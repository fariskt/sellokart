import { Card } from "@/components/ui/card";
import { CouponStats } from "../lib/types";
import { Ticket, CheckCircle2, XCircle, ShoppingBag, IndianRupee } from "lucide-react";

interface CouponsStatsProps {
  stats: CouponStats;
}

export function CouponsStatsComponent({ stats }: CouponsStatsProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  const statCards = [
    {
      label: "Total Coupons",
      value: stats.total,
      description: "All campaigns",
      icon: Ticket,
      className: "border-border bg-card text-foreground",
    },
    {
      label: "Active Coupons",
      value: stats.active,
      description: "Live & valid",
      icon: CheckCircle2,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Expired Coupons",
      value: stats.expired,
      description: "Past end date",
      icon: XCircle,
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
    },
    {
      label: "Total Uses",
      value: stats.totalUses,
      description: "Order checkouts",
      icon: ShoppingBag,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Discounts Given",
      value: formatCurrency(stats.totalDiscount),
      description: "Revenue impact",
      icon: IndianRupee,
      className: "border-primary/20 bg-primary/5 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`p-4 border transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[110px] ${card.className}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {card.value}
                </p>
              </div>
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
            </div>
            <p className="mt-2 text-[10px] opacity-75 italic">{card.description}</p>
          </Card>
        );
      })}
    </div>
  );
}
