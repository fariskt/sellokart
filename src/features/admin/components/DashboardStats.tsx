import { Card } from "@/components/ui/card";
import { DashboardStatsData } from "../lib/types";
import { IndianRupee, ShoppingCart, Users, Package, RefreshCw } from "lucide-react";

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
      label: "Revenue Status",
      value: formatCurrency(stats.revenue.total),
      icon: IndianRupee,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
      subStats: [
        { label: "Today", value: formatCurrency(stats.revenue.today) },
        { label: "This Month", value: formatCurrency(stats.revenue.thisMonth) },
      ],
    },
    {
      label: "Orders Summary",
      value: stats.orders.total,
      icon: ShoppingCart,
      className: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
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
      className: "border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-400",
      subStats: [
        { label: "New This Month", value: stats.customers.newThisMonth },
      ],
    },
    {
      label: "Product Inventory",
      value: stats.products.total,
      icon: Package,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
      subStats: [
        { label: "Active", value: stats.products.active },
        { label: "Out of Stock", value: stats.products.outOfStock, highlight: stats.products.outOfStock > 0 },
      ],
    },
    {
      label: "Returns & Exchanges",
      value: stats.returns.total,
      icon: RefreshCw,
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
      subStats: [
        { label: "Pending", value: stats.returns.pending },
        { label: "Completed", value: stats.returns.completed },
      ],
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`p-4 border transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[140px] bg-card`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <div className={`p-1.5 rounded-md border ${card.className}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
                {card.value}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-x-3 gap-y-1">
              {card.subStats.map((sub) => (
                <div key={sub.label} className="text-[10px] flex items-center gap-1 font-medium">
                  <span className="text-muted-foreground">{sub.label}:</span>
                  <span className={(sub as any).highlight ? "text-destructive font-bold" : "text-foreground font-semibold"}>
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
