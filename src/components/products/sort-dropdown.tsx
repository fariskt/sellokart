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
    <div className="flex items-center space-x-2.5 select-none font-display">
      <label
        htmlFor="sort-select"
        className="text-[11px] font-black tracking-[0.1em] uppercase text-landing-primary-muted whitespace-nowrap"
      >
        Sort by:
      </label>
      <select
        id="sort-select"
        value={activeSort}
        onChange={handleSortChange}
        className="px-4 py-2.5 text-xs font-bold border border-landing-primary/20 bg-white/95 rounded-full text-landing-dark focus:outline-none focus:ring-2 focus:ring-landing-primary/20 focus:border-landing-primary transition-all cursor-pointer shadow-xs"
      >
        <option value="popular">Most Popular</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
