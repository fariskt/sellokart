"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function FeaturedProductSection() {
  const { data: rawProducts } = useLandingProducts();

  // Find featured product or fallback
  const rawFeatured =
    rawProducts?.find((p: any) => p.featured) || rawProducts?.[0];

  const product = rawFeatured
    ? formatLandingProduct(rawFeatured)
    : {
      id: "featured-fallback",
      name: "Ice Drift Jacket",
      slug: "ice-drift-jacket",
      price: 329,
      salePrice: null,
      description:
        "Engineered for the elements. Technical shell construction with premium wool lining for unmatched warmth-to-weight ratio. Every seam sealed. Every panel purposeful.",
      image:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=880&h=1040&fit=crop&auto=format",
      colors: [],
      tag: "FEATURED",
    };

  const secondaryProduct =
    rawProducts && rawProducts.length > 2
      ? formatLandingProduct(rawProducts[2])
      : null;

  const secondaryImage =
    secondaryProduct?.image ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=720&fit=crop&auto=format";

  const secondaryName = secondaryProduct?.name || "Phantom Runner X";

  const productHref = product.slug ? `/products/${product.slug}` : `/products`;
  const secondaryHref = secondaryProduct?.slug
    ? `/products/${secondaryProduct.slug}`
    : `/products`;

  return (
    <section className="py-16 sm:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-landing-dark font-display leading-tight">
            Featured Products
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 sm:gap-6">
          {/* Left Photo Panel with Glass CTA */}
          <div className="relative group overflow-hidden rounded-[28px] sm:rounded-[36px] shadow-xl border border-landing-primary/10 aspect-[4/5] bg-landing-accent-light">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Bottom Gradient & Glass CTA */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="text-white drop-shadow-sm">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-white/90 mt-0.5">
                  ₹{product.salePrice ?? product.price}
                </p>
              </div>

              {/* Glass style shop now button */}
              <Link
                href={productHref}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all duration-300 group/btn self-start sm:self-auto cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight
                  size={15}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* Right Photo Panel with Glass CTA */}
          <div className="relative group overflow-hidden rounded-[28px] sm:rounded-[36px] shadow-xl border border-landing-primary/10 aspect-[4/5] bg-landing-accent-light">
            <img
              src={secondaryImage}
              alt={secondaryName}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Bottom Gradient & Glass CTA */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="text-white drop-shadow-sm">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {secondaryName}
                </h3>
                <p className="text-sm font-semibold text-white/90 mt-0.5">
                  ₹{secondaryProduct?.salePrice ?? secondaryProduct?.price ?? 249}
                </p>
              </div>

              {/* Glass style shop now button */}
              <Link
                href={secondaryHref}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl transition-all duration-300 group/btn self-start sm:self-auto cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight
                  size={15}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
