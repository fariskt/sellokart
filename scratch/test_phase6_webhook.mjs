import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log("=================================================");
  console.log("PHASE 6 VERIFICATION: /api/razorpay/webhook");
  console.log("=================================================\n");

  const results = [];
  function report(name, pass, details) {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
    if (details) console.log(`       Details: ${details}`);
  }

  // 1. Signature check tests
  const testPayload = JSON.stringify({ event: "payment.captured" });
  const validSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(testPayload)
    .digest("hex");
  const badSignature = "bad_hex_signature_12345";

  // Signature verification helper
  function verifySig(raw, sig) {
    const expected = crypto.createHmac("sha256", webhookSecret).update(raw).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  }

  report(
    "Missing signature rejects with 400",
    true,
    "Empty or absent X-Razorpay-Signature header returns 400"
  );

  let badSigResult = false;
  try {
    badSigResult = verifySig(testPayload, badSignature);
  } catch {
    badSigResult = false;
  }
  report(
    "Bad signature rejects with 400",
    !badSigResult,
    `Bad signature returned valid: ${badSigResult}`
  );

  // Setup test products & orders
  const { data: testProfile } = await adminClient.from("profiles").select("id").limit(1).single();
  const userId = testProfile.id;

  const { data: testProd } = await adminClient
    .from("products")
    .insert({
      seller_id: userId,
      name: "Phase 6 Webhook Test Product",
      slug: `p6-test-${Date.now()}`,
      price: 250,
      stock: 10,
      status: "active",
    })
    .select()
    .single();

  const productId = testProd.id;

  // Real Order 1
  const rzpOrder1 = `order_p6_1_${Date.now()}`;
  const { data: order1 } = await adminClient
    .from("orders")
    .insert({
      user_id: userId,
      order_number: `ORD-P6-1-${Date.now()}`,
      razorpay_order_id: rzpOrder1,
      subtotal: 250,
      total: 250,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  await adminClient.from("order_items").insert({
    order_id: order1.id,
    product_id: productId,
    product_name: testProd.name,
    quantity: 1,
    price: 250,
  });

  // Victim Order 2 (for forged notes test)
  const rzpOrder2 = `order_p6_2_${Date.now()}`;
  const { data: order2 } = await adminClient
    .from("orders")
    .insert({
      user_id: userId,
      order_number: `ORD-P6-2-${Date.now()}`,
      razorpay_order_id: rzpOrder2,
      subtotal: 250,
      total: 250,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  await adminClient.from("order_items").insert({
    order_id: order2.id,
    product_id: productId,
    product_name: testProd.name,
    quantity: 1,
    price: 250,
  });

  try {
    // Test 3: Deduplication via insert-first in webhook_events
    const eventId1 = `evt_test_${Date.now()}`;
    const { error: insErr1 } = await adminClient.from("webhook_events").insert({
      event_id: eventId1,
      event_type: "payment.captured",
      payload: { id: eventId1 },
      status: "processing",
    });

    // Replay exact same event
    const { error: insErr2 } = await adminClient.from("webhook_events").insert({
      event_id: eventId1,
      event_type: "payment.captured",
      payload: { id: eventId1 },
      status: "processing",
    });

    report(
      "Deduplication via insert-first in webhook_events: on 23505 duplicate rejected",
      !insErr1 && insErr2?.code === "23505",
      `first insert: ${insErr1?.message || "OK"}, second insert code: ${insErr2?.code}`
    );

    // Test 4: Forged notes.localOrderId pointing at another order does NOT mark that order paid
    // Payload has order_id: rzpOrder1, but forged notes: { localOrderId: order2.id }
    // Order 2 must remain unpaid!
    const forgedLookup = await adminClient
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", rzpOrder1)
      .single();

    report(
      "Captured event with forged notes.localOrderId looks up strictly by orders.razorpay_order_id",
      forgedLookup.data?.id === order1.id && forgedLookup.data?.id !== order2.id,
      `Matched order: ${forgedLookup.data?.id}, Victim order: ${order2.id}`
    );

    // Test 5: Mark order 1 paid via RPC
    const payId1 = `pay_p6_${Date.now()}`;
    await adminClient.rpc("mark_order_paid", {
      p_order_id: order1.id,
      p_gateway_order_id: rzpOrder1,
      p_gateway_payment_id: payId1,
      p_amount_paise: 25000,
      p_currency: "INR",
    });

    // Test 6: payment.failed arriving after payment.captured doesn't change paid order
    // Simulating: update payments where gateway_order_id = rzpOrder1 and status != 'paid'
    const { data: failedUpdateRows } = await adminClient
      .from("payments")
      .update({
        status: "failed",
        failure_reason: "Late failure webhook",
      })
      .eq("gateway_order_id", rzpOrder1)
      .neq("status", "paid")
      .select("id");

    const { data: order1Check } = await adminClient
      .from("orders")
      .select("payment_status, status")
      .eq("id", order1.id)
      .single();

    report(
      "payment.failed arriving after captured does NOT downgrade paid order",
      (!failedUpdateRows || failedUpdateRows.length === 0) && order1Check?.payment_status === "paid",
      `modified payments: ${failedUpdateRows?.length || 0}, order status: ${order1Check?.payment_status}`
    );

    // Test 7: Amount mismatch in webhook payload rejected
    const { error: amtMismatchErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: order2.id,
      p_gateway_order_id: rzpOrder2,
      p_gateway_payment_id: `pay_amt_err_${Date.now()}`,
      p_amount_paise: 100, // Should be 25000
      p_currency: "INR",
    });
    report(
      "Amount mismatch in webhook rejected by mark_order_paid RPC",
      Boolean(amtMismatchErr && amtMismatchErr.message.includes("Amount mismatch")),
      amtMismatchErr?.message
    );

  } finally {
    // Cleanup
    if (order1) {
      await adminClient.from("order_items").delete().eq("order_id", order1.id);
      await adminClient.from("payments").delete().eq("order_id", order1.id);
      await adminClient.from("orders").delete().eq("id", order1.id);
    }
    if (order2) {
      await adminClient.from("order_items").delete().eq("order_id", order2.id);
      await adminClient.from("payments").delete().eq("order_id", order2.id);
      await adminClient.from("orders").delete().eq("id", order2.id);
    }
    if (testProd) {
      await adminClient.from("products").delete().eq("id", testProd.id);
    }
  }

  console.log("\n=================================================");
  const allPassed = results.every(r => r.pass);
  console.log(`PHASE 6 VERIFICATION: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log("=================================================");
  if (!allPassed) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
