"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppPagination } from "@/components/AppPagination";
import { AppSelect } from "@/components/AppSelect";
import { InventoryLog, InventoryType } from "../lib/types";

interface InventoryLogsClientProps {
  logs: InventoryLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentType: string;
}

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Sale", value: "sale" },
  { label: "Restock", value: "restock" },
  { label: "Return", value: "return" },
  { label: "Adjustment", value: "adjustment" },
  { label: "Damaged", value: "damaged" },
  { label: "Order Cancelled", value: "cancelled_order" },
];

const typeLabels: Record<InventoryType, string> = {
  sale: "Sale",
  restock: "Restock",
  return: "Return",
  adjustment: "Adjustment",
  damaged: "Damaged",
  cancelled_order: "Order Cancelled",
};

const typeBadgeStyles: Record<InventoryType, string> = {
  sale: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  restock: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  return: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  adjustment: "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
  damaged: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  cancelled_order: "border-border bg-muted/40 text-muted-foreground",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getQuantityDisplay(log: InventoryLog) {
  const isDeduction = log.new_stock < log.previous_stock;
  if (isDeduction) {
    return <span className="font-semibold tabular-nums text-rose-600">−{log.quantity}</span>;
  }
  return <span className="font-semibold tabular-nums text-emerald-600">+{log.quantity}</span>;
}

export function InventoryLogsClient({
  logs,
  pagination,
  currentType,
}: InventoryLogsClientProps) {
  const router = useRouter();

  function handleTypeChange(val: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    if (val === "all") {
      params.delete("type");
    } else {
      params.set("type", val);
    }
    router.push(`?${params.toString()}`);
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3 bg-card p-4 rounded-lg border border-border shadow-2xs">
        <div className="w-full sm:w-52 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Log Type
          </label>
          <AppSelect
            name="type"
            value={currentType}
            onValueChange={handleTypeChange}
            options={typeOptions}
            placeholder="All Types"
          />
        </div>
        <div className="self-end text-sm text-muted-foreground">
          {pagination.total} total log{pagination.total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Previous</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">New Stock</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1 py-8">
                    <span className="text-base font-semibold">No logs found</span>
                    <span className="text-sm text-muted-foreground">
                      Stock changes will appear here.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {log.products?.name ?? log.product_id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.product_variants?.name ? (
                      <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                        {log.product_variants.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        typeBadgeStyles[log.type] ?? "border-border"
                      }`}
                    >
                      {typeLabels[log.type] ?? log.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {log.previous_stock}
                  </TableCell>
                  <TableCell className="text-right">{getQuantityDisplay(log)}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-foreground">
                    {log.new_stock}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                    {log.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AppPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
