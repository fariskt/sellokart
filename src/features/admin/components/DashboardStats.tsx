import { Card } from "@/components/ui/card";
import { DashboardStatsData } from "../lib/types";
import { IndianRupee, ShoppingCart, Users, Package, RefreshCw, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.revenue.total),
      icon: IndianRupee,
      isFeatured: true,
      subStats: [
        { label: "Today", value: formatCurrency(stats.revenue.today) },
        { label: "This Month", value: formatCurrency(stats.revenue.thisMonth) },
      ],
    },
    {
      label: "Orders Summary",
      value: stats.orders.total,
      icon: ShoppingCart,
      isFeatured: false,
      subStats: [
        { label: "Today", value: stats.orders.today },
        { label: "Pending", value: stats.orders.pending },
        { label: "Delivered", value: stats.orders.delivered },
      ],
    },
    {
      label: "Customers Insights",
      value: stats.customers.total,
      icon: Users,
      isFeatured: false,
      subStats: [
        { label: "New This Month", value: stats.customers.newThisMonth },
      ],
    },
    {
      label: "Product Catalog",
      value: stats.products.total,
      icon: Package,
      isFeatured: false,
      subStats: [
        { label: "Active", value: stats.products.active },
        { label: "Out of Stock", value: stats.products.outOfStock, highlight: stats.products.outOfStock > 0 },
      ],
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {cards.map((card) => {
        return (
          <Card
            key={card.label}
            className={cn(
              "p-5 transition-all duration-300 flex flex-col justify-between min-h-[160px] rounded-2xl relative overflow-hidden group",
              card.isFeatured
                ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                : "bg-card border-border/80 shadow-2xs hover:shadow-xs"
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  card.isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {card.label}
                </p>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
                    card.isFeatured
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "border border-border/80 text-muted-foreground bg-muted/20"
                  )}
                  title="View details"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className={cn(
                "mt-3 text-3xl font-bold tracking-tight",
                card.isFeatured ? "text-primary-foreground" : "text-foreground"
              )}>
                {card.value}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-current/10 flex flex-wrap gap-1.5">
              {card.subStats.map((sub) => (
                <div
                  key={sub.label}
                  className={cn(
                    "text-[10px] inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full",
                    card.isFeatured
                      ? "bg-primary-foreground/15 text-primary-foreground/90"
                      : (sub as any).highlight
                        ? "bg-destructive/10 text-destructive font-bold"
                        : "bg-muted/70 text-muted-foreground"
                  )}
                >
                  <span>{sub.label}:</span>
                  <span className="font-semibold text-current">
                    {sub.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
