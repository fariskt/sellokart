"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";
import { useCartStore } from "@/store/cart-store";
import { signout } from "@/features/auth/actions";
import { useSidebarStore } from "@/store/sidebar-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../common/Logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { Fragment } from "react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  tracking: "Shipment Tracking",
  users: "Users & Staff",
  inventory: "Inventory",
  settings: "Settings",
  reviews: "Reviews",
  payments: "Payments",
  categories: "Categories",
  shipments: "Shipments",
  notifications: "Notifications",
  account: "My Account",
};

function getDashboardBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];
  let path = "";

  segments.forEach((seg, idx) => {
    path += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const label = ROUTE_LABELS[seg.toLowerCase()] || seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href: path, isLast });
  });

  return crumbs;
}

const POPULAR_SEARCHES = ["Hoodie", "Runner", "Sneakers", "Jacket", "Cargo", "Cap"];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const isAdmin = pathname.startsWith("/admin") || user?.app_metadata?.role === "admin";
  const hasSidebar = pathname.startsWith("/admin") || pathname.startsWith("/account");
  const { isCollapsed, isHovered } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const collapsed = mounted ? isCollapsed : false;
  const hovered = mounted ? isHovered : false;
  const isExpanded = !collapsed || hovered;

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
    return [];
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

  // Click outside listener to close search & profile dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setMobileSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
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
        setShowDropdown(false);
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

  const isCheckout = pathname === "/checkout";

  // Distraction-free Minimal Header for Checkout Page
  if (isCheckout) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-landing-primary/10 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between">
          {/* Left: Brand Logo & Subtle Secure Checkout Indicator */}
          <div>
            <Logo />
          </div>

          {/* Right: Essential Cart Navigation & Support Access */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Support Access */}
            <Link
              href="/contact"
              target="_blank"
              title="Need help? Contact support"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-slate-100"
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground/80 shrink-0" />
              <span className="hidden sm:inline">Need Help?</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

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
        className={cn(
          "fixed top-0 right-0 z-50 pointer-events-none transition-all duration-300",
          hasSidebar
            ? isExpanded
              ? "left-0 md:left-64"
              : "left-0 md:left-16"
            : "left-0"
        )}
        style={{
          right: isModalOpen && scrollbarWidth > 0 ? `${scrollbarWidth}px` : 0,
        }}
      >
        <div
          className={cn(
            "pointer-events-auto h-16 sm:h-[68px] flex items-center justify-between w-full bg-white border border-landing-primary/10 select-none",
            hasSidebar ? "px-4 sm:px-6" : "px-4 sm:px-7"
          )}
        >
          {/* Left Side: Desktop Nav or Context Badge if on Sidebar page */}
          {hasSidebar ? (
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex md:hidden items-center">
                <Logo variant="admin" />
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Breadcrumb>
                  <BreadcrumbList className="text-xs font-medium">
                    {getDashboardBreadcrumbs(pathname).map((crumb, idx) => (
                      <Fragment key={crumb.href}>
                        {idx > 0 && <BreadcrumbSeparator className="text-muted-foreground/40" />}
                        <BreadcrumbItem>
                          {crumb.isLast ? (
                            <BreadcrumbPage className="font-semibold text-foreground">
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link
                                href={crumb.href}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {crumb.label}
                              </Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
                <Link
                  href="/"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer ml-1 border-l border-border/80 pl-3"
                >
                  <ArrowLeft size={13} />
                  <span>Store</span>
                </Link>
              </div>
            </div>
          ) : (
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
          )}

          {/* Center Logo (on non-sidebar pages) */}
          {!hasSidebar && (
            <div className="flex items-center">
              <Logo variant="landing" />
            </div>
          )}

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
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1.5 text-xs font-bold text-landing-dark hover:text-landing-primary transition-colors cursor-pointer bg-landing-primary-light px-3.5 py-2 rounded-full font-display border border-landing-primary/10 shadow-2xs"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || "Profile"}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <User size={14} />
                    )}
                    <span className="max-w-[90px] truncate hidden md:inline">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-landing-primary/15 shadow-2xl p-2 z-50 font-display select-none"
                      >
                        <div className="px-3 py-2 border-b border-landing-primary/10 mb-1.5">
                          <p className="text-[10px] font-bold text-landing-primary-muted uppercase tracking-wider">
                            Signed in as
                          </p>
                          <p className="text-xs font-bold text-landing-dark truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href={isAdmin ? "/admin" : "/account"}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-landing-dark hover:bg-landing-primary-light hover:text-landing-primary transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-landing-primary-muted" />
                          <span>{isAdmin ? "Admin Dashboard" : "Customer Portal"}</span>
                        </Link>

                        {!isAdmin && (
                          <Link
                            href="/account/orders"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-landing-dark hover:bg-landing-primary-light hover:text-landing-primary transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-landing-primary-muted" />
                            <span>My Orders</span>
                          </Link>
                        )}

                        <Link
                          href={isAdmin ? "/admin/settings" : "/account/profile"}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-landing-dark hover:bg-landing-primary-light hover:text-landing-primary transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-landing-primary-muted" />
                          <span>Settings</span>
                        </Link>

                        <div className="w-full h-[1px] bg-landing-primary/10 my-1.5" />

                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            signout();
                          }}
                          type="button"
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                <div className="flex flex-col gap-2">
                  <div className="px-3.5 py-2.5 bg-landing-primary-light/50 rounded-2xl flex items-center gap-3">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || "Profile"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-landing-primary/10 flex items-center justify-center text-landing-primary">
                        <User size={16} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-landing-dark truncate">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-landing-primary-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Link
                      href={isAdmin ? "/admin" : "/account"}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-landing-primary-light text-landing-dark text-xs font-bold font-display"
                    >
                      <LayoutDashboard size={14} />
                      <span>{isAdmin ? "Admin" : "Account"}</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-landing-primary-light text-landing-dark text-xs font-bold font-display"
                    >
                      <ShoppingBag size={14} />
                      <span>Orders</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signout();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-destructive/20 text-destructive text-xs font-bold font-display hover:bg-destructive/10 transition-colors mt-1 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
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
