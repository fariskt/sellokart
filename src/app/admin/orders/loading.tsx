import { TableSkeleton } from "@/components/common/TableSkeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card animate-pulse">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total Items</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableSkeleton rows={10} columns={8} />
      </Table>
    </div>
  );
}
