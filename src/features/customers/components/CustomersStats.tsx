import { Card } from "@/components/ui/card";
import { CustomersStats } from "../lib/types";

interface CustomersStatsProps {
  stats: CustomersStats;
}

export function CustomersStatsComponent({ stats }: CustomersStatsProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  const statCards = [
    {
      label: "Total Customers",
      value: stats.total,
      description: "Registered store accounts",
      className: "border-border bg-card",
    },
    {
      label: "New Customers",
      value: stats.new30Days,
      description: "Signed up in last 30 days",
      className: "border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400",
    },
    {
      label: "Active Customers",
      value: stats.active,
      description: "Placed orders in last 30 days",
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Total Spend",
      value: formatCurrency(stats.revenue),
      description: "Lifetime revenue generated",
      className: "border-primary/20 bg-primary/5 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
