import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[105px] rounded-lg" />
        ))}
      </div>

      {/* Filters skeleton */}
      <Skeleton className="h-[72px] w-full rounded-lg" />

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableSkeleton rows={10} columns={8} />
        </Table>
      </div>
    </div>
  );
}
