import { TableSkeleton } from "@/components/common/TableSkeleton";

export default function Loading() {
  return (
    <TableSkeleton
      rows={10}
      columns={5}
    />
  );
}