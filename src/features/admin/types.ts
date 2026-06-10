export interface DashboardStats {
  revenue: number;
  orders: number;
  users: number;
  products: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}