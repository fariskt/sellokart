import { Card } from "@/components/ui/card";
import { CustomerDetailsStats } from "../lib/types";

interface CustomerStatsCardProps {
  stats: CustomerDetailsStats;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function CustomerStatsCard({ stats }: CustomerStatsCardProps) {
  const kpiCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      description: "Lifetime order quantity",
      className: "border-border bg-card",
    },
    {
      label: "Total Spend",
      value: formatCurrency(stats.totalSpend),
      description: "From paid orders",
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Average Order Value",
      value: formatCurrency(stats.averageOrderValue),
      description: "Average spend per order",
      className: "border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      description: "Submitted feedback",
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Total Returns",
      value: stats.totalReturns,
      description: "Return requests",
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
    },
    {
      label: "Wishlist Count",
      value: stats.wishlistCount,
      description: "Saved products",
      className: "border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 w-full">
      {kpiCards.map((card) => (
        <Card
          key={card.label}
          className={`p-4 border transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[105px] ${card.className}`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">
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
