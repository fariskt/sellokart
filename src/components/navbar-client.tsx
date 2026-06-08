"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, User as UserIcon, LogOut, ShoppingBag, Settings, LayoutDashboard } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { signout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface NavbarClientProps {
  user: User | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

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
    { name: "Shop", href: "#" },
    { name: "Features", href: "#" },
    { name: "Categories", href: "#" },
    { name: "Sell", href: "#" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full select-none transition-all duration-300",
      hasScrolled 
        ? "border-b border-border bg-background/85 backdrop-blur-md shadow-xs" 
        : "bg-transparent"
    )}>
      <div className="container-page h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            SELLOKART
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-semibold transition-colors duration-200",
                hasScrolled 
                  ? "text-muted-foreground hover:text-primary" 
                  : "text-white/80 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons (Auth states) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative">
              {/* User Profile Trigger */}
              <button
                onClick={toggleDropdown}
                type="button"
                className={cn(
                  "flex items-center space-x-2 p-1.5 rounded-full border border-transparent transition-all cursor-pointer",
                  hasScrolled
                    ? "hover:bg-muted/50 hover:border-border text-foreground"
                    : "hover:bg-white/10 hover:border-white/10 text-white"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-accent/20">
                  <UserIcon className="w-4 h-4" />
                </div>
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
                        href="#"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="#"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="#"
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
                className={cn(
                  "text-sm font-semibold transition-colors duration-200",
                  hasScrolled 
                    ? "text-muted-foreground hover:text-primary" 
                    : "text-white/80 hover:text-white"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary-hover button-shadow hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            type="button"
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              hasScrolled
                ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
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
            className="md:hidden border-t border-border bg-white overflow-hidden shadow-lg"
          >
            <div className="container-page py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-semibold text-muted-foreground hover:text-primary transition-colors py-1.5 border-b border-border/30"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 flex flex-col space-y-3">
                {user ? (
                  <>
                    <div className="px-1.5 py-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      type="button"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/15 transition-all cursor-pointer"
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
                      className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-primary border border-border bg-background hover:bg-muted/30 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-hover button-shadow transition-all"
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
