"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const ratingOptions = [
  { label: "All Ratings", value: "all" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

const dateRangeOptions = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Custom Range", value: "custom" },
];

export function ReviewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const rating = searchParams.get("rating") ?? "all";
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
              Search Reviews
            </label>
            <div className="flex gap-2">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Product, Customer or Comment..."
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

        {/* Rating */}
        <div className="w-full sm:w-44 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Rating
          </label>
          <AppSelect
            key={`rating-${rating}`}
            name="rating"
            value={rating}
            onValueChange={(val) => updateParams({ rating: val })}
            options={ratingOptions}
            placeholder="Rating"
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
