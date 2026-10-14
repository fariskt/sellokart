"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";

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

  // Mobile collapsible state
  const [isMobileExpanded, setIsMobileExpanded] = React.useState(false);

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
    if (activeCategory.toLowerCase() === category.toLowerCase()) {
      updateFilters({ category: null }); // Clear filter on click again
    } else {
      updateFilters({ category });
    }
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
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
    <div className="w-full bg-white/90 backdrop-blur-xl border border-landing-primary/10 rounded-3xl p-5 lg:p-6 shadow-[0_16px_48px_rgba(26,63,240,0.06)] select-none font-display">
      {/* Title / Mobile Toggle */}
      <div className="flex items-center justify-between pb-3 lg:pb-4 border-b border-landing-primary/10">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center space-x-2 text-landing-dark font-black text-sm cursor-pointer lg:cursor-default"
        >
          <SlidersHorizontal className="w-4 h-4 text-landing-primary" />
          <span className="tracking-tight">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-landing-primary" />
          )}
          <span className="lg:hidden text-[11px] font-bold text-landing-primary flex items-center gap-1 ml-2">
            ({isMobileExpanded ? "Tap to close" : "Tap to open"})
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isMobileExpanded && "rotate-180",
              )}
            />
          </span>
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-bold text-landing-primary hover:text-landing-primary-hover cursor-pointer tracking-wider uppercase transition-colors shrink-0"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Body: Collapsible on mobile, always visible on desktop */}
      <div
        className={cn(
          "space-y-6 pt-5 lg:pt-6",
          isMobileExpanded ? "block" : "hidden lg:block",
        )}
      >
        {/* Categories Filter */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-landing-primary font-display">
            Category
          </h4>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const isSelected =
                activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between font-display",
                    isSelected
                      ? "bg-landing-primary text-white shadow-md shadow-landing-primary/25"
                      : "text-landing-dark/80 hover:bg-landing-primary-light hover:text-landing-primary",
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
        <div className="space-y-3 pt-4 border-t border-landing-primary/10">
          <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-landing-primary font-display">
            Price Range ($)
          </h4>
          <form onSubmit={handlePriceApply} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-landing-primary/20 rounded-xl bg-white text-landing-dark placeholder:text-landing-primary-muted/60 focus:outline-none focus:ring-2 focus:ring-landing-primary/20 focus:border-landing-primary transition-all"
              />
              <span className="text-landing-primary-muted text-xs font-bold">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-landing-primary/20 rounded-xl bg-white text-landing-dark placeholder:text-landing-primary-muted/60 focus:outline-none focus:ring-2 focus:ring-landing-primary/20 focus:border-landing-primary transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-landing-dark hover:bg-landing-primary text-white text-[11px] font-black uppercase tracking-[0.14em] shadow-md transition-all cursor-pointer active:scale-98"
            >
              Apply Price
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
