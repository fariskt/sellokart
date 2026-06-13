"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const paymentStatusOptions = [
  { label: "All Payments", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const dateRangeOptions = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Custom Range", value: "custom" },
];

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const paymentStatus = searchParams.get("paymentStatus") ?? "all";
  const dateRange = searchParams.get("dateRange") ?? "all";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const [searchValue, setSearchValue] = useState(search);

  // Sync state if search parameter changes externally
  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search);
    
    // Always reset to page 1 on filter modification
    params.set("page", "1");

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchValue });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-card p-4 rounded-lg border border-border shadow-2xs">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-72">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Search Orders
            </label>
            <div className="flex gap-2">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search Number or Customer..."
                className="h-10"
              />
              <Button type="submit" variant="secondary" className="h-10 px-3 shrink-0 cursor-pointer">
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Order Status Select */}
        <div className="w-full sm:w-48 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Order Status
          </label>
          <AppSelect
            name="status"
            value={status}
            onValueChange={(val) => updateParams({ status: val })}
            options={statusOptions}
            placeholder="Status"
          />
        </div>

        {/* Payment Status Select */}
        <div className="w-full sm:w-48 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Payment Status
          </label>
          <AppSelect
            name="paymentStatus"
            value={paymentStatus}
            onValueChange={(val) => updateParams({ paymentStatus: val })}
            options={paymentStatusOptions}
            placeholder="Payment"
          />
        </div>

        {/* Date Range Select */}
        <div className="w-full sm:w-48 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Date Range
          </label>
          <AppSelect
            name="dateRange"
            value={dateRange}
            onValueChange={(val) => {
              // Reset custom start/end dates if leaving custom mode
              if (val !== "custom") {
                updateParams({ dateRange: val, startDate: null, endDate: null });
              } else {
                updateParams({ dateRange: val });
              }
            }}
            options={dateRangeOptions}
            placeholder="Date Range"
          />
        </div>

        {/* Reset All Filters */}
        <div className="shrink-0">
          <Button
            variant="ghost"
            onClick={() => {
              setSearchValue("");
              router.push(window.location.pathname);
            }}
            className="h-10 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Render Custom Date Picker Fields only when dateRange === "custom" */}
      {dateRange === "custom" && (
        <div className="flex flex-wrap items-end gap-3 bg-muted/30 p-4 rounded-lg border border-border/80 border-dashed animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => updateParams({ startDate: e.target.value })}
              className="h-10 w-44 bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => updateParams({ endDate: e.target.value })}
              className="h-10 w-44 bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
