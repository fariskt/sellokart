"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AdjustStockInput,
  CreateInventoryLogInput,
  GetInventoryParams,
  InventoryItem,
  InventoryLog,
  InventoryStats,
} from "./types";

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const adjustStockSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  variant_id: z.string().uuid("Invalid variant ID").nullable(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  type: z.enum(["restock", "adjustment", "damaged", "return"]),
  notes: z.string().max(500).nullable().optional(),
  direction: z.enum(["add", "remove"]).optional(),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 10;

function getStockStatusLabel(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock === 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

// ─── Stats ──────────────────────────────────────────────────────────────────

/**
 * Compute inventory-wide stats: total products, in stock, low stock, out of stock, total units
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  const supabase = await createClient();

  // Fetch all products with stock
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, stock, status")
    .neq("status", "archived");

  if (prodError) {
    console.error("getInventoryStats products error:", prodError.message);
  }

  // Fetch all product variants with stock
  const { data: variants, error: varError } = await supabase
    .from("product_variants")
    .select("id, product_id, stock");

  if (varError) {
    console.error("getInventoryStats variants error:", varError.message);
  }

  // Products that have no variants contribute their own stock
  const variantProductIds = new Set((variants ?? []).map((v) => v.product_id));

  const allStocks: number[] = [];

  for (const p of products ?? []) {
    if (variantProductIds.has(p.id)) continue; // variants handle this product's stock
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
export async function getInventoryPaginated({
  page = 1,
  limit = 15,
  search,
  status,
  categoryId,
}: GetInventoryParams) {
  const supabase = await createClient();

  // ── Products query (those WITHOUT variants) ──────────────────────────────
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

  if (search) {
    const s = search.trim();
    prodQuery = prodQuery.or(`name.ilike.%${s}%,sku.ilike.%${s}%`);
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

  const { data: rawProducts } = await prodQuery.order("created_at", { ascending: false });

  // ── Variants query ───────────────────────────────────────────────────────
  let varQuery = supabase
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
        sku,
        status,
        created_at,
        category_id,
        categories:category_id (id, name)
      )
      `
    )
    .neq("products.status", "archived");

  if (search) {
    const s = search.trim();
    varQuery = varQuery.or(`name.ilike.%${s}%,sku.ilike.%${s}%,products.name.ilike.%${s}%`);
  }

  if (status && status !== "all") {
    if (status === "out_of_stock") {
      varQuery = varQuery.eq("stock", 0);
    } else if (status === "low_stock") {
      varQuery = varQuery.gt("stock", 0).lte("stock", LOW_STOCK_THRESHOLD);
    } else if (status === "in_stock") {
      varQuery = varQuery.gt("stock", LOW_STOCK_THRESHOLD);
    }
  }

  const { data: rawVariants } = await varQuery.order("created_at", { ascending: false });

  // ── Find products that have variants so we exclude them from the products list ──
  const variantProductIds = new Set((rawVariants ?? []).map((v) => v.product_id));

  // ── Build flat items ─────────────────────────────────────────────────────
  const items: InventoryItem[] = [];

  for (const p of rawProducts ?? []) {
    if (variantProductIds.has(p.id)) continue; // skip - has variants
    items.push({
      id: p.id,
      product_id: p.id,
      variant_id: null,
      name: (p as any).name ?? "",
      sku: (p as any).sku ?? null,
      variant_name: "-",
      stock: Number((p as any).stock ?? 0),
      status: (p as any).status ?? "active",
      created_at: (p as any).created_at ?? "",
      category_id: (p as any).category_id ?? null,
      categories: (p as any).categories ?? null,
    });
  }

  for (const v of rawVariants ?? []) {
    const prod = (v as any).products;
    if (!prod) continue;
    items.push({
      id: v.id,
      product_id: v.product_id,
      variant_id: v.id,
      name: prod.name ?? "",
      sku: (v as any).sku ?? prod.sku ?? null,
      variant_name: (v as any).name ?? "-",
      stock: Number((v as any).stock ?? 0),
      status: prod.status ?? "active",
      created_at: prod.created_at ?? "",
      category_id: prod.category_id ?? null,
      categories: prod.categories ?? null,
    });
  }

  // Apply category filter after merge (for variants)
  const filtered =
    categoryId && categoryId !== "all"
      ? items.filter((i) => i.category_id === categoryId)
      : items;

  // ── Pagination ──────────────────────────────────────────────────────────
  const total = filtered.length;
  const from = (page - 1) * limit;
  const paginated = filtered.slice(from, from + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Low / Out of Stock ───────────────────────────────────────────────────────

/**
 * Fetch products and variants where stock <= LOW_STOCK_THRESHOLD but > 0
 */
export async function getLowStockProducts(): Promise<InventoryItem[]> {
  const result = await getInventoryPaginated({ status: "low_stock", limit: 200 });
  return result.data;
}

/**
 * Fetch products and variants where stock = 0
 */
export async function getOutOfStockProducts(): Promise<InventoryItem[]> {
  const result = await getInventoryPaginated({ status: "out_of_stock", limit: 200 });
  return result.data;
}

// ─── Inventory History ────────────────────────────────────────────────────────

/**
 * Fetch stock change logs for a specific product/variant
 */
export async function getInventoryHistory(
  productId: string,
  variantId: string | null
): Promise<InventoryLog[]> {
  const supabase = await createClient();

  let query = supabase
    .from("inventory_logs")
    .select(
      `
      *,
      products:product_id (id, name),
      product_variants:variant_id (id, name)
      `
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (variantId) {
    query = query.eq("variant_id", variantId);
  } else {
    query = query.is("variant_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getInventoryHistory error:", error.message);
    return [];
  }

  return (data ?? []) as unknown as InventoryLog[];
}

/**
 * Fetch all inventory logs (global audit trail), paginated
 */
export async function getAllInventoryLogs({
  page = 1,
  limit = 20,
  type,
}: {
  page?: number;
  limit?: number;
  type?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("inventory_logs")
    .select(
      `
      *,
      products:product_id (id, name),
      product_variants:variant_id (id, name)
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const from = (page - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1);

  if (error) {
    console.error("getAllInventoryLogs error:", error.message);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as unknown as InventoryLog[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Create Inventory Log ─────────────────────────────────────────────────────

/**
 * Insert a raw inventory log entry into inventory_logs
 */
export async function createInventoryLog(input: CreateInventoryLogInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("inventory_logs").insert({
    product_id: input.product_id,
    variant_id: input.variant_id ?? null,
    previous_stock: input.previous_stock,
    quantity: input.quantity,
    new_stock: input.new_stock,
    order_id: input.order_id ?? null,
    type: input.type,
    notes: input.notes ?? null,
  });

  if (error) {
    console.error("createInventoryLog error:", error.message);
    throw new Error(error.message);
  }
}

// ─── Adjust Stock ─────────────────────────────────────────────────────────────

/**
 * Manually adjust stock for a product or variant.
 * Writes a log entry and updates the relevant table.
 */
export async function adjustStock(input: AdjustStockInput) {
  const validation = adjustStockSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createClient();
  const { product_id, variant_id, quantity, type, notes, direction } = input;

  // ── Determine which table holds the stock ──────────────────────────────
  let previousStock = 0;

  if (variant_id) {
    const { data, error } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", variant_id)
      .single();

    if (error || !data) {
      return { success: false, message: "Variant not found" };
    }
    previousStock = Number(data.stock ?? 0);
  } else {
    const { data, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", product_id)
      .single();

    if (error || !data) {
      return { success: false, message: "Product not found" };
    }
    previousStock = Number(data.stock ?? 0);
  }

  // ── Compute new stock ────────────────────────────────────────────────
  let newStock: number;
  const isDeduct = type === "damaged" || direction === "remove";

  if (isDeduct) {
    newStock = previousStock - quantity;
  } else {
    newStock = previousStock + quantity;
  }

  if (newStock < 0) {
    return {
      success: false,
      message: `Cannot reduce stock below 0. Current stock: ${previousStock}.`,
    };
  }

  // ── Update stock ─────────────────────────────────────────────────────
  if (variant_id) {
    const { error } = await supabase
      .from("product_variants")
      .update({ stock: newStock })
      .eq("id", variant_id);

    if (error) return { success: false, message: error.message };
  } else {
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", product_id);

    if (error) return { success: false, message: error.message };
  }

  // ── Write log ──────────────────────────────────────────────────────
  await createInventoryLog({
    product_id,
    variant_id,
    previous_stock: previousStock,
    quantity,
    new_stock: newStock,
    type,
    notes: notes ?? null,
  });

  revalidatePath("/admin/inventory");

  return {
    success: true,
    message: "Stock adjusted successfully",
    newStock,
  };
}

// ─── Order Event Handlers ─────────────────────────────────────────────────────

/**
 * Deduct stock for all items in an order (sale event).
 * Idempotent: skips items that already have a "sale" log for this order.
 */
export async function handleOrderSale(orderId: string) {
  const supabase = await createClient();

  // Fetch order items
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, variant_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items || items.length === 0) return;

  for (const item of items) {
    // ── Idempotency check ────────────────────────────────────────────
    const existingQuery = supabase
      .from("inventory_logs")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", item.product_id)
      .eq("type", "sale");

    const finalQuery =
      item.variant_id
        ? existingQuery.eq("variant_id", item.variant_id)
        : existingQuery.is("variant_id", null);

    const { data: existing } = await finalQuery.limit(1);
    if (existing && existing.length > 0) continue; // already processed

    // ── Get current stock ──────────────────────────────────────────
    let previousStock = 0;

    if (item.variant_id) {
      const { data } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variant_id)
        .single();
      previousStock = Number(data?.stock ?? 0);
    } else {
      const { data } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      previousStock = Number(data?.stock ?? 0);
    }

    const newStock = Math.max(0, previousStock - Number(item.quantity));

    // ── Update stock ─────────────────────────────────────────────
    if (item.variant_id) {
      await supabase
        .from("product_variants")
        .update({ stock: newStock })
        .eq("id", item.variant_id);
    } else {
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product_id);
    }

    // ── Log ────────────────────────────────────────────────────────
    await createInventoryLog({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      previous_stock: previousStock,
      quantity: Number(item.quantity),
      new_stock: newStock,
      order_id: orderId,
      type: "sale",
    });
  }

  revalidatePath("/admin/inventory");
}

/**
 * Restore stock for all items in a cancelled order.
 * Idempotent: skips items already restored.
 */
export async function handleOrderCancellation(orderId: string) {
  const supabase = await createClient();

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, variant_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items || items.length === 0) return;

  for (const item of items) {
    // ── Idempotency check ────────────────────────────────────────────
    const existingQuery = supabase
      .from("inventory_logs")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", item.product_id)
      .eq("type", "cancelled_order");

    const finalQuery =
      item.variant_id
        ? existingQuery.eq("variant_id", item.variant_id)
        : existingQuery.is("variant_id", null);

    const { data: existing } = await finalQuery.limit(1);
    if (existing && existing.length > 0) continue;

    // ── Get current stock ──────────────────────────────────────────
    let previousStock = 0;

    if (item.variant_id) {
      const { data } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variant_id)
        .single();
      previousStock = Number(data?.stock ?? 0);
    } else {
      const { data } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      previousStock = Number(data?.stock ?? 0);
    }

    const newStock = previousStock + Number(item.quantity);

    // ── Update stock ─────────────────────────────────────────────
    if (item.variant_id) {
      await supabase
        .from("product_variants")
        .update({ stock: newStock })
        .eq("id", item.variant_id);
    } else {
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product_id);
    }

    // ── Log ────────────────────────────────────────────────────────
    await createInventoryLog({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      previous_stock: previousStock,
      quantity: Number(item.quantity),
      new_stock: newStock,
      order_id: orderId,
      type: "cancelled_order",
    });
  }

  revalidatePath("/admin/inventory");
}

/**
 * Restore stock for a return approval.
 * Idempotent: skips items already restored via return log.
 */
export async function handleReturnApproved(returnId: string) {
  const supabase = await createClient();

  // Fetch the return record to get order_id
  const { data: returnRecord, error: returnError } = await supabase
    .from("returns")
    .select("order_id")
    .eq("id", returnId)
    .single();

  if (returnError || !returnRecord?.order_id) return;

  const orderId = returnRecord.order_id;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, variant_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !items || items.length === 0) return;

  for (const item of items) {
    // ── Idempotency check ────────────────────────────────────────────
    const existingQuery = supabase
      .from("inventory_logs")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", item.product_id)
      .eq("type", "return");

    const finalQuery =
      item.variant_id
        ? existingQuery.eq("variant_id", item.variant_id)
        : existingQuery.is("variant_id", null);

    const { data: existing } = await finalQuery.limit(1);
    if (existing && existing.length > 0) continue;

    // ── Get current stock ──────────────────────────────────────────
    let previousStock = 0;

    if (item.variant_id) {
      const { data } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", item.variant_id)
        .single();
      previousStock = Number(data?.stock ?? 0);
    } else {
      const { data } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();
      previousStock = Number(data?.stock ?? 0);
    }

    const newStock = previousStock + Number(item.quantity);

    if (item.variant_id) {
      await supabase
        .from("product_variants")
        .update({ stock: newStock })
        .eq("id", item.variant_id);
    } else {
      await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.product_id);
    }

    await createInventoryLog({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      previous_stock: previousStock,
      quantity: Number(item.quantity),
      new_stock: newStock,
      order_id: orderId,
      type: "return",
    });
  }

  revalidatePath("/admin/inventory");
}
