"use server";

import { createClient } from "@/lib/supabase/server";
import {
  DashboardStatsData,
  RevenueAnalyticsItem,
  OrdersAnalyticsItem,
  TopProductItem,
  TopCategoryItem,
  RecentOrderItem,
  LowStockProductItem,
  RecentCustomerItem,
  ReviewsAnalyticsData,
  CouponAnalyticsData,
} from "./types";

// ─── Helpers for Date Ranges ─────────────────────────────────────────────────

function getDateRange(range: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start = new Date(0); // Epoch start
  let end = now;

  if (range === "today") {
    start = new Date();
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (range === "7days") {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
  } else if (range === "30days") {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
  } else if (range === "12months") {
    start = new Date();
    start.setFullYear(now.getFullYear() - 1);
    start.setHours(0, 0, 0, 0);
  } else if (range === "custom") {
    if (customStart) {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
    }
    if (customEnd) {
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── getDashboardStats ────────────────────────────────────────────────────────

export async function getDashboardStats(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<DashboardStatsData> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfThisMonth = new Date();
  startOfThisMonth.setDate(1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const earliestDate = new Date(Math.min(new Date(start).getTime(), startOfThisMonth.getTime())).toISOString();

  // Run database queries in parallel
  const [ordersRes, profilesRes, productsRes, returnsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total, status, payment_status, created_at")
      .gte("created_at", earliestDate)
      .lte("created_at", end),
    supabase
      .from("profiles")
      .select("created_at")
      .eq("role", "customer")
      .gte("created_at", earliestDate)
      .lte("created_at", end),
    supabase
      .from("products")
      .select("status, stock")
      .in("status", ["draft", "active"]),
    supabase
      .from("returns")
      .select("status, created_at")
      .gte("created_at", start)
      .lte("created_at", end),
  ]);

  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (productsRes.error) throw new Error(productsRes.error.message);
  if (returnsRes.error) throw new Error(returnsRes.error.message);

  const orders = ordersRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const products = productsRes.data ?? [];
  const returns = returnsRes.data ?? [];

  // Filter thresholds
  const startStr = new Date(start).toISOString();
  const todayStr = startOfToday.toISOString();
  const thisMonthStr = startOfThisMonth.toISOString();

  // 1. Revenue
  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid" && o.created_at >= startStr)
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const revenueThisMonth = orders
    .filter((o) => o.payment_status === "paid" && o.created_at >= thisMonthStr)
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const revenueToday = orders
    .filter((o) => o.payment_status === "paid" && o.created_at >= todayStr)
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  // 2. Orders
  const totalOrders = orders.filter((o) => o.created_at >= startStr).length;
  const ordersToday = orders.filter((o) => o.created_at >= todayStr).length;
  const pendingOrders = orders.filter((o) => o.status === "pending" && o.created_at >= startStr).length;
  const processingOrders = orders.filter((o) => o.status === "processing" && o.created_at >= startStr).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered" && o.created_at >= startStr).length;

  // 3. Customers
  const totalCustomers = profiles.filter((p) => p.created_at >= startStr).length;
  const newCustomersThisMonth = profiles.filter((p) => p.created_at >= thisMonthStr).length;

  // 4. Products (snapshot)
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const outOfStockProducts = products.filter((p) => Number(p.stock || 0) === 0).length;

  // 5. Returns
  const totalReturnsCount = returns.length;
  const pendingReturns = returns.filter((r) => r.status === "pending" || r.status === "requested").length;
  const completedReturns = returns.filter((r) => r.status === "completed" || r.status === "approved").length;

  return {
    revenue: {
      total: totalRevenue,
      thisMonth: revenueThisMonth,
      today: revenueToday,
    },
    orders: {
      total: totalOrders,
      today: ordersToday,
      pending: pendingOrders,
      processing: processingOrders,
      delivered: deliveredOrders,
    },
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomersThisMonth,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      outOfStock: outOfStockProducts,
    },
    returns: {
      total: totalReturnsCount,
      pending: pendingReturns,
      completed: completedReturns,
    },
  };
}

// ─── getRevenueAnalytics ──────────────────────────────────────────────────────

export async function getRevenueAnalytics(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<RevenueAnalyticsItem[]> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("payment_status", "paid")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return aggregateTimeSeries(data ?? [], range, "total");
}

// ─── getOrdersAnalytics ───────────────────────────────────────────────────────

export async function getOrdersAnalytics(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<OrdersAnalyticsItem[]> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return aggregateTimeSeries(data ?? [], range, "count");
}

// ─── getTopProducts ──────────────────────────────────────────────────────────

export async function getTopProducts(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<TopProductItem[]> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      quantity,
      price,
      product_id,
      products (
        name,
        product_images (
          image_url,
          is_primary
        )
      ),
      orders!inner (
        payment_status,
        created_at
      )
    `)
    .eq("orders.payment_status", "paid")
    .gte("orders.created_at", start)
    .lte("orders.created_at", end);

  if (error) throw new Error(error.message);

  const productMap: Record<string, { name: string; image_url: string | null; qty: number; rev: number }> = {};

  for (const item of data ?? []) {
    const pId = item.product_id;
    const qty = Number(item.quantity || 0);
    const rev = qty * Number(item.price || 0);

    const prodInfo = item.products as any;
    const name = prodInfo?.name || "Deleted Product";

    // Resolve primary image
    const imgs = prodInfo?.product_images ?? [];
    const primaryImg = imgs.find((i: any) => i.is_primary) ?? imgs[0];
    const image_url = primaryImg?.image_url || null;

    if (!productMap[pId]) {
      productMap[pId] = { name, image_url, qty: 0, rev: 0 };
    }
    productMap[pId].qty += qty;
    productMap[pId].rev += rev;
  }

  return Object.entries(productMap)
    .map(([id, info]) => ({
      id,
      name: info.name,
      image_url: info.image_url,
      units_sold: info.qty,
      revenue: info.rev,
    }))
    .sort((a, b) => b.units_sold - a.units_sold)
    .slice(0, 10);
}

// ─── getTopCategories ────────────────────────────────────────────────────────

export async function getTopCategories(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<TopCategoryItem[]> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("order_items")
    .select(`
      quantity,
      price,
      products (
        category_id,
        categories:category_id (
          name
        )
      ),
      orders!inner (
        payment_status,
        created_at
      )
    `)
    .eq("orders.payment_status", "paid")
    .gte("orders.created_at", start)
    .lte("orders.created_at", end);

  if (error) throw new Error(error.message);

  const categoryMap: Record<string, { products_sold: number; revenue: number }> = {};

  for (const item of data ?? []) {
    const qty = Number(item.quantity || 0);
    const rev = qty * Number(item.price || 0);

    const prodInfo = item.products as any;
    const catName = prodInfo?.categories?.name || "Uncategorized";

    if (!categoryMap[catName]) {
      categoryMap[catName] = { products_sold: 0, revenue: 0 };
    }
    categoryMap[catName].products_sold += qty;
    categoryMap[catName].revenue += rev;
  }

  return Object.entries(categoryMap)
    .map(([name, info]) => ({
      name,
      products_sold: info.products_sold,
      revenue: info.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ─── getRecentOrders ──────────────────────────────────────────────────────────

export async function getRecentOrders(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<RecentOrderItem[]> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      total,
      status,
      payment_status,
      created_at,
      profiles:user_id (
        name,
        email
      )
    `)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);

  return (data ?? []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    customer_name: o.profiles?.name || "Guest Customer",
    customer_email: o.profiles?.email || "-",
    total: Number(o.total || 0),
    status: o.status,
    payment_status: o.payment_status,
    created_at: o.created_at,
  }));
}

