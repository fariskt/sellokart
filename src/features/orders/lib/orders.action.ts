"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GetOrdersParams, Order, OrderStatus, PaymentStatus } from "./types";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";
import {
  handleOrderSale,
  handleOrderCancellation,
} from "@/features/inventory/lib/inventory.action";

// Validation schemas using Zod
const orderStatusSchema = z.enum(
  ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
  {
    error: "Order status is required",
  }
);

const paymentStatusSchema = z.enum(
  ["pending", "paid", "failed", "refunded"],
  {
    error: "Payment status is required",
  }
);

/**
 * Fetch all orders without pagination
 */
export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();

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
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Order[];
}

/**
 * Fetch filtered and paginated orders along with aggregated summary stats
 */
export async function getOrdersPaginated({
  page = 1,
  limit = 10,
  search,
  status,
  paymentStatus,
  dateRange,
  startDate,
  endDate,
}: GetOrdersParams) {
  const supabase = await createClient();

  // 1. Fetch stats based on ALL orders (so stats reflect the entire store state, not the filtered subset)
  const { data: allOrders, error: statsError } = await supabase
    .from("orders")
    .select("status, payment_status, total");

  if (statsError) {
    console.error("Error fetching stats data:", statsError.message);
  }

  const ordersArray = allOrders ?? [];
  const stats = {
    total: ordersArray.length,
    pending: ordersArray.filter((o) => o.status === "pending").length,
    processing: ordersArray.filter((o) => o.status === "processing").length,
    shipped: ordersArray.filter((o) => o.status === "shipped").length,
    delivered: ordersArray.filter((o) => o.status === "delivered").length,
    cancelled: ordersArray.filter((o) => o.status === "cancelled").length,
    revenue: ordersArray
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + Number(o.total || 0), 0),
  };

  // 2. Build the paginated and filtered query
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

  // Apply filters
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (paymentStatus && paymentStatus !== "all") {
    query = query.eq("payment_status", paymentStatus);
  }

  if (search) {
    const searchClean = search.trim();
    // Search profile names matching the term
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id")
      .ilike("name", `%${searchClean}%`);

    const profileIds = profilesData?.map((p) => p.id) ?? [];

    let orCondition = `order_number.ilike.%${searchClean}%`;
    if (profileIds.length > 0) {
      orCondition += `,user_id.in.(${profileIds.join(",")})`;
    }
    query = query.or(orCondition);
  }

  if (dateRange && dateRange !== "all") {
    const now = new Date();
    if (dateRange === "today") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = query.gte("created_at", startOfToday.toISOString());
    } else if (dateRange === "this_week") {
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startOfWeek.toISOString());
    } else if (dateRange === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte("created_at", startOfMonth.toISOString());
    } else if (dateRange === "custom" && startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte("created_at", start.toISOString());

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }
    }
  }

  // Execute paginated range query
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count ?? 0;

  return {
    data: (data ?? []) as unknown as Order[],
    stats,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/**
 * Fetch a single order by ID with profile and nested items
 */
export async function getOrderById(orderId: string) {
  const supabase = await createClient();

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

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }

  return {
    success: true,
    data: data as unknown as Order,
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();

  // Validate status using Zod
  const validation = orderStatusSchema.safeParse(status);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid order status value",
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  // Trigger inventory updates based on the new status
  if (status === "processing") {
    await handleOrderSale(orderId).catch((e) =>
      console.error("handleOrderSale failed:", e)
    );
  } else if (status === "cancelled") {
    await handleOrderCancellation(orderId).catch((e) =>
      console.error("handleOrderCancellation failed:", e)
    );
  }

  revalidatePath("/admin/orders");

  const { data: order } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .single();

  const entityName = order ? `Order #${order.order_number}` : "Order";
  const actionName = status === "cancelled" ? "Order Cancelled" : "Order Status Changed";

  await createAuditLog({
    action: actionName,
    tableName: "orders",
    recordId: orderId,
    entityName: entityName,
    metadata: {
      status,
    },
  });

  return {
    success: true,
    message: "Order status updated successfully",
  };
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  const supabase = await createClient();

  // Validate payment status using Zod
  const validation = paymentStatusSchema.safeParse(paymentStatus);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid payment status value",
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/orders");

  const { data: order } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", orderId)
    .single();

  const entityName = order ? `Order #${order.order_number}` : "Order";
  
  let actionName = "Payment Status Changed";
  if (paymentStatus === "paid") {
    actionName = "Payment Created";
  } else if (paymentStatus === "refunded") {
    actionName = "Payment Refunded";
  } else if (paymentStatus === "failed") {
    actionName = "Payment Failed";
  }

  await createAuditLog({
    action: actionName,
    tableName: "orders",
    recordId: orderId,
    entityName: entityName,
    metadata: {
      paymentStatus,
    },
  });

  return {
    success: true,
    message: "Payment status updated successfully",
  };
}
