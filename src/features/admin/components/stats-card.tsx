import { StatCard } from "@/components/stat-card";

interface Props {
  revenue: number;
  orders: number;
  users: number;
  products: number;
}

export function StatsCards({
  revenue,
  orders,
  users,
  products,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Revenue"
        value={`₹${revenue.toLocaleString()}`}
      />

      <StatCard
        label="Orders"
        value={orders}
      />

      <StatCard
        label="Users"
        value={users}
      />

      <StatCard
        label="Products"
        value={products}
      />
    </div>
  );
}