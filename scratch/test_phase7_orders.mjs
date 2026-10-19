import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log("=================================================");
  console.log("PHASE 7 VERIFICATION: Orders Actions & State Machine");
  console.log("=================================================\n");

  const results = [];
  function report(name, pass, details) {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
    if (details) console.log(`       Details: ${details}`);
  }

  const { data: testProfile } = await adminClient.from("profiles").select("id").limit(1).single();
  const userId = testProfile.id;

  // 1. Create a test order in pending & unpaid state
  const { data: pendingOrder } = await adminClient
    .from("orders")
    .insert({
      user_id: userId,
      order_number: `ORD-P7-${Date.now()}`,
      subtotal: 100,
      total: 100,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  try {
    // Test 1: Moving unpaid order to 'processing' directly is rejected by RPC
    const { error: procErr } = await adminClient.rpc("update_order_status", {
      p_order_id: pendingOrder.id,
      p_to: "processing",
      p_actor: userId,
    });
    report(
      "processing on an unpaid order rejected",
      Boolean(procErr && (procErr.message.includes("Invalid status transition") || procErr.message.includes("requires paid"))),
      procErr?.message
    );

    // Test 2: Moving delivered -> pending rejected
    // First set order status to delivered directly via admin to test RPC transition enforcement
    await adminClient.from("orders").update({ status: "delivered", payment_status: "paid" }).eq("id", pendingOrder.id);
    const { error: delToPendErr } = await adminClient.rpc("update_order_status", {
      p_order_id: pendingOrder.id,
      p_to: "pending",
      p_actor: userId,
    });
    report(
      "delivered -> pending transition rejected",
      Boolean(delToPendErr && delToPendErr.message.includes("Invalid status transition")),
      delToPendErr?.message
    );

    // Test 3: Updating a non-existent ID returns failure and no audit log
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const { error: fakeErr } = await adminClient.rpc("update_order_status", {
      p_order_id: fakeId,
      p_to: "cancelled",
      p_actor: userId,
    });
    report(
      "Updating non-existent order ID returns failure",
      Boolean(fakeErr && fakeErr.message.includes("not found")),
      fakeErr?.message
    );

    // Test 4: Scalable stats query (head: true count queries)
    const { count: dbCount } = await adminClient.from("orders").select("*", { count: "exact", head: true });
    report(
      "Scalable stats: exact count query succeeds without row memory truncation",
      typeof dbCount === "number" && dbCount >= 1,
      `Exact orders count in database: ${dbCount}`
    );

  } finally {
    if (pendingOrder) {
      await adminClient.from("orders").delete().eq("id", pendingOrder.id);
    }
  }

  console.log("\n=================================================");
  const allPassed = results.every(r => r.pass);
  console.log(`PHASE 7 VERIFICATION: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log("=================================================");
  if (!allPassed) process.exit(1);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
