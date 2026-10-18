import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient, verifyPaymentSignature } from "@/lib/razorpay/server";
import { handleOrderSale } from "@/features/inventory/lib/inventory.action";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";

const verifyPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = verifyPaymentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // 1. Cryptographic HMAC SHA256 timing-safe verification
    const isValidSignature = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      console.warn("Invalid Razorpay payment signature attempt:", {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
      });
      return NextResponse.json(
        { error: "Invalid payment signature verification failed." },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    // 2. Fetch expected local order
    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .select("id, order_number, total, status, payment_status, user_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Local order not found." },
        { status: 404 }
      );
    }

    // 3. Verify Razorpay Order ID matches existing payment or order
    const { data: existingPayment } = await adminClient
      .from("payments")
      .select("id, gateway_order_id, status, amount")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingPayment && existingPayment.gateway_order_id) {
      if (existingPayment.gateway_order_id !== razorpayOrderId) {
        return NextResponse.json(
          { error: "Razorpay order ID mismatch with local record." },
          { status: 400 }
        );
      }
    }

    // 4. Idempotency Check: if already paid, return early to prevent duplicate side effects
    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment has already been verified and processed.",
        orderId: order.id,
        orderNumber: order.order_number,
      });
    }

    // 5. Authoritative validation with Razorpay API
    const razorpay = getRazorpayClient();
    let rzpPayment;
    try {
      rzpPayment = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (fetchErr: unknown) {
      console.error("Failed to fetch payment details from Razorpay API:", fetchErr);
      return NextResponse.json(
        { error: "Failed to fetch authoritative payment status from Razorpay." },
        { status: 502 }
      );
    }

    if (!rzpPayment) {
      return NextResponse.json(
        { error: "Payment record could not be found at Razorpay." },
        { status: 404 }
      );
    }

    // Check payment status
    // Razorpay payment statuses: 'captured', 'authorized', 'failed', 'refunded'
    const isCaptured = rzpPayment.status === "captured";
    const isAuthorized = rzpPayment.status === "authorized";

    if (!isCaptured && !isAuthorized) {
      return NextResponse.json(
        {
          error: `Payment is not in a valid paid state (status: ${rzpPayment.status}).`,
        },
        { status: 400 }
      );
    }

    // Validate amount matches expected order amount (in paise)
    const expectedPaise = Math.round(Number(order.total) * 100);
    if (Number(rzpPayment.amount) !== expectedPaise) {
      console.error("Amount mismatch detected:", {
        expectedPaise,
        receivedAmount: rzpPayment.amount,
      });
      return NextResponse.json(
        { error: "Transaction amount mismatch with local order amount." },
        { status: 400 }
      );
    }

    // If authorized but not yet captured, capture it if necessary
    if (isAuthorized && !isCaptured) {
      try {
        await razorpay.payments.capture(
          razorpayPaymentId,
          expectedPaise,
          rzpPayment.currency || "INR"
        );
      } catch (capErr: unknown) {
        const msg = capErr instanceof Error ? capErr.message : "Capture error";
        console.warn("Manual capture attempt notice:", msg);
      }
    }

    // 6. Update local payment record
    const nowIso = new Date().toISOString();

    if (existingPayment) {
      const updateRes = await adminClient
        .from("payments")
        .update({
          gateway_payment_id: razorpayPaymentId,
          gateway_signature: razorpaySignature,
          status: "paid",
          paid_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", existingPayment.id);

      if (updateRes.error && updateRes.error.code === "PGRST204") {
        // If updated_at column is not yet migrated, update without it
        await adminClient
          .from("payments")
          .update({
            gateway_payment_id: razorpayPaymentId,
            gateway_signature: razorpaySignature,
            status: "paid",
            paid_at: nowIso,
          })
          .eq("id", existingPayment.id);
      }
    } else {
      await adminClient.from("payments").insert({
        order_id: order.id,
        gateway: "razorpay",
        gateway_order_id: razorpayOrderId,
        gateway_payment_id: razorpayPaymentId,
        gateway_signature: razorpaySignature,
        amount: order.total,
        status: "paid",
        paid_at: nowIso,
      });
    }

    // 7. Update order status to paid and processing
    await adminClient
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        updated_at: nowIso,
      })
      .eq("id", order.id);

    // 8. Idempotently deduct inventory
    try {
      await handleOrderSale(order.id);
    } catch (invErr) {
      console.error("Inventory deduction error after payment:", invErr);
    }

    // 9. Create audit log
    try {
      await createAuditLog({
        userId: order.user_id,
        action: "Payment Verified",
        tableName: "orders",
        recordId: order.id,
        entityName: `Order #${order.order_number}`,
        metadata: {
          gateway: "razorpay",
          razorpayOrderId,
          razorpayPaymentId,
          amount: order.total,
          status: "paid",
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation notice:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified.",
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error: unknown) {
    console.error("Unhandled error in /api/razorpay/verify-payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error occurred during verification.",
        message: message,
      },
      { status: 500 }
    );
  }
}
