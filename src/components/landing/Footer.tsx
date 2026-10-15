"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#fbfcfd] border-t border-landing-primary/10 text-landing-dark pt-16 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* WhatsApp Community CTA Banner Card (Concentric Ripple Layout from Reference) */}
        <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#0c0e14] mb-16 shadow-2xl border border-white/10">
          {/* Ambient Edge Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-landing-primary/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-950/20 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px] sm:min-h-[340px] items-center relative z-10">
            {/* Left Decorative Concentric Discs Graphic */}
            <div className="lg:col-span-5 h-[240px] sm:h-[300px] lg:h-full relative overflow-hidden flex items-start justify-center lg:justify-start">
              <svg
                viewBox="0 0 420 380"
                className="w-full h-full max-w-[420px] object-cover pointer-events-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="discShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.55" />
                  </filter>
                  <radialGradient id="disc5Grad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#1e232d" />
                    <stop offset="100%" stopColor="#0d1017" />
                  </radialGradient>
                  <radialGradient id="disc4Grad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1f2937" />
                  </radialGradient>
                  <radialGradient id="disc3Grad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#475569" />
                  </radialGradient>
                  <radialGradient id="disc2Grad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </radialGradient>
                  <radialGradient id="disc1Grad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </radialGradient>
                </defs>

                {/* Layer 5 (Outermost) */}
                <circle cx="170" cy="10" r="300" fill="url(#disc5Grad)" opacity="0.9" />
                {/* Layer 4 */}
                <circle cx="170" cy="10" r="235" fill="url(#disc4Grad)" filter="url(#discShadow)" />
                {/* Layer 3 */}
                <circle cx="170" cy="10" r="175" fill="url(#disc3Grad)" filter="url(#discShadow)" />
                {/* Layer 2 */}
                <circle cx="170" cy="10" r="120" fill="url(#disc2Grad)" filter="url(#discShadow)" />
                {/* Layer 1 (Innermost Top Disc) */}
                <circle cx="170" cy="10" r="70" fill="url(#disc1Grad)" filter="url(#discShadow)" />
              </svg>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 lg:pl-4 flex flex-col justify-center">
              <h3 className="text-3xl sm:text-4xl lg:text-[42px]  tracking-tight text-white font-display leading-[1.12] mb-3 sm:mb-4">
                Join Our Exclusive
                <br />
                WhatsApp Community
              </h3>

              <p className="text-xs sm:text-sm text-white/70 max-w-lg leading-relaxed mb-6 sm:mb-8 font-sans">
                Get instant access to secret product drops, exclusive member specials, and direct customer care. We&apos;re happy to help you.
              </p>

              {/* Pill CTA Button with Glossy Orb / Circle Indicator */}
              <div>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 pl-6 sm:pl-7 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full bg-landing-primary hover:bg-landing-primary-hover text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xl hover:shadow-2xl group cursor-pointer"
                >
                  <span>Join WhatsApp Community</span>
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-white to-slate-200 text-landing-dark flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={14} className="text-landing-dark" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

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
