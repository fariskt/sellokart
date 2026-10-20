import { Card } from "@/components/ui/card";
import { OrdersStats } from "../lib/types";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
      label: "Total Revenue",
      value: formatCurrency(stats.revenue),
      description: "From paid orders",
      isFeatured: true,
      className: "md:col-span-2 xl:col-span-2",
    },
    {
      label: "Total Orders",
      value: stats.total,
      description: "Lifetime orders",
      isFeatured: false,
    },
    {
      label: "Pending",
      value: stats.pending,
      description: "Awaiting action",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      isFeatured: false,
    },
    {
      label: "Processing",
      value: stats.processing,
      description: "Being prepared",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
      isFeatured: false,
    },
    {
      label: "Shipped",
      value: stats.shipped,
      description: "In transit",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
      isFeatured: false,
    },
    {
      label: "Delivered",
      value: stats.delivered,
      description: "Completed orders",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      isFeatured: false,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-7">
      {statCards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            "p-4 transition-all duration-300 rounded-2xl flex flex-col justify-between min-h-[120px] group relative overflow-hidden",
            card.isFeatured
              ? "bg-primary text-primary-foreground border-transparent shadow-xs"
              : "bg-card border-border/80 shadow-2xs hover:shadow-xs",
            card.className
          )}
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <p className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                card.isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {card.label}
              </p>
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
                  card.isFeatured
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "border border-border/80 text-muted-foreground bg-muted/20"
                )}
              >
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>

            <p className={cn(
              "mt-2 text-2xl font-bold tracking-tight",
              card.isFeatured ? "text-primary-foreground" : "text-foreground"
            )}>
              {card.value}
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between text-[10px]">
            <span className={card.isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"}>
              {card.description}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
