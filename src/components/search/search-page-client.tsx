"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/landing/ProductCard";
import { CatalogProduct } from "@/features/products/lib/formatCatalogProduct";

interface SearchPageClientProps {
  initialQuery: string;
  results: CatalogProduct[];
  allProducts: CatalogProduct[];
}

export function SearchPageClient({
  initialQuery,
  results,
  allProducts,
}: SearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // States
  const [query, setQuery] = React.useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync state with URL change
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Hide suggestions on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchSubmit = (searchVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim() === "") {
      params.delete("q");
    } else {
      params.set("q", searchVal);
    }
    setShowSuggestions(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  // Filter suggestions dynamically (matching product names)
  const suggestions = React.useMemo(() => {
    if (query.trim().length === 0) return [];
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, allProducts]);

  const popularSearches = [
    "Hoodie",
    "Runner",
    "Jacket",
    "Sneaker",
    "Cap",
    "Pants",
  ];

  return (
    <div className="space-y-12 select-none font-display">
      {/* Search Bar & Suggestions Input */}
      <div className="relative max-w-2xl mx-auto space-y-4" ref={dropdownRef}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit(query);
          }}
          className="relative w-full"
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-landing-primary">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            placeholder="Type to search hoodie, runner, jackets, sneakers..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-13 pr-32 py-4 text-sm font-bold border border-landing-primary/20 bg-white/95 rounded-full shadow-[0_12px_40px_rgba(26,63,240,0.06)] text-landing-dark placeholder:text-landing-primary-muted/70 focus:outline-none focus:ring-2 focus:ring-landing-primary/20 focus:border-landing-primary transition-all font-display"
          />

          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-landing-primary hover:bg-landing-primary-hover text-white text-xs  tracking-[0.12em] uppercase transition-all shadow-md active:scale-95 cursor-pointer font-display"
          >
            Search
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions &&
          (query.trim().length > 0 || suggestions.length > 0) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-landing-primary/15 rounded-3xl shadow-xl z-30 overflow-hidden divide-y divide-landing-primary/10 animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.length > 0 ? (
                <div className="py-2.5">
                  <span className="px-5 py-1.5 text-[10px]  text-landing-primary-muted uppercase tracking-widest block mb-1">
                    Product Suggestions
                  </span>
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setQuery(p.name);
                        handleSearchSubmit(p.name);
                      }}
                      className="w-full text-left px-5 py-2.5 hover:bg-landing-primary-light transition-colors flex items-center justify-between text-xs text-landing-dark font-bold font-display cursor-pointer"
                    >
                      <span>{p.name}</span>
                      <span className="text-[10px]  uppercase text-landing-primary tracking-wider">
                        {p.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-xs font-medium text-landing-primary-muted">
                  No matching product suggestions found. Press Enter to search.
                </div>
              )}
            </div>
          )}

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
          <span className="text-landing-primary-muted font-bold text-[11px] tracking-wider uppercase">
            Popular:
          </span>
          {popularSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                handleSearchSubmit(term);
              }}
              className="px-3.5 py-1.5 rounded-full border border-landing-primary/15 bg-white/80 hover:border-landing-primary hover:bg-landing-primary-light text-landing-dark hover:text-landing-primary transition-all text-xs font-bold cursor-pointer font-display shadow-2xs"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="border-t border-landing-primary/10 pt-8 flex items-center justify-between">
        <h2 className="text-xl  text-landing-dark font-display">
          {initialQuery ? (
            <>
              Search Results for{" "}
              <span className="text-landing-primary">&ldquo;{initialQuery}&rdquo;</span>{" "}
              <span className="text-sm font-semibold text-landing-primary-muted">
                ({results.length} found)
              </span>
            </>
          ) : (
            "Enter a keyword above to search our catalog"
          )}
        </h2>
      </div>

      {/* Results Grid using ProductCard */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((prod) => (
            <div key={prod.id} className="h-[390px]">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      ) : (
        initialQuery && (
          <div className="text-center py-20 bg-white/70 backdrop-blur-md border border-dashed border-landing-primary/20 rounded-3xl p-8">
            <span className="text-xl  text-landing-dark block mb-2 font-display">
              No results match your search
            </span>
            <span className="text-sm font-medium text-landing-primary-muted font-display">
              Try double checking your spelling or search for broader keywords
              like hoodie, runner, jacket, sneaker.
            </span>
          </div>
        )
      )}
    </div>
  );
}
