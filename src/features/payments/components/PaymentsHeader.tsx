import { Title } from "@/components/ui/title";

export function PaymentsHeader() {
  return (
    <div>
      <Title>Payments</Title>
      <p className="mt-1 text-sm text-muted-foreground">
        Track payment transactions, gateway responses, and revenue across all orders.
      </p>
    </div>
  );
}
