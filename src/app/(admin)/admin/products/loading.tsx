import { TableSkeleton } from "@/components/common/TableSkeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableSkeleton rows={10} columns={7} />
      </Table>
    </div>
  );
}