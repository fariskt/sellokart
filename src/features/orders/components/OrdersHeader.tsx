import { Title } from "@/components/ui/title";

export function OrdersHeader() {
  return (
    <div>
      <Title>Orders</Title>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage customer orders, track payments, and update fulfillment statuses.
      </p>
    </div>
  );
}
