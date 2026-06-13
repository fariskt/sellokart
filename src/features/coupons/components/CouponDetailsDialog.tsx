"use client";

import { useState, useEffect, useTransition } from "react";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CouponUsageTable } from "./CouponUsageTable";
import { getCouponById } from "../lib/coupons.action";
import { Coupon, CouponUsage } from "../lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface CouponDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

function getCouponStatus(coupon: Coupon): "active" | "inactive" | "expired" {
  if (new Date(coupon.end_date) < new Date()) return "expired";
  return coupon.is_active ? "active" : "inactive";
}

function getStatusBadge(status: "active" | "inactive" | "expired") {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    expired: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  return (
    <Badge
      variant="outline"
      className={`uppercase tracking-wider text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </Badge>
  );
}

function formatDiscount(type: "percentage" | "fixed", value: number) {
  if (type === "percentage") return `${value}%`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/60 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-0.5">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function CouponDetailsDialog({
  open,
  onOpenChange,
  coupon,
}: CouponDetailsDialogProps) {
  const [loading, startLoading] = useTransition();
  const [detailData, setDetailData] = useState<(Coupon & { coupon_usage: CouponUsage[] }) | null>(null);

  useEffect(() => {
    if (open && coupon) {
      setDetailData(null);
      startLoading(async () => {
        const result = await getCouponById(coupon.id);
        if (result.success && result.data) {
          setDetailData(result.data as any);
        }
      });
    }
  }, [open, coupon]);

  if (!coupon) return null;

  const status = getCouponStatus(coupon);
  const data = detailData ?? coupon;
  const usages: CouponUsage[] = (detailData?.coupon_usage as CouponUsage[]) ?? [];
  const usageCount = detailData?.usage_count ?? coupon.usage_count ?? 0;
  const remaining = coupon.usage_limit - usageCount;

  // Calculate total discount from usages
  const totalDiscount = usages.reduce((acc, u) => acc + ((u as any).discount_amount ?? 0), 0);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Coupon Details"
      description={`Viewing: ${coupon.code}`}
      size="2xl"
    >
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-lg flex h-auto w-fit">
          <TabsTrigger
            value="info"
            className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Information
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Usage History ({usageCount})
          </TabsTrigger>
        </TabsList>

        {/* ── Information Tab ── */}
        <TabsContent value="info" className="outline-hidden focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Section title="Coupon Information">
                <InfoRow
                  label="Code"
                  value={
                    <span className="font-mono font-extrabold text-foreground tracking-widest text-base">
                      {coupon.code}
                    </span>
                  }
                />
                <InfoRow label="Description" value={coupon.description || "-"} />
                <InfoRow
                  label="Discount Type"
                  value={
                    <span className="uppercase font-semibold">{coupon.discount_type}</span>
                  }
                />
                <InfoRow
                  label="Discount Value"
                  value={formatDiscount(coupon.discount_type, coupon.discount_value)}
                />
                <InfoRow label="Status" value={getStatusBadge(status)} />
              </Section>

              <Section title="Validity">
                <InfoRow label="Start Date" value={formatDate(coupon.start_date)} />
                <InfoRow label="End Date" value={formatDate(coupon.end_date)} />
              </Section>
            </div>

            <div className="space-y-4">
              <Section title="Restrictions">
                <InfoRow
                  label="Min Order Amount"
                  value={
                    coupon.minimum_order_amount > 0
                      ? formatCurrency(coupon.minimum_order_amount)
                      : "No minimum"
                  }
                />
                <InfoRow
                  label="Max Discount"
                  value={
                    coupon.maximum_discount && coupon.maximum_discount > 0
                      ? formatCurrency(coupon.maximum_discount)
                      : "Unlimited"
                  }
                />
                <InfoRow label="Usage Limit" value={coupon.usage_limit} />
              </Section>

              <Section title="Usage Analytics">
                {loading ? (
                  <div className="space-y-3 py-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : (
                  <>
                    <InfoRow label="Total Uses" value={usageCount} />
                    <InfoRow
                      label="Remaining Uses"
                      value={
                        <span
                          className={
                            remaining <= 0
                              ? "text-rose-600 font-bold"
                              : remaining <= 5
                              ? "text-amber-600 font-bold"
                              : "text-foreground"
                          }
                        >
                          {remaining <= 0 ? "Fully used" : remaining}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Total Discount Given"
                      value={
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          -{formatCurrency(totalDiscount)}
                        </span>
                      }
                    />
                  </>
                )}
              </Section>
            </div>
          </div>
        </TabsContent>

        {/* ── Usage History Tab ── */}
        <TabsContent value="usage" className="outline-hidden focus-visible:ring-0">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <CouponUsageTable usages={usages} />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-2 border-t border-border mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
          Close
        </Button>
      </div>
    </AppDialog>
  );
}
