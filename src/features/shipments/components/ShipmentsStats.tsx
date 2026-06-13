import { Card } from "@/components/ui/card";
import { ShipmentsStats } from "../lib/types";

interface ShipmentsStatsProps {
  stats: ShipmentsStats;
}

export function ShipmentsStatsComponent({ stats }: ShipmentsStatsProps) {
  const statCards = [
    {
      label: "Total",
      value: stats.total,
      description: "All shipments",
      className: "border-border bg-card",
    },
    {
      label: "Pending",
      value: stats.pending,
      description: "Not yet packed",
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Packed",
      value: stats.packed,
      description: "Ready to dispatch",
      className: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
    },
    {
      label: "Shipped",
      value: stats.shipped,
      description: "Dispatched",
      className: "border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-400",
    },
    {
      label: "In Transit",
      value: stats.in_transit,
      description: "On the way",
      className: "border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400",
    },
    {
      label: "Delivered",
      value: stats.delivered,
      description: "Completed",
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Returned",
      value: stats.returned,
      description: "Sent back",
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 xl:grid-cols-7">
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
