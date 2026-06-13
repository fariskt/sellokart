"use client";

import Link from "next/link";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CustomerReturn } from "../lib/types";

interface CustomerReturnsTabProps {
  returns: CustomerReturn[];
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
    approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    completed: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[status] ?? "border-border bg-muted/50"}`}>
      {status}
    </span>
  );
}

export function CustomerReturnsTab({ returns }: CustomerReturnsTabProps) {
  if (returns.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
        <h3 className="text-sm font-semibold text-foreground">No returns found</h3>
        <p className="mt-1 text-xs text-muted-foreground">This customer has not filed any return requests yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((ret) => {
            const orderNum = ret.orders?.order_number || "Unknown Order";
            return (
              <TableRow key={ret.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono font-bold text-foreground">
                  <Link
                    href={`/admin/orders?search=${encodeURIComponent(orderNum)}`}
                    className="text-primary hover:underline"
                  >
                    #{orderNum}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate" title={ret.reason}>
                  {ret.reason}
                </TableCell>
                <TableCell>{getStatusBadge(ret.status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(ret.created_at)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
