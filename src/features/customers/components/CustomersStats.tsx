import { StatCard } from "@/components/stat-card";
import { Users, UserPlus, UserCheck, DollarSign } from "lucide-react";
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
      isFeatured: true,
      icon: Users,
    },
    {
      label: "New Customers",
      value: stats.new30Days,
      description: "Signed up in last 30 days",
      icon: UserPlus,
    },
    {
      label: "Active Customers",
      value: stats.active,
      description: "Placed orders in last 30 days",
      icon: UserCheck,
    },
    {
      label: "Total Spend",
      value: formatCurrency(stats.revenue),
      description: "Lifetime customer revenue",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          description={card.description}
          isFeatured={card.isFeatured}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
