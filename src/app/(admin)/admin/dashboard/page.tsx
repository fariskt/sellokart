import { RecentOrders } from "@/features/admin/components/recent-orders";
import { RevenueChart } from "@/features/admin/components/revenue-chart";
import { StatsCards } from "@/features/admin/components/stats-card";
import { getDashboardData } from "@/features/admin/lib/dashboard";


export default async function AdminPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-6">
      <StatsCards
        revenue={dashboard.revenue}
        orders={dashboard.orders}
        users={dashboard.users}
        products={dashboard.products}
      />

      <RevenueChart
        data={dashboard?.revenueByMonth ?? []}
      />

      <RecentOrders
        orders={dashboard.recentOrders}
      />
    </div>
  );
}