import { Title } from "@/components/ui/title";

export function ShipmentsHeader() {
  return (
    <div>
      <Title>Shipments</Title>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage courier shipments, tracking numbers, and delivery statuses for all orders.
      </p>
    </div>
  );
}
