"use client";

import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "./constants";

export function CategorySection() {
  return (
    <section className="py-24 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-landing-primary" />
            <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
              Shop by Category
            </span>
          </div>
          <h2
            className="leading-none tracking-tight font-black text-landing-dark font-display"
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4.5rem)"
            }}
          >
            Collections
          </h2>
        </div>
      </div>

      {/* Main asymmetric grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.2fr 0.9fr", gap: 14, height: 580 }}>
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.name}
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-landing-primary-light"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(10,15,46,0.82) 0%, rgba(10,15,46,0.1) 50%, transparent 100%)"
              }}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(26,63,240,0.15)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <div className="text-[10px] font-black tracking-[0.28em] uppercase mb-2 text-landing-accent-glow font-display">
                {cat.sub}
              </div>
              <h3
                className="leading-none tracking-tight mb-4 font-black text-white font-display"
                style={{
                  fontSize: i === 0 ? "2.8rem" : "2.2rem"
                }}
              >
                {cat.name}
              </h3>
              <button className="inline-flex items-center gap-2 text-[13px] font-black tracking-wide group-hover:gap-3 transition-all cursor-pointer text-white font-display">
                {cat.cta} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
        {[
          { name: "Accessories", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&h=420&fit=crop&auto=format" },
          { name: "Bags", image: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=763&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
          { name: "Footwear", image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=700&h=420&fit=crop&auto=format" },
        ].map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-landing-primary-light"
            style={{ height: 240 }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(10,15,46,0.72) 0%, transparent 60%)" }}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(26,63,240,0.15)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h4 className="font-black tracking-tight text-[1.4rem] text-white font-display">
                {item.name}
              </h4>
              <span className="text-[11px] font-bold text-landing-accent-glow font-display">
                Shop Now →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
