export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Gateway = "razorpay";

export interface Payment {
  id: string;
  order_id: string | null;
  gateway: Gateway;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  amount: number;
  status: PaymentStatus;
  failure_reason: string | null;
  refunded_amount: number | null;
  paid_at: string | null;
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

export interface PaymentsStats {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
  revenue: number;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}
