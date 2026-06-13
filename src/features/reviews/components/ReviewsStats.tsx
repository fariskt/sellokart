import { Card } from "@/components/ui/card";
import { ReviewStats } from "../lib/types";
import { MessageSquare, Clock, CheckCircle2, XCircle, Star } from "lucide-react";

interface ReviewsStatsProps {
  stats: ReviewStats;
}

export function ReviewsStatsComponent({ stats }: ReviewsStatsProps) {
  const statCards = [
    {
      label: "Total Reviews",
      value: stats.total,
      description: "Submitted feedback",
      icon: MessageSquare,
      className: "border-border bg-card text-foreground",
    },
    {
      label: "Pending",
      value: stats.pending,
      description: "Awaiting review",
      icon: Clock,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Approved",
      value: stats.approved,
      description: "Visible on store",
      icon: CheckCircle2,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      description: "Hidden from store",
      icon: XCircle,
      className: "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400",
    },
    {
      label: "Average Rating",
      value: `${stats.averageRating.toFixed(1)} / 5.0`,
      description: "Across all reviews",
      icon: Star,
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
