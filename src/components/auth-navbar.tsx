"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { adminNavigation, customerNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { signout } from "@/features/auth/actions";
import { useSidebarStore } from "@/store/sidebar-store";
import { useCartStore } from "@/store/cart-store";

export function AuthNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname.startsWith("/admin");
  const isCustomer =
    pathname.startsWith("/account") ||
    pathname === "/cart" ||
    pathname === "/wishlist" ||
    pathname === "/checkout";
  const hasSidebar =
    pathname.startsWith("/admin") || pathname.startsWith("/account");

  // State management
  const { isCollapsed, isHovered } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cart Count from Store
  const cartCount = useCartStore(
    (state) => state.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  );

  // Fetch user session client-side and subscribe to updates
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    setMounted(true);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signout();
  };

  // Active navigation config based on role
  const activeNavigation = isAdmin
    ? adminNavigation
    : isCustomer && hasSidebar
      ? customerNavigation
      : [];

  // Flattened pages for searching
  const searchablePages: { name: string; href: string; category: string }[] = [];
  activeNavigation.forEach((group) => {
    group.items.forEach((item) => {
      searchablePages.push({
        name: item.name,
        href: item.href,
        category: group.groupName,
      });
      if (item.subItems) {
        item.subItems.forEach((sub) => {
          searchablePages.push({
            name: `${item.name} > ${sub.name}`,
            href: sub.href,
            category: group.groupName,
          });
        });
      }
    });
  });

  // Filter search results
  const filteredResults =
    searchQuery.trim() === ""
      ? []
      : searchablePages
          .filter(
            (page) =>
              page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              page.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5);

  // Close search results dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowResults(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K or Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === "Escape") {
        setShowResults(false);
        setMobileSearchOpen(false);
        setShowDropdown(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (href: string) => {
    setSearchQuery("");
    setShowResults(false);
    setIsDrawerOpen(false);
    router.push(href);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      if (hasSidebar && filteredResults.length > 0) {
        handleResultClick(filteredResults[0].href);
      } else {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        setShowResults(false);
        setMobileSearchOpen(false);
      }
    }
  };

  const collapsed = mounted ? isCollapsed : false;
  const hovered = mounted ? isHovered : false;
  const isExpanded = !collapsed || hovered;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-50 pointer-events-none transition-all duration-300",
          hasSidebar
            ? isExpanded
              ? "left-0 md:left-64"
              : "left-0 md:left-16"
            : "left-0 px-3 sm:px-6 lg:px-0"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto h-16 sm:h-[68px] flex items-center justify-between w-full bg-white border-b border-landing-primary/10 select-none",
            hasSidebar ? "px-4 sm:px-6" : "px-4 sm:px-7 border border-landing-primary/10"
          )}
        >
          {/* Left Side: Desktop Nav or Mobile Drawer Toggle + Context Badge */}
          {hasSidebar ? (
            <div className="flex items-center gap-3 shrink-0">
              {activeNavigation.length > 0 && (
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
                  aria-label="Open sidebar menu"
                >
                  <Menu size={20} />
                </button>
              )}

              {/* Mobile Logo when Sidebar is collapsed / hidden on small screens */}
              <Link href="/" className="flex md:hidden items-center">
                <Image
                  src="/logo4.png"
                  alt="Sellokart-Logo"
                  width={140}
                  height={140}
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </Link>

              {/* Desktop Context Badge & Quick Link */}
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-landing-primary-light text-landing-primary font-display border border-landing-primary/10">
                  {isAdmin ? "Admin Console" : "My Account"}
                </span>
                <Link
                  href="/"
                  className="text-[13px] font-bold tracking-wide text-landing-dark hover:text-landing-primary transition-colors font-display flex items-center gap-1.5 cursor-pointer ml-1"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Store</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Left Nav items (Desktop) matching Navbar */}
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

              {/* Mobile Menu Toggle for non-sidebar pages */}
              <button
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                aria-label="Toggle menu"
              >
                {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}

          {/* Center Logo (Shown on non-sidebar pages like Cart / Checkout) */}
          {!hasSidebar && (
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logo4.png"
                  alt="Sellokart-Logo"
                  width={160}
                  height={160}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>
            </div>
          )}

          {/* Right Side: Search, Cart & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Search Bar with Pill Design */}
            <div ref={searchRef} className="relative hidden md:block">
              <div
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200",
                  showResults
                    ? "bg-white border-landing-primary ring-2 ring-landing-primary/20 w-[240px] sm:w-[280px] shadow-sm"
                    : "bg-landing-accent-light/80 hover:bg-landing-accent-light border-landing-primary/10 w-[180px] sm:w-[220px]"
                )}
              >
                <Search size={14} className="text-landing-dark shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit(e);
                  }}
                  placeholder={
                    isAdmin
                      ? "Search admin panel..."
                      : hasSidebar
                        ? "Search account..."
                        : "Search products..."
                  }
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

              {/* Desktop Dropdown Panel for Search Results */}
              <AnimatePresence>
                {showResults && filteredResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-3 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-landing-primary/15 overflow-hidden z-50 p-3 font-display"
                  >
                    <div className="text-[10px] uppercase tracking-[0.2em] text-landing-primary-muted font-display px-2 py-1 mb-1">
                      Search Results
                    </div>
                    <div className="space-y-1">
                      {filteredResults.map((result) => (
                        <button
                          key={result.href}
                          onClick={() => handleResultClick(result.href)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold hover:bg-landing-primary-light hover:text-landing-primary transition-all text-left text-landing-dark cursor-pointer group"
                        >
                          <span className="truncate">{result.name}</span>
                          <span className="text-[10px] text-landing-primary-muted font-semibold bg-landing-primary-light/60 px-2 py-0.5 rounded-full shrink-0">
                            {result.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
              aria-label="Toggle mobile search"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Cart Bag Icon Button */}
            {!isAdmin && (
              <Link
                href="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
                title="Cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-landing-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Actions / Profile Dropdown matching Navbar */}
            <div className="flex items-center gap-2 ml-1">
              {user ? (
                <div className="relative">
                  {/* User Profile Pill Trigger */}
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-bold text-landing-dark hover:text-landing-primary transition-colors cursor-pointer bg-landing-primary-light px-3.5 py-2 rounded-full font-display border border-landing-primary/10"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || "Profile"}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon size={14} />
                    )}
                    <span className="max-w-[90px] truncate hidden md:inline">
                      {user.user_metadata?.full_name ||
                        user.email?.split("@")[0]}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowDropdown(false)}
                        />

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
                            href={isAdmin ? "/admin/dashboard" : "/account"}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-landing-dark hover:bg-landing-primary-light hover:text-landing-primary transition-colors cursor-pointer"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-landing-primary-muted" />
                            <span>
                              {isAdmin ? "Admin Dashboard" : "Customer Portal"}
                            </span>
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
                            href={
                              isAdmin ? "/admin/settings" : "/account/profile"
                            }
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
                              handleSignOut();
                            }}
                            type="button"
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
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
                </div>
              )}
            </div>
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
                  if (e.key === "Enter") handleSearchSubmit(e);
                }}
                placeholder={
                  isAdmin
                    ? "Search admin panel..."
                    : hasSidebar
                      ? "Search account..."
                      : "Search products..."
                }
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

            {filteredResults.length > 0 ? (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {filteredResults.map((page) => (
                  <button
                    key={page.href}
                    onClick={() => handleResultClick(page.href)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-slate-50 text-left text-landing-dark"
                  >
                    <span>{page.name}</span>
                    <span className="text-[10px] text-landing-primary-muted font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                      {page.category}
                    </span>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() !== "" ? (
              <div className="py-4 text-center text-xs text-slate-500">
                No matching results for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : null}
          </div>
        )}

        {/* Mobile Navigation Drawer for Non-Sidebar Pages (Cart / Checkout) */}
        {!hasSidebar && isDrawerOpen && (
          <div className="lg:hidden max-w-[1400px] mx-auto mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-landing-primary/10 shadow-xl p-6 pointer-events-auto transition-all">
            <nav className="flex flex-col space-y-3.5 mb-6">
              <Link
                href="/products"
                onClick={() => setIsDrawerOpen(false)}
                className="text-sm font-bold text-landing-dark hover:text-landing-primary font-display flex items-center justify-between"
              >
                <span>Shop All Products</span>
                <span className="text-xs text-landing-primary">➔</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsDrawerOpen(false)}
                className="text-sm font-bold text-landing-dark hover:text-landing-primary font-display flex items-center justify-between"
              >
                <span>Contact Us</span>
                <span className="text-xs text-landing-primary">➔</span>
              </Link>
            </nav>

            <div className="pt-4 border-t border-landing-primary/10 flex flex-col gap-2.5">
              {user ? (
                <Link
                  href={
                    user.app_metadata?.role === "admin" ? "/admin" : "/account"
                  }
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-landing-primary-light text-landing-dark text-xs font-bold font-display"
                >
                  <UserIcon size={15} />
                  <span>My Account</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-full border border-landing-dark/20 text-landing-dark text-xs font-bold font-display hover:bg-slate-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsDrawerOpen(false)}
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

      {/* Mobile Slide-Out Sidebar Drawer for Admin & Account */}
      <AnimatePresence>
        {hasSidebar && isDrawerOpen && activeNavigation.length > 0 && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs md:hidden"
            />

            {/* Sliding Panel Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 border-r border-landing-primary/10 shadow-2xl flex flex-col justify-between p-5 md:hidden select-none font-display"
            >
              <div className="space-y-5 overflow-y-auto flex-1 pr-1">
                {/* Header Context with Logo */}
                <div className="flex items-center justify-between border-b border-landing-primary/10 pb-3">
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center"
                  >
                    <Image
                      src="/logo4.png"
                      alt="Sellokart-Logo"
                      width={130}
                      height={130}
                      className="h-7 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-landing-primary-light text-landing-dark transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Role Identifier Badge */}
                <div className="px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-landing-primary-light text-landing-primary">
                    {isAdmin ? "Admin Console" : "Customer Portal"}
                  </span>
                </div>

                {/* Mobile Search Bar inside Drawer */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-landing-primary-muted">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8.5 pl-9 pr-4 rounded-full border border-landing-primary/15 bg-landing-accent-light/80 text-xs text-landing-dark placeholder:text-landing-primary-muted focus:outline-hidden focus:ring-1 focus:ring-landing-primary transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Search query results inside Drawer */}
                {searchQuery.trim() !== "" ? (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-landing-primary-muted uppercase tracking-wider pl-1">
                      Search Results
                    </h3>
                    {searchablePages.filter((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 ? (
                      <div className="text-center py-6 text-xs text-landing-primary-muted italic">
                        No pages matched query.
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {searchablePages
                          .filter((page) =>
                            page.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          )
                          .slice(0, 6)
                          .map((page) => (
                            <li key={page.href}>
                              <button
                                onClick={() => handleResultClick(page.href)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-landing-primary hover:text-white transition-colors cursor-pointer block text-landing-dark"
                              >
                                {page.name}
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  /* Standard navigation list */
                  <div className="space-y-5">
                    {activeNavigation.map((group) => (
                      <div key={group.groupName} className="space-y-2">
                        <h3 className="px-3 text-[10px] font-bold text-landing-primary-muted uppercase tracking-wider">
                          {group.groupName}
                        </h3>
                        <ul className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isParentActive = pathname === item.href;
                            const hasActiveChild = item.subItems?.some(
                              (sub) => pathname === sub.href
                            );
                            const isActive = isParentActive || hasActiveChild;

                            return (
                              <li key={item.name} className="space-y-1">
                                <Link
                                  href={item.href}
                                  onClick={() => setIsDrawerOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group",
                                    isActive
                                      ? "bg-landing-primary text-white shadow-xs"
                                      : "text-landing-dark hover:bg-landing-primary-light hover:text-landing-primary"
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Icon
                                      className={cn(
                                        "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                                        isActive
                                          ? "text-white"
                                          : "text-landing-primary-muted group-hover:text-landing-primary"
                                      )}
                                    />
                                    <span>{item.name}</span>
                                  </div>
                                  {item.subItems && (
                                    <ChevronRight
                                      className={cn(
                                        "w-3.5 h-3.5 transition-transform duration-200",
                                        isActive
                                          ? "rotate-90 text-white"
                                          : "text-landing-primary-muted/50"
                                      )}
                                    />
                                  )}
                                </Link>

                                {/* Sub Items inside Drawer */}
                                {item.subItems && isActive && (
                                  <ul className="pl-6 pr-1 py-1 space-y-1 mt-0.5 border-l border-landing-primary/15 ml-5">
                                    {item.subItems.map((sub) => {
                                      const isSubActive = pathname === sub.href;
                                      return (
                                        <li key={sub.name}>
                                          <Link
                                            href={sub.href}
                                            onClick={() =>
                                              setIsDrawerOpen(false)
                                            }
                                            className={cn(
                                              "block py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer",
                                              isSubActive
                                                ? "text-landing-primary bg-landing-primary-light font-bold"
                                                : "text-slate-600 hover:text-landing-primary hover:bg-landing-primary-light/50"
                                            )}
                                          >
                                            {sub.name}
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Profile & Logout */}
              {user && (
                <div className="pt-4 border-t border-landing-primary/10 px-1 space-y-3 shrink-0">
                  <div className="flex items-center space-x-3">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || "Profile"}
                        className="w-9 h-9 rounded-full object-cover border border-landing-primary/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-landing-primary-light flex items-center justify-center text-landing-primary border border-landing-primary/20">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-landing-dark truncate">
                        {user.user_metadata?.full_name ||
                          user.email?.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-landing-primary-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold bg-destructive/10 text-destructive hover:bg-destructive/15 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-landing-primary/10 text-[10px] text-landing-primary-muted px-1 flex items-center justify-between mt-3 shrink-0">
                <span>© Sellokart 2026</span>
                <span className="font-bold text-landing-primary">v0.1.0</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
