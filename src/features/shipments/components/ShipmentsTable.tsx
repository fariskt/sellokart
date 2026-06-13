"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit3 } from "lucide-react";
import { Shipment } from "../lib/types";

interface ShipmentsTableProps {
  shipments: Shipment[];
  onView: (shipment: Shipment) => void;
  onUpdate: (shipment: Shipment) => void;
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch { return dateStr; }
}

export function ShipmentsTable({ shipments, onView, onUpdate }: ShipmentsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking Number</TableHead>
            <TableHead>Order Number</TableHead>
            <TableHead>Courier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Shipped At</TableHead>
            <TableHead>Delivered At</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {shipments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold">No shipments found</span>
                  <span className="text-sm text-muted-foreground">Try adjusting your filters.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            shipments.map((shipment) => (
              <TableRow key={shipment.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono font-bold text-foreground">
                  {shipment.tracking_number || "-"}
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {shipment.orders?.order_number ? `#${shipment.orders.order_number}` : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {shipment.courier_name || "-"}
                </TableCell>
                <TableCell>{getStatusBadge(shipment.shipment_status)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(shipment.shipped_at)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(shipment.delivered_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onView(shipment)}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdate(shipment)}>
                        <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
                        Update Status
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
