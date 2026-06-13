"use client";

import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CustomerOrder } from "../lib/types";

interface CustomerOrdersTabProps {
  orders: CustomerOrder[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    cancelled: "bg-zinc-500/10 text-zinc-650 border-zinc-500/20",
    refunded: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status] ?? "border-border bg-muted/50"}`}>
      {status}
    </span>
  );
}

function getPaymentStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    paid: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    failed: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    refunded: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status] ?? "border-border bg-muted/50"}`}>
      {status}
    </span>
  );
}

export function CustomerOrdersTab({ orders }: CustomerOrdersTabProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
        <h3 className="text-sm font-semibold text-foreground">No orders found</h3>
        <p className="mt-1 text-xs text-muted-foreground">This customer has not placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Created Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono font-bold text-foreground">
                <Link
                  href={`/admin/orders?search=${encodeURIComponent(order.order_number)}`}
                  className="text-primary hover:underline"
                >
                  #{order.order_number}
                </Link>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
              <TableCell className="text-right font-semibold text-foreground">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
