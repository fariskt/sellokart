import { Card } from "@/components/ui/card";
import { PaymentsStats } from "../lib/types";

interface PaymentsStatsProps {
  stats: PaymentsStats;
}

export function PaymentsStatsComponent({ stats }: PaymentsStatsProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  const statCards = [
    {
      label: "Total Payments",
      value: stats.total,
      description: "Lifetime transactions",
      className: "border-border bg-card",
    },
    {
      label: "Successful",
      value: stats.paid,
      description: "Paid & cleared",
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: stats.pending,
      description: "Awaiting capture",
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Failed",
      value: stats.failed,
      description: "Gateway declined",
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
    },
    {
      label: "Refunded",
      value: stats.refunded,
      description: "Amount returned",
      className: "border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-400",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.revenue),
      description: "From paid orders",
      className: "border-primary/20 bg-primary/5 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
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
          <p className="mt-1 text-[10px] opacity-70 italic">{card.description}</p>
        </Card>
      ))}
    </div>
  );
}
