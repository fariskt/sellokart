import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runE2ETest() {
  console.log("=================================================");
  console.log("PHASE 9: END-TO-END LIFECYCLE VERIFICATION TEST");
  console.log("create order -> pay -> verify -> webhook -> single deduction -> cancel -> single restoration");
  console.log("=================================================\n");

  const results = [];
  function report(name, pass, details) {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name}`);
    if (details) console.log(`       Details: ${details}`);
  }

  const { data: authData } = await adminClient.auth.admin.listUsers();
  const user = authData?.users?.[0];
  if (!user) throw new Error("No auth users found");
  const userId = user.id;

  await adminClient.from("profiles").upsert({
    id: userId,
    email: user.email,
    name: "Admin User",
    role: "admin",
  });

  // 1. Initial product with stock = 20
  const { data: product, error: prodErr } = await adminClient
    .from("products")
    .insert({
      seller_id: userId,
      name: "E2E Lifecycle Product",
      slug: `e2e-prod-${Date.now()}`,
      price: 199.99,
      stock: 20,
      status: "active",
    })
    .select()
    .single();

  if (prodErr || !product) {
    console.error("Product insert failed:", prodErr);
    process.exit(1);
  }

  const productId = product.id;
  const initialStock = 20;

  let orderId = "";
  const rzpOrderId = `order_e2e_${Date.now()}`;
  const rzpPaymentId = `pay_e2e_${Date.now()}`;
  const orderNumber = `SK-E2E-${Date.now().toString().slice(-6)}`;
  const itemQty = 2;
  const unitPaise = Math.round(199.99 * 100); // 19999
  const subtotalPaise = unitPaise * itemQty; // 39998
  const taxPaise = Math.round(subtotalPaise * 0.18); // 7200
  const shippingPaise = 15000; // 15000
  const totalPaise = subtotalPaise + taxPaise + shippingPaise; // 62198

  try {
    // STEP 1: Create Order
    const { data: order, error: ordErr } = await adminClient
      .from("orders")
      .insert({
        order_number: orderNumber,
        subtotal: subtotalPaise / 100.0,
        tax: taxPaise / 100.0,
        shipping: shippingPaise / 100.0,
        discount: 0,
        total: totalPaise / 100.0,
        status: "pending",
        payment_status: "pending",
        user_id: userId,
        razorpay_order_id: rzpOrderId,
      })
      .select()
      .single();

    if (ordErr || !order) throw new Error("Order creation failed: " + ordErr?.message);
    orderId = order.id;

    await adminClient.from("order_items").insert({
      order_id: orderId,
      product_id: productId,
      product_name: product.name,
      quantity: itemQty,
      price: 199.99,
    });

    report(
      "Step 1: Order created with status = pending, payment_status = pending",
      order.status === "pending" && order.payment_status === "pending",
      `orderId: ${orderId}, orderNumber: ${orderNumber}`
    );

    // STEP 2 & 3: Pay & Verify
    const { data: verifyRes, error: verifyErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_gateway_order_id: rzpOrderId,
      p_gateway_payment_id: rzpPaymentId,
      p_amount_paise: totalPaise,
      p_currency: "INR",
      p_signature: "sig_e2e_valid",
    });

    const { data: stockAfterVerify } = await adminClient.from("products").select("stock").eq("id", productId).single();

    report(
      "Step 2 & 3: Payment verified, order marked paid, stock deducted (20 -> 18)",
      !verifyErr && verifyRes?.already_paid === false && stockAfterVerify?.stock === 18,
      `stock: ${stockAfterVerify?.stock}, error: ${verifyErr?.message}`
    );

    // STEP 4: Webhook fires for payment.captured (concurrent or duplicate delivery)
    const { data: webhookRes, error: webhookErr } = await adminClient.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_gateway_order_id: rzpOrderId,
      p_gateway_payment_id: rzpPaymentId,
      p_amount_paise: totalPaise,
      p_currency: "INR",
    });

    const { data: stockAfterWebhook } = await adminClient.from("products").select("stock").eq("id", productId).single();

    report(
      "Step 4: Webhook payment.captured handled idempotently (single stock deduction confirmed: 18)",
      !webhookErr && webhookRes?.already_paid === true && stockAfterWebhook?.stock === 18,
      `stock: ${stockAfterWebhook?.stock}, response: ${JSON.stringify(webhookRes)}`
    );

    // STEP 5: Cancel Order
    const { data: cancelRes, error: cancelErr } = await adminClient.rpc("cancel_order", {
      p_order_id: orderId,
    });

    const { data: stockAfterCancel } = await adminClient.from("products").select("stock").eq("id", productId).single();
    const { data: cancelledOrder } = await adminClient.from("orders").select("status").eq("id", orderId).single();

    report(
      "Step 5: Order cancelled and stock restored by exact logged quantity (18 + 2 = 20)",
      !cancelErr && cancelRes?.cancelled === true && cancelledOrder?.status === "cancelled" && stockAfterCancel?.stock === 20,
      `final stock: ${stockAfterCancel?.stock}, order status: ${cancelledOrder?.status}`
    );

    // STEP 6: Replay cancel_order (idempotency check)
    const { data: cancelReplayRes, error: cancelReplayErr } = await adminClient.rpc("cancel_order", {
      p_order_id: orderId,
    });
    const { data: stockAfterReplay } = await adminClient.from("products").select("stock").eq("id", productId).single();

    report(
      "Step 6: Cancel replay restores nothing (single restoration confirmed: 20)",
      !cancelReplayErr && cancelReplayRes?.cancelled === true && stockAfterReplay?.stock === 20,
      `final stock: ${stockAfterReplay?.stock}`
    );

  } finally {
    // Cleanup
    if (orderId) {
      await adminClient.from("inventory_logs").delete().eq("order_id", orderId);
      await adminClient.from("order_items").delete().eq("order_id", orderId);
      await adminClient.from("payments").delete().eq("order_id", orderId);
      await adminClient.from("orders").delete().eq("id", orderId);
    }
    if (productId) {
      await adminClient.from("products").delete().eq("id", productId);
    }
  }

  console.log("\n=================================================");
  const allPassed = results.every(r => r.pass);
  console.log(`END-TO-END LIFECYCLE TEST: ${allPassed ? "ALL PHASES PASSED" : "FAILED"}`);
  console.log("=================================================");
  if (!allPassed) process.exit(1);
}

runE2ETest().catch(err => {
  console.error(err);
  process.exit(1);
});
