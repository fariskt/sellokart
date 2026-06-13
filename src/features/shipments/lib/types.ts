export type ShipmentStatus =
  | "pending"
  | "packed"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled";

export interface Shipment {
  id: string;
  order_id: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  shipment_status: ShipmentStatus;
  estimated_delivery: string | null;
  notes: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  // Nested relations
  orders?: {
    id: string;
    order_number: string;
    total: number;
    profiles?: {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  } | null;
}

export interface ShipmentsStats {
  total: number;
  pending: number;
  packed: number;
  shipped: number;
  in_transit: number;
  delivered: number;
  returned: number;
}

export interface GetShipmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  courier?: string;
}

export interface UpdateShipmentInput {
  courier_name: string;
  tracking_number: string;
  shipment_status: ShipmentStatus;
  estimated_delivery?: string | null;
  notes?: string | null;
}