// ─── getLowStockProducts ──────────────────────────────────────────────────────

export async function getLowStockProducts(): Promise<LowStockProductItem[]> {
  const supabase = await createClient();

  const { data: rawProducts, error: prodError } = await supabase
    .from("products")
    .select("id, name, sku, stock, status")
    .lte("stock", 10)
    .in("status", ["draft", "active"])
    .order("stock", { ascending: true });

  if (prodError) throw new Error(prodError.message);

  const { data: rawVariants, error: varError } = await supabase
    .from("product_variants")
    .select(`
      id,
      product_id,
      name,
      sku,
      stock,
      products!inner (
        name,
        status
      )
    `)
    .lte("stock", 10)
    .in("products.status", ["draft", "active"])
    .order("stock", { ascending: true });

  if (varError) throw new Error(varError.message);

  const { data: allVariants } = await supabase
    .from("product_variants")
    .select("product_id");

  const variantProductIds = new Set((allVariants ?? []).map((v) => v.product_id));

  const items: LowStockProductItem[] = [];

  for (const p of rawProducts ?? []) {
    if (variantProductIds.has(p.id)) continue;
    items.push({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: Number(p.stock || 0),
      variant_name: "-",
    });
  }

  for (const v of rawVariants ?? []) {
    const prod = v.products as any;
    if (!prod) continue;
    items.push({
      id: v.id,
      name: prod.name,
      sku: v.sku || null,
      stock: Number(v.stock || 0),
      variant_name: v.name,
    });
  }

  return items.sort((a, b) => a.stock - b.stock).slice(0, 10);
}

// ─── getRecentCustomers ───────────────────────────────────────────────────────

export async function getRecentCustomers(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<RecentCustomerItem[]> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, avatar, created_at")
    .eq("role", "customer")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    avatar: c.avatar || null,
    created_at: c.created_at,
  }));
}

// ─── getReviewsAnalytics ──────────────────────────────────────────────────────

