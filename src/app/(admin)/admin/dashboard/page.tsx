import { DashboardPageClient } from "@/features/admin/components/DashboardPageClient";
import {
  getDashboardStats,
  getRevenueAnalytics,
  getOrdersAnalytics,
  getTopProducts,
  getTopCategories,
  getRecentOrders,
  getLowStockProducts,
  getRecentCustomers,
  getReviewsAnalytics,
  getCouponsAnalytics,
} from "@/features/admin/lib/dashboard.action";

interface DashboardPageProps {
  searchParams: Promise<{
    range?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const range = params.range ?? "30days";
  const startDate = params.startDate;
  const endDate = params.endDate;

  // Fetch all analytics in parallel for performance
  const [
    stats,
    revenueAnalytics,
    ordersAnalytics,
    topProducts,
    topCategories,
    recentOrders,
    lowStockProducts,
    recentCustomers,
    reviewsAnalytics,
    couponsAnalytics,
  ] = await Promise.all([
    getDashboardStats(range, startDate, endDate),
    getRevenueAnalytics(range, startDate, endDate),
    getOrdersAnalytics(range, startDate, endDate),
    getTopProducts(range, startDate, endDate),
    getTopCategories(range, startDate, endDate),
    getRecentOrders(range, startDate, endDate),
    getLowStockProducts(),
    getRecentCustomers(range, startDate, endDate),
    getReviewsAnalytics(range, startDate, endDate),
    getCouponsAnalytics(range, startDate, endDate),
  ]);

  return (
    <div className="p-6">
      <DashboardPageClient
        stats={stats}
        revenueAnalytics={revenueAnalytics}
        ordersAnalytics={ordersAnalytics}
        topProducts={topProducts}
        topCategories={topCategories}
        recentOrders={recentOrders}
        lowStockProducts={lowStockProducts}
        recentCustomers={recentCustomers}
        reviewsAnalytics={reviewsAnalytics}
        couponsAnalytics={couponsAnalytics}
      />
    </div>
  );
}