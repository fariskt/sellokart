import { Title } from "@/components/ui/title";

export function CustomersHeader() {
  return (
    <div>
      <Title>Customer Management</Title>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage customer profiles, order activity, spend history, addresses, and feedback reviews.
      </p>
    </div>
  );
}
