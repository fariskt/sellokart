export interface CustomerProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  user_id: string | null;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerReturn {
  id: string;
  user_id: string;
  order_id: string;
  reason: string;
  status: string;
  created_at: string;
  orders?: {
    order_number: string;
  } | null;
}

export interface CustomerReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    product_images?: {
      image_url: string;
      is_primary: boolean;
    }[];
  } | null;
}

export interface CustomerWishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    product_images?: {
      image_url: string;
      is_primary: boolean;
    }[];
  } | null;
}

export interface CustomerListItem extends CustomerProfile {
  orders: CustomerOrder[];
  // Calculated properties helper type for display
  calculated?: {
    total_orders: number;
    total_spend: number;
    last_order_date: string | null;
  };
}

export interface CustomersStats {
  total: number;
  new30Days: number;
  active: number;
  revenue: number;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  customerType?: "all" | "new" | "returning" | "high_value";
}

export interface CustomerDetailsStats {
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  totalReviews: number;
  totalReturns: number;
  wishlistCount: number;
}
