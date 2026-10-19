"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function NewArrivalsSection() {
  const { data: rawProducts, isLoading } = useLandingProducts();

  // Format Supabase products
  const allProducts =
    rawProducts && rawProducts.length > 0
      ? rawProducts.map((p, idx) => formatLandingProduct(p, idx))
      : [];

  // Display first 8 products
  const products = allProducts.slice(0, 8);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Pebble Header with Tab Pills */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl  tracking-tight text-landing-dark font-display leading-tight">
            Latest Products
          </h2>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-[28px] bg-slate-100 animate-pulse h-[380px]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-7">
          {products.map((product) => (
            <div key={product.id} className="min-h-[380px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      <div className="mt-12 pt-8 border-t border-landing-primary/10 flex items-center justify-end gap-6">
        <Link
          href="/products"
          className="rounded-full bg-landing-dark text-white hover:bg-landing-primary px-7 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2.5 font-display transition-all cursor-pointer shadow-sm"
        >
          <span>View All Products</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
