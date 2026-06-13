"use client";

import { AppDialog } from "@/components/AppDialog";
import { Notification } from "../lib/types";
import type { ReactNode } from "react";

interface NotificationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification?: Notification | null;
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(isRead: boolean) {
  if (isRead) {
    return (
      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-slate-500/10 text-slate-600 border-slate-500/20">
        Read
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-600 border-rose-500/20">
      Unread
    </span>
  );
}

function getTypeBadge(type: string) {
  const typeStyles: Record<string, string> = {
    order: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
    payment: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    shipment: "bg-purple-500/10 text-purple-700 border border-purple-500/20",
    return: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
    coupon: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    system: "bg-zinc-500/10 text-zinc-700 border border-zinc-500/20",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${typeStyles[type] || "border-border"}`}>
      {type}
    </span>
  );
}

export function NotificationDetailsDialog({
  open,
  onOpenChange,
  notification,
}: NotificationDetailsDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Notification Details"
      description={notification ? `Alert ID: ${notification.id}` : undefined}
      size="xl"
    >
      {!notification ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading notification details...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recipient Information */}
          <DetailsSection title="Recipient Profile">
            <DetailsGrid
              items={[
                ["Name", notification.profiles?.name || "Guest Customer"],
                ["Email", notification.profiles?.email || "-"],
                ["User ID", <span key="uid" className="font-mono text-xs text-muted-foreground break-all">{notification.user_id}</span>],
              ]}
            />
          </DetailsSection>

          {/* Alert Content */}
          <DetailsSection title="Notification Content">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</span>
                <p className="text-sm font-bold text-foreground bg-muted/20 p-2.5 rounded-md border border-border/50">
                  {notification.title}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</span>
                <p className="text-sm text-foreground bg-muted/20 p-3 rounded-md border border-border/50 whitespace-pre-wrap leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>
          </DetailsSection>

          {/* Metadata */}
          <DetailsSection title="Delivery Status & Metadata">
            <DetailsGrid
              items={[
                ["Notification Type", getTypeBadge(notification.type)],
                ["Status", getStatusBadge(notification.is_read)],
                ["Dispatched At", formatDateTime(notification.created_at)],
                ["Read At", formatDateTime(notification.read_at)],
                [
                  "Action URL",
                  notification.action_url ? (
                    <a
                      key="url"
                      href={notification.action_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-xs break-all"
                    >
                      {notification.action_url}
                    </a>
                  ) : (
                    "-"
                  ),
                ],
              ]}
            />
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
