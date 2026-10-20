import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getRazorpayClient } from "@/lib/razorpay/server";
import { getRazorpayPublicEnv } from "@/lib/razorpay/env";
import { calculateAuthoritativePricing } from "@/lib/pricing";

// Rate limiting state (In-memory sliding window: 10 requests / 60 seconds per user)
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const userRequestTimestamps = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = userRequestTimestamps.get(userId) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    userRequestTimestamps.set(userId, validTimestamps);
    return true; // Exceeded
  }
  validTimestamps.push(now);
  userRequestTimestamps.set(userId, validTimestamps);
  return false;
}

// Request validation schema
const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  }),
  shippingAddress: z.object({
    addressLine1: z.string().min(3, "Address is required"),
    addressLine2: z.string().optional().nullable(),
    city: z.string().optional().nullable().default(""),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(4, "Valid postal code is required"),
    country: z.string().default("India"),
  }),
  items: z
    .array(
      z.object({
        id: z.string().uuid("Invalid product ID format"),
        variantId: z.string().uuid("Invalid variant ID format").optional().nullable(),
        quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Quantity cannot exceed 10"),
      })
    )
    .min(1, "Cart cannot be empty"),
  couponCode: z.string().optional().nullable(),
  expectedTotalPaise: z.number().int().optional().nullable(),
  confirmedPriceChange: z.boolean().optional().default(false),
});

let orderSeq = 0;

