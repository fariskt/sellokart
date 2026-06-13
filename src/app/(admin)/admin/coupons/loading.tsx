import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Stats Cards Skeleton (5 cards) */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] w-full rounded-lg" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="h-16 w-full rounded-lg bg-card border border-border animate-pulse flex items-center px-4 gap-4">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-10 w-44 hidden sm:block" />
        <Skeleton className="h-10 w-44 hidden sm:block" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount Type</TableHead>
              <TableHead className="text-right">Discount Value</TableHead>
              <TableHead className="text-center">Usage</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>
          <TableSkeleton rows={10} columns={9} />
        </Table>
      </div>
    </div>
  );
}
