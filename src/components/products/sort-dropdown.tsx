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
      <label htmlFor="sort-select" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={activeSort}
        onChange={handleSortChange}
        className="px-3 py-2 text-xs font-semibold border border-border bg-white rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
      >
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Customer Rated</option>
      </select>
    </div>
  );
}
