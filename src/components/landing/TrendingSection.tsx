"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TRENDING } from "./constants";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function TrendingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: rawProducts, isLoading } = useLandingProducts();

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  // Convert Supabase products or fallback to default TRENDING
  const items =
    rawProducts && rawProducts.length > 0
      ? rawProducts.map((p, idx) => {
          const formatted = formatLandingProduct(p, idx);
          return {
            rank: String(idx + 1).padStart(2, "0"),
            name: formatted.name,
            price: formatted.salePrice ?? formatted.price,
            sales: p.featured
              ? "Featured Choice"
              : p.stock > 0
                ? "In Stock"
                : "Limited Drop",
            image: formatted.image,
            href: formatted.slug
              ? `/products/${formatted.slug}`
              : `/products/${formatted.id}`,
          };
        })
      : TRENDING.map((t) => ({ ...t, href: "#" }));

  return (
    <section className="py-24 bg-landing-accent-light">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-6 h-px bg-landing-primary" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
                This Season
              </span>
            </div>
            <h2
              className="leading-none tracking-tight font-black text-landing-dark font-display"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
              }}
            >
              Bestsellers
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer border-landing-dark text-landing-dark hover:bg-landing-dark hover:text-white"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer text-white bg-landing-dark hover:bg-landing-primary"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden pb-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-none w-[280px] h-[360px] rounded-2xl bg-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {items.map((item) => (
              <Link
                key={item.rank}
                href={item.href}
                className="flex-none group cursor-pointer w-[280px] snap-start"
              >
                <div className="relative overflow-hidden rounded-2xl h-[360px] bg-landing-primary-light">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,15,46,0.5) 0%, transparent 50%)",
                    }}
                  />
                  {/* Rank watermark */}
                  <div className="absolute top-3 left-3 text-[5rem] font-black leading-none select-none pointer-events-none text-white/15 font-display">
                    {item.rank}
                  </div>
                  {/* Info pill */}
                  <div
                    className="absolute bottom-3 left-3 right-3 rounded-xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.93)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-black leading-tight text-landing-dark font-display truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-medium mt-0.5 text-landing-primary-muted">
                          {item.sales}
                        </div>
                      </div>
                      <div className="text-[14px] font-black text-landing-primary font-display shrink-0">
                        ${item.price}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
