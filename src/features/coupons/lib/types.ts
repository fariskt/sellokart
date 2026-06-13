export type DiscountType = "percentage" | "fixed";
export type CouponStatus = "active" | "inactive" | "expired";

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  description: string | null;
  start_date: string;
  end_date: string;
  usage_limit: number;
  is_active: boolean;
  created_at: string;
  // Computed fields
  usage_count?: number;
  coupon_usage?: { count: number }[];
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  used_at: string;
  profiles?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  orders?: {
    id: string;
    order_number: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
  } | null;
}

export interface CouponStats {
  total: number;
  active: number;
  expired: number;
  totalUses: number;
  totalDiscount: number;
}

export interface GetCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  discountType?: string;
}
