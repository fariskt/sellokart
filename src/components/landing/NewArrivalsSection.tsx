"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { PRODUCTS } from "./constants";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function NewArrivalsSection() {
  const { data: rawProducts, isLoading } = useLandingProducts();

  // Format Supabase products or fallback to default constants if empty
  const products =
    rawProducts && rawProducts.length > 0
      ? rawProducts.map((p, idx) => formatLandingProduct(p, idx))
      : PRODUCTS;

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-8 md:mb-12">
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
              fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
            }}
          >
            New
            <br />
            Arrivals
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden lg:flex items-center gap-2 text-sm font-black tracking-wide transition-colors group text-landing-dark font-display hover:text-landing-primary"
        >
          View All{" "}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {isLoading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr] lg:grid-rows-[310px_310px] gap-3.5">
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[360px] lg:h-auto lg:row-span-2" />
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[310px]" />
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[310px]" />
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[310px]" />
          <div className="rounded-2xl bg-slate-200/60 animate-pulse h-[310px]" />
        </div>
      ) : products.length >= 5 ? (
        <>
          {/* Editorial grid: large left + 2x2 right on desktop, clean responsive grid on mobile/tablet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr] lg:grid-rows-[310px_310px] gap-3.5">
            <div className="h-[400px] sm:h-[460px] lg:h-auto lg:row-span-2">
              <ProductCard product={products[0]} />
            </div>
            <div className="h-[340px] sm:h-[360px] lg:h-[310px]">
              <ProductCard product={products[1]} />
            </div>
            <div className="h-[340px] sm:h-[360px] lg:h-[310px]">
              <ProductCard product={products[2]} />
            </div>
            <div className="h-[340px] sm:h-[360px] lg:h-[310px]">
              <ProductCard product={products[3]} />
            </div>
            <div className="h-[340px] sm:h-[360px] lg:h-[310px]">
              <ProductCard product={products[4]} />
            </div>
          </div>

          {/* Bottom row if more products exist */}
          {products.length > 5 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3.5">
              {products[5] && (
                <div className="h-[340px] sm:h-[360px] lg:h-[360px]">
                  <ProductCard product={products[5]} />
                </div>
              )}
              {products[6] && (
                <div className="h-[340px] sm:h-[360px] lg:h-[360px]">
                  <ProductCard product={products[6]} />
                </div>
              )}
              {products[7] && (
                <div className="h-[340px] sm:h-[360px] lg:h-[360px] sm:col-span-2 lg:col-span-1">
                  <ProductCard product={products[7]} />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Fallback flex/grid for smaller product counts */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[360px]">
          {products.map((product) => (
            <div key={product.id} className="h-[360px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Mobile View All button */}
      <div className="mt-8 text-center lg:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-black tracking-wider uppercase px-6 py-3 rounded-full border-2 border-landing-dark text-landing-dark font-display hover:bg-landing-dark hover:text-white transition-colors cursor-pointer"
        >
          View All Products <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
