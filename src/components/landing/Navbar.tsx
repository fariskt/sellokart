"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, User, ShoppingBag, Menu, X, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";
import { PRODUCTS } from "./constants";
import { useCartStore } from "@/store/cart-store";

const POPULAR_SEARCHES = ["Hoodie", "Runner", "Sneakers", "Jacket", "Cargo", "Cap"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cart Count from Store
  const cartCount = useCartStore(
    (state) => state.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  );

  // Products Data for Search
  const { data: rawProducts } = useLandingProducts();
  const allProducts = useMemo(() => {
    if (rawProducts && rawProducts.length > 0) {
      return rawProducts.map((p, i) => formatLandingProduct(p, i));
    }
    return PRODUCTS;
  }, [rawProducts]);

  const query = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!query) return [];
    return allProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          ("description" in product && typeof product.description === "string" && product.description.toLowerCase().includes(query)) ||
          (product.tag && product.tag.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [allProducts, query]);

  const trendingProducts = useMemo(() => {
    return allProducts.slice(0, 3);
  }, [allProducts]);

  // Modal active state: search open or mobile drawer open
  const isModalOpen = searchOpen || mobileSearchOpen || mobileOpen;
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // Disable scrollbar & prevent layout shift / clutter with padding compensation
  useEffect(() => {
    if (isModalOpen) {
      const scrollWidth = window.innerWidth - document.documentElement.clientWidth;
      setScrollbarWidth(scrollWidth);

      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      if (scrollWidth > 0) {
        document.body.style.paddingRight = `${scrollWidth}px`;
      }

      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      };
    } else {
      setScrollbarWidth(0);
    }
  }, [isModalOpen]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      {/* Modal Dark Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${isModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => {
          setSearchOpen(false);
          setMobileSearchOpen(false);
          setMobileOpen(false);
        }}
        aria-hidden="true"
      />

      {/* Fake Scrollbar to avoid layout shift / page clutter when scroll is locked */}
      {isModalOpen && scrollbarWidth > 0 && (
        <div
          className="fixed top-0 bottom-0 right-0 z-50 pointer-events-none bg-slate-100/90 dark:bg-slate-900/90 border-l border-slate-200/80 dark:border-slate-800 transition-opacity"
          style={{ width: `${scrollbarWidth}px` }}
          aria-hidden="true"
        >
          <div className="w-full flex justify-center pt-2">
            <div
              className="w-[7px] rounded-full bg-slate-300 dark:bg-slate-600"
              style={{ height: "120px" }}
            />
          </div>
        </div>
      )}

      <header
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-0 pointer-events-none"
        style={{
          right: isModalOpen && scrollbarWidth > 0 ? `${scrollbarWidth}px` : 0,
        }}
      >
        <div
          className="px-4 sm:px-7 pointer-events-auto h-16 sm:h-[68px] flex items-center justify-between w-full bg-white border border-landing-primary/10"
        >
          {/* Left Nav items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-[13px] font-bold tracking-wide text-landing-dark hover:text-landing-primary transition-colors font-display flex items-center gap-1 cursor-pointer"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-[13px] font-bold tracking-wide text-landing-dark hover:text-landing-primary transition-colors font-display flex items-center gap-1 cursor-pointer"
            >
              Shop
            </Link>
            <Link
              href="/contact"
              className="text-[13px] font-bold tracking-wide text-landing-dark hover:text-landing-primary transition-colors font-display cursor-pointer"
            >
              Contact
            </Link>
          </nav>

          {/* Center Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo4.png"
                alt="Sellokart-Logo"
                width={160}
                height={160}
              />
            </Link>
          </div>

          {/* Right Search, Cart & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Bar with Floating Dropdown */}
            <div ref={searchRef} className="relative hidden md:block">
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 ${searchOpen
                  ? "bg-white border-landing-primary ring-2 ring-landing-primary/20 w-[240px] sm:w-[280px] shadow-sm"
                  : "bg-landing-accent-light/80 hover:bg-landing-accent-light border-landing-primary/10 w-[180px] sm:w-[220px]"
                  }`}
              >
                <Search size={14} className="text-landing-dark shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchOpen) setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-xs text-landing-dark placeholder:text-landing-primary-muted focus:outline-hidden font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Desktop Dropdown Panel */}
              {searchOpen && (
                <div className="absolute top-full right-0 mt-3 w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-landing-primary/15 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* When Search Query is Empty: Suggestions & Trending */}
                  {!query ? (
                    <div className="p-4 space-y-4">
                      <div className="pt-3">
                        <div className="text-[10px]  uppercase tracking-[0.2em] text-landing-primary-muted font-display mb-2">
                          Trending Drops
                        </div>
                        <div className="space-y-1">
                          {trendingProducts.map((product) => {
                            const href =
                              "slug" in product && product.slug
                                ? `/products/${product.slug}`
                                : `/products/${product.id}`;
                            return (
                              <Link
                                key={product.id}
                                href={href}
                                onClick={() => setSearchOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                              >
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-landing-dark truncate group-hover:text-landing-primary transition-colors">
                                    {product.name}
                                  </div>
                                  <div className="text-[11px] font-semibold text-slate-500">
                                    ${product.price}
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-landing-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  View →
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    /* When Matching Products are Found */
                    <div className="p-3">
                      <div className="text-[10px]  uppercase tracking-[0.2em] text-landing-primary-muted font-display px-2 py-1 mb-1">
                        Products ({searchResults.length})
                      </div>
                      <div className="space-y-1">
                        {searchResults.map((product) => {
                          const href =
                            "slug" in product && product.slug
                              ? `/products/${product.slug}`
                              : `/products/${product.id}`;
                          const price = ("salePrice" in product && product.salePrice) ? product.salePrice : product.price;
                          return (
                            <Link
                              key={product.id}
                              href={href}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                            >
                              <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-landing-dark font-display truncate group-hover:text-landing-primary transition-colors">
                                  {product.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-landing-dark">
                                    ${price}
                                  </span>
                                  {"salePrice" in product && Boolean(product.salePrice) && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      ${product.price}
                                    </span>
                                  )}
                                  {product.tag && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-landing-primary-light text-landing-primary uppercase">
                                      {product.tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight
                                size={14}
                                className="text-slate-300 group-hover:text-landing-primary group-hover:translate-x-0.5 transition-all shrink-0"
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Empty Search Results State */
                    <div className="p-7 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <Search size={16} />
                      </div>
                      <div className="text-xs font-bold text-landing-dark mb-1 font-display">
                        No products found
                      </div>
                      <p className="text-[11px] text-landing-primary-muted max-w-[200px] mx-auto mb-3">
                        We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try another keyword.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {POPULAR_SEARCHES.slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search mobile toggle button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
              aria-label="Toggle mobile search"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Cart Bag */}
            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-landing-primary text-white text-[9px]  rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Actions */}
            <div className="hidden sm:flex items-center gap-2 ml-1">
              {user ? (
                <Link
                  href={
                    user.app_metadata?.role === "admin" ? "/admin" : "/account"
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-landing-dark hover:text-landing-primary transition-colors cursor-pointer bg-landing-primary-light px-3.5 py-2 rounded-full font-display border border-landing-primary/10"
                >
                  <User size={14} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-bold tracking-wide text-landing-dark hover:text-landing-primary px-3 py-2 rounded-full transition-colors cursor-pointer font-display"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-landing-dark hover:bg-landing-primary text-white text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs font-display tracking-wider"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Panel */}
        {mobileSearchOpen && (
          <div
            ref={mobileSearchRef}
            className="md:hidden max-w-[1400px] mx-auto mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-landing-primary/15 shadow-2xl p-4 pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 mb-3">
              <Search size={16} className="text-landing-dark shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                placeholder="Search products, collections..."
                className="w-full bg-transparent text-sm text-landing-dark placeholder:text-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {!query ? (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {searchResults.map((product) => {
                  const href =
                    "slug" in product && product.slug
                      ? `/products/${product.slug}`
                      : `/products/${product.id}`;
                  return (
                    <Link
                      key={product.id}
                      href={href}
                      onClick={() => setMobileSearchOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-landing-dark truncate">
                          {product.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">
                          ${("salePrice" in product && product.salePrice) ? product.salePrice : product.price}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                No products found for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden max-w-[1400px] mx-auto mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-landing-primary/10 shadow-xl p-6 pointer-events-auto transition-all">
            <nav className="flex flex-col space-y-3.5 mb-6">
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-landing-dark hover:text-landing-primary font-display flex items-center justify-between"
              >
                <span>Shop All Products</span>
                <span className="text-xs text-landing-primary">➔</span>
              </Link>
            </nav>

            <div className="pt-4 border-t border-landing-primary/10 flex flex-col gap-2.5">
              {user ? (
                <Link
                  href={
                    user.app_metadata?.role === "admin" ? "/admin" : "/account"
                  }
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-landing-primary-light text-landing-dark text-xs font-bold font-display"
                >
                  <User size={15} />
                  <span>My Account</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-full border border-landing-dark/20 text-landing-dark text-xs font-bold font-display hover:bg-slate-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-full bg-landing-dark text-white text-xs font-bold font-display hover:bg-landing-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
