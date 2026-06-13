"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { OrdersAnalyticsItem } from "../lib/types";

interface OrdersChartProps {
  data: OrdersAnalyticsItem[];
  loading?: boolean;
}

export function OrdersChart({ data, loading }: OrdersChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <Card className="p-4 bg-card border border-border shadow-2xs space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border border-border shadow-2xs">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Orders Trend</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Total orders count aggregated over time</p>
      </div>

      <div className="h-[280px] w-full text-xs">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No order transactions recorded for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-zinc-800" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: any) => [Number(value), "Orders"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Bar
                name="Orders Placed"
                dataKey="orders"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
