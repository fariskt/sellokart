"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ReviewsAnalyticsData } from "../lib/types";

interface ReviewsAnalyticsProps {
  data: ReviewsAnalyticsData;
  loading?: boolean;
}

export function ReviewsAnalytics({ data, loading }: ReviewsAnalyticsProps) {
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
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </Card>
    );
  }

  // Prep Recharts data
  const chartData = [
    { name: "5 Star", count: data.distribution.stars5, color: "var(--success)" },
    { name: "4 Star", count: data.distribution.stars4, color: "var(--success)" },
    { name: "3 Star", count: data.distribution.stars3, color: "var(--warning)" },
    { name: "2 Star", count: data.distribution.stars2, color: "var(--warning)" },
    { name: "1 Star", count: data.distribution.stars1, color: "var(--destructive)" },
  ];

  return (
    <Card className="p-6 bg-card border border-border shadow-2xs rounded-3xl">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Reviews Summary</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Customer feedback and rating distributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Summary Card */}
        <div className="flex flex-col items-center justify-center p-4 border border-border bg-muted/10 rounded-lg text-center">
          <span className="text-5xl  text-foreground tracking-tight">{data.averageRating}</span>
          <div className="flex items-center gap-0.5 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(data.averageRating)
                  ? "fill-amber-500 text-amber-500"
                  : "text-muted border-muted"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground mt-2 font-medium">
            Based on {data.totalReviews} customer reviews
          </span>
        </div>

        {/* Rating Distribution Chart (Recharts) */}
        <div className="md:col-span-2 h-[180px] w-full text-xs">
          {data.totalReviews === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No product reviews found in this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                />
                <Tooltip
                  formatter={(value: any) => [Number(value), "Reviews"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
