"use client";

import { AppDialog } from "@/components/AppDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryItem, InventoryLog, InventoryType } from "../lib/types";

interface InventoryHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  logs: InventoryLog[];
  isLoading?: boolean;
}

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
  const isDeduction = ["sale", "damaged"].includes(log.type);
  const isAddition = ["restock", "return", "cancelled_order"].includes(log.type);

  if (isDeduction || log.new_stock < log.previous_stock) {
    return <span className="font-semibold tabular-nums text-rose-600">−{log.quantity}</span>;
  }
  if (isAddition || log.new_stock > log.previous_stock) {
    return <span className="font-semibold tabular-nums text-emerald-600">+{log.quantity}</span>;
  }
  return <span className="tabular-nums text-muted-foreground">{log.quantity}</span>;
}

export function InventoryHistoryDialog({
  open,
  onOpenChange,
  item,
  logs,
  isLoading,
}: InventoryHistoryDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Stock History"
      description={
        item
          ? `${item.name}${item.variant_name !== "-" ? ` — ${item.variant_name}` : ""}`
          : "Loading..."
      }
      size="xl"
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <span className="text-sm text-muted-foreground animate-pulse">Loading history...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center space-y-1">
          <span className="text-base font-semibold">No history found</span>
          <span className="text-sm text-muted-foreground">
            No stock changes have been recorded for this item.
          </span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Previous</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">New Stock</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(log.created_at)}
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
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppDialog>
  );
}
