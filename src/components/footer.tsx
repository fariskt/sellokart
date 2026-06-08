"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { name: "All Products", href: "/products" },
    { name: "Browse Categories", href: "/categories" },
    { name: "Featured Products", href: "/featured" },
    { name: "Hot Deals", href: "/deals" },
    { name: "Our Sellers", href: "/sellers" },
  ];

  const supportLinks = [
    { name: "Help & FAQs", href: "/faq" },
    { name: "Shipping & Delivery", href: "/shipping-policy" },
    { name: "Returns & Refunds", href: "/return-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Privacy Policy", href: "/privacy-policy" },
  ];

  const companyLinks = [
    { name: "About Sellokart", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Partner Program", href: "/sellers" },
    { name: "Sitemap", href: "/sitemap" },
  ];

  const socialLinks = [
    { 
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
        </svg>
      ), 
      href: "https://facebook.com", 
      label: "Facebook", 
      color: "hover:text-blue-500 hover:bg-blue-500/10" 
    },
    { 
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ), 
      href: "https://instagram.com", 
      label: "Instagram", 
      color: "hover:text-pink-500 hover:bg-pink-500/10" 
    },
    { 
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ), 
      href: "https://twitter.com", 
      label: "Twitter", 
      color: "hover:text-sky-400 hover:bg-sky-400/10" 
    },
    { 
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
        </svg>
      ), 
      href: "https://linkedin.com", 
      label: "LinkedIn", 
      color: "hover:text-blue-600 hover:bg-blue-600/10" 
    },
    { 
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ), 
      href: "https://youtube.com", 
      label: "YouTube", 
      color: "hover:text-red-500 hover:bg-red-500/10" 
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-border-dark select-none">
      {/* Trust Badges */}
      <div className="border-b border-border-dark bg-slate-950/50">
        <div className="container-page py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Free & Fast Shipping</h4>
                <p className="text-xs text-slate-500 mt-0.5">On orders above ₹1,999</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-border-dark">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Easy Returns</h4>
                <p className="text-xs text-slate-500 mt-0.5">30-day hassle-free returns</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-border-dark">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Secure Checkout</h4>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted transactions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-border-dark">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">24/7 Dedicated Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">Get help anytime you need</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Logo & Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                SELLOKART
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Discover curated luxury styling, high-fidelity acoustics, and modern minimalist desk accessories designed for the modern lifestyle.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-slate-300">Sellokart HQ, 5th Floor, Silicon Valley, Bengaluru, KA 560001</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:support@sellokart.com" className="text-slate-300 hover:text-white transition-colors">
                  support@sellokart.com
                </a>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+918001234567" className="text-slate-300 hover:text-white transition-colors">
                  +91 800 123 4567
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-9 h-9 rounded-xl border border-border-dark bg-white/5 flex items-center justify-center text-slate-400 transition-all duration-300 cursor-pointer",
                    social.color
                  )}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-border-dark bg-slate-950/80">
        <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            &copy; {currentYear} Sellokart Private Limited. All rights reserved. Made in India.
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 opacity-60">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 bg-white/5 border border-border-dark px-1.5 py-0.5 rounded-sm">VISA</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 bg-white/5 border border-border-dark px-1.5 py-0.5 rounded-sm">MASTERCARD</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 bg-white/5 border border-border-dark px-1.5 py-0.5 rounded-sm">RUPAY</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 bg-white/5 border border-border-dark px-1.5 py-0.5 rounded-sm">UPI</span>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              type="button"
              className="w-9 h-9 rounded-xl border border-border-dark bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer shadow-xs"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
