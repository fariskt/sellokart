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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit3 } from "lucide-react";
import { Order } from "../lib/types";

interface OrdersTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
}

export function OrdersTable({ orders, onView, onUpdateStatus }: OrdersTableProps) {
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
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
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60",
      processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/60",
      shipped: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/60",
      delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60",
      cancelled: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200",
      refunded: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60",
    };

    return (
      <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status] || ""}`}>
        {status}
      </Badge>
    );
  }

  function getPaymentStatusBadge(status: string) {
    const statusStyles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60",
      paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60",
      failed: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60",
      refunded: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60",
    };

    return (
      <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status] || ""}`}>
        {status}
      </Badge>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Number</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Total Items</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Total Amount</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Status</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Status</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Created Date</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold">No orders found</span>
                  <span className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

              return (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono font-bold text-foreground">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {order.profiles?.name || "Guest Customer"}
                      </span>
                      {order.profiles?.email && (
                        <span className="text-xs text-muted-foreground">
                          {order.profiles.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {totalItems}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onView(order)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
                          <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
                          Update Status
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
