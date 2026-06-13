import { Card } from "@/components/ui/card";
import { NotificationStats } from "../lib/types";
import { Bell, Eye, EyeOff, Calendar } from "lucide-react";

interface NotificationsStatsProps {
  stats: NotificationStats;
}

export function NotificationsStatsComponent({ stats }: NotificationsStatsProps) {
  const statCards = [
    {
      label: "Total Notifications",
      value: stats.total,
      description: "All alert dispatches",
      icon: Bell,
      className: "border-border bg-card text-foreground",
    },
    {
      label: "Read Notifications",
      value: stats.read,
      description: "Acknowledged alerts",
      icon: Eye,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Unread Notifications",
      value: stats.unread,
      description: "Awaiting review",
      icon: EyeOff,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Dispatched Today",
      value: stats.today,
      description: "Since midnight",
      icon: Calendar,
      className: "border-primary/20 bg-primary/5 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
