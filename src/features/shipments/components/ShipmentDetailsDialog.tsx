"use client";

import { AppDialog } from "@/components/AppDialog";
import { Shipment } from "../lib/types";
import type { ReactNode } from "react";

interface ShipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment?: Shipment | null;
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch { return dateStr; }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch { return dateStr; }
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    packed: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    in_transit: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    out_for_delivery: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    returned: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    cancelled: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  };
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status] ?? "border-border"}`}>
      {label}
    </span>
  );
}

function ShipmentTimeline({ shipment }: { shipment: Shipment }) {
  const steps = [
    {
      label: "Created",
      date: formatDateTime(shipment.created_at),
      done: true,
      color: "bg-primary",
    },
    {
      label: "Shipped",
      date: formatDateTime(shipment.shipped_at),
      done: !!shipment.shipped_at,
      color: "bg-purple-500",
    },
    {
      label: "Delivered",
      date: formatDateTime(shipment.delivered_at),
      done: !!shipment.delivered_at,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="relative flex flex-col gap-0">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-start gap-4">
          {/* Timeline dot + connector */}
          <div className="flex flex-col items-center">
            <div
              className={`h-4 w-4 rounded-full border-2 border-background shadow-md z-10 mt-1 shrink-0 ${step.done ? step.color : "bg-muted border-border"}`}
            />
            {idx < steps.length - 1 && (
              <div className={`w-0.5 h-8 ${step.done ? "bg-primary/30" : "bg-border"}`} />
            )}
          </div>

          {/* Content */}
          <div className="pb-2">
            <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </p>
            {step.date ? (
              <p className="text-xs text-muted-foreground">{step.date}</p>
            ) : (
              <p className="text-xs text-muted-foreground/50 italic">Not yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShipmentDetailsDialog({ open, onOpenChange, shipment }: ShipmentDetailsDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Shipment Details"
      description={shipment?.tracking_number ? `Tracking: ${shipment.tracking_number}` : undefined}
      size="xl"
    >
      {!shipment ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading shipment details...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Shipment Information */}
          <DetailsSection title="Shipment Information">
            <DetailsGrid items={[
              ["Tracking Number", <span key="tn" className="font-mono font-bold">{shipment.tracking_number || "-"}</span>],
              ["Courier Name", shipment.courier_name || "-"],
              ["Status", getStatusBadge(shipment.shipment_status)],
              ["Estimated Delivery", formatDate(shipment.estimated_delivery)],
              ["Notes", shipment.notes || "-"],
            ]} />
          </DetailsSection>

          {/* Timeline */}
          <DetailsSection title="Timeline">
            <ShipmentTimeline shipment={shipment} />
          </DetailsSection>

          {/* Order Information */}
          <DetailsSection title="Order Information">
            <DetailsGrid items={[
              ["Order Number", shipment.orders?.order_number ? <span key="on" className="font-mono font-bold">#{shipment.orders.order_number}</span> : "-"],
              ["Customer Name", shipment.orders?.profiles?.name || "Guest Customer"],
              ["Customer Email", shipment.orders?.profiles?.email || "-"],
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
