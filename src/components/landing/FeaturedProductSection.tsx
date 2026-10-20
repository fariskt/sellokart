"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function FeaturedProductSection() {
  const { data: rawProducts } = useLandingProducts();

  if (!rawProducts || rawProducts.length === 0) {
    return null;
  }

  // Find featured product or first product
  const rawFeatured =
    rawProducts.find((p: any) => p.featured) || rawProducts[0];

  const product = formatLandingProduct(rawFeatured);

  // Find secondary product
  const secondaryRaw =
    rawProducts.length > 1
      ? rawProducts.find((p: any) => p.id !== rawFeatured.id) || rawProducts[1]
      : null;

  const secondaryProduct = secondaryRaw
    ? formatLandingProduct(secondaryRaw)
    : null;

  const productHref = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
  const secondaryHref = secondaryProduct?.slug
    ? `/products/${secondaryProduct.slug}`
    : secondaryProduct?.id
      ? `/products/${secondaryProduct.id}`
      : `/products`;

  return (
    <section className="py-16 sm:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-landing-dark font-display leading-tight">
            Featured Products
          </h2>
        </motion.div>

        <div className={`grid grid-cols-1 ${secondaryProduct ? "md:grid-cols-2" : "max-w-2xl mx-auto"} items-center gap-4 sm:gap-6`}>
          {/* Main Photo Panel with Glass CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative group overflow-hidden rounded-[28px] sm:rounded-[36px] shadow-xl border border-landing-primary/10 aspect-[4/5] bg-landing-accent-light"
          >
            <img
              src={product.image || "/placeholder-image.jpg"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
              </motion.div>
            </div>
          </motion.div>

          {/* Secondary Photo Panel if available */}
          {secondaryProduct && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              className="relative group overflow-hidden rounded-[28px] sm:rounded-[36px] shadow-xl border border-landing-primary/10 aspect-[4/5] bg-landing-accent-light"
            >
              <img
                src={secondaryProduct.image || "/placeholder-image.jpg"}
                alt={secondaryProduct.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder-image.jpg";
                }}
              />

              {/* Bottom Gradient & Glass CTA */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="text-white drop-shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {secondaryProduct.name}
                  </h3>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">
                    ₹{secondaryProduct.salePrice ?? secondaryProduct.price}
                  </p>
                </div>

                {/* Glass style shop now button */}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
