import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { CreateInventoryLogInput } from "./types";

/**
 * Insert a raw inventory log entry into inventory_logs (Service Role only)
 */
export async function createInventoryLog(input: CreateInventoryLogInput) {
  const supabase = createAdminClient();

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
  }
}

/**
 * Deduct stock for all items in an order via atomic apply_order_sale RPC
 */
export async function handleOrderSale(orderId: string) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.rpc("apply_order_sale", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("handleOrderSale RPC failed:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/admin/inventory");
  return data;
}

/**
 * Restore stock for cancelled order via atomic cancel_order RPC
 */
export async function handleOrderCancellation(orderId: string) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.rpc("cancel_order", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("handleOrderCancellation RPC failed:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/admin/inventory");
  return data;
}

/**
 * Restore stock for approved return via atomic apply_return RPC
 */
export async function handleReturnApproved(returnId: string) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.rpc("apply_return", {
    p_return_id: returnId,
  });

  if (error) {
    console.error("handleReturnApproved RPC failed:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/admin/inventory");
  return data;
}
