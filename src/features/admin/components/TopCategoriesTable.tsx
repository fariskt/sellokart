"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopCategoryItem } from "../lib/types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface TopCategoriesTableProps {
  categories: TopCategoryItem[];
}

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#6366F1"];

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

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
      <div className="p-4 border-b border-border/80 bg-muted/10">
        <h3 className="text-sm font-semibold text-foreground">Top Categories</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Highest category revenue first</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Table representation */}
        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-center w-24">Sold</TableHead>
                <TableHead className="text-right w-28">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                    No sales recorded.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c.name} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-semibold text-foreground text-xs truncate max-w-[140px]">
                      {c.name}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      {c.products_sold}
                    </TableCell>
                    <TableCell className="text-right font-black text-xs text-foreground">
                      {formatCurrency(c.revenue)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pie Chart representation */}
        <div className="h-[220px] w-full flex items-center justify-center border border-border rounded-md bg-muted/5 p-2 text-xs">
          {!mounted ? (
            <div className="text-muted-foreground">Loading chart...</div>
          ) : categories.length === 0 ? (
            <div className="text-muted-foreground">No data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  nameKey="name"
                  dataKey="revenue"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
