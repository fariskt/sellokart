import { Card } from "@/components/ui/card";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  isFeatured?: boolean;
  trend?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  description,
  isFeatured = false,
  trend,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[140px]",
        isFeatured
          ? "bg-primary text-primary-foreground border-transparent shadow-sm"
          : "bg-card border-border/80 shadow-2xs hover:shadow-xs",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {label}
          </p>
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shrink-0",
              isFeatured
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "border border-border/80 text-muted-foreground bg-muted/20"
            )}
          >
            {Icon ? <Icon className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
          </div>
        </div>

        <p
          className={cn(
            "mt-3 text-3xl font-bold tracking-tight",
            isFeatured ? "text-primary-foreground" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>

      {(description || trend) && (
        <div className="mt-3 pt-2.5 border-t border-current/10 flex items-center justify-between text-[11px]">
          {description && (
            <span
              className={cn(
                "truncate",
                isFeatured ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {description}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-medium ml-auto",
                isFeatured
                  ? "bg-primary-foreground/15 text-primary-foreground"
                  : "bg-success/10 text-success border border-success/20"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}