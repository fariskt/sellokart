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

import Link from "next/link";
import { Plus } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title>Store Dashboard</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, monitor, and accomplish your ecommerce operations with ease.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DashboardFilters />
          <Link
            href="/admin/products"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </Link>
        </div>
      </div>
      {/* Main KPI Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Revenue & Orders Charts (Two-column layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart
          data={revenueAnalytics}
          totalRevenue={stats.revenue.total}
          thisMonthRevenue={stats.revenue.thisMonth}
        />
        <OrdersChart
          data={ordersAnalytics}
          totalOrders={stats.orders.total}
          todayOrders={stats.orders.today}
        />
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
