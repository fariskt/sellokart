export interface DashboardStatsData {
  revenue: {
    total: number;
    thisMonth: number;
    today: number;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
    processing: number;
    delivered: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  returns: {
    total: number;
    pending: number;
    completed: number;
  };
}

export interface RevenueAnalyticsItem {
  date: string;
  revenue: number;
}

export interface OrdersAnalyticsItem {
  date: string;
  orders: number;
}

export interface TopProductItem {
  id: string;
  name: string;
  image_url: string | null;
  units_sold: number;
  revenue: number;
}

export interface TopCategoryItem {
  name: string;
  products_sold: number;
  revenue: number;
}

export interface RecentOrderItem {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface LowStockProductItem {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  variant_name?: string;
}

export interface RecentCustomerItem {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  created_at: string;
}

export interface ReviewsAnalyticsData {
  averageRating: number;
  totalReviews: number;
  distribution: {
    stars5: number;
    stars4: number;
    stars3: number;
    stars2: number;
    stars1: number;
  };
}

export interface CouponAnalyticsData {
  total: number;
  active: number;
  totalUses: number;
  topCoupons: {
    code: string;
    usage_count: number;
  }[];
}
