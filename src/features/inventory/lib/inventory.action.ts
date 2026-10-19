"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  AdjustStockInput,
  GetInventoryParams,
  InventoryItem,
  InventoryLog,
  InventoryStats,
} from "./types";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const adjustStockSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  variant_id: z.string().uuid("Invalid variant ID").nullable().optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  type: z.enum(["restock", "adjustment", "damaged", "return"]),
  notes: z.string().max(500).nullable().optional(),
  direction: z.enum(["add", "remove"]).optional(),
});

const getInventoryParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(15),
  search: z.string().max(100).optional(),
  status: z.enum(["all", "in_stock", "low_stock", "out_of_stock"]).optional(),
  categoryId: z.string().optional(),
});

const getLogsParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().nullable().optional(),
  type: z.enum(["all", "sale", "restock", "return", "adjustment", "damaged", "cancelled_order"]).optional(),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 10;

function sanitizeSearch(search?: string | null): string {
  if (!search) return "";
  return search.replace(/[,()\\%"_]/g, "").trim().slice(0, 50);
}


// ─── Stats ──────────────────────────────────────────────────────────────────

/**
 * Compute inventory-wide stats: total products, in stock, low stock, out of stock, total units
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  const { supabase } = await requireAdmin();

  // Fetch all products with stock
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, stock, status")
    .neq("status", "archived");

  if (prodError) {
    console.error("getInventoryStats products error:", prodError.message);
    throw new Error("Failed to load product inventory stats");
  }

  // Fetch all product variants with stock
  const { data: variants, error: varError } = await supabase
    .from("product_variants")
    .select("id, product_id, stock");

  if (varError) {
    console.error("getInventoryStats variants error:", varError.message);
    throw new Error("Failed to load variant inventory stats");
  }

  // Products that have no variants contribute their own stock
  const variantProductIds = new Set((variants ?? []).map((v) => v.product_id));

  const allStocks: number[] = [];

  for (const p of products ?? []) {
    if (variantProductIds.has(p.id)) continue;
    allStocks.push(Number(p.stock ?? 0));
  }

  for (const v of variants ?? []) {
    allStocks.push(Number(v.stock ?? 0));
  }

  const totalProducts = allStocks.length;
  const inStock = allStocks.filter((s) => s > LOW_STOCK_THRESHOLD).length;
  const lowStock = allStocks.filter((s) => s > 0 && s <= LOW_STOCK_THRESHOLD).length;
  const outOfStock = allStocks.filter((s) => s === 0).length;
  const totalUnits = allStocks.reduce((sum, s) => sum + s, 0);

  return { totalProducts, inStock, lowStock, outOfStock, totalUnits };
}

// ─── Paginated Inventory List ────────────────────────────────────────────────

/**
 * Fetch a flat, paginated list of inventory items (products without variants + all variants)
 */
export async function getInventoryPaginated(params: GetInventoryParams = {}) {
  const { supabase } = await requireAdmin();
  const parsed = getInventoryParamsSchema.parse(params);
  const { page, limit, status, categoryId } = parsed;
  const searchClean = sanitizeSearch(parsed.search);

  // Products query (those WITHOUT variants)
  let prodQuery = supabase
    .from("products")
    .select(
      `
      id,
      name,
      sku,
      stock,
      status,
      created_at,
      category_id,
      categories:category_id (id, name)
      `,
      { count: "exact" }
    )
    .neq("status", "archived");

  if (searchClean) {
    prodQuery = prodQuery.or(`name.ilike.%${searchClean}%,sku.ilike.%${searchClean}%`);
  }

  if (categoryId && categoryId !== "all") {
    prodQuery = prodQuery.eq("category_id", categoryId);
  }

  if (status && status !== "all") {
    if (status === "out_of_stock") {
      prodQuery = prodQuery.eq("stock", 0);
    } else if (status === "low_stock") {
      prodQuery = prodQuery.gt("stock", 0).lte("stock", LOW_STOCK_THRESHOLD);
    } else if (status === "in_stock") {
      prodQuery = prodQuery.gt("stock", LOW_STOCK_THRESHOLD);
    }
  }

  const { data: rawProducts, error: prodErr } = await prodQuery.order("created_at", { ascending: false });
  if (prodErr) {
    console.error("getInventoryPaginated prodErr:", prodErr.message);
    throw new Error("Failed to load inventory products");
  }

  // Variants query
  const varQuery = supabase
    .from("product_variants")
    .select(
      `
      id,
      product_id,
      name,
      sku,
      stock,
      products:product_id (
        id,
        name,
        status,
        created_at,
        category_id,
        categories:category_id (id, name)
      )
      `
    );

  const { data: rawVariants, error: varErr } = await varQuery;
  if (varErr) {
    console.error("getInventoryPaginated varErr:", varErr.message);
    throw new Error("Failed to load inventory variants");
  }

  // Flatten and merge
  const variantProductIds = new Set((rawVariants ?? []).map((v) => v.product_id));

  const flatItems: InventoryItem[] = [];

  for (const p of rawProducts ?? []) {
    if (variantProductIds.has(p.id)) continue;
    const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    flatItems.push({
      id: p.id,
      product_id: p.id,
      variant_id: null,
      name: p.name,
      sku: p.sku ?? null,
      variant_name: "-",
      stock: Number(p.stock ?? 0),
      status: p.status,
      created_at: p.created_at,
      category_id: p.category_id,
      categories: cat ?? null,
    });
  }

  for (const v of rawVariants ?? []) {
    const parentProd = Array.isArray(v.products) ? v.products[0] : v.products;
    if (!parentProd || parentProd.status === "archived") continue;

    if (searchClean) {
      const matchName = parentProd.name.toLowerCase().includes(searchClean.toLowerCase());
      const matchSku = (v.sku ?? "").toLowerCase().includes(searchClean.toLowerCase());
      const matchVariantName = (v.name ?? "").toLowerCase().includes(searchClean.toLowerCase());
      if (!matchName && !matchSku && !matchVariantName) continue;
    }

    if (categoryId && categoryId !== "all" && parentProd.category_id !== categoryId) {
      continue;
    }

    const stockNum = Number(v.stock ?? 0);
    if (status && status !== "all") {
      if (status === "out_of_stock" && stockNum !== 0) continue;
      if (status === "low_stock" && (stockNum === 0 || stockNum > LOW_STOCK_THRESHOLD)) continue;
      if (status === "in_stock" && stockNum <= LOW_STOCK_THRESHOLD) continue;
    }

    const cat = Array.isArray(parentProd.categories) ? parentProd.categories[0] : parentProd.categories;

    flatItems.push({
      id: v.id,
      product_id: parentProd.id,
      variant_id: v.id,
      name: parentProd.name,
      sku: v.sku ?? null,
      variant_name: v.name ?? "-",
      stock: stockNum,
      status: parentProd.status,
      created_at: parentProd.created_at,
      category_id: parentProd.category_id,
      categories: cat ?? null,
    });
  }

  flatItems.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const total = flatItems.length;
  const totalPages = Math.ceil(total / limit);
  const from = (page - 1) * limit;
  const paginatedData = flatItems.slice(from, from + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// ─── Low Stock & Out of Stock Filter Helpers ─────────────────────────────────

export async function getLowStockProducts(params: { page?: number; limit?: number; search?: string } = {}) {
  await requireAdmin();
  const res = await getInventoryPaginated({ ...params, limit: params.limit ?? 100, status: "low_stock" });
  return res.data;
}

export async function getOutOfStockProducts(params: { page?: number; limit?: number; search?: string } = {}) {
  await requireAdmin();
  const res = await getInventoryPaginated({ ...params, limit: params.limit ?? 100, status: "out_of_stock" });
  return res.data;
}

// ─── Inventory Logs ──────────────────────────────────────────────────────────

export async function getInventoryHistory(productId: string, variantId?: string | null) {
  const { supabase } = await requireAdmin();

  const idValidation = z.string().uuid().safeParse(productId);
  if (!idValidation.success) {
    return [];
  }

  let query = supabase
    .from("inventory_logs")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (variantId) {
    const varValidation = z.string().uuid().safeParse(variantId);
    if (varValidation.success) {
      query = query.eq("variant_id", variantId);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("getInventoryHistory error:", error.message);
    return [];
  }

  return (data ?? []) as unknown as InventoryLog[];
}

export async function getAllInventoryLogs({
  page = 1,
  limit = 20,
  productId,
  variantId,
  type,
}: {
  page?: number;
  limit?: number;
  productId?: string;
  variantId?: string | null;
  type?: string;
} = {}) {
  const { supabase } = await requireAdmin();
  const parsed = getLogsParamsSchema.parse({
    page,
    limit,
    productId,
    variantId,
    type: type as z.infer<typeof getLogsParamsSchema>["type"],
  });

  let query = supabase
    .from("inventory_logs")
    .select(
      `
      id,
      product_id,
      variant_id,
      previous_stock,
      quantity,
      new_stock,
      order_id,
      type,
      notes,
      created_at,
      products:product_id (id, name),
      product_variants:variant_id (id, name)
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (parsed.type && parsed.type !== "all") {
    query = query.eq("type", parsed.type);
  }

  if (parsed.productId) {
    query = query.eq("product_id", parsed.productId);
  }

  if (parsed.variantId) {
    query = query.eq("variant_id", parsed.variantId);
  }

  const from = (parsed.page - 1) * parsed.limit;
  const { data, count, error } = await query.range(from, from + parsed.limit - 1);

  if (error) {
    console.error("getAllInventoryLogs error:", error.message);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as unknown as InventoryLog[],
    pagination: {
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit),
    },
  };
}

// ─── Adjust Stock ─────────────────────────────────────────────────────────────

export async function adjustStock(input: AdjustStockInput) {
  const { user } = await requireAdmin();

  const validation = adjustStockSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { product_id, variant_id, quantity, type, notes, direction } = validation.data;

  // Derive signed delta: damaged = deduct, direction === "remove" = deduct
  const isDeduct = type === "damaged" || direction === "remove";
  const signedDelta = isDeduct ? -quantity : quantity;

  const adminClient = createAdminClient();
  const { data: rpcRes, error: rpcErr } = await adminClient.rpc("adjust_stock", {
    p_product_id: product_id,
    p_variant_id: variant_id || null,
    p_delta: signedDelta,
    p_type: type,
    p_notes: notes || null,
    p_actor: user.id,
  });

  if (rpcErr) {
    console.error("adjust_stock RPC failed:", rpcErr);
    return {
      success: false,
      message: rpcErr.message || "Failed to adjust stock",
    };
  }

  revalidatePath("/admin/inventory");

  return {
    success: true,
    message: "Stock adjusted successfully",
    newStock: rpcRes?.new_stock,
  };
}
