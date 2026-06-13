import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CouponAnalyticsData } from "../lib/types";
import { Ticket, CheckCircle2, ShoppingBag } from "lucide-react";

interface CouponsAnalyticsProps {
  data: CouponAnalyticsData;
}

export function CouponsAnalytics({ data }: CouponsAnalyticsProps) {
  const statCards = [
    {
      label: "Total Campaigns",
      value: data.total,
      icon: Ticket,
      className: "border-border bg-muted/10 text-foreground",
    },
    {
      label: "Active Codes",
      value: data.active,
      icon: CheckCircle2,
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Campaign Redemptions",
      value: data.totalUses,
      icon: ShoppingBag,
      className: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
  ];

  return (
    <Card className="p-4 bg-card border border-border shadow-2xs space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Coupon & Promotions Analytics</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Campaign performance and redemption highlights</p>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-3 border rounded-lg flex items-center justify-between gap-4 ${card.className}`}
            >
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">{card.label}</p>
                <p className="text-lg font-black mt-1 text-foreground">{card.value}</p>
              </div>
              <Icon className="w-5 h-5 shrink-0 opacity-80" />
            </div>
          );
        })}
      </div>

      {/* Top Used Coupons List */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/10">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Top Redemptions</h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Code</TableHead>
              <TableHead className="text-right w-32">Usage Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-20 text-center text-xs text-muted-foreground">
                  No coupon redemptions in this period.
                </TableCell>
              </TableRow>
            ) : (
              data.topCoupons.map((c) => (
                <TableRow key={c.code} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-foreground uppercase">
                    {c.code}
                  </TableCell>
                  <TableCell className="text-right font-black text-xs text-primary">
                    {c.usage_count}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
