"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { GetOrdersParams, Order, OrderStatus, PaymentStatus } from "./types";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";
import { getRazorpayClient } from "@/lib/razorpay/server";

// Validation schemas using Zod
const orderStatusSchema = z.enum(
  ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
  {
    error: "Valid order status is required",
  }
);

const paymentStatusSchema = z.enum(
  ["pending", "paid", "failed", "refunded"],
  {
    error: "Valid payment status is required",
  }
);

const getOrdersParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  status: z.enum(["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
  paymentStatus: z.enum(["all", "pending", "paid", "failed", "refunded"]).optional(),
  dateRange: z.enum(["all", "today", "yesterday", "last_7_days", "last_30_days", "this_month", "last_month", "custom"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

function sanitizeSearch(search?: string | null): string {
  if (!search) return "";
  return search.replace(/[,()\\%"_]/g, "").trim().slice(0, 50);
}

/**
 * Fetch all orders without pagination (Admin only)
 */
export async function getOrders(): Promise<Order[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email,
        phone
      ),
      order_items (
        id,
        order_id,
        product_id,
        variant_id,
        product_name,
        product_sku,
        variant_name,
        quantity,
        price,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load orders");
  }

  return (data ?? []) as unknown as Order[];
}

/**
 * Fetch filtered and paginated orders along with aggregated summary stats (Admin only)
 */
export async function getOrdersPaginated(params: GetOrdersParams = {}) {
  const { supabase } = await requireAdmin();
  const parsed = getOrdersParamsSchema.parse(params);
  const { page, limit, status, paymentStatus, dateRange, startDate, endDate } = parsed;
  const searchClean = sanitizeSearch(parsed.search);

  // 1. Fetch exact aggregate stats via SQL count queries (scalable beyond 1,000+ orders)
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: processingCount },
    { count: confirmedCount },
    { count: shippedCount },
    { count: deliveredCount },
    { count: cancelledCount },
    { data: revenueRows },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "shipped"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
  ]);

  const stats = {
    total: totalCount ?? 0,
    pending: pendingCount ?? 0,
    processing: (processingCount ?? 0) + (confirmedCount ?? 0),
    shipped: shippedCount ?? 0,
    delivered: deliveredCount ?? 0,
    cancelled: cancelledCount ?? 0,
    revenue: (revenueRows ?? []).reduce((sum, o) => sum + Number(o.total || 0), 0),
  };

  // 2. Build filtered paginated query
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("orders").select(
    `
    *,
    profiles:user_id (
      id,
      name,
      email,
      phone
    ),
    order_items (
      id,
      order_id,
      product_id,
      variant_id,
      product_name,
      product_sku,
      variant_name,
      quantity,
      price,
      created_at
    )
    `,
    { count: "exact" }
  );

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (paymentStatus && paymentStatus !== "all") {
    query = query.eq("payment_status", paymentStatus);
  }

  if (searchClean) {
    query = query.ilike("order_number", `%${searchClean}%`);
  }

  // Date filters
  const now = new Date();
  if (dateRange === "today") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    query = query.gte("created_at", today);
  } else if (dateRange === "yesterday") {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfYesterday = yesterday.toISOString();
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    query = query.gte("created_at", startOfYesterday).lt("created_at", endOfYesterday);
  } else if (dateRange === "last_7_days") {
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", last7Days);
  } else if (dateRange === "last_30_days") {
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", last30Days);
  } else if (dateRange === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    query = query.gte("created_at", startOfMonth);
  } else if (dateRange === "last_month") {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    query = query.gte("created_at", startOfLastMonth).lt("created_at", endOfLastMonth);
  } else if (dateRange === "custom" && startDate && endDate) {
    query = query.gte("created_at", startDate).lte("created_at", endDate);
  }

  query = query.order("created_at", { ascending: false });

  const { data: orders, count, error } = await query.range(from, to);

  if (error) {
    console.error("Error fetching orders:", error.message);
    return {
      data: [],
      orders: [],
      stats,
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const filteredTotal = count ?? 0;
  const orderList = (orders ?? []) as unknown as Order[];

  return {
    data: orderList,
    orders: orderList,
    stats,
    pagination: {
      page,
      limit,
      total: filteredTotal,
      totalPages: Math.ceil(filteredTotal / limit),
    },
  };
}

/**
 * Fetch a single order by ID with profile and nested items (Admin only)
 */
export async function getOrderById(orderId: string) {
  const { supabase } = await requireAdmin();

  const idValidation = z.string().uuid().safeParse(orderId);
  if (!idValidation.success) {
    return {
      success: false,
      message: "Invalid order ID format",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email,
        phone
      ),
      order_items (
        id,
        order_id,
        product_id,
        variant_id,
        product_name,
        product_sku,
        variant_name,
        quantity,
        price,
        created_at
      )
    `)
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return {
      success: false,
      message: "Order not found",
      data: null,
    };
  }

  return {
    success: true,
    data: data as unknown as Order,
  };
}

/**
 * Update order status (Admin only)
 * Calls update_order_status RPC (state machine & inventory side effects inside)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { supabase, user } = await requireAdmin();

  const idValidation = z.string().uuid().safeParse(orderId);
  if (!idValidation.success) {
    return { success: false, message: "Invalid order ID format" };
  }

  const validation = orderStatusSchema.safeParse(status);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid order status value",
    };
  }

  // Fetch current order to ensure existence and capture old value for audit log
  const { data: currentOrder, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, order_number")
    .eq("id", orderId)
    .single();

  if (fetchErr || !currentOrder) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  const oldStatus = currentOrder.status;

  // Enforce state transition and inventory side-effects via Postgres RPC
  const { error: rpcErr } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_to: status,
    p_actor: user.id,
  });

  if (rpcErr) {
    console.error("update_order_status RPC failed:", rpcErr);
    return {
      success: false,
      message: rpcErr.message || "Failed to update order status",
    };
  }

  revalidatePath("/admin/orders");

  // Audit log written ONLY on actual success
  try {
    await createAuditLog({
      userId: user.id,
      action: status === "cancelled" ? "Order Cancelled" : "Order Status Changed",
      tableName: "orders",
      recordId: orderId,
      entityName: `Order #${currentOrder.order_number}`,
      metadata: {
        oldStatus,
        newStatus: status,
      },
    });
  } catch (auditErr) {
    console.warn("Audit log notice:", auditErr);
  }

  return {
    success: true,
    message: "Order status updated successfully",
  };
}

/**
 * Update payment status (Admin only)
 * Restricted to 'refunded' only. Calls Razorpay API and disallows manual 'paid' mutations.
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  reason?: string
) {
  const { supabase, user } = await requireAdmin();

  const idValidation = z.string().uuid().safeParse(orderId);
  if (!idValidation.success) {
    return { success: false, message: "Invalid order ID format" };
  }

  const validation = paymentStatusSchema.safeParse(paymentStatus);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid payment status value",
    };
  }

  // Security rule: Never allow manual setting of 'paid'
  if (paymentStatus === "paid") {
    return {
      success: false,
      message: "Manual setting of paid status is disallowed. Orders must be paid via gateway verification.",
    };
  }

  // Only allow initiating a refund
  if (paymentStatus !== "refunded") {
    return {
      success: false,
      message: "Only refund requests are supported via payment status update.",
    };
  }

  if (!reason || !reason.trim()) {
    return {
      success: false,
      message: "A refund reason is required.",
    };
  }

  // Fetch payment details for this order
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id, gateway, gateway_payment_id, amount, status")
    .eq("order_id", orderId)
    .single();

  if (payErr || !payment) {
    return {
      success: false,
      message: "No payment record found for this order.",
    };
  }

  if (payment.status !== "paid") {
    return {
      success: false,
      message: `Cannot refund an unpaid order (current payment status: ${payment.status}).`,
    };
  }

  // Trigger refund via Razorpay if gateway_payment_id exists
  if (payment.gateway === "razorpay" && payment.gateway_payment_id) {
    try {
      const razorpay = getRazorpayClient();
      const amountPaise = Math.round(Number(payment.amount) * 100);
      await razorpay.payments.refund(payment.gateway_payment_id, {
        amount: amountPaise,
        notes: {
          reason: reason.trim(),
          actor: user.id,
        },
      });
    } catch (refErr: unknown) {
      console.error("Razorpay refund error:", refErr);
      return {
        success: false,
        message: "Payment provider rejected the refund request.",
      };
    }
  }

  // Update payment and order records
  const { data: updatedRows, error: updErr } = await supabase
    .from("payments")
    .update({
      status: "refunded",
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .select("id");

  if (updErr || !updatedRows || updatedRows.length === 0) {
    return {
      success: false,
      message: "Failed to record refund status in database.",
    };
  }

  await supabase
    .from("orders")
    .update({
      payment_status: "refunded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  revalidatePath("/admin/orders");

  try {
    await createAuditLog({
      userId: user.id,
      action: "Payment Refunded",
      tableName: "payments",
      recordId: payment.id,
      entityName: `Order Payment #${orderId}`,
      metadata: {
        reason: reason.trim(),
        previousStatus: payment.status,
        newStatus: "refunded",
      },
    });
  } catch (auditErr) {
    console.warn("Audit log notice:", auditErr);
  }

  return {
    success: true,
    message: "Refund processed successfully",
  };
}
