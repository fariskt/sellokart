import { StatCard } from "@/components/stat-card";
import { Package, CheckCircle2, FileEdit, AlertCircle } from "lucide-react";

interface Props {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
}

export function ProductStats({
  total,
  active,
  draft,
  outOfStock,
}: Props) {
  const stats = [
    {
      label: "Total Products",
      value: total,
      isFeatured: true,
      description: "Complete catalog count",
      icon: Package,
    },
    {
      label: "Active",
      value: active,
      description: "Live in store",
      icon: CheckCircle2,
    },
    {
      label: "Draft",
      value: draft,
      description: "Unpublished items",
      icon: FileEdit,
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      description: "Needs restocking",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          isFeatured={stat.isFeatured}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}