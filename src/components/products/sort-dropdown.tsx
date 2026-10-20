"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSort = searchParams.get("sort") || "popular";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (sortValue === "popular") {
      params.delete("sort");
    } else {
      params.set("sort", sortValue);
    }

    // Reset page to 1 on sort change
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2 select-none">
      <label
        htmlFor="sort-select"
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
      >
        Sort by:
      </label>
      <select
        id="sort-select"
        value={activeSort}
        onChange={handleSortChange}
        className="px-3.5 py-1.5 text-xs font-medium border border-border bg-card rounded-full text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs"
      >
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