export async function getReviewsAnalytics(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<ReviewsAnalyticsData> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) throw new Error(error.message);

  const ratings = data ?? [];
  const totalReviews = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0;

  const distribution = {
    stars5: ratings.filter((r) => Number(r.rating) === 5).length,
    stars4: ratings.filter((r) => Number(r.rating) === 4).length,
    stars3: ratings.filter((r) => Number(r.rating) === 3).length,
    stars2: ratings.filter((r) => Number(r.rating) === 2).length,
    stars1: ratings.filter((r) => Number(r.rating) === 1).length,
  };

  return {
    averageRating,
    totalReviews,
    distribution,
  };
}

// ─── getCouponsAnalytics ──────────────────────────────────────────────────────

export async function getCouponsAnalytics(
  range: string = "30days",
  startDate?: string,
  endDate?: string
): Promise<CouponAnalyticsData> {
  const supabase = await createClient();
  const { start, end } = getDateRange(range, startDate, endDate);

  // 1. Fetch total coupons
  const { count: total, error: tError } = await supabase
    .from("coupons")
    .select("id", { count: "exact", head: true })
    .lte("created_at", end);

  // 2. Fetch active coupons
  const { count: active, error: aError } = await supabase
    .from("coupons")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .gte("end_date", new Date().toISOString())
    .lte("created_at", end);

  // 3. Fetch coupon usages in date range
  const { data: usages, error: uError } = await supabase
    .from("coupon_usage")
    .select(`
      id,
      used_at,
      coupons (
        code
      )
    `)
    .gte("used_at", start)
    .lte("used_at", end);

  if (tError || aError || uError) {
    throw new Error(tError?.message || aError?.message || uError?.message);
  }

  const usageCount = usages?.length ?? 0;

  const couponCounts: Record<string, number> = {};
  for (const u of usages ?? []) {
    const code = u.coupons?.code || "UNKNOWN";
    couponCounts[code] = (couponCounts[code] || 0) + 1;
  }

  const topCoupons = Object.entries(couponCounts)
    .map(([code, usage_count]) => ({ code, usage_count }))
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 5);

  return {
    total: total ?? 0,
    active: active ?? 0,
    totalUses: usageCount,
    topCoupons,
  };
}

// ─── Internal Helper for Chart Data Aggregations ─────────────────────────────

function aggregateTimeSeries(
  rawData: { created_at: string; total?: number | string }[],
  range: string,
  metric: "total" | "count"
): any[] {
  const map: Record<string, number> = {};

  if (range === "today") {
    // Group by hour
    for (let i = 0; i < 24; i++) {
      const label = `${String(i).padStart(2, "0")}:00`;
      map[label] = 0;
    }

    for (const row of rawData) {
      try {
        const hour = new Date(row.created_at).getHours();
        const label = `${String(hour).padStart(2, "0")}:00`;
        const val = metric === "total" ? Number(row.total || 0) : 1;
        map[label] = (map[label] || 0) + val;
      } catch {}
    }
  } else if (range === "7days" || range === "30days") {
    // Group by Day (e.g. "14 Jun")
    const daysLimit = range === "7days" ? 7 : 30;
    const now = new Date();
    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      map[label] = 0;
    }

    for (const row of rawData) {
      try {
        const label = new Date(row.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
        const val = metric === "total" ? Number(row.total || 0) : 1;
        if (map[label] !== undefined) {
          map[label] += val;
        }
      } catch {}
    }
  } else if (range === "12months") {
    // Group by Month (e.g. "Jun 2026")
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      map[label] = 0;
    }

    for (const row of rawData) {
      try {
        const label = new Date(row.created_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });
        const val = metric === "total" ? Number(row.total || 0) : 1;
        if (map[label] !== undefined) {
          map[label] += val;
        }
      } catch {}
    }
  } else {
    // Custom range or default: group by day if interval <= 30 days, else group by month
    if (rawData.length === 0) return [];
    const first = new Date(rawData[0].created_at).getTime();
    const last = new Date(rawData[rawData.length - 1].created_at).getTime();
    const diffDays = Math.ceil((last - first) / (1000 * 60 * 60 * 24));

    if (diffDays <= 31) {
      for (const row of rawData) {
        try {
          const label = new Date(row.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });
          const val = metric === "total" ? Number(row.total || 0) : 1;
          map[label] = (map[label] || 0) + val;
        } catch {}
      }
    } else {
      for (const row of rawData) {
        try {
          const label = new Date(row.created_at).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          });
          const val = metric === "total" ? Number(row.total || 0) : 1;
          map[label] = (map[label] || 0) + val;
        } catch {}
      }
    }
  }

  // Convert to chart format
  const key = metric === "total" ? "revenue" : "orders";
  return Object.entries(map).map(([date, value]) => ({
    date,
    [key]: value,
  }));
}
