"use client";

import { useState, useEffect } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { NAV_LINKS } from "./constants";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
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
        <a
          href="#"
          className="text-xl font-black tracking-tighter text-landing-dark font-display"
        >
          SELLOKART
        </a>

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

        {/* Icons */}
        <div className="flex items-center gap-1">
          {[Search, User, Heart].map((Icon, i) => (
            <button
              key={i}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full transition-colors hover:bg-landing-primary-light text-landing-dark cursor-pointer"
            >
              <Icon size={17} />
            </button>
          ))}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-landing-primary-light transition-colors text-landing-dark cursor-pointer">
            <ShoppingBag size={17} />
            <span className="absolute top-1 right-1 w-4 h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center bg-landing-primary">
              3
            </span>
          </button>
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
        </div>
      )}
    </header>
  );
}
