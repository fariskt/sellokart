import { TableSkeleton } from "@/components/common/TableSkeleton";
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card animate-pulse">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking Number</TableHead>
            <TableHead>Order Number</TableHead>
            <TableHead>Courier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Shipped At</TableHead>
            <TableHead>Delivered At</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableSkeleton rows={10} columns={7} />
      </Table>
    </div>
  );
}
