import { Card } from "@/components/ui/card";
import { OrdersStats } from "../lib/types";

interface OrdersStatsProps {
  stats: OrdersStats;
}

export function OrdersStatsComponent({ stats }: OrdersStatsProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats.total,
      description: "Lifetime orders",
      className: "border-border bg-card",
    },
    {
      label: "Pending",
      value: stats.pending,
      description: "Awaiting action",
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Processing",
      value: stats.processing,
      description: "Being prepared",
      className: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      description: "In transit",
      className: "border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-400",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      description: "Completed orders",
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      description: "Voided orders",
      className: "border-zinc-500/20 bg-zinc-500/5 text-zinc-600 dark:text-zinc-400",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.revenue),
      description: "From paid orders",
      className: "border-primary/20 bg-primary/5 text-primary md:col-span-2 xl:col-span-1",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
      {statCards.map((card) => (
        <Card
          key={card.label}
          className={`p-4 border transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[105px] ${card.className}`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {card.value}
            </p>
          </div>
          <p className="mt-1 text-[10px] opacity-70 italic">
            {card.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
