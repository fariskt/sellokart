import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log("=================================================");
  console.log("PHASE 3 VERIFICATION: TESTING DATABASE MIGRATION");
  console.log("=================================================\n");

  const results = [];

  // Helper for reporting
  function report(name, pass, details) {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
    if (details) console.log(`       Details: ${details}`);
  }

  // Find a test user (seller/customer) to create an order
  const { data: testProfile } = await adminClient
    .from("profiles")
    .select("id")
    .limit(1)
    .single();

  const userId = testProfile?.id || "00000000-0000-0000-0000-000000000000";

  // 1. Create a test product with known stock
  const testProductSku = `TEST-PROD-${Date.now()}`;
  const { data: testProduct, error: prodErr } = await adminClient
    .from("products")
    .insert({
      seller_id: userId,
      name: "Phase 3 Test Product",
      slug: `phase-3-test-${Date.now()}`,
      price: 100,
      stock: 20,
      sku: testProductSku,
      status: "active",
    })
    .select()
    .single();

  if (prodErr || !testProduct) {
    console.error("Failed to insert test product:", prodErr);
    process.exit(1);
  }

  const productId = testProduct.id;
  console.log(`Created test product ${productId} with initial stock = 20`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Anon client: select * from orders returns empty
    // -------------------------------------------------------------------------
    const { data: anonOrders, error: anonErr } = await anonClient.from("orders").select("*");
    report(
      "As anon, select * from orders returns nothing",
      !anonErr && (!anonOrders || anonOrders.length === 0),
      `anon returned: ${JSON.stringify(anonOrders)}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: mark_order_paid with wrong amount, wrong gateway order ID, or wrong currency raises
    // -------------------------------------------------------------------------
    const testOrderNum = `ORD-T3-${Date.now()}`;
    const testRzpOrder = `order_test_${Date.now()}`;
    const { data: testOrder1, error: ordErr1 } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        order_number: testOrderNum,
        razorpay_order_id: testRzpOrder,
        subtotal: 200,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 200,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (ordErr1 || !testOrder1) throw new Error("Failed to insert testOrder1: " + ordErr1?.message);

    await adminClient.from("order_items").insert({
      order_id: testOrder1.id,
      product_id: productId,
      product_name: testProduct.name,
      quantity: 2,
      price: 100,
    });

    // 2a. Wrong amount
    const { error: errWrongAmt } = await adminClient.rpc("mark_order_paid", {
      p_order_id: testOrder1.id,
      p_gateway_order_id: testRzpOrder,
      p_gateway_payment_id: "pay_test_123",
      p_amount_paise: 99999, // Should be 20000
      p_currency: "INR",
    });
    report(
      "mark_order_paid with wrong amount raises",
      Boolean(errWrongAmt && errWrongAmt.message.includes("Amount mismatch")),
      errWrongAmt?.message
    );

    // 2b. Wrong gateway order ID
    const { error: errWrongGateway } = await adminClient.rpc("mark_order_paid", {
      p_order_id: testOrder1.id,
      p_gateway_order_id: "order_wrong_id",
      p_gateway_payment_id: "pay_test_123",
      p_amount_paise: 20000,
      p_currency: "INR",
    });
    report(
      "mark_order_paid with wrong gateway order ID raises",
      Boolean(errWrongGateway && errWrongGateway.message.includes("mismatch")),
      errWrongGateway?.message
    );

    // 2c. Wrong currency
    const { error: errWrongCurr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: testOrder1.id,
      p_gateway_order_id: testRzpOrder,
      p_gateway_payment_id: "pay_test_123",
      p_amount_paise: 20000,
      p_currency: "USD",
    });
    report(
      "mark_order_paid with wrong currency raises",
      Boolean(errWrongCurr && errWrongCurr.message.includes("currency")),
      errWrongCurr?.message
    );

    // -------------------------------------------------------------------------
    // TEST 3: Calling mark_order_paid succeeds and deducts stock exactly once
    // -------------------------------------------------------------------------
    const testPaymentId1 = `pay_val_${Date.now()}`;
    const { data: paidRes1, error: paidErr1 } = await adminClient.rpc("mark_order_paid", {
      p_order_id: testOrder1.id,
      p_gateway_order_id: testRzpOrder,
      p_gateway_payment_id: testPaymentId1,
      p_amount_paise: 20000,
      p_currency: "INR",
      p_signature: "sig_valid_1",
    });

    const { data: prodStock1 } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "mark_order_paid marks order paid and deducts stock (20 -> 18)",
      !paidErr1 && paidRes1?.already_paid === false && prodStock1?.stock === 18,
      `stock: ${prodStock1?.stock}, response: ${JSON.stringify(paidRes1)}, error: ${paidErr1?.message}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Calling mark_order_paid second time returns already_paid and leaves stock unchanged
    // -------------------------------------------------------------------------
    const { data: paidRes2, error: paidErr2 } = await adminClient.rpc("mark_order_paid", {
      p_order_id: testOrder1.id,
      p_gateway_order_id: testRzpOrder,
      p_gateway_payment_id: testPaymentId1,
      p_amount_paise: 20000,
      p_currency: "INR",
      p_signature: "sig_valid_1",
    });

    const { data: prodStock2 } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "mark_order_paid called twice returns already_paid: true and leaves stock unchanged (18)",
      !paidErr2 && paidRes2?.already_paid === true && prodStock2?.stock === 18,
      `stock: ${prodStock2?.stock}, response: ${JSON.stringify(paidRes2)}`
    );

    // -------------------------------------------------------------------------
    // TEST 5: apply_order_sale idempotency (calling directly on already-sold order deducts nothing)
    // -------------------------------------------------------------------------
    const { error: saleErr } = await adminClient.rpc("apply_order_sale", {
      p_order_id: testOrder1.id,
    });
    const { data: prodStock3 } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "calling apply_order_sale twice on one order deducts stock once (stock remains 18)",
      !saleErr && prodStock3?.stock === 18,
      `stock: ${prodStock3?.stock}, error: ${saleErr?.message}`
    );

    // -------------------------------------------------------------------------
    // TEST 6: Concurrent calls to mark_order_paid / apply_order_sale deduct once
    // -------------------------------------------------------------------------
    const testOrderNumConc = `ORD-CONC-${Date.now()}`;
    const testRzpOrderConc = `order_conc_${Date.now()}`;
    const { data: testOrderConc } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        order_number: testOrderNumConc,
        razorpay_order_id: testRzpOrderConc,
        subtotal: 300,
        total: 300,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    await adminClient.from("order_items").insert({
      order_id: testOrderConc.id,
      product_id: productId,
      product_name: testProduct.name,
      quantity: 3,
      price: 100,
    });

    // Fire 2 concurrent calls
    const concPayId = `pay_conc_${Date.now()}`;
    const [conc1, conc2] = await Promise.all([
      adminClient.rpc("mark_order_paid", {
        p_order_id: testOrderConc.id,
        p_gateway_order_id: testRzpOrderConc,
        p_gateway_payment_id: concPayId,
        p_amount_paise: 30000,
        p_currency: "INR",
      }),
      adminClient.rpc("mark_order_paid", {
        p_order_id: testOrderConc.id,
        p_gateway_order_id: testRzpOrderConc,
        p_gateway_payment_id: concPayId,
        p_amount_paise: 30000,
        p_currency: "INR",
      }),
    ]);

    const { data: prodStockConc } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "two concurrent mark_order_paid calls deduct once (18 - 3 = 15)",
      prodStockConc?.stock === 15,
      `stock: ${prodStockConc?.stock}, conc1: ${JSON.stringify(conc1.data)}, conc2: ${JSON.stringify(conc2.data)}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: An order exceeding stock raises and leaves stock unchanged
    // -------------------------------------------------------------------------
    const testOrderOversell = `ORD-OVER-${Date.now()}`;
    const testRzpOversell = `order_over_${Date.now()}`;
    const { data: testOrderOver } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        order_number: testOrderOversell,
        razorpay_order_id: testRzpOversell,
        subtotal: 5000,
        total: 5000,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    await adminClient.from("order_items").insert({
      order_id: testOrderOver.id,
      product_id: productId,
      product_name: testProduct.name,
      quantity: 999, // exceeds stock (currently 15)
      price: 100,
    });

    const { error: errOversell } = await adminClient.rpc("mark_order_paid", {
      p_order_id: testOrderOver.id,
      p_gateway_order_id: testRzpOversell,
      p_gateway_payment_id: "pay_over_1",
      p_amount_paise: 500000,
      p_currency: "INR",
    });

    const { data: prodStockOver } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "an order exceeding stock raises and leaves stock unchanged (15)",
      Boolean(errOversell && errOversell.message.includes("Insufficient stock")) && prodStockOver?.stock === 15,
      `stock: ${prodStockOver?.stock}, error: ${errOversell?.message}`
    );

    // -------------------------------------------------------------------------
    // TEST 8: cancel_order on a never-paid order restores nothing
    // -------------------------------------------------------------------------
    const { data: cancelRes1, error: cancelErr1 } = await adminClient.rpc("cancel_order", {
      p_order_id: testOrderOver.id,
    });
    const { data: prodStockCancel1 } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "cancel_order on never-paid order restores nothing (stock remains 15)",
      !cancelErr1 && cancelRes1?.cancelled === true && prodStockCancel1?.stock === 15,
      `stock: ${prodStockCancel1?.stock}, response: ${JSON.stringify(cancelRes1)}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: cancel_order on paid order restores logged quantity
    // -------------------------------------------------------------------------
    const { data: cancelRes2, error: cancelErr2 } = await adminClient.rpc("cancel_order", {
      p_order_id: testOrderConc.id, // was 3 items
    });
    const { data: prodStockCancel2 } = await adminClient.from("products").select("stock").eq("id", productId).single();
    report(
      "cancel_order on paid order restores logged quantity (15 + 3 = 18)",
      !cancelErr2 && cancelRes2?.cancelled === true && prodStockCancel2?.stock === 18,
      `stock: ${prodStockCancel2?.stock}, response: ${JSON.stringify(cancelRes2)}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Invalid transition delivered -> pending raises
    // -------------------------------------------------------------------------
    // Move testOrder1 to delivered: confirmed -> processing -> shipped -> delivered
    await adminClient.rpc("update_order_status", {
      p_order_id: testOrder1.id,
      p_to: "processing",
      p_actor: userId,
    });
    await adminClient.rpc("update_order_status", {
      p_order_id: testOrder1.id,
      p_to: "shipped",
      p_actor: userId,
    });
    await adminClient.rpc("update_order_status", {
      p_order_id: testOrder1.id,
      p_to: "delivered",
      p_actor: userId,
    });

    const { error: errInvalidTrans } = await adminClient.rpc("update_order_status", {
      p_order_id: testOrder1.id,
      p_to: "pending",
      p_actor: userId,
    });
    report(
      "invalid transition delivered -> pending raises",
      Boolean(errInvalidTrans && errInvalidTrans.message.includes("Invalid status transition")),
      errInvalidTrans?.message
    );

    // -------------------------------------------------------------------------
    // TEST 11: Security permissions: anon calling apply_order_sale is denied
    // -------------------------------------------------------------------------
    const { error: errAnonRpc } = await anonClient.rpc("apply_order_sale", {
      p_order_id: testOrder1.id,
    });
    report(
      "anon cannot execute apply_order_sale RPC",
      Boolean(errAnonRpc),
      errAnonRpc?.message
    );

    // -------------------------------------------------------------------------
    // TEST 12: RLS blocks unauthorized updates on orders, products, profiles
    // -------------------------------------------------------------------------
    // a. Anon / unprivileged cannot update orders
    const { data: ordUpdateRows } = await anonClient
      .from("orders")
      .update({ payment_status: "paid" })
      .eq("id", testOrder1.id)
      .select("id");
    report(
      "unprivileged update on orders is denied (0 rows modified)",
      !ordUpdateRows || ordUpdateRows.length === 0,
      `modified rows: ${JSON.stringify(ordUpdateRows)}`
    );

    // b. Anon / unprivileged cannot update products
    const { data: prodUpdateRows } = await anonClient
      .from("products")
      .update({ stock: 999 })
      .eq("id", productId)
      .select("id");
    report(
      "unprivileged update on products is denied (0 rows modified)",
      !prodUpdateRows || prodUpdateRows.length === 0,
      `modified rows: ${JSON.stringify(prodUpdateRows)}`
    );

    // c. Profiles role update cannot be performed by unprivileged caller
    const { data: roleUpdateRows, error: roleUpdateErr } = await anonClient
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId)
      .select("id");
    
    // Check that DB role is unchanged
    const { data: profileCheck } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    report(
      "unprivileged update on profiles role is denied and role remains unchanged",
      (!roleUpdateRows || roleUpdateRows.length === 0) && profileCheck?.role !== "admin",
      `modified rows: ${JSON.stringify(roleUpdateRows)}, current role: ${profileCheck?.role}`
    );

  } finally {
    // Cleanup test product
    await adminClient.from("products").delete().eq("id", productId);
  }

  console.log("\n=================================================");
  const allPassed = results.every((r) => r.pass);
  console.log(`PHASE 3 VERIFICATION COMPLETE: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log("=================================================");

  if (!allPassed) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
