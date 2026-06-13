import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[105px] w-full rounded-lg" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="h-16 w-full rounded-lg bg-card border border-border animate-pulse flex items-center px-4 gap-4">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-10 w-44 hidden sm:block" />
        <Skeleton className="h-10 w-44 hidden md:block" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]" />
              <TableHead>Customer Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-center">Total Orders</TableHead>
              <TableHead className="text-right">Total Spend</TableHead>
              <TableHead>Last Order Date</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>
          <TableSkeleton rows={10} columns={9} />
        </Table>
      </div>
    </div>
  );
}
