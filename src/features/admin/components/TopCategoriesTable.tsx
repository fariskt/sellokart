"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopCategoryItem } from "../lib/types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";

interface TopCategoriesTableProps {
  categories: TopCategoryItem[];
}

const DONUT_COLORS = [
  "#f59e0b", // Warm Yellow
  "#f97316", // Orange
  "#e11d48", // Rose / Red
  "#8b5cf6", // Purple / Violet
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#3b82f6", // Blue
];

export function TopCategoriesTable({ categories }: TopCategoriesTableProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  const totalSold = categories.reduce((acc, c) => acc + (c.products_sold || 0), 0);
  const formattedTotalSold = new Intl.NumberFormat("en-US").format(totalSold);

  return (
    <Card className="p-6 bg-card border border-border shadow-2xs rounded-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground tracking-tight">Product sold</h3>
        <span className="text-xs text-muted-foreground font-medium">By category</span>
      </div>

      {/* Donut & Category Pills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Category Pills on Left */}
        <div className="flex flex-wrap gap-2.5">
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">No category sales recorded yet.</p>
          ) : (
            categories.slice(0, 6).map((c, i) => {
              const color = DONUT_COLORS[i % DONUT_COLORS.length];
              return (
                <div
                  key={c.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/60 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate max-w-[110px]">{c.name}</span>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    ({c.products_sold})
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Donut Chart with Center Number on Right */}
        <div className="relative h-[200px] w-full flex items-center justify-center">
          {!mounted ? (
            <div className="text-xs text-muted-foreground">Loading chart...</div>
          ) : categories.length === 0 ? (
            <div className="text-xs text-muted-foreground">No data available.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    nameKey="name"
                    dataKey="products_sold"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    cornerRadius={6}
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as TopCategoryItem;
                        return (
                          <div className="bg-zinc-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs border border-zinc-800 space-y-0.5">
                            <p className="text-[11px] text-zinc-400 font-medium">{item.name}</p>
                            <p className="font-bold text-sm tracking-tight text-white">
                              {item.products_sold} sold • {formatCurrency(item.revenue)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metrics in Donut Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {formattedTotalSold}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">Total sold</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Breakdown Table */}
      {categories.length > 0 && (
        <div className="border border-border/80 rounded-2xl overflow-hidden pt-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-xs font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-center w-24 text-xs font-semibold text-muted-foreground">Sold</TableHead>
                <TableHead className="text-right w-32 text-xs font-semibold text-muted-foreground">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c, i) => (
                <TableRow key={c.name} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="text-xs font-medium text-foreground py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      />
                      <span className="truncate max-w-[160px]">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-xs py-2.5">
                    {c.products_sold}
                  </TableCell>
                  <TableCell className="text-right text-xs text-foreground py-2.5">
                    {formatCurrency(c.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
