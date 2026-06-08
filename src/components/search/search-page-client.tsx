"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Heart, Star, ShoppingBag, Sparkles, ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: string;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  category: string;
  slug: string;
}

interface SearchPageClientProps {
  initialQuery: string;
  results: Product[];
  allProducts: Product[];
}

export function SearchPageClient({ initialQuery, results, allProducts }: SearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);

  // States
  const [query, setQuery] = React.useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Track Analytics: Search Query on search submit/load
  React.useEffect(() => {
    if (initialQuery) {
      console.log(`Analytics Event: Search Query - Query: "${initialQuery}"`);
    }
  }, [initialQuery]);

  // Sync state with URL change
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Hide suggestions on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  const handleResultClick = (prod: Product) => {
    // Track Analytics: Search Result Click
    console.log(`Analytics Event: Search Result Click - ID: ${prod.id}, Name: "${prod.name}"`);
  };

  const handleAddToCart = (prod: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image
    });
    alert(`Added ${prod.name} to cart!`);
  };

  const handleWishlistToggle = (prod: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image
    });
  };

  // Filter suggestions dynamically (matching product names)
  const suggestions = React.useMemo(() => {
    if (query.trim().length === 0) return [];
    return allProducts
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, allProducts]);

  const popularSearches = ["Headphones", "Desk Mat", "Jacket", "Audio", "Minimalist"];

  return (
    <div className="space-y-10 select-none">
      
      {/* Search Bar & Suggestions Input */}
      <div className="relative max-w-2xl mx-auto space-y-4" ref={dropdownRef}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit(query);
          }}
          className="relative w-full"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          
          <input
            type="text"
            placeholder="Type to search acoustics, fashion, desk decor..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-12 pr-28 py-3.5 text-base border border-border bg-white rounded-2xl shadow-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />

          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-all button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (query.trim().length > 0 || suggestions.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-border rounded-2xl shadow-lg z-30 overflow-hidden divide-y divide-border/60 animate-in fade-in slide-in-from-top-2 duration-200">
            {suggestions.length > 0 ? (
              <div className="py-2.5">
                <span className="px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Product Suggestions
                </span>
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setQuery(p.name);
                      handleSearchSubmit(p.name);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between text-sm text-foreground font-semibold"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground font-medium">{p.category}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No matching product suggestions found. Press Enter to search.
              </div>
            )}
          </div>
        )}

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
          <span className="text-muted-foreground font-semibold">Popular:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                handleSearchSubmit(term);
              }}
              className="px-3 py-1.5 rounded-full border border-border bg-white hover:border-primary/50 hover:bg-secondary/20 text-muted-foreground hover:text-primary transition-all font-semibold cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-bold text-foreground">
          {initialQuery ? (
            <>
              Search Results for <span className="text-primary">"{initialQuery}"</span> ({results.length} found)
            </>
          ) : (
            "Enter a query above to search our catalog"
          )}
        </h2>
        
        {/* FTS/Search Engine Placeholder Alert */}
        <div className="mt-4 p-3 bg-secondary/30 border border-accent/20 rounded-xl flex items-center justify-between text-xs text-secondary-foreground font-semibold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Search query matches filtered using simulated PostgreSQL Full-Text Search. Algolia indexing integration pending.</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {results.map((prod) => {
            const isInWishlist = wishlistItems.some((wi) => wi.id === prod.id);
            return (
              <Link
                key={prod.id}
                href={`/products/${prod.slug}`}
                onClick={() => handleResultClick(prod)}
                className="product-card overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-primary/50"
              >
                <div className="h-48 bg-muted/30 relative overflow-hidden">
                  {prod.badge && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9px] font-bold badge-sale rounded-md">
                      {prod.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleWishlistToggle(prod, e)}
                    className={cn(
                      "absolute top-3 right-3 z-10 w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs",
                      isInWishlist
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                    aria-label="Add to Wishlist"
                  >
                    <Heart className={cn("w-3.5 h-3.5", isInWishlist && "fill-current")} />
                  </button>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5 border-t border-border/40 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{prod.category}</span>
                    <h4 className="font-bold text-foreground mt-1 mb-2 line-clamp-1 group-hover:text-primary transition-colors text-sm">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <span className="text-xs font-bold text-foreground">{prod.rating}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">({prod.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="price text-base">₹{prod.price.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(prod, e)}
                      className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors button-shadow cursor-pointer active:scale-95"
                      aria-label="Add to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        initialQuery && (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl">
            <span className="text-base font-bold text-foreground block mb-1">No results match your search</span>
            <span className="text-xs text-muted-foreground">Double check your spelling or search for something else.</span>
          </div>
        )
      )}
    </div>
  );
}
