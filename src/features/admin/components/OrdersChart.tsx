"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { OrdersAnalyticsItem } from "../lib/types";
import { ArrowUpRight, ChevronDown } from "lucide-react";

interface OrdersChartProps {
  data: OrdersAnalyticsItem[];
  totalOrders?: number;
  todayOrders?: number;
  loading?: boolean;
}

export function OrdersChart({
  data,
  totalOrders,
  todayOrders,
  loading,
}: OrdersChartProps) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState("Monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

  const computedTotal =
    totalOrders !== undefined
      ? totalOrders
      : data.reduce((acc, item) => acc + (item.orders || 0), 0);

  if (loading || !mounted) {
    return (
      <Card className="p-6 bg-card border border-border shadow-2xs space-y-4 rounded-3xl">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-2xl" />
      </Card>
    );
  }

  // Format date labels
  const formattedData = data.map((item) => {
    let shortDate = item.date;
    let fullDate = item.date;
    try {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        fullDate = d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
      }
    } catch {}
    return {
      ...item,
      shortDate,
      fullDate,
    };
  });

  return (
    <Card className="p-6 bg-card border border-border shadow-2xs rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground tracking-tight">Total orders</h3>
        <button
          type="button"
          onClick={() => setTimeframe((prev) => (prev === "Monthly" ? "Weekly" : "Monthly"))}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer select-none"
        >
          <span>{timeframe}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Metric */}
      <div className="mt-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {new Intl.NumberFormat("en-US").format(computedTotal)}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            12.5%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {todayOrders !== undefined ? `${todayOrders} orders received today` : "Order volume trends"}
        </p>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full text-xs">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No order transactions recorded for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--ring)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--ring)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--border)"
                opacity={0.65}
              />
              <XAxis
                dataKey="shortDate"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={36}
              />
              <Tooltip
                cursor={{
                  stroke: "var(--ring)",
                  strokeWidth: 1.5,
                  strokeDasharray: "4 4",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-zinc-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl text-xs border border-zinc-800 space-y-0.5">
                        <p className="text-[11px] text-zinc-400 font-medium">
                          {row.fullDate || row.shortDate}
                        </p>
                        <p className="font-bold text-sm tracking-tight text-white">
                          {row.orders} {row.orders === 1 ? "order" : "orders"}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="var(--ring)"
                strokeWidth={2.5}
                fill="url(#ordersGradient)"
                activeDot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "var(--ring)",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
