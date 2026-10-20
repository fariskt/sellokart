"use client";

import * as React from "react";
import { useState } from "react";
import { Title } from "@/components/ui/title";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck, CheckCircle2, Clock, AlertTriangle, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import { Shipment } from "@/features/shipments/lib/types";

interface TrackingClientProps {
  shipments: Shipment[];
}

export function TrackingClient({ shipments }: TrackingClientProps) {
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("all");

  const filtered = shipments.filter((s) => {
    const matchesSearch =
      (s.tracking_number?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.orders?.order_number?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.courier_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.orders?.profiles?.name?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesCourier = courierFilter === "all" || s.courier_name === courierFilter;
    return matchesSearch && matchesCourier;
  });

  const uniqueCouriers = Array.from(
    new Set(shipments.map((s) => s.courier_name).filter((name): name is string => Boolean(name)))
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Tracking number copied to clipboard!");
  };

  const totalTracked = shipments.length;
  const inTransitCount = shipments.filter(
    (s) => s.shipment_status === "in_transit" || s.shipment_status === "shipped"
  ).length;
  const outForDeliveryCount = shipments.filter(
    (s) => s.shipment_status === "out_for_delivery"
  ).length;
  const deliveredCount = shipments.filter((s) => s.shipment_status === "delivered").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title>Shipment Tracking</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Live carrier telemetry and fulfillment progress for dispatch orders.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tracked Shipments"
          value={totalTracked}
          description="Packages with assigned AWB"
          isFeatured={true}
          icon={Truck}
        />
        <StatCard
          label="In Transit"
          value={inTransitCount}
          description="Moving across logistics hubs"
          icon={Clock}
        />
        <StatCard
          label="Out for Delivery"
          value={outForDeliveryCount}
          description="Arriving with courier agents"
          icon={AlertTriangle}
        />
        <StatCard
          label="Delivered"
          value={deliveredCount}
          description="Successfully completed deliveries"
          icon={CheckCircle2}
        />
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search AWB, Order #, or Customer..."
            className="pl-9 rounded-full bg-card border-border/80 text-xs h-9"
          />
        </div>

        {uniqueCouriers.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setCourierFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                courierFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Couriers
            </button>
            {uniqueCouriers.map((c) => (
              <button
                key={c}
                onClick={() => setCourierFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  courierFilter === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real Shipments Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracking AWB</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Number</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Courier</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Delivery</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No tracking records found in shipments table.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-foreground">
                      {item.tracking_number}
                      <button
                        type="button"
                        onClick={() => handleCopy(item.tracking_number || "")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                        title="Copy AWB"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {item.orders?.order_number ? `#${item.orders.order_number}` : "-"}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {item.orders?.profiles?.name || "Customer"}
                  </TableCell>

                  <TableCell>
                    <Badge className="bg-secondary text-secondary-foreground rounded-full text-[11px] font-semibold">
                      {item.courier_name}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        item.shipment_status === "delivered"
                          ? "bg-success/10 text-success border-success/20"
                          : item.shipment_status === "out_for_delivery"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : item.shipment_status === "returned" || item.shipment_status === "cancelled"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      {item.shipment_status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {item.estimated_delivery
                      ? new Date(item.estimated_delivery).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
