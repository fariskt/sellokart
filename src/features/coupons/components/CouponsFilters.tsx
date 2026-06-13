"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
];

const discountTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

export function CouponsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const discountType = searchParams.get("discountType") ?? "all";

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
    <div className="flex flex-wrap items-end gap-3 bg-card p-4 rounded-lg border border-border shadow-2xs">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Search Coupons
          </label>
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Coupon code or description..."
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

      {/* Discount Type */}
      <div className="w-full sm:w-44 space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Discount Type
        </label>
        <AppSelect
          key={`type-${discountType}`}
          name="discountType"
          value={discountType}
          onValueChange={(val) => updateParams({ discountType: val })}
          options={discountTypeOptions}
          placeholder="Type"
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
  );
}
