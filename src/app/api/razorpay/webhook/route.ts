import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay/server";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";

interface WebhookPayload {
  event: string;
  event_id?: string;
  id?: string;
  payload?: {
    payment?: {
      entity?: {
        id: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
        error_description?: string;
        error_reason?: string;
      };
    };
    order?: {
      entity?: {
        id: string;
        amount?: number;
        status?: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  let eventId = "";
  const adminClient = createAdminClient();

  try {
    // 1. Read exact raw request body for cryptographic signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.warn("Webhook rejected: Missing X-Razorpay-Signature header.");
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 400 }
      );
    }

    // 2. Cryptographic HMAC SHA256 timing-safe verification
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.warn("Webhook rejected: Invalid X-Razorpay-Signature.");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // 3. Parse JSON after signature has been verified against raw body
    let body: WebhookPayload;
    try {
      body = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Reject if event ID is missing (no random or timestamp fallback)
    const rawEventId = req.headers.get("x-razorpay-event-id") || body.event_id || body.id;
    if (!rawEventId || typeof rawEventId !== "string" || !rawEventId.trim()) {
      return NextResponse.json(
        { error: "Missing webhook event ID" },
        { status: 400 }
      );
    }

    eventId = rawEventId.trim();
    const event = body.event;

    // 4. Dedupe via insert-first: insert into webhook_events with status 'processing'
    const { error: insertEventErr } = await adminClient
      .from("webhook_events")
      .insert({
        event_id: eventId,
        event_type: event,
        payload: body,
        status: "processing",
      });

    if (insertEventErr) {
      if (insertEventErr.code === "23505") {
        // Unique violation - event already recorded
        const { data: existingEvent, error: fetchErr } = await adminClient
          .from("webhook_events")
          .select("id, status, created_at")
          .eq("event_id", eventId)
          .single();

        if (fetchErr || !existingEvent) {
          return NextResponse.json(
            { error: "Webhook event lookup error" },
            { status: 500 }
          );
        }

        if (existingEvent.status === "processed") {
          return NextResponse.json(
            { status: "ok", message: "Event already processed" },
            { status: 200 }
          );
        }

        const createdAtMs = new Date(existingEvent.created_at).getTime();
        const isStuck = Date.now() - createdAtMs > 5 * 60 * 1000;

        if (isStuck || existingEvent.status === "failed") {
          // Re-process stuck or previously failed event
          await adminClient
            .from("webhook_events")
            .update({ status: "processing" })
            .eq("event_id", eventId);
        } else {
          // Still processing by another invocation
          return NextResponse.json(
            { status: "ok", message: "Event currently being processed" },
            { status: 200 }
          );
        }
      } else {
        // Table or database unavailable
        console.error("webhook_events insert failed:", insertEventErr);
        return NextResponse.json(
          { error: "Webhook storage error" },
          { status: 500 }
        );
      }
    }

    // 5. Extract payment & order entities from verified payload
    const paymentEntity = body.payload?.payment?.entity;
    const orderEntity = body.payload?.order?.entity;

    const rzpPaymentId = paymentEntity?.id;
    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentAmountPaise = Number(paymentEntity?.amount ?? orderEntity?.amount ?? 0);
    const paymentCurrency = paymentEntity?.currency || "INR";

    const nowIso = new Date().toISOString();

    // 6. Handle webhook events
    switch (event) {
      case "payment.captured":
      case "order.paid": {
        if (!rzpOrderId) {
          console.error("Webhook payment.captured without razorpay order ID:", { rzpPaymentId });
          await adminClient
            .from("webhook_events")
            .update({ status: "failed" })
            .eq("event_id", eventId);
          return NextResponse.json(
            { error: "Missing gateway order ID in captured payment event" },
            { status: 500 }
          );
        }

        // Look up order ONLY by razorpay_order_id from verified payload (ignore notes)
        const { data: order, error: orderLookupErr } = await adminClient
          .from("orders")
          .select("id, order_number, total, payment_status, status, user_id, razorpay_order_id")
          .eq("razorpay_order_id", rzpOrderId)
          .single();

        if (orderLookupErr || !order) {
          console.error("CRITICAL: No matching order found for captured payment:", {
            rzpPaymentId,
            rzpOrderId,
            error: orderLookupErr?.message,
          });
          await adminClient
            .from("webhook_events")
            .update({ status: "failed" })
            .eq("event_id", eventId);
          return NextResponse.json(
            { error: "Matching order record not found for captured payment" },
            { status: 500 }
          );
        }

        // Call atomic mark_order_paid RPC
        const { data: paidResult, error: markErr } = await adminClient.rpc("mark_order_paid", {
          p_order_id: order.id,
          p_gateway_order_id: rzpOrderId,
          p_gateway_payment_id: rzpPaymentId || `pay_${rzpOrderId}`,
          p_amount_paise: paymentAmountPaise,
          p_currency: paymentCurrency,
        });

        if (markErr) {
          console.error("Webhook mark_order_paid RPC failed:", markErr);
          await adminClient
            .from("webhook_events")
            .update({ status: "failed" })
            .eq("event_id", eventId);
          return NextResponse.json(
            { error: "Order payment finalization failed" },
            { status: 500 }
          );
        }

        if (paidResult && !paidResult.already_paid) {
          try {
            await createAuditLog({
              userId: order.user_id,
              action: `Webhook ${event} Processed`,
              tableName: "orders",
              recordId: order.id,
              entityName: `Order #${order.order_number}`,
              metadata: {
                eventId,
                event,
                rzpPaymentId,
                rzpOrderId,
              },
            });
          } catch (auditErr) {
            console.warn("Audit log notice:", auditErr);
          }
        }

        break;
      }

      case "payment.failed": {
        const errorDesc =
          paymentEntity?.error_description ||
          paymentEntity?.error_reason ||
          "Payment failed at gateway";

        if (rzpOrderId) {
          // Update payments by gateway_order_id using .eq() only, never downgrade a paid payment
          const { error: failErr } = await adminClient
            .from("payments")
            .update({
              status: "failed",
              failure_reason: errorDesc,
              gateway_payment_id: rzpPaymentId,
              updated_at: nowIso,
            })
            .eq("gateway_order_id", rzpOrderId)
            .neq("status", "paid");

          if (failErr) {
            console.error("Failed to update payment failure status:", failErr);
            await adminClient
              .from("webhook_events")
              .update({ status: "failed" })
              .eq("event_id", eventId);
            return NextResponse.json(
              { error: "Payment failure record update failed" },
              { status: 500 }
            );
          }
        }
        break;
      }

      case "payment.authorized": {
        if (rzpOrderId) {
          // Update payments by gateway_order_id, never downgrade a paid payment
          const { error: authErr } = await adminClient
            .from("payments")
            .update({
              gateway_payment_id: rzpPaymentId,
              updated_at: nowIso,
            })
            .eq("gateway_order_id", rzpOrderId)
            .neq("status", "paid");

          if (authErr) {
            console.error("Failed to update payment authorized status:", authErr);
            await adminClient
              .from("webhook_events")
              .update({ status: "failed" })
              .eq("event_id", eventId);
            return NextResponse.json(
              { error: "Payment authorization record update failed" },
              { status: 500 }
            );
          }
        }
        break;
      }

      default: {
        break;
      }
    }

    // 7. On success mark event processed
    await adminClient
      .from("webhook_events")
      .update({ status: "processed", processed_at: nowIso })
      .eq("event_id", eventId);

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: unknown) {
    console.error("Unhandled webhook error:", error);

    if (eventId) {
      try {
        await adminClient
          .from("webhook_events")
          .update({ status: "failed" })
          .eq("event_id", eventId);
      } catch {}
    }

    return NextResponse.json(
      { error: "Webhook handler encountered an error" },
      { status: 500 }
    );
  }
}
