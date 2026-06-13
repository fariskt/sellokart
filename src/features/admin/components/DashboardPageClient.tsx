"use client";

import { DashboardStats } from "./DashboardStats";
import { DashboardFilters } from "./DashboardFilters";
import { RevenueChart } from "./RevenueChart";
import { OrdersChart } from "./OrdersChart";
import { TopProductsTable } from "./TopProductsTable";
import { TopCategoriesTable } from "./TopCategoriesTable";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { LowStockTable } from "./LowStockTable";
import { RecentCustomersTable } from "./RecentCustomersTable";
import { ReviewsAnalytics } from "./ReviewsAnalytics";
import { CouponsAnalytics } from "./CouponsAnalytics";
import { Title } from "@/components/ui/title";
import {
  DashboardStatsData,
  RevenueAnalyticsItem,
  OrdersAnalyticsItem,
  TopProductItem,
  TopCategoryItem,
  RecentOrderItem,
  LowStockProductItem,
  RecentCustomerItem,
  ReviewsAnalyticsData,
  CouponAnalyticsData,
} from "../lib/types";

interface DashboardPageClientProps {
  stats: DashboardStatsData;
  revenueAnalytics: RevenueAnalyticsItem[];
  ordersAnalytics: OrdersAnalyticsItem[];
  topProducts: TopProductItem[];
  topCategories: TopCategoryItem[];
  recentOrders: RecentOrderItem[];
  lowStockProducts: LowStockProductItem[];
  recentCustomers: RecentCustomerItem[];
  reviewsAnalytics: ReviewsAnalyticsData;
  couponsAnalytics: CouponAnalyticsData;
}

export function DashboardPageClient({
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
}: DashboardPageClientProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Title>Analytics Dashboard</Title>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of store performance, revenue trends, and key business metrics.
        </p>
      </div>

      {/* Date Range Filters */}
      <DashboardFilters />

      {/* Main KPI Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Revenue & Orders Charts (Two-column layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={revenueAnalytics} />
        <OrdersChart data={ordersAnalytics} />
      </div>

      {/* Top Products & Top Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopProductsTable products={topProducts} />
        <TopCategoriesTable categories={topCategories} />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={recentOrders} />

      {/* Low Stock Alerts & Recent Customers (Two-column layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LowStockTable products={lowStockProducts} />
        <RecentCustomersTable customers={recentCustomers} />
      </div>

      {/* Reviews Analytics */}
      <ReviewsAnalytics data={reviewsAnalytics} />

      {/* Coupons Analytics */}
      <CouponsAnalytics data={couponsAnalytics} />
    </div>
  );
}
