import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_dashboard_stats"
  );

  console.log("data", data);
  

  if (error) {
    throw new Error(error.message);
  }

  return {
    revenue: data.revenue,
    orders: data.orders,
    users: data.users,
    products: data.products,
    recentOrders: data.recent_orders,
  };
}