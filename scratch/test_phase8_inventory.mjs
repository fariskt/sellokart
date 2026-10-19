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
  console.log("PHASE 8 VERIFICATION: Inventory Actions & Variant Deductions");
  console.log("=================================================\n");

  const results = [];
  function report(name, pass, details) {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
    if (details) console.log(`       Details: ${details}`);
  }

  const { data: testProfile } = await adminClient.from("profiles").select("id").limit(1).single();
  const userId = testProfile.id;

  // 1. Setup product with initial stock = 50 for concurrent adjustment test
  const { data: testProd } = await adminClient
    .from("products")
    .insert({
      seller_id: userId,
      name: "Phase 8 Concurrency Test Product",
      slug: `p8-conc-${Date.now()}`,
      price: 100,
      stock: 50,
      status: "active",
    })
    .select()
    .single();

  const productId = testProd.id;

  // 2. Setup product with variants for variant deduction test
  const { data: parentProd } = await adminClient
    .from("products")
    .insert({
      seller_id: userId,
      name: "Phase 8 Variant Parent Product",
      slug: `p8-parent-${Date.now()}`,
      price: 200,
      stock: 100,
      status: "active",
    })
    .select()
    .single();

  const { data: variantA } = await adminClient
    .from("product_variants")
    .insert({
      product_id: parentProd.id,
      name: "Size L",
      stock: 15,
      is_active: true,
      price: 200,
    })
    .select()
    .single();

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Concurrent adjust_stock x20 on one product ends with correct final stock
    // 50 initial stock - 20 calls of delta (-1) = 30 final stock
    // -------------------------------------------------------------------------
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        adminClient.rpc("adjust_stock", {
          p_product_id: productId,
          p_variant_id: null,
          p_delta: -1,
          p_type: "adjustment",
          p_notes: `Concurrent adjustment #${i + 1}`,
          p_actor: userId,
        })
      );
    }

    await Promise.all(promises);

    const { data: stockAfter20 } = await adminClient
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    report(
      "Concurrent adjust_stock x20 on one product ends with correct final stock (50 - 20 = 30)",
      stockAfter20?.stock === 30,
      `initial stock: 50, final stock: ${stockAfter20?.stock}`
    );

    // -------------------------------------------------------------------------
    // TEST 2: Purchasing a variant product deducts variant stock, NOT parent product stock
    // Parent stock = 100, Variant stock = 15. Purchase 2 of Variant -> Variant becomes 13, Parent remains 100.
    // -------------------------------------------------------------------------
    const rzpOrderNum = `order_var_${Date.now()}`;
    const { data: varOrder } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        order_number: `ORD-VAR-${Date.now()}`,
        razorpay_order_id: rzpOrderNum,
        subtotal: 400,
        total: 400,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    await adminClient.from("order_items").insert({
      order_id: varOrder.id,
      product_id: parentProd.id,
      variant_id: variantA.id,
      product_name: parentProd.name,
      variant_name: variantA.name,
      quantity: 2,
      price: 200,
    });

    // Mark paid via RPC
    const payId = `pay_var_${Date.now()}`;
    await adminClient.rpc("mark_order_paid", {
      p_order_id: varOrder.id,
      p_gateway_order_id: rzpOrderNum,
      p_gateway_payment_id: payId,
      p_amount_paise: 40000,
      p_currency: "INR",
    });

    const { data: finalParent } = await adminClient.from("products").select("stock").eq("id", parentProd.id).single();
    const { data: finalVariant } = await adminClient.from("product_variants").select("stock").eq("id", variantA.id).single();

    report(
      "A variant product purchased through checkout deducts variant stock (15 -> 13), NOT parent product stock (100 -> 100)",
      finalParent?.stock === 100 && finalVariant?.stock === 13,
      `parent stock: ${finalParent?.stock} (expected 100), variant stock: ${finalVariant?.stock} (expected 13)`
    );

    // -------------------------------------------------------------------------
    // TEST 3: inventory_logs insert permissions are service-role only
    // -------------------------------------------------------------------------
    const { error: anonLogErr } = await anonClient.from("inventory_logs").insert({
      product_id: productId,
      quantity: 1,
      type: "adjustment",
      previous_stock: 30,
      new_stock: 29,
    });

    report(
      "inventory_logs insert permissions are denied for anon/unprivileged",
      Boolean(anonLogErr),
      anonLogErr?.message || "Denied by RLS"
    );

    // Cleanup var order
    if (varOrder) {
      await adminClient.from("order_items").delete().eq("order_id", varOrder.id);
      await adminClient.from("payments").delete().eq("order_id", varOrder.id);
      await adminClient.from("orders").delete().eq("id", varOrder.id);
    }

  } finally {
    if (productId) await adminClient.from("products").delete().eq("id", productId);
    if (variantA) await adminClient.from("product_variants").delete().eq("id", variantA.id);
    if (parentProd) await adminClient.from("products").delete().eq("id", parentProd.id);
  }

  console.log("\n=================================================");
  const allPassed = results.every(r => r.pass);
  console.log(`PHASE 8 VERIFICATION: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log("=================================================");
  if (!allPassed) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
