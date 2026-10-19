import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getRazorpayClient, verifyPaymentSignature } from "@/lib/razorpay/server";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";

const verifyPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Zod validate the request body
    const json = await req.json();
    const parsed = verifyPaymentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification parameters." },
        { status: 400 }
      );
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // 2. Authenticate strictly with getUser(). No user -> 401
    const userClient = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // 3. Fetch order with admin client. !user || order.user_id !== user.id -> 403
    // MUST do this BEFORE any Razorpay call and before signature work
    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .select("id, order_number, total, status, payment_status, user_id, razorpay_order_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Order could not be found." },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to verify this order." },
        { status: 403 }
      );
    }

    // 4. Require order.razorpay_order_id === razorpayOrderId (no "if exists" escape)
    if (!order.razorpay_order_id || order.razorpay_order_id !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Razorpay order ID does not match local order record." },
        { status: 400 }
      );
    }

    // 5. Verify the signature (verifyPaymentSignature)
    const isValidSignature = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      // Log sanitized notice without dumping sensitive full signature
      console.warn("Invalid Razorpay payment signature verification attempt for order:", orderId);
      return NextResponse.json(
        { error: "Payment verification failed: invalid signature." },
        { status: 400 }
      );
    }

    // 6. Fetch the payment from Razorpay and validate constraints
    const razorpay = getRazorpayClient();
    let rzpPayment;
    try {
      rzpPayment = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (fetchErr: unknown) {
      console.error("Razorpay payments.fetch error:", fetchErr);
      return NextResponse.json(
        { error: "Failed to communicate with payment gateway. Please try again." },
        { status: 502 }
      );
    }

    if (!rzpPayment) {
      return NextResponse.json(
        { error: "Payment record was not found at payment provider." },
        { status: 404 }
      );
    }

    const expectedPaise = Math.round(Number(order.total) * 100);

    if (rzpPayment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Payment is not associated with this checkout order." },
        { status: 400 }
      );
    }

    if (rzpPayment.currency !== "INR") {
      return NextResponse.json(
        { error: "Payment currency mismatch." },
        { status: 400 }
      );
    }

    if (Number(rzpPayment.amount) !== expectedPaise) {
      return NextResponse.json(
        { error: "Payment amount does not match order total." },
        { status: 400 }
      );
    }

    // 7. If status is authorized: attempt capture, then RE-FETCH
    if (rzpPayment.status === "authorized") {
      try {
        await razorpay.payments.capture(razorpayPaymentId, expectedPaise, "INR");
        rzpPayment = await razorpay.payments.fetch(razorpayPaymentId);
      } catch (capErr: unknown) {
        console.warn("Payment capture attempt failed:", capErr);
      }
    }

    if (rzpPayment.status !== "captured") {
      if (rzpPayment.status === "authorized") {
        return NextResponse.json(
          { error: "Payment authorization is pending capture. Order cannot be marked paid." },
          { status: 202 }
        );
      }
      return NextResponse.json(
        { error: "Payment was not successfully captured." },
        { status: 400 }
      );
    }

    // 8. Call adminClient.rpc("mark_order_paid", {...}) and check error
    const { data: paidResult, error: rpcErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: order.id,
      p_gateway_order_id: razorpayOrderId,
      p_gateway_payment_id: razorpayPaymentId,
      p_amount_paise: expectedPaise,
      p_currency: "INR",
      p_signature: razorpaySignature,
    });

    if (rpcErr) {
      console.error("mark_order_paid RPC error:", rpcErr);

      // If RPC reports an inventory failure (insufficient stock), initiate refund path
      if (rpcErr.message && rpcErr.message.includes("Insufficient stock")) {
        console.error("INVENTORY FAILURE ON PAID ORDER - Initiating auto-refund:", {
          orderId: order.id,
          paymentId: razorpayPaymentId,
        });

        try {
          await razorpay.payments.refund(razorpayPaymentId, {
            amount: expectedPaise,
            notes: { reason: "Inventory oversold after payment" },
          });
        } catch (refundErr) {
          console.error("Auto-refund failed for oversold order:", refundErr);
        }

        return NextResponse.json(
          { error: "One or more items in your order became unavailable. A full refund has been initiated." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to process order payment completion." },
        { status: 500 }
      );
    }

    const alreadyPaid = Boolean(paidResult?.already_paid);

    // 9. Create audit log only when already_paid is false, wrapped so a log failure doesn't fail request
    if (!alreadyPaid) {
      try {
        await createAuditLog({
          userId: user.id,
          action: "Payment Verified",
          tableName: "orders",
          recordId: order.id,
          entityName: `Order #${order.order_number}`,
          metadata: {
            gatewayPaymentId: razorpayPaymentId,
            amount: order.total,
          },
        });
      } catch (auditErr) {
        console.warn("Audit log creation notice:", auditErr);
      }
    }

    return NextResponse.json({
      success: true,
      alreadyPaid,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error: unknown) {
    console.error("Unhandled error in /api/razorpay/verify-payment:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying your payment." },
      { status: 500 }
    );
  }
}
