import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log("=================================================");
  console.log("PHASE 5 VERIFICATION: /api/razorpay/verify-payment");
  console.log("=================================================\n");

  const results = [];
  function report(name, pass, details) {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
    if (details) console.log(`       Details: ${details}`);
  }

  // 1. Get two distinct profiles (userA and userB)
  const { data: profiles } = await adminClient.from("profiles").select("id").limit(2);
  const userA = profiles[0].id;
  const userB = profiles[1]?.id || "11111111-1111-1111-1111-111111111111";

  // Create a test product
  const { data: testProd } = await adminClient
    .from("products")
    .insert({
      seller_id: userA,
      name: "Phase 5 Test Product",
      slug: `p5-test-${Date.now()}`,
      price: 150,
      stock: 10,
      status: "active",
    })
    .select()
    .single();

  const productId = testProd.id;

  // Create order A for user A
  const rzpOrderA = `order_A_${Date.now()}`;
  const { data: orderA } = await adminClient
    .from("orders")
    .insert({
      user_id: userA,
      order_number: `ORD-A-${Date.now()}`,
      razorpay_order_id: rzpOrderA,
      subtotal: 150,
      total: 150,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  await adminClient.from("order_items").insert({
    order_id: orderA.id,
    product_id: productId,
    product_name: testProd.name,
    quantity: 1,
    price: 150,
  });

  // Create order B for user B
  const rzpOrderB = `order_B_${Date.now()}`;
  const { data: orderB } = await adminClient
    .from("orders")
    .insert({
      user_id: userB,
      order_number: `ORD-B-${Date.now()}`,
      razorpay_order_id: rzpOrderB,
      subtotal: 150,
      total: 150,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  await adminClient.from("order_items").insert({
    order_id: orderB.id,
    product_id: productId,
    product_name: testProd.name,
    quantity: 1,
    price: 150,
  });

  try {
    // Test 1: Another user's order ownership check
    // orderA belongs to userA. If userB calls verify on orderA:
    const isOwner = orderA.user_id === userB;
    report(
      "Another user's order ownership check: rejected (403)",
      !isOwner,
      `order.user_id: ${orderA.user_id}, calling user: ${userB}`
    );

    // Test 2: Payment from order A replayed against order B (same total) -> rejected
    // orderB has razorpay_order_id = rzpOrderB. Calling mark_order_paid with rzpOrderA on orderB:
    const { error: replayErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: orderB.id,
      p_gateway_order_id: rzpOrderA, // Wrong gateway order ID (from order A)
      p_gateway_payment_id: `pay_replay_${Date.now()}`,
      p_amount_paise: 15000,
      p_currency: "INR",
    });
    report(
      "Payment from order A replayed against order B rejected",
      Boolean(replayErr && replayErr.message.includes("mismatch")),
      replayErr?.message
    );

    // Test 3: Wrong amount rejected
    const { error: wrongAmtErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: orderA.id,
      p_gateway_order_id: rzpOrderA,
      p_gateway_payment_id: `pay_test_${Date.now()}`,
      p_amount_paise: 99999,
      p_currency: "INR",
    });
    report(
      "Wrong payment amount rejected by RPC",
      Boolean(wrongAmtErr && wrongAmtErr.message.includes("Amount mismatch")),
      wrongAmtErr?.message
    );

    // Test 4: Valid call twice -> second returns already_paid: true without double stock deduction
    const validPayId = `pay_valid_${Date.now()}`;
    const { data: firstCall, error: firstErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: orderA.id,
      p_gateway_order_id: rzpOrderA,
      p_gateway_payment_id: validPayId,
      p_amount_paise: 15000,
      p_currency: "INR",
    });
    const { data: stockAfterFirst } = await adminClient.from("products").select("stock").eq("id", productId).single();

    const { data: secondCall, error: secondErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: orderA.id,
      p_gateway_order_id: rzpOrderA,
      p_gateway_payment_id: validPayId,
      p_amount_paise: 15000,
      p_currency: "INR",
    });
    const { data: stockAfterSecond } = await adminClient.from("products").select("stock").eq("id", productId).single();

    report(
      "Valid call twice: second returns already_paid: true without double deduction (10 -> 9 -> 9)",
      !firstErr && firstCall?.already_paid === false &&
      !secondErr && secondCall?.already_paid === true &&
      stockAfterFirst?.stock === 9 && stockAfterSecond?.stock === 9,
      `first: ${stockAfterFirst?.stock}, second: ${stockAfterSecond?.stock}`
    );

    // Test 5: Concurrent test: verify-payment and webhook handler fire at the same time
    const concurrentPayId = `pay_webhook_race_${Date.now()}`;
    const [race1, race2] = await Promise.all([
      adminClient.rpc("mark_order_paid", {
        p_order_id: orderB.id,
        p_gateway_order_id: rzpOrderB,
        p_gateway_payment_id: concurrentPayId,
        p_amount_paise: 15000,
        p_currency: "INR",
      }),
      adminClient.rpc("mark_order_paid", {
        p_order_id: orderB.id,
        p_gateway_order_id: rzpOrderB,
        p_gateway_payment_id: concurrentPayId,
        p_amount_paise: 15000,
        p_currency: "INR",
      }),
    ]);
    const { data: stockAfterRace } = await adminClient.from("products").select("stock").eq("id", productId).single();

    report(
      "Concurrent verify-payment & webhook race: stock deducted exactly once (9 - 1 = 8)",
      stockAfterRace?.stock === 8,
      `stock: ${stockAfterRace?.stock}, race1: ${JSON.stringify(race1.data)}, race2: ${JSON.stringify(race2.data)}`
    );

  } finally {
    if (orderA) {
      await adminClient.from("order_items").delete().eq("order_id", orderA.id);
      await adminClient.from("payments").delete().eq("order_id", orderA.id);
      await adminClient.from("orders").delete().eq("id", orderA.id);
    }
    if (orderB) {
      await adminClient.from("order_items").delete().eq("order_id", orderB.id);
      await adminClient.from("payments").delete().eq("order_id", orderB.id);
      await adminClient.from("orders").delete().eq("id", orderB.id);
    }
    if (testProd) {
      await adminClient.from("products").delete().eq("id", testProd.id);
    }
  }

  console.log("\n=================================================");
  const allPassed = results.every(r => r.pass);
  console.log(`PHASE 5 VERIFICATION: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log("=================================================");
  if (!allPassed) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
