"use client";

import { useRouter } from "next/navigation";
import { AppPagination } from "@/components/AppPagination";
import { CustomersHeader } from "./CustomersHeader";
import { CustomersStatsComponent } from "./CustomersStats";
import { CustomerFilters } from "./CustomerFilters";
import { CustomersTable } from "./CustomersTable";
import { CustomerListItem, CustomersStats } from "../lib/types";

interface CustomersPageClientProps {
  initialData: {
    data: CustomerListItem[];
    stats: CustomersStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function CustomersPageClient({ initialData }: CustomersPageClientProps) {
  const router = useRouter();

  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb Panel */}
      <CustomersHeader />

      {/* Overview Statistics Cards */}
      <CustomersStatsComponent stats={initialData.stats} />

      {/* Advanced Filtering & Search Bars */}
      <CustomerFilters />

      {/* Data Table List Grid */}
      <CustomersTable customers={initialData.data} />

      {/* App Router Page Pagination footer */}
      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
