import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      {/* Stats Cards Skeleton (4 cards for notifications) */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] w-full rounded-lg" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="h-18 w-full rounded-lg bg-card border border-border animate-pulse flex items-center px-4 gap-4">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-10 w-44 hidden sm:block" />
        <Skeleton className="h-10 w-44 hidden sm:block" />
        <Skeleton className="h-10 w-44 hidden md:block" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notification Details</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableSkeleton rows={10} columns={6} />
        </Table>
      </div>
    </div>
  );
}
