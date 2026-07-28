"use client";

import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "./constants";

export function NewArrivalsSection() {
  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-landing-primary" />
            <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
              Just Arrived
            </span>
          </div>
          <h2 
            className="leading-none tracking-tight font-black text-landing-dark font-display" 
            style={{ 
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)"
            }}
          >
            New<br />Arrivals
          </h2>
        </div>
        <a 
          href="#" 
          className="hidden lg:flex items-center gap-2 text-sm font-black tracking-wide transition-colors group text-landing-dark font-display hover:text-landing-primary"
        >
          View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Editorial grid: large left + 2×2 right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr", gridTemplateRows: "310px 310px", gap: 14 }}>
        <div style={{ gridRow: "1 / 3" }}><ProductCard product={PRODUCTS[0]} /></div>
        <div><ProductCard product={PRODUCTS[1]} /></div>
        <div><ProductCard product={PRODUCTS[2]} /></div>
        <div><ProductCard product={PRODUCTS[3]} /></div>
        <div><ProductCard product={PRODUCTS[4]} /></div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14, height: 360 }}>
        <ProductCard product={PRODUCTS[5]} />
        <ProductCard product={PRODUCTS[6]} />
        <ProductCard product={PRODUCTS[7]} />
      </div>
    </section>
  );
}
