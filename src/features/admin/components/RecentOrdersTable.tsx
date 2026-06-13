"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RecentOrderItem } from "../lib/types";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

interface RecentOrdersTableProps {
  orders: RecentOrderItem[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const router = useRouter();

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  function getStatusBadge(status: string) {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      processing: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      shipped: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      delivered: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      cancelled: "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400 border border-zinc-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      refunded: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
    };

    return (
      <span className={statusStyles[status] || "border rounded-full px-2 py-0.5 text-[10px] font-semibold"}>
        {status}
      </span>
    );
  }

  function getPaymentStatusBadge(status: string) {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      paid: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      failed: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      refunded: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
    };

    return (
      <span className={statusStyles[status] || "border rounded-full px-2 py-0.5 text-[10px] font-semibold"}>
        {status}
      </span>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
      <div className="p-4 border-b border-border/80 bg-muted/10">
        <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest 10 order transactions</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                No recent orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((o) => (
              <TableRow key={o.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-mono font-bold text-foreground">
                  #{o.order_number}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-xs">{o.customer_name}</span>
                    <span className="text-[10px] text-muted-foreground">{o.customer_email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-xs text-foreground">
                  {formatCurrency(o.total)}
                </TableCell>
                <TableCell>{getStatusBadge(o.status)}</TableCell>
                <TableCell>{getPaymentStatusBadge(o.payment_status)}</TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(o.created_at)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted cursor-pointer"
                    onClick={() => router.push(`/admin/orders?search=${o.order_number}`)}
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="sr-only">View Order</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
