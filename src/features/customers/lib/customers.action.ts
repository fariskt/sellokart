"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  CustomerAddress,
  CustomerListItem,
  CustomerOrder,
  CustomerProfile,
  CustomerReturn,
  CustomerReview,
  CustomerWishlistItem,
  GetCustomersParams,
  CustomerDetailsStats,
} from "./types";

// Validation schemas
const customerIdSchema = z.string().uuid("Invalid customer ID format");

const getCustomersParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  search: z.string().trim().optional(),
  dateRange: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerType: z.enum(["all", "new", "returning", "high_value"]).optional().default("all"),
});

/**
 * Fetch all profiles with role = 'customer'
 */
export async function getCustomers(): Promise<CustomerProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerProfile[];
}

/**
 * Fetch filtered, paginated customers with statistics and calculation summary
 */
export async function getCustomersPaginated(params: GetCustomersParams) {
  // Validate params using Zod
  const validated = getCustomersParamsSchema.parse(params);
  const { page, limit, search, dateRange, startDate, endDate, customerType } = validated;

  const supabase = await createClient();

  // 1. Fetch store-wide metrics: retrieve all customers and their orders to compute stats
  // (This ensures metrics match the entire customer base, not just the filtered/paginated page)
  const { data: allCustomers, error: statsError } = await supabase
    .from("profiles")
    .select(`
      id,
      created_at,
      orders (
        id,
        total,
        payment_status,
        created_at
      )
    `)
    .eq("role", "customer");

  if (statsError) {
    console.error("Error fetching customer stats:", statsError.message);
  }

  const customersArr = allCustomers ?? [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Compute store-wide statistics
  const storeStats = {
    total: customersArr.length,
    // Joined in last 30 days
    new30Days: customersArr.filter((c) => new Date(c.created_at) >= thirtyDaysAgo).length,
    // Has at least 1 order in the last 30 days
    active: customersArr.filter((c) =>
      (c.orders as any[])?.some((o) => new Date(o.created_at) >= thirtyDaysAgo)
    ).length,
    // Sum of paid orders
    revenue: customersArr.reduce(
      (sum, c) =>
        sum +
        ((c.orders as any[])?.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total || 0), 0) ?? 0),
      0
    ),
  };

  // 2. Query filtered profiles.
  // SQL Filters for profiles fields are applied first to reduce database loading.
  let query = supabase
    .from("profiles")
    .select(`
      id,
      name,
      email,
      phone,
      avatar,
      role,
      created_at,
      updated_at,
      orders (
        id,
        total,
        status,
        payment_status,
        created_at
      )
    `)
    .eq("role", "customer");

  // Search filter
  if (search) {
    const searchClean = search.trim();
    query = query.or(`name.ilike.%${searchClean}%,email.ilike.%${searchClean}%,phone.ilike.%${searchClean}%`);
  }

  // Registration Date filters
  if (dateRange && dateRange !== "all") {
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

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // 3. Process calculations and filter by Customer Type in JS
  let processedList: CustomerListItem[] = (data ?? []).map((p: any) => {
    const orders: CustomerOrder[] = p.orders ?? [];
    const total_orders = orders.length;
    const total_spend = orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const last_order_date =
      orders.length > 0
        ? new Date(Math.max(...orders.map((o) => new Date(o.created_at).getTime()))).toISOString()
        : null;

    return {
      ...p,
      calculated: {
        total_orders,
        total_spend,
        last_order_date,
      },
    };
  });

  // Apply Customer Type filters
  if (customerType && customerType !== "all") {
    if (customerType === "new") {
      // Profiles created within the last 30 days
      processedList = processedList.filter(
        (c) => new Date(c.created_at) >= thirtyDaysAgo
      );
    } else if (customerType === "returning") {
      // Customers with 2 or more orders
      processedList = processedList.filter(
        (c) => (c.calculated?.total_orders ?? 0) >= 2
      );
    } else if (customerType === "high_value") {
      // High Spend customers (Spend >= 10,000 INR)
      processedList = processedList.filter(
        (c) => (c.calculated?.total_spend ?? 0) >= 10000
      );
    }
  }

  // 4. Paginate final filtered records
  const totalRecords = processedList.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const startIndex = (page - 1) * limit;
  const paginatedList = processedList.slice(startIndex, startIndex + limit);

  return {
    data: paginatedList,
    stats: storeStats,
    pagination: {
      page,
      limit,
      total: totalRecords,
      totalPages,
    },
  };
}

/**
 * Fetch profile details by customer ID
 */
export async function getCustomerById(customerId: string) {
  // Validate ID
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", customerId)
    .eq("role", "customer")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message === "Row not found" ? "Customer not found." : error.message,
      data: null,
    };
  }

  return {
    success: true,
    data: data as CustomerProfile,
  };
}

/**
 * Fetch customer order list
 */
export async function getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, user_id, order_number, total, status, payment_status, created_at")
    .eq("user_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerOrder[];
}

/**
 * Fetch customer saved addresses
 */
export async function getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("addresses")
    .select("id, user_id, full_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at, updated_at")
    .eq("user_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerAddress[];
}

/**
 * Fetch returns for a customer
 */
export async function getCustomerReturns(customerId: string): Promise<CustomerReturn[]> {
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("returns")
    .select(`
      id,
      user_id,
      order_id,
      reason,
      status,
      created_at,
      orders:order_id (
        order_number
      )
    `)
    .eq("user_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as CustomerReturn[];
}

/**
 * Fetch reviews by a customer
 */
export async function getCustomerReviews(customerId: string): Promise<CustomerReview[]> {
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      user_id,
      product_id,
      rating,
      comment,
      created_at,
      products:product_id (
        id,
        name,
        price,
        product_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq("user_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as CustomerReview[];
}

/**
 * Fetch wishlist items for a customer
 */
export async function getCustomerWishlist(customerId: string): Promise<CustomerWishlistItem[]> {
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      id,
      user_id,
      product_id,
      created_at,
      products:product_id (
        id,
        name,
        price,
        product_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq("user_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as CustomerWishlistItem[];
}

/**
 * Fetch stats summary for a single customer
 */
export async function getCustomerStats(customerId: string): Promise<CustomerDetailsStats> {
  customerIdSchema.parse(customerId);

  const supabase = await createClient();

  // Run queries in parallel
  const [ordersRes, reviewsRes, returnsRes, wishlistRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total, payment_status")
      .eq("user_id", customerId),
    supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .eq("user_id", customerId),
    supabase
      .from("returns")
      .select("id", { count: "exact" })
      .eq("user_id", customerId),
    supabase
      .from("wishlists")
      .select("id", { count: "exact" })
      .eq("user_id", customerId),
  ]);

  const orders = ordersRes.data ?? [];
  const totalOrders = orders.length;

  const totalSpend = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

  return {
    totalOrders,
    totalSpend,
    averageOrderValue,
    totalReviews: reviewsRes.count ?? 0,
    totalReturns: returnsRes.count ?? 0,
    wishlistCount: wishlistRes.count ?? 0,
  };
}
