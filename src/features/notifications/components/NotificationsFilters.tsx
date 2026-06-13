"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Read", value: "read" },
  { label: "Unread", value: "unread" },
];

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Order", value: "order" },
  { label: "Payment", value: "payment" },
  { label: "Shipment", value: "shipment" },
  { label: "Return", value: "return" },
  { label: "Coupon", value: "coupon" },
  { label: "System", value: "system" },
];

const dateRangeOptions = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Custom Range", value: "custom" },
];

export function NotificationsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const type = searchParams.get("type") ?? "all";
  const dateRange = searchParams.get("dateRange") ?? "all";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search);
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
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Search Notifications
            </label>
            <div className="flex gap-2">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Title or message content..."
                className="h-10 text-sm"
              />
              <Button type="submit" variant="secondary" className="h-10 px-3 shrink-0 cursor-pointer">
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Status */}
        <div className="w-full sm:w-44 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Status
          </label>
          <AppSelect
            key={`status-${status}`}
            name="status"
            value={status}
            onValueChange={(val) => updateParams({ status: val })}
            options={statusOptions}
            placeholder="Status"
          />
        </div>

        {/* Type */}
        <div className="w-full sm:w-44 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Type
          </label>
          <AppSelect
            key={`type-${type}`}
            name="type"
            value={type}
            onValueChange={(val) => updateParams({ type: val })}
            options={typeOptions}
            placeholder="Type"
          />
        </div>

        {/* Date Range */}
        <div className="w-full sm:w-44 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Date Range
          </label>
          <AppSelect
            key={`dateRange-${dateRange}`}
            name="dateRange"
            value={dateRange}
            onValueChange={(val) => {
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

        {/* Clear */}
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

      {/* Custom Date Range Inputs */}
      {dateRange === "custom" && (
        <div className="flex flex-wrap items-end gap-3 bg-muted/30 p-4 rounded-lg border border-dashed border-border/80">
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
