"use client";

import { AppDialog } from "@/components/AppDialog";
import { Badge } from "@/components/ui/badge";
import { Order } from "../lib/types";
import { OrderItemsTable } from "./OrderItemsTable";
import { OrderSummary } from "./OrderSummary";
import type { ReactNode } from "react";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
}

export function OrderDialog({ open, onOpenChange, order }: OrderDialogProps) {
  function formatDateTime(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  }

  // Helper helper function to get status badges
  function getStatusBadge(status: string) {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5",
      processing: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5",
      shipped: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 rounded-full px-2.5 py-0.5",
      delivered: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5",
      cancelled: "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400 border border-zinc-500/20 rounded-full px-2.5 py-0.5",
      refunded: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5",
    };

    return (
      <span className={statusStyles[status] || "border rounded-full px-2.5 py-0.5"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  function getPaymentStatusBadge(status: string) {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5",
      paid: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5",
      failed: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5",
      refunded: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5",
    };

    return (
      <span className={statusStyles[status] || "border rounded-full px-2.5 py-0.5"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Order Details"
      description={order ? `Order #${order.order_number}` : undefined}
      size="2xl"
    >
      {!order ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading order details...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Details Header Info */}
          <DetailsSection title="Order Information">
            <DetailsGrid
              items={[
                ["Order Number", <span key="num" className="font-mono font-semibold text-foreground">{order.order_number}</span>],
                ["Order Date", formatDateTime(order.created_at)],
                ["Order Status", getStatusBadge(order.status)],
                ["Payment Status", getPaymentStatusBadge(order.payment_status)],
              ]}
            />
          </DetailsSection>

          {/* Customer Info */}
          <DetailsSection title="Customer Information">
            <DetailsGrid
              items={[
                ["Customer Name", order.profiles?.name || "Guest Customer"],
                ["Email Address", order.profiles?.email || "-"],
                ["Phone Number", order.profiles?.phone || "-"],
              ]}
            />
          </DetailsSection>

          {/* Items Table Snapshot */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground px-1">Ordered Items</h3>
            <OrderItemsTable items={order.order_items ?? []} />
          </div>

          {/* Financial Totals */}
          <div className="grid gap-4 md:grid-cols-2">
            <div />
            <OrderSummary
              subtotal={order.subtotal}
              tax={order.tax}
              shipping={order.shipping}
              discount={order.discount}
              total={order.total}
            />
          </div>
        </div>
      )}
    </AppDialog>
  );
}

function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border p-4 bg-card shadow-2xs">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function DetailsGrid({
  items,
}: {
  items: [string, ReactNode][];
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </dt>
          <dd className="text-sm text-foreground font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
