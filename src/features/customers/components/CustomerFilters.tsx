"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

const dateRangeOptions = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Custom Range", value: "custom" },
];

const customerTypeOptions = [
  { label: "All Customers", value: "all" },
  { label: "New Customers", value: "new" },
  { label: "Returning Customers", value: "returning" },
  { label: "High Value Customers", value: "high_value" },
];

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const dateRange = searchParams.get("dateRange") ?? "all";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const customerType = searchParams.get("customerType") ?? "all";

  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1"); // reset to page 1 on filter changes

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
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Search Customers
            </label>
            <div className="flex gap-2">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Name, email, or phone..."
                className="h-10"
              />
              <Button type="submit" variant="secondary" className="h-10 px-3 shrink-0 cursor-pointer">
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Customer Type Select */}
        <div className="w-full sm:w-48 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Customer Type
          </label>
          <AppSelect
            name="customerType"
            value={customerType}
            onValueChange={(val) => updateParams({ customerType: val })}
            options={customerTypeOptions}
            placeholder="Select Type"
          />
        </div>

        {/* Date Range Select */}
        <div className="w-full sm:w-44 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Joined Date
          </label>
          <AppSelect
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
            placeholder="Joined Date"
          />
        </div>

        {/* Clear Filters Button */}
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

      {/* Custom Date Inputs */}
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
