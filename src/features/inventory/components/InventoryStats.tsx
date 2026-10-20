import { StatCard } from "@/components/stat-card";
import { InventoryStats } from "../lib/types";
import { Package, CheckCircle, AlertTriangle, XCircle, Layers } from "lucide-react";

interface InventoryStatsProps {
  stats: InventoryStats;
}

export function InventoryStatsComponent({ stats }: InventoryStatsProps) {
  const cards = [
    {
      label: "Total Units",
      value: stats.totalUnits.toLocaleString("en-IN"),
      description: "Combined stock in warehouse",
      icon: Layers,
      isFeatured: true,
    },
    {
      label: "Total SKUs",
      value: stats.totalProducts,
      description: "Products & variants tracked",
      icon: Package,
    },
    {
      label: "In Stock",
      value: stats.inStock,
      description: "Healthy inventory levels",
      icon: CheckCircle,
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      description: "10 units or fewer remaining",
      icon: AlertTriangle,
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      description: "Zero units available",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          description={card.description}
          icon={card.icon}
          isFeatured={card.isFeatured}
        />
      ))}
    </div>
  );
}
