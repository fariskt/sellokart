"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { GetPaymentsParams, Payment, PaymentStatus } from "./types";

// Zod validation schemas
const paymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"], {
  required_error: "Payment status is required",
  invalid_type_error: "Invalid payment status value",
});

const amountSchema = z.number().min(0, "Amount must be 0 or greater");

/**
 * Fetch all payments without pagination
 */
export async function getPayments(): Promise<Payment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      orders:order_id (
        id,
        order_number,
        total,
        profiles:user_id (
          id,
          name,
          email,
          phone
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Payment[];
}

/**
 * Fetch filtered and paginated payments with aggregated stats
 */
export async function getPaymentsPaginated({
  page = 1,
  limit = 10,
  search,
  status,
  dateRange,
  startDate,
  endDate,
}: GetPaymentsParams) {
  const supabase = await createClient();

  // 1. Compute stats across ALL payments
  const { data: allPayments, error: statsError } = await supabase
    .from("payments")
    .select("status, amount");

  if (statsError) {
    console.error("Error fetching payment stats:", statsError.message);
  }

  const paymentsArr = allPayments ?? [];
  const stats = {
    total: paymentsArr.length,
    paid: paymentsArr.filter((p) => p.status === "paid").length,
    pending: paymentsArr.filter((p) => p.status === "pending").length,
    failed: paymentsArr.filter((p) => p.status === "failed").length,
    refunded: paymentsArr.filter((p) => p.status === "refunded").length,
    revenue: paymentsArr
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0),
  };

  // 2. Build paginated + filtered query
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("payments").select(
    `
    *,
    orders:order_id (
      id,
      order_number,
      total,
      profiles:user_id (
        id,
        name,
        email,
        phone
      )
    )
    `,
    { count: "exact" }
  );

  // Status filter
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  // Search filter: by gateway_payment_id directly, or by order_number via lookup
  if (search) {
    const searchClean = search.trim();

    // Find matching orders by order_number
    const { data: matchingOrders } = await supabase
      .from("orders")
      .select("id")
      .ilike("order_number", `%${searchClean}%`);

    const orderIds = matchingOrders?.map((o) => o.id) ?? [];

    let orCondition = `gateway_payment_id.ilike.%${searchClean}%`;
    if (orderIds.length > 0) {
      orCondition += `,order_id.in.(${orderIds.join(",")})`;
    }
    query = query.or(orCondition);
  }

  // Date range filter
  if (dateRange && dateRange !== "all") {
    const now = new Date();
    if (dateRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = query.gte("created_at", start.toISOString());
    } else if (dateRange === "this_week") {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      query = query.gte("created_at", start.toISOString());
    } else if (dateRange === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte("created_at", start.toISOString());
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

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count ?? 0;

  return {
    data: (data ?? []) as unknown as Payment[],
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
 * Fetch a single payment by ID with nested order and profile
 */
export async function getPaymentById(paymentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      orders:order_id (
        id,
        order_number,
        total,
        profiles:user_id (
          id,
          name,
          email,
          phone
        )
      )
    `)
    .eq("id", paymentId)
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
    data: data as unknown as Payment,
  };
}
