"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal } from "lucide-react";

interface FiltersSidebarProps {
  categories: string[];
}

export function FiltersSidebar({ categories }: FiltersSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active filters from query parameters
  const activeCategory = searchParams.get("category") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  // Local state for price inputs
  const [minPrice, setMinPrice] = React.useState(activeMinPrice);
  const [maxPrice, setMaxPrice] = React.useState(activeMaxPrice);

  // Sync price input state with URL changes
  React.useEffect(() => {
    setMinPrice(activeMinPrice);
  }, [activeMinPrice]);

  React.useEffect(() => {
    setMaxPrice(activeMaxPrice);
  }, [activeMaxPrice]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Track Analytics: Filter Applied
    console.log("Analytics Event: Filter Applied", newParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset page to 1 when filters change
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    if (activeCategory === category) {
      updateFilters({ category: null }); // Clear filter on click again
    } else {
      updateFilters({ category });
    }
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null
    });
  };

  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = activeCategory || activeMinPrice || activeMaxPrice;

  return (
    <div className="w-full space-y-6 bg-white border border-border rounded-2xl p-6 shadow-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center space-x-2 text-foreground font-bold">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between",
                  isSelected
                    ? "bg-secondary text-secondary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span>{cat}</span>
                {isSelected && <X className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-border/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Range (₹)</h4>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            Apply Price
          </button>
        </form>
      </div>
    </div>
  );
}
