import { Card } from "@/components/ui/card";
import { InventoryStats } from "../lib/types";
import { Package, CheckCircle, AlertTriangle, XCircle, Layers } from "lucide-react";

interface InventoryStatsProps {
  stats: InventoryStats;
}

export function InventoryStatsComponent({ stats }: InventoryStatsProps) {
  const cards = [
    {
      label: "Total SKUs",
      value: stats.totalProducts,
      description: "Products & variants tracked",
      icon: Package,
      className: "border-border bg-card text-foreground",
      iconClass: "text-muted-foreground",
    },
    {
      label: "In Stock",
      value: stats.inStock,
      description: "Above low-stock threshold",
      icon: CheckCircle,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
      iconClass: "text-emerald-500",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      description: "10 units or fewer remaining",
      icon: AlertTriangle,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
      iconClass: "text-amber-500",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      description: "Zero units available",
      icon: XCircle,
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
      iconClass: "text-rose-500",
    },
    {
      label: "Total Units",
      value: stats.totalUnits.toLocaleString("en-IN"),
      description: "Combined stock across all SKUs",
      icon: Layers,
      className: "border-primary/20 bg-primary/5 text-primary",
      iconClass: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`p-4 border transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[105px] ${card.className}`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {card.label}
              </p>
              <Icon className={`h-4 w-4 shrink-0 ${card.iconClass}`} />
            </div>
            <div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-[10px] opacity-70 italic">{card.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
