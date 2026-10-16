"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#fbfcfd] border-t border-landing-primary/10 text-landing-dark pt-16 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 sm:gap-12 pb-14 border-b border-landing-primary/10">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-2xl  tracking-tight text-landing-dark font-display mb-3"
            >
              <span>SELLOKART</span>
            </Link>
            <p className="text-xs sm:text-sm text-landing-primary-muted max-w-sm leading-relaxed mb-6 font-sans">
              Precision-crafted essentials and statement pieces. Designed for everyday comfort and modern style.
            </p>

            {/* Social Pill Icons */}
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-landing-accent-light text-landing-dark hover:bg-landing-dark hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-landing-accent-light text-landing-dark hover:bg-landing-dark hover:text-white flex items-center justify-center transition-colors"
                aria-label="Twitter / X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-landing-accent-light text-landing-dark hover:bg-landing-dark hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-[11px]  uppercase tracking-[0.2em] text-landing-dark font-display mb-4">
              Shop
            </div>
            <ul className="space-y-2.5">
              {[
                { name: "Products", href: "/products" },
                { name: "Cart", href: "/cart" },
                { name: "Account", href: "/account" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-landing-primary-muted hover:text-landing-dark transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-[11px]  uppercase tracking-[0.2em] text-landing-dark font-display mb-4">
              Support
            </div>
            <ul className="space-y-2.5">
              {[
                { name: "Contact Us", href: "/contact" },
                { name: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-landing-primary-muted hover:text-landing-dark transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-2 md:col-span-3">
            <div className="text-[11px]  uppercase tracking-[0.2em] text-landing-dark font-display mb-4">
              Policies
            </div>
            <ul className="space-y-2.5">
              {[
                { name: "Shipping Policy", href: "/shipping-policy" },
                { name: "Return Policy", href: "/return-policy" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms & Conditions", href: "/terms-and-conditions" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-landing-primary-muted hover:text-landing-dark transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-landing-primary-muted">
          <div>© {new Date().getFullYear()} Sellokart. All rights reserved.</div>
          <p className="text-landing-primary-muted/70 text-[11px]">
            Designed for seamless shopping &amp; premium essentials.
          </p>
        </div>
      </div>
    </footer>
  );
}
