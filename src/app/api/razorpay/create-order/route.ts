import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getRazorpayClient } from "@/lib/razorpay/server";
import { getRazorpayPublicEnv } from "@/lib/razorpay/env";
import { validateCoupon } from "@/features/coupons/lib/coupons.action";

// Request validation schema
const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  }),
  shippingAddress: z.object({
    addressLine1: z.string().min(3, "Address is required"),
    addressLine2: z.string().optional().nullable(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(4, "Valid postal code is required"),
    country: z.string().default("India"),
  }),
  items: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Cart cannot be empty"),
  couponCode: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createOrderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { customer, shippingAddress, items, couponCode } = parsed.data;

    // Check customer authentication
    const userClient = await createServerClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    const userId = user ? user.id : null;
    const guestToken = userId ? null : crypto.randomBytes(24).toString("hex");

    const adminClient = await createAdminClient();

    // 1. Authoritatively fetch products from Supabase
    const itemIds = items.map((i) => String(i.id));
    const { data: dbProducts, error: prodErr } = await adminClient
      .from("products")
      .select("id, name, price, sale_price, stock, status, sku")
      .in("id", itemIds);

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        { error: "Could not retrieve products from the database." },
        { status: 400 }
      );
    }

    const productMap = new Map(dbProducts.map((p) => [String(p.id), p]));

    // 2. Validate stock, status, and compute authoritative pricing
    const orderItemsToInsert: {
      product_id: string;
      product_name: string;
      product_sku: string | null;
      quantity: number;
      price: number;
    }[] = [];

    let authoritativeSubtotal = 0;

    for (const item of items) {
      const prod = productMap.get(String(item.id));
      if (!prod) {
        return NextResponse.json(
          { error: `Product with ID ${item.id} was not found.` },
          { status: 404 }
        );
      }

      if (prod.status === "archived") {
        return NextResponse.json(
          { error: `Product "${prod.name}" is no longer available.` },
          { status: 400 }
        );
      }

      if (prod.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${item.quantity}.`,
          },
          { status: 400 }
        );
      }

      const effectivePrice = Number(prod.sale_price ?? prod.price);
      authoritativeSubtotal += effectivePrice * item.quantity;

      orderItemsToInsert.push({
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku ?? null,
        quantity: item.quantity,
        price: effectivePrice,
      });
    }

    // 3. Authoritatively compute Shipping & Tax (GST 18%)
    const isFreeShippingRule = authoritativeSubtotal >= 1999;
    let shippingFee = isFreeShippingRule ? 0 : 150;
    const tax = Math.round(authoritativeSubtotal * 0.18);

    // 4. Authoritatively validate and apply coupon if provided
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode && couponCode.trim()) {
      const codeClean = couponCode.trim().toUpperCase();
      try {
        const couponRes = await validateCoupon(
          codeClean,
          authoritativeSubtotal,
          customer.email
        );
        if (couponRes.success && couponRes.data) {
          discountAmount = couponRes.data.discountAmount;
          appliedCouponCode = codeClean;
          if (couponRes.data.discountType === "freeship" || codeClean === "FREESHIP") {
            shippingFee = 0;
          }
        }
      } catch (couponErr) {
        console.warn("Coupon validation error:", couponErr);
      }
    }

    // Authoritative total
    const grandTotal = Math.max(0, authoritativeSubtotal + shippingFee + tax - discountAmount);

    // Razorpay requires currency subunits (paise for INR). Minimum ₹1 (100 paise)
    const amountInPaise = Math.max(100, Math.round(grandTotal * 100));

    // 5. Generate unique order number
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SK-${datePrefix}-${randomSuffix}`;

    // 6. Insert pending order into database
    // Base columns guaranteed in database
    const orderPayload: Record<string, unknown> = {
      order_number: orderNumber,
      subtotal: authoritativeSubtotal,
      tax: tax,
      shipping: shippingFee,
      discount: discountAmount,
      total: grandTotal,
      status: "pending",
      payment_status: "pending",
      user_id: userId,
    };

    // Attempt to store extra details (will be ignored safely if table doesn't have them)
    let orderInsertRes = await adminClient
      .from("orders")
      .insert({
        ...orderPayload,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
        guest_token: guestToken,
      })
      .select("id")
      .single();

    // If extended columns failed due to schema cache before migration, fallback to base payload
    if (orderInsertRes.error && orderInsertRes.error.code === "PGRST204") {
      orderInsertRes = await adminClient
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .single();
    }

    if (orderInsertRes.error || !orderInsertRes.data) {
      console.error("Failed to create local order:", orderInsertRes.error);
      return NextResponse.json(
        { error: "Failed to initialize order record in database." },
        { status: 500 }
      );
    }

    const localOrderId = orderInsertRes.data.id;

    // 7. Insert order items
    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      order_id: localOrderId,
      ...item,
    }));

    const { error: itemsErr } = await adminClient
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsErr) {
      console.error("Failed to insert order items:", itemsErr);
      // Clean up order
      await adminClient.from("orders").delete().eq("id", localOrderId);
      return NextResponse.json(
        { error: "Failed to create order items." },
        { status: 500 }
      );
    }

    // 8. Create Razorpay order via official server SDK
    let rzpOrder;
    try {
      const razorpay = getRazorpayClient();
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: {
          localOrderId: localOrderId,
          orderNumber: orderNumber,
          customerEmail: customer.email,
          customerName: customer.name,
        },
      });
    } catch (rzpErr: unknown) {
      console.error("Razorpay order creation error:", rzpErr);
      const rzpMessage = rzpErr instanceof Error ? rzpErr.message : "Razorpay error";
      // Delete incomplete pending order
      await adminClient.from("orders").delete().eq("id", localOrderId);
      return NextResponse.json(
        {
          error: "Failed to create payment session with Razorpay. Please verify API credentials.",
          details: rzpMessage,
        },
        { status: 502 }
      );
    }

    // 9. Update order with razorpay_order_id and record in payments table
    try {
      await adminClient
        .from("orders")
        .update({ razorpay_order_id: rzpOrder.id })
        .eq("id", localOrderId);
    } catch {}

    // Insert pending payment record
    const paymentPayload: Record<string, unknown> = {
      order_id: localOrderId,
      gateway: "razorpay",
      gateway_order_id: rzpOrder.id,
      amount: grandTotal,
      status: "pending",
    };

    let paymentInsertRes = await adminClient
      .from("payments")
      .insert({ ...paymentPayload, currency: "INR" });

    if (paymentInsertRes.error && paymentInsertRes.error.code === "PGRST204") {
      // currency column absent
      paymentInsertRes = await adminClient.from("payments").insert(paymentPayload);
    }

    if (paymentInsertRes.error) {
      console.warn("Failed to insert pending payment record:", paymentInsertRes.error);
    }

    const { keyId } = getRazorpayPublicEnv();

    // Return minimal required information to client
    return NextResponse.json({
      success: true,
      orderId: localOrderId,
      orderNumber: orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId,
      guestToken: guestToken,
      orderDetails: {
        subtotal: authoritativeSubtotal,
        shipping: shippingFee,
        tax: tax,
        discount: discountAmount,
        total: grandTotal,
        appliedCoupon: appliedCouponCode,
      },
    });
  } catch (error: unknown) {
    console.error("Unhandled error in /api/razorpay/create-order:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error occurred while processing order.",
        message: message,
      },
      { status: 500 }
    );
  }
}
