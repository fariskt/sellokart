"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gift,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: rawProducts } = useLandingProducts();

  const heroProduct =
    rawProducts && rawProducts.length > 0
      ? formatLandingProduct(rawProducts[3])
      : null;

  const slides = [
    {
      eyebrow: "NEW COLLECTION",
      titleLine1: "Wrapped in",
      titleLine2: "Warmth.",
      desc: "Precision-crafted essentials and statement pieces for those who move first. Premium materials. Uncompromising detail.",
      tag: "LITTLE MOMENTS",
    },
    {
      eyebrow: "SIGNATURE PIECES",
      titleLine1: "Made to Move,",
      titleLine2: "Built for Life.",
      desc: "Breathable silhouettes and elevated textures designed for all-day ease and effortless style.",
      tag: "BESTSELLER",
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="w-full">
      {/* Main Hero Container */}
      <section>
        <div className="relative w-full pt-16 sm:pt-20 overflow-hidden min-h-[620px] sm:min-h-[650px] flex items-center text-white shadow-2xl">
          {/* Full Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroProduct?.image || "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"}
              alt="Hero background"
              className="w-full h-full object-cover object-center transition-all duration-1000 scale-105"
            />

            {/* Balanced background overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

            {/* Subtle overall darkening */}
            <div className="absolute inset-0 bg-black/10" />
          </div>
          {/* Grid Layout inside Stage */}
          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 py-12 lg:py-16 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Eyebrow Pill */}
              <motion.div
                key={`eyebrow-${activeSlide}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px]  tracking-[0.2em] uppercase font-display flex items-center gap-1.5 shadow-xs">
                  {current.eyebrow}
                </span>
              </motion.div>

              {/* Expressive Pebble Heading */}
              <motion.h1
                key={`title-${activeSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl sm:text-6xl lg:text-[76px]  tracking-tight leading-[0.95] text-white font-display mb-6 drop-shadow-sm"
              >
                {current.titleLine1}
                <br />
                <span className="text-landing-accent-light">
                  {current.titleLine2}
                </span>
              </motion.h1>

              {/* Pebble Pill Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-10">
                <Link
                  href="/products"
                  className="rounded-full bg-white text-landing-dark hover:bg-landing-accent-light px-7 py-3.5 sm:py-4 inline-flex items-center gap-3 font-display font-bold text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <span className="w-7 h-7 rounded-full bg-landing-dark text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={13} />
                  </span>
                </Link>
              </div>

              {/* Pebble Slider Pagination Controls */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/15 max-w-md">
                <div className="text-xs font-bold text-white/80 font-display tracking-wider">
                  0{activeSlide + 1} / 0{slides.length}
                </div>
                {/* Progress bar track */}
                <div className="w-20 h-1 bg-white/25 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{
                      width: `${((activeSlide + 1) / slides.length) * 100}%`,
                    }}
                  />
                </div>
                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlide(
                        (prev) => (prev - 1 + slides.length) % slides.length
                      )
                    }
                    className="w-8 h-8 rounded-full border border-white/30 text-white hover:bg-white hover:text-landing-dark flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % slides.length)
                    }
                    className="w-8 h-8 rounded-full border border-white/30 text-white hover:bg-white hover:text-landing-dark flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Marquee Ticker */}
      <div className="relative w-full bg-gradient-to-r from-[#9ef2df] via-[#b6e8fa] to-[#d6dcfe] border-y border-[#1e3d48]/10 py-2.5 sm:py-3 overflow-hidden select-none">
        <div className="flex items-center whitespace-nowrap gap-8 sm:gap-10 animate-[marquee_25s_linear_infinite]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 sm:gap-10 shrink-0">
              <span className="text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#1e3d48]">
                FREE SHIPPING &amp; RETURNS
              </span>
              <Gift size={16} strokeWidth={2} className="text-[#1e3d48] shrink-0" />
              <span className="text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#1e3d48]">
                GET A FREE GIFT
              </span>
              <ShoppingCart size={16} strokeWidth={2} className="text-[#1e3d48] shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
