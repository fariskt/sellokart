import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-6 shadow-xs relative overflow-hidden select-none",
        className
      )}
    >
      {/* Decorative subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary border border-accent/10 shrink-0 mt-0.5">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex items-center shrink-0 self-start sm:self-center">
          {action}
        </div>
      )}
    </div>
  );
}
