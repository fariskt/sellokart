"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="w-full bg-card rounded-2xl p-5 border border-border shadow-2xs select-none">
      {/* Title / Mobile Toggle */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center space-x-2 text-foreground font-semibold text-sm cursor-pointer lg:cursor-default"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="tracking-tight">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
          <span className="lg:hidden text-xs font-medium text-primary flex items-center gap-1 ml-2">
            ({isMobileExpanded ? "Close" : "Open"})
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
            className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer tracking-wider uppercase transition-colors shrink-0"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Body: Collapsible on mobile, always visible on desktop */}
      <div
        className={cn(
          "space-y-6 pt-5",
          isMobileExpanded ? "block" : "hidden lg:block",
        )}
      >
        {/* Categories Filter */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </h4>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isSelected =
                activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <motion.button
                  type="button"
                  key={cat}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "w-full text-left px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted font-medium",
                  )}
                >
                  <span>{cat}</span>
                  {isSelected && <X className="w-3.5 h-3.5" />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Range (₹)
          </h4>
          <form onSubmit={handlePriceApply} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-border rounded-xl bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <span className="text-muted-foreground text-xs font-medium">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-border rounded-xl bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Apply Price
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
