import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Filters Skeleton */}
      <div className="h-16 w-full rounded-lg bg-card border border-border animate-pulse flex items-center px-4 gap-4">
        <Skeleton className="h-10 w-56" />
      </div>

      {/* Stats Cards Skeleton (5 cards) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-lg" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton className="h-[340px] w-full rounded-lg" />
        <Skeleton className="h-[340px] w-full rounded-lg" />
      </div>

      {/* Top Products & Categories Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 mt-1" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableSkeleton rows={5} columns={4} />
          </Table>
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="p-4 border-b">
          <Skeleton className="h-4 w-40" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableSkeleton rows={8} columns={7} />
        </Table>
      </div>

      {/* Low Stock & Recent Customers Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton className="h-[280px] w-full rounded-lg" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>

      {/* Reviews & Coupons Skeleton */}
      <Skeleton className="h-[260px] w-full rounded-lg" />
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  );
}
