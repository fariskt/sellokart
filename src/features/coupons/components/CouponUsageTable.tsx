"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CouponUsage } from "../lib/types";

interface CouponUsageTableProps {
  usages: CouponUsage[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function CouponUsageTable({ usages }: CouponUsageTableProps) {
  if (usages.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card">
        <p className="text-sm font-semibold text-foreground">No usage history found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This coupon has not been used by any customers yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Order Number</TableHead>
            <TableHead className="text-right">Order Total</TableHead>
            <TableHead className="text-right">Discount Given</TableHead>
            <TableHead>Used At</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {usages.map((usage) => {
            const profile = usage.profiles;
            const order = usage.orders;
            const discount = (usage as any).discount_amount ?? 0;

            return (
              <TableRow
                key={usage.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm">
                      {profile?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {profile?.email || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono font-bold text-foreground">
                  {order?.order_number ? `#${order.order_number}` : "-"}
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {order?.total != null ? formatCurrency(order.total) : "-"}
                </TableCell>
                <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(discount)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                  {formatDate(usage.used_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
