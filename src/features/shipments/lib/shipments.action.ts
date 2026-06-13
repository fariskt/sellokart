"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  GetShipmentsParams,
  Shipment,
  ShipmentStatus,
  UpdateShipmentInput,
} from "./types";

// Zod validation schema
const updateShipmentSchema = z.object({
  courier_name: z.string().trim().min(1, "Courier name is required"),
  tracking_number: z.string().trim().min(1, "Tracking number is required"),
  shipment_status: z.enum(
    [
      "pending",
      "packed",
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "returned",
      "cancelled",
    ],
    { required_error: "Shipment status is required" }
  ),
  estimated_delivery: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * Fetch all shipments without pagination
 */
export async function getShipments(): Promise<Shipment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipments")
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

  return (data ?? []) as unknown as Shipment[];
}

/**
 * Fetch filtered and paginated shipments with aggregated stats
 */
export async function getShipmentsPaginated({
  page = 1,
  limit = 10,
  search,
  status,
  courier,
}: GetShipmentsParams) {
  const supabase = await createClient();

  // 1. Compute stats across ALL shipments
  const { data: allShipments, error: statsError } = await supabase
    .from("shipments")
    .select("shipment_status");

  if (statsError) {
    console.error("Error fetching shipment stats:", statsError.message);
  }

  const shipmentsArr = allShipments ?? [];
  const stats = {
    total: shipmentsArr.length,
    pending: shipmentsArr.filter((s) => s.shipment_status === "pending").length,
    packed: shipmentsArr.filter((s) => s.shipment_status === "packed").length,
    shipped: shipmentsArr.filter((s) => s.shipment_status === "shipped").length,
    in_transit: shipmentsArr.filter((s) => s.shipment_status === "in_transit").length,
    delivered: shipmentsArr.filter((s) => s.shipment_status === "delivered").length,
    returned: shipmentsArr.filter((s) => s.shipment_status === "returned").length,
  };

  // 2. Build paginated + filtered query
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("shipments").select(
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
    query = query.eq("shipment_status", status);
  }

  // Courier filter
  if (courier && courier !== "all") {
    query = query.ilike("courier_name", `%${courier}%`);
  }

  // Search filter: tracking number OR order number lookup
  if (search) {
    const searchClean = search.trim();

    const { data: matchingOrders } = await supabase
      .from("orders")
      .select("id")
      .ilike("order_number", `%${searchClean}%`);

    const orderIds = matchingOrders?.map((o) => o.id) ?? [];

    let orCondition = `tracking_number.ilike.%${searchClean}%`;
    if (orderIds.length > 0) {
      orCondition += `,order_id.in.(${orderIds.join(",")})`;
    }
    query = query.or(orCondition);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count ?? 0;

  return {
    data: (data ?? []) as unknown as Shipment[],
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
 * Fetch a single shipment by ID with nested order and profile
 */
export async function getShipmentById(shipmentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipments")
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
    .eq("id", shipmentId)
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
    data: data as unknown as Shipment,
  };
}

/**
 * Update a shipment — automatically sets shipped_at / delivered_at when status changes
 */
export async function updateShipment(
  shipmentId: string,
  input: UpdateShipmentInput
) {
  const supabase = await createClient();

  // Validate input using Zod
  const validation = updateShipmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid shipment data",
    };
  }

  const { courier_name, tracking_number, shipment_status, estimated_delivery, notes } =
    validation.data;

  // Fetch existing record to preserve timestamps
  const { data: existing } = await supabase
    .from("shipments")
    .select("shipment_status, shipped_at, delivered_at")
    .eq("id", shipmentId)
    .single();

  // Auto-set timestamps based on status transitions
  const now = new Date().toISOString();
  let shipped_at = existing?.shipped_at ?? null;
  let delivered_at = existing?.delivered_at ?? null;

  if (shipment_status === "shipped" && !shipped_at) {
    shipped_at = now;
  }
  if (shipment_status === "delivered" && !delivered_at) {
    delivered_at = now;
  }

  const { error } = await supabase
    .from("shipments")
    .update({
      courier_name,
      tracking_number,
      shipment_status,
      estimated_delivery: estimated_delivery ?? null,
      notes: notes ?? null,
      shipped_at,
      delivered_at,
    })
    .eq("id", shipmentId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/shipments");

  return {
    success: true,
    message: "Shipment updated successfully",
  };
}