function generateOrderNumber(): string {
  const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const time = Date.now().toString().slice(-6);
  orderSeq = (orderSeq + 1) % 10000;
  const seq = String(orderSeq).padStart(4, "0");
  return `SK-${datePrefix}-${time}${seq}`;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createOrderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data. Please check your cart and shipping information." },
        { status: 400 }
      );
    }

    const { customer, shippingAddress, items, couponCode, expectedTotalPaise, confirmedPriceChange } = parsed.data;

    // 1. Authenticate user strictly using server session
    const userClient = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: "Authentication is required to proceed with checkout. Please sign in." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 2. Check rate limit per user
    if (checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    // 3. Merge duplicate cart lines by (productId, variantId) and cap at 10
    const mergedMap = new Map<string, { productId: string; variantId: string | null; quantity: number }>();
    for (const item of items) {
      const key = `${item.id}:${item.variantId || "null"}`;
      const existing = mergedMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedMap.set(key, { productId: item.id, variantId: item.variantId || null, quantity: item.quantity });
      }
    }

    const mergedItems = Array.from(mergedMap.values());
    for (const item of mergedItems) {
      if (item.quantity > 10) {
        return NextResponse.json(
          { error: "Quantity for a single item cannot exceed 10 units." },
          { status: 400 }
        );
      }
    }

    const adminClient = createAdminClient();

    // 4. Calculate authoritative pricing using the shared integer paise engine
    let pricing;
    try {
      pricing = await calculateAuthoritativePricing({
        items: mergedItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: couponCode || null,
        userEmail: user.email,
        destination: shippingAddress,
      });
    } catch (pricingErr: unknown) {
      console.error("Authoritative pricing calculation failed:", pricingErr);
      return NextResponse.json(
        { error: pricingErr instanceof Error ? pricingErr.message : "Unable to calculate authoritative pricing." },
        { status: 400 }
      );
    }

    // 5. If customer saw an estimate and the server total differs, require confirmation
    if (
      expectedTotalPaise != null &&
      !confirmedPriceChange &&
      pricing.totalPaise !== expectedTotalPaise
    ) {
      return NextResponse.json(
        {
          error: "Order total has changed due to updated prices or taxes. Please review and confirm your new total.",
          requiresConfirmation: true,
          expectedTotalPaise,
          newTotalPaise: pricing.totalPaise,
          orderDetails: {
            subtotal: pricing.subtotal,
            discount: pricing.discount,
            shipping: pricing.shipping,
            tax: pricing.gstAmount,
            total: pricing.total,
          },
        },
        { status: 409 }
      );
    }

    // 6. Validate live stock from database
    const productIds = Array.from(new Set(pricing.lineItems.map((l) => l.productId)));
    const { data: dbProducts, error: prodErr } = await adminClient
      .from("products")
      .select("id, name, stock, status")
      .in("id", productIds);

    if (prodErr || !dbProducts) {
      return NextResponse.json(
        { error: "Unable to verify current product stock." },
        { status: 500 }
      );
    }

    const prodMap = new Map(dbProducts.map((p) => [p.id, p]));

    const variantIds = pricing.lineItems
      .map((l) => l.variantId)
      .filter((id): id is string => Boolean(id));

    let varMap = new Map<string, any>();
    if (variantIds.length > 0) {
      const { data: dbVariants } = await adminClient
        .from("product_variants")
        .select("id, name, stock, is_active")
        .in("id", variantIds);
      if (dbVariants) {
        varMap = new Map(dbVariants.map((v) => [v.id, v]));
      }
    }

    for (const line of pricing.lineItems) {
      const prod = prodMap.get(line.productId);
      if (!prod || prod.status !== "active") {
        return NextResponse.json(
          { error: `Product "${line.name}" is no longer available.` },
          { status: 400 }
        );
      }

      if (line.variantId) {
        const variant = varMap.get(line.variantId);
        if (!variant || variant.is_active === false) {
          return NextResponse.json(
            { error: `Variant for "${line.name}" is no longer available.` },
            { status: 400 }
          );
        }
        if (Number(variant.stock) < line.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for "${line.name}". Available: ${variant.stock}.` },
            { status: 400 }
          );
        }
      } else {
        if (Number(prod.stock) < line.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for "${line.name}". Available: ${prod.stock}.` },
            { status: 400 }
          );
        }
      }
    }

    const totalPaise = pricing.totalPaise;
    const isFreeOrder = totalPaise === 0;

    // 7. Insert order with complete snapshot
    let orderInsertRes;
    let orderNumber = "";
    const MAX_ORDER_NUM_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ORDER_NUM_ATTEMPTS; attempt++) {
      orderNumber = generateOrderNumber();
      const orderPayload = {
        order_number: orderNumber,
        subtotal: pricing.subtotal,
        tax: pricing.gstAmount,
        gst_amount: pricing.gstAmount,
        shipping: pricing.shipping,
        discount: pricing.discount,
        total: pricing.total,
        total_paise: pricing.totalPaise,
        status: isFreeOrder ? "confirmed" : "pending",
        payment_status: isFreeOrder ? "paid" : "pending",
        user_id: userId,
        customer_name: customer.name,
        customer_email: user.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
      };

      orderInsertRes = await adminClient
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .single();

      if (!orderInsertRes.error) {
        break;
      }

      if (orderInsertRes.error.code === "23505" && attempt < MAX_ORDER_NUM_ATTEMPTS) {
        continue;
      }

      console.error("Order insertion failed:", orderInsertRes.error);
      return NextResponse.json(
        { error: "Failed to initialize order record in database." },
        { status: 500 }
      );
    }

    if (!orderInsertRes?.data?.id) {
      return NextResponse.json(
        { error: "Failed to initialize order record in database." },
        { status: 500 }
      );
    }

    const localOrderId = orderInsertRes.data.id;

    // 8. Insert order items with complete snapshot
    const itemsWithOrderId = pricing.lineItems.map((item) => ({
      order_id: localOrderId,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.name,
      variant_name: null,
      product_sku: item.sku,
      quantity: item.quantity,
      price: item.unitPrice,
      unit_price: item.unitPrice,
      discount: item.discount,
      gst_rate: item.gstRate,
      gst_amount: item.gstAmount,
      total_paise: item.payablePaise,
    }));

    const { error: itemsErr } = await adminClient
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsErr) {
      console.error("Failed to insert order items:", itemsErr);
      await adminClient.from("orders").delete().eq("id", localOrderId);
      return NextResponse.json(
        { error: "Failed to save order items. Please try again." },
        { status: 500 }
      );
    }

    // 11. If order is free (zero-total): finalize directly without calling Razorpay
    if (isFreeOrder) {
      // Record free payment
      const { error: payErr } = await adminClient.from("payments").insert({
        order_id: localOrderId,
        gateway: "coupon",
        gateway_order_id: `free_${localOrderId}`,
        amount: 0,
        currency: "INR",
        status: "paid",
        paid_at: new Date().toISOString(),
      });

      if (payErr) {
        console.error("Failed to record free payment:", payErr);
      }

      // Deduct stock atomically via RPC
      const { error: saleErr } = await adminClient.rpc("apply_order_sale", {
        p_order_id: localOrderId,
      });

      if (saleErr) {
        console.error("apply_order_sale for free order failed:", saleErr);
      }

      return NextResponse.json({
        success: true,
        free: true,
        orderId: localOrderId,
        orderNumber: orderNumber,
        orderDetails: {
          subtotal: pricing.subtotal,
          shipping: pricing.shipping,
          tax: pricing.gstAmount,
          discount: pricing.discount,
          total: 0,
          totalPaise: 0,
          appliedCoupon: pricing.couponCode,
        },
      });
    }

    // 12. Create Razorpay order via official server SDK
    let rzpOrder;
    try {
      const razorpay = getRazorpayClient();
      rzpOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: {
          localOrderId: localOrderId,
          orderNumber: orderNumber,
        },
      });
    } catch (rzpErr: unknown) {
      console.error("Razorpay order creation error:", rzpErr);
      // Clean up order items and order
      const { error: delItemErr } = await adminClient.from("order_items").delete().eq("order_id", localOrderId);
      if (delItemErr) console.error("Cleanup deletion failed on order_items:", delItemErr);
      const { error: delOrdErr } = await adminClient.from("orders").delete().eq("id", localOrderId);
      if (delOrdErr) console.error("Cleanup deletion failed on orders:", delOrdErr);
      return NextResponse.json(
        { error: "Payment gateway session could not be created. Please try again." },
        { status: 502 }
      );
    }

    // 13. Update orders.razorpay_order_id
    const { error: updateRzpErr } = await adminClient
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", localOrderId)
      .select("id")
      .single();

    if (updateRzpErr) {
      console.error("Failed to link razorpay_order_id to order:", updateRzpErr);
      const { error: delItemErr } = await adminClient.from("order_items").delete().eq("order_id", localOrderId);
      if (delItemErr) console.error("Cleanup deletion failed on order_items:", delItemErr);
      const { error: delOrdErr } = await adminClient.from("orders").delete().eq("id", localOrderId);
      if (delOrdErr) console.error("Cleanup deletion failed on orders:", delOrdErr);
      return NextResponse.json(
        { error: "Failed to record payment order details." },
        { status: 500 }
      );
    }

    // 14. Insert pending payment record
    const { error: paymentErr } = await adminClient.from("payments").insert({
      order_id: localOrderId,
      gateway: "razorpay",
      gateway_order_id: rzpOrder.id,
      amount: totalPaise / 100.0,
      currency: "INR",
      status: "pending",
    });

    if (paymentErr) {
      console.error("Failed to insert pending payment record:", paymentErr);
      const { error: delItemErr } = await adminClient.from("order_items").delete().eq("order_id", localOrderId);
      if (delItemErr) console.error("Cleanup deletion failed on order_items:", delItemErr);
      const { error: delOrdErr } = await adminClient.from("orders").delete().eq("id", localOrderId);
      if (delOrdErr) console.error("Cleanup deletion failed on orders:", delOrdErr);
      return NextResponse.json(
        { error: "Failed to initialize payment record." },
        { status: 500 }
      );
    }

    const { keyId } = getRazorpayPublicEnv();

    return NextResponse.json({
      success: true,
      free: false,
      orderId: localOrderId,
      orderNumber: orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: totalPaise,
      currency: "INR",
      keyId: keyId,
      orderDetails: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        tax: pricing.gstAmount,
        discount: pricing.discount,
        total: pricing.total,
        totalPaise: pricing.totalPaise,
        appliedCoupon: pricing.couponCode,
      },
    });
  } catch (error: unknown) {
    console.error("Unhandled error in /api/razorpay/create-order:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your order." },
      { status: 500 }
    );
  }
}
