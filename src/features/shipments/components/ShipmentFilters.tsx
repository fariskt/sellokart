"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "In Transit", value: "in_transit" },
  { label: "Out For Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Returned", value: "returned" },
  { label: "Cancelled", value: "cancelled" },
];

export function ShipmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const courier = searchParams.get("courier") ?? "";

  const [searchValue, setSearchValue] = useState(search);
  const [courierValue, setCourierValue] = useState(courier);

  useEffect(() => {
    setSearchValue(search);
    setCourierValue(courier);
  }, [search, courier]);

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
    updateParams({ search: searchValue, courier: courierValue });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-card p-4 rounded-lg border border-border shadow-2xs">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Search Shipments
          </label>
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tracking number or order..."
              className="h-10"
            />
            <Button type="submit" variant="secondary" className="h-10 px-3 shrink-0 cursor-pointer">
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Status */}
      <div className="w-full sm:w-48 space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Shipment Status
        </label>
        <AppSelect
          name="status"
          value={status}
          onValueChange={(val) => updateParams({ status: val })}
          options={statusOptions}
          placeholder="Status"
        />
      </div>

      {/* Courier name text filter */}
      <div className="w-full sm:w-44 space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Courier Name
        </label>
        <Input
          value={courierValue}
          onChange={(e) => setCourierValue(e.target.value)}
          placeholder="e.g. Delhivery..."
          className="h-10"
          onBlur={() => updateParams({ courier: courierValue })}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams({ courier: courierValue });
          }}
        />
      </div>

      {/* Clear */}
      <div className="shrink-0">
        <Button
          variant="ghost"
          onClick={() => {
            setSearchValue("");
            setCourierValue("");
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
