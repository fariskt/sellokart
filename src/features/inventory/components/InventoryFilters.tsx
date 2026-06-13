"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface InventoryFiltersProps {
  categories: Category[];
}

const stockStatusOptions = [
  { label: "All Stock Levels", value: "all" },
  { label: "In Stock", value: "in_stock" },
  { label: "Low Stock (≤ 10)", value: "low_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
];

export function InventoryFilters({ categories }: InventoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const categoryId = searchParams.get("categoryId") ?? "all";

  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const categoryOptions = [
    { label: "All Categories", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

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
            Search
          </label>
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Product name or SKU..."
              className="h-10"
            />
            <Button type="submit" variant="secondary" className="h-10 px-3 shrink-0 cursor-pointer">
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Stock Status */}
      <div className="w-full sm:w-52 space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Stock Status
        </label>
        <AppSelect
          name="status"
          value={status}
          onValueChange={(val) => updateParams({ status: val })}
          options={stockStatusOptions}
          placeholder="Stock Status"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div className="w-full sm:w-48 space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Category
          </label>
          <AppSelect
            name="categoryId"
            value={categoryId}
            onValueChange={(val) => updateParams({ categoryId: val })}
            options={categoryOptions}
            placeholder="Category"
          />
        </div>
      )}

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
