"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Play,
  Pause,
  Trash,
} from "lucide-react";
import { Coupon } from "../lib/types";

interface CouponsTableProps {
  coupons: Coupon[];
  onView: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onActivate: (coupon: Coupon) => void;
  onDeactivate: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

function getCouponStatus(coupon: Coupon): "active" | "inactive" | "expired" {
  if (new Date(coupon.end_date) < new Date()) {
    return "expired";
  }
  return coupon.is_active ? "active" : "inactive";
}

function getStatusBadge(status: "active" | "inactive" | "expired") {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    expired: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatDiscount(type: "percentage" | "fixed", value: number) {
  if (type === "percentage") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
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

export function CouponsTable({
  coupons,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: CouponsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount Type</TableHead>
            <TableHead className="text-right">Discount Value</TableHead>
            <TableHead className="text-center">Usage</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {coupons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold text-foreground">No coupons found</span>
                  <span className="text-sm text-muted-foreground">
                    Try adjusting your filters or create a new coupon.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              const usageCount = coupon.usage_count ?? 0;
              const isExpired = status === "expired";

              return (
                <TableRow
                  key={coupon.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono font-bold text-foreground tracking-wide uppercase">
                    {coupon.code}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {coupon.description || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                      {coupon.discount_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {formatDiscount(coupon.discount_type, coupon.discount_value)}
                  </TableCell>
                  <TableCell className="text-center font-medium font-mono text-sm">
                    {usageCount} / {coupon.usage_limit}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(coupon.start_date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(coupon.end_date)}
                  </TableCell>
                  <TableCell>{getStatusBadge(status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onView(coupon)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit(coupon)}>
                          <Edit2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          Edit Coupon
                        </DropdownMenuItem>

                        {!isExpired && (
                          coupon.is_active ? (
                            <DropdownMenuItem onClick={() => onDeactivate(coupon)}>
                              <Pause className="mr-2 h-4 w-4 text-amber-600" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onActivate(coupon)}>
                              <Play className="mr-2 h-4 w-4 text-emerald-600" />
                              Activate
                            </DropdownMenuItem>
                          )
                        )}

                        <DropdownMenuItem
                          onClick={() => onDelete(coupon)}
                          className="text-rose-600 hover:text-rose-700 focus:text-rose-700"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
