"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import { Payment } from "../lib/types";

interface PaymentsTableProps {
  payments: Payment[];
  onView: (payment: Payment) => void;
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch { return dateStr; }
}

export function PaymentsTable({ payments, onView }: PaymentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Payment ID</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid At</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold">No payments found</span>
                  <span className="text-sm text-muted-foreground">Try adjusting your filters.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono font-bold text-foreground">
                  {payment.orders?.order_number ? `#${payment.orders.order_number}` : "-"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                    {payment.gateway}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {payment.gateway_payment_id || "-"}
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(payment.paid_at)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(payment.created_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => onView(payment)}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
