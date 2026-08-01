"use client";

import { useState, useEffect } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { NAV_LINKS } from "./constants";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/92 backdrop-blur-2xl shadow-[0_1px_0_rgba(26,63,240,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-landing-dark font-display"
        >
          SELLOKART
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium tracking-wide transition-colors text-landing-dark font-display hover:text-landing-primary"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Icons & Actions */}
        <div className="flex items-center gap-1">
          {/* Search Button */}
          <button className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full transition-colors hover:bg-landing-primary-light text-landing-dark cursor-pointer">
            <Search size={17} />
          </button>

          {/* Wishlist/Heart Button */}
          <Link
            href="/wishlist"
            className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full transition-colors hover:bg-landing-primary-light text-landing-dark cursor-pointer"
          >
            <Heart size={17} />
          </Link>

          {/* Shopping Bag */}
          <Link
            href="/cart"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light transition-colors text-landing-dark cursor-pointer"
          >
            <ShoppingBag size={17} />
            <span className="absolute top-1 right-1 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center bg-landing-primary">
              3
            </span>
          </Link>

          {/* Authentication Actions */}
          <div className="hidden lg:flex items-center gap-3 ml-2">
            {user ? (
              <Link
                href={user.app_metadata?.role === "admin" ? "/admin" : "/account"}
                className="flex items-center gap-1.5 text-sm font-semibold text-landing-dark hover:text-landing-primary transition-colors cursor-pointer bg-landing-primary-light px-3 py-1.5 rounded-full font-display"
              >
                <User size={15} />
                <span>Account</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold tracking-wide text-landing-dark hover:text-landing-primary transition-colors cursor-pointer font-display"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-landing-primary hover:bg-landing-primary-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shadow-xs hover:shadow-sm font-display tracking-wider"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light transition-colors ml-1 text-landing-dark cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[rgba(26,63,240,0.08)] px-6 py-6 space-y-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="block text-sm font-semibold tracking-wide text-landing-dark font-display"
            >
              {link}
            </a>
          ))}
          {/* Mobile Auth Actions */}
          <div className="pt-4 border-t border-[rgba(26,63,240,0.08)] flex flex-col gap-3">
            {user ? (
              <Link
                href={user.app_metadata?.role === "admin" ? "/admin" : "/account"}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-[rgba(26,63,240,0.08)] text-landing-dark text-sm font-bold tracking-wide font-display hover:bg-landing-primary-light transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <User size={15} />
                <span>My Account</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full py-2.5 rounded-full border border-[rgba(26,63,240,0.08)] text-landing-dark text-sm font-bold tracking-wide font-display hover:bg-landing-primary-light transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center w-full py-2.5 rounded-full bg-landing-primary text-white text-sm font-bold tracking-wide font-display hover:bg-landing-primary-hover transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
