"use client";

import { AppDialog } from "@/components/AppDialog";
import { Payment } from "../lib/types";
import type { ReactNode } from "react";

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch { return dateStr; }
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    failed: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    refunded: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status] ?? "border-border"}`}>
      {status}
    </span>
  );
}

export function PaymentDetailsDialog({ open, onOpenChange, payment }: PaymentDetailsDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Payment Details"
      description={payment ? `Payment for Order #${payment.orders?.order_number ?? "-"}` : undefined}
      size="xl"
    >
      {!payment ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading payment details...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Information */}
          <DetailsSection title="Payment Information">
            <DetailsGrid items={[
              ["Payment Status", getStatusBadge(payment.status)],
              ["Amount", formatCurrency(payment.amount)],
              ["Gateway", <span key="gw" className="font-mono font-semibold capitalize">{payment.gateway}</span>],
              ["Paid At", formatDateTime(payment.paid_at)],
              ["Created At", formatDateTime(payment.created_at)],
              ["Failure Reason", payment.failure_reason || "-"],
              ["Refunded Amount", payment.refunded_amount != null ? formatCurrency(payment.refunded_amount) : "-"],
            ]} />
          </DetailsSection>

          {/* Order Information */}
          <DetailsSection title="Order Information">
            <DetailsGrid items={[
              ["Order Number", payment.orders?.order_number ? <span key="on" className="font-mono font-bold">#{payment.orders.order_number}</span> : "-"],
              ["Order Total", payment.orders?.total != null ? formatCurrency(payment.orders.total) : "-"],
              ["Customer Name", payment.orders?.profiles?.name || "Guest Customer"],
              ["Customer Email", payment.orders?.profiles?.email || "-"],
            ]} />
          </DetailsSection>

          {/* Razorpay Information */}
          <DetailsSection title="Razorpay Information">
            <DetailsGrid items={[
              ["Razorpay Order ID", payment.gateway_order_id || "-"],
              ["Razorpay Payment ID", payment.gateway_payment_id || "-"],
              ["Razorpay Signature", payment.gateway_signature
                ? <span key="sig" className="font-mono text-xs break-all text-muted-foreground">{payment.gateway_signature}</span>
                : "-"],
            ]} />
          </DetailsSection>
        </div>
      )}
    </AppDialog>
  );
}

function DetailsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-border p-4 bg-card shadow-2xs">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function DetailsGrid({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
          <dd className="text-sm text-foreground font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
