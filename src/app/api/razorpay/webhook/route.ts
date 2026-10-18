import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay/server";
import { handleOrderSale } from "@/features/inventory/lib/inventory.action";
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
        notes?: {
          localOrderId?: string;
          orderNumber?: string;
        };
      };
    };
    order?: {
      entity?: {
        id: string;
        amount?: number;
        status?: string;
        notes?: {
          localOrderId?: string;
          orderNumber?: string;
        };
      };
    };
  };
}

export async function POST(req: NextRequest) {
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

    const event = body.event;
    const eventId =
      req.headers.get("x-razorpay-event-id") ||
      body.event_id ||
      body.id ||
      `${event}-${Date.now()}`;

    const adminClient = await createAdminClient();

    // 4. Deduplication and Idempotency tracking via webhook_events
    try {
      const { data: existingEvent } = await adminClient
        .from("webhook_events")
        .select("id, status")
        .eq("event_id", eventId)
        .maybeSingle();

      if (existingEvent) {
        return NextResponse.json({
          status: "ok",
          message: "Event already processed",
        });
      }

      // Record event receipt
      await adminClient.from("webhook_events").insert({
        event_id: eventId,
        event_type: event,
        payload: body,
        status: "processing",
      });
    } catch {
      // Table might not exist yet before migration is applied; proceed with event handling
    }

    // 5. Extract payment & order entities from Razorpay payload
    const paymentEntity = body.payload?.payment?.entity;
    const orderEntity = body.payload?.order?.entity;

    const rzpPaymentId = paymentEntity?.id;
    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const localOrderId =
      paymentEntity?.notes?.localOrderId ||
      orderEntity?.notes?.localOrderId;

    const nowIso = new Date().toISOString();

    // 6. Handle specific Razorpay webhook events
    switch (event) {
      case "payment.captured":
      case "order.paid": {
        if (!rzpOrderId && !localOrderId && !rzpPaymentId) {
          console.warn("Webhook received without identifiable order/payment ID:", body);
          break;
        }

        // Look up local order
        let orderQuery = adminClient.from("orders").select("id, order_number, total, payment_status, status, user_id");
        if (localOrderId) {
          orderQuery = orderQuery.eq("id", localOrderId);
        } else if (rzpOrderId) {
          // Look up order via payments table
          const { data: pRec } = await adminClient
            .from("payments")
            .select("order_id")
            .eq("gateway_order_id", rzpOrderId)
            .maybeSingle();

          if (pRec?.order_id) {
            orderQuery = orderQuery.eq("id", pRec.order_id);
          } else {
            orderQuery = orderQuery.eq("razorpay_order_id", rzpOrderId);
          }
        }

        const { data: order } = await orderQuery.maybeSingle();

        if (order) {
          // Check if already paid (idempotency guard)
          if (order.payment_status !== "paid") {
            // Update order
            await adminClient
              .from("orders")
              .update({
                payment_status: "paid",
                status: "processing",
                updated_at: nowIso,
              })
              .eq("id", order.id);

            // Update payments table
            if (rzpOrderId || rzpPaymentId) {
              const { data: existingPay } = await adminClient
                .from("payments")
                .select("id")
                .or(
                  `order_id.eq.${order.id},gateway_order_id.eq.${rzpOrderId || ""},gateway_payment_id.eq.${rzpPaymentId || ""}`
                )
                .maybeSingle();

              if (existingPay) {
                const updatePayRes = await adminClient
                  .from("payments")
                  .update({
                    status: "paid",
                    gateway_payment_id: rzpPaymentId,
                    paid_at: nowIso,
                    updated_at: nowIso,
                  })
                  .eq("id", existingPay.id);

                if (updatePayRes.error && updatePayRes.error.code === "PGRST204") {
                  await adminClient
                    .from("payments")
                    .update({
                      status: "paid",
                      gateway_payment_id: rzpPaymentId,
                      paid_at: nowIso,
                    })
                    .eq("id", existingPay.id);
                }
              }
            }

            // Deduct inventory atomically & idempotently
            try {
              await handleOrderSale(order.id);
            } catch (e) {
              console.error("Webhook handleOrderSale error:", e);
            }

            // Audit log
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
            } catch {}
          }
        }
        break;
      }

      case "payment.failed": {
        const errorDesc =
          paymentEntity?.error_description ||
          paymentEntity?.error_reason ||
          "Payment failed at gateway";

        if (rzpOrderId || rzpPaymentId || localOrderId) {
          // Guard: Never downgrade an already paid order due to an out-of-order failure event
          let existingOrder = null;
          if (localOrderId) {
            const { data } = await adminClient
              .from("orders")
              .select("id, payment_status")
              .eq("id", localOrderId)
              .maybeSingle();
            existingOrder = data;
          }

          if (existingOrder && existingOrder.payment_status === "paid") {
            console.log("Ignoring payment.failed for already paid order:", existingOrder.id);
            break;
          }

          // Update payment record to failed
          const failUpdateRes = await adminClient
            .from("payments")
            .update({
              status: "failed",
              failure_reason: errorDesc,
              gateway_payment_id: rzpPaymentId,
              updated_at: nowIso,
            })
            .or(`gateway_order_id.eq.${rzpOrderId || ""},order_id.eq.${localOrderId || ""}`);

          if (failUpdateRes.error && failUpdateRes.error.code === "PGRST204") {
            await adminClient
              .from("payments")
              .update({
                status: "failed",
                failure_reason: errorDesc,
                gateway_payment_id: rzpPaymentId,
              })
              .or(`gateway_order_id.eq.${rzpOrderId || ""},order_id.eq.${localOrderId || ""}`);
          }
        }
        break;
      }

      case "payment.authorized": {
        // Track authorization in payment record, but DO NOT mark order paid if capture is expected
        if (rzpOrderId && rzpPaymentId) {
          try {
            await adminClient
              .from("payments")
              .update({
                gateway_payment_id: rzpPaymentId,
                status: "pending",
                updated_at: nowIso,
              })
              .eq("gateway_order_id", rzpOrderId);
          } catch {}
        }
        break;
      }

      default: {
        // Other events acknowledged
        break;
      }
    }

    // Mark event as processed in webhook_events table
    try {
      await adminClient
        .from("webhook_events")
        .update({ status: "processed", processed_at: nowIso })
        .eq("event_id", eventId);
    } catch {}

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: unknown) {
    console.error("Unhandled error in /api/razorpay/webhook:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Webhook handler error", message: message },
      { status: 500 }
    );
  }
}
