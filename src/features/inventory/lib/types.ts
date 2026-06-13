export type InventoryType =
  | "sale"
  | "restock"
  | "return"
  | "adjustment"
  | "damaged"
  | "cancelled_order";

export interface InventoryItem {
  id: string; // SKU or variant_id or product_id
  product_id: string;
  variant_id: string | null;
  name: string; // Product name
  sku: string | null;
  variant_name: string; // e.g. "Size: M, Color: Red" or "-"
  stock: number;
  status: "draft" | "active" | "archived";
  created_at: string;
  category_id?: string | null;
  categories?: {
    id: string;
    name: string;
  } | null;
  last_updated?: string | null;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  variant_id: string | null;
  previous_stock: number;
  quantity: number;
  new_stock: number;
  order_id: string | null;
  type: InventoryType;
  notes: string | null;
  created_at: string;
  products?: {
    id: string;
    name: string;
  } | null;
  product_variants?: {
    id: string;
    name: string;
  } | null;
}

export interface InventoryStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalUnits: number;
}

export interface GetInventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  categoryId?: string;
}

export interface AdjustStockInput {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  type: "restock" | "adjustment" | "damaged" | "return";
  notes?: string | null;
  direction?: "add" | "remove"; // For adjustments
}

export interface CreateInventoryLogInput {
  product_id: string;
  variant_id: string | null;
  previous_stock: number;
  quantity: number;
  new_stock: number;
  order_id?: string | null;
  type: InventoryType;
  notes?: string | null;
}
