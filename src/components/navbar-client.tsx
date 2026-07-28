"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, User as UserIcon, LogOut, ShoppingBag, Settings, LayoutDashboard, Search, ShoppingCart } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { signout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

interface NavbarClientProps {
  user: User | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  const { items } = useCartStore();
  const cartItemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTransparent = false; // Always solid for minimalist scandinavian top bar

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim() !== "") {
      router.push(`/search?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleSignOut = async () => {
    await signout();
  };

  const navLinks = [
    { name: "Shop", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "Featured", href: "/featured" },
    { name: "Deals", href: "/deals" },
    { name: "Sellers", href: "/sellers" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full select-none transition-all duration-300 border-b border-border bg-background/90 backdrop-blur-md shadow-2xs">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <span className="text-xl font-extrabold tracking-tight text-brand-dark lowercase">
            sellokart
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow inline-block mt-1" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-bold text-brand-muted hover:text-brand-dark transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons (Auth states) */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-36 lg:w-48 h-9 flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full h-full pl-8 pr-3 text-xs rounded-full border border-border bg-transparent text-brand-dark focus:outline-hidden transition-all duration-300 focus:border-brand-dark"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-brand-muted" />
          </form>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="relative h-9 w-9 rounded-full border border-border flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-muted text-brand-dark"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-yellow text-brand-yellow-foreground text-[9px] font-bold flex items-center justify-center border border-background shadow-xs animate-in zoom-in">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              {/* User Profile Trigger */}
              <button
                onClick={toggleDropdown}
                type="button"
                className="flex items-center space-x-2 h-9 pl-1.5 pr-3 rounded-full border border-border transition-all cursor-pointer hover:bg-muted text-brand-dark"
              >
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata?.full_name || "Profile"} 
                    className="w-6 h-6 rounded-full object-cover border border-accent/20 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-accent/20 shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-sm font-semibold max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-lg z-40"
                    >
                      <div className="px-3 py-2 border-b border-border/60 mb-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-foreground truncate mt-0.5">{user.email}</p>
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account/profile"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>

                      <div className="w-full h-[1px] bg-border/60 my-1.5" />

                      <button
                        onClick={handleSignOut}
                        type="button"
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-brand-muted hover:text-brand-dark transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-9 px-5 rounded-full font-bold text-sm bg-brand-yellow text-brand-yellow-foreground hover:bg-brand-yellow-hover transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu & Cart Actions */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-muted text-brand-muted hover:text-brand-dark transition-all duration-300 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-brand-yellow text-brand-yellow-foreground text-[9px] font-bold flex items-center justify-center border border-background shadow-xs">
                {cartItemCount}
              </span>
            )}
          </Link>

          <button
            onClick={toggleMenu}
            type="button"
            className="p-1.5 rounded-full hover:bg-muted text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden shadow-lg"
          >
            <div className="container-page py-4 flex flex-col space-y-4">
              {/* Mobile Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-full bg-background text-brand-dark focus:outline-hidden focus:border-brand-dark"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-brand-muted pointer-events-none" />
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-bold text-brand-muted hover:text-brand-dark transition-colors py-1.5 border-b border-border/30"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 flex flex-col space-y-3">
                {user ? (
                  <>
                    <div className="px-1.5 py-1">
                      <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-brand-dark truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      type="button"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full text-sm font-bold bg-destructive/10 text-destructive hover:bg-destructive/15 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-2.5 rounded-full text-sm font-bold text-brand-muted hover:text-brand-dark border border-border bg-background hover:bg-muted transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-2.5 rounded-full text-sm font-bold bg-brand-yellow text-brand-yellow-foreground hover:bg-brand-yellow-hover transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
