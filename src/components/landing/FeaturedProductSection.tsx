"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Play } from "lucide-react";
import Link from "next/link";
import { useLandingProducts } from "@/features/products/hooks/useLandingProducts";
import { formatLandingProduct } from "@/features/products/lib/formatLandingProduct";

export function FeaturedProductSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [-18, 18]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [0.88, 1.06, 1.06, 0.92],
  );
  const [selectedSize, setSelectedSize] = useState("M");

  const { data: rawProducts } = useLandingProducts();

  // Find a product with featured: true, or fallback to the top product
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

  // Derive sizes from variants if present, otherwise use defaults
  const variantSizes =
    rawFeatured?.product_variants
      ?.map((v: any) => v.name)
      .filter((name: string) => name && name.length <= 4) ?? [];

  const sizes =
    variantSizes.length > 0 ? variantSizes : ["XS", "S", "M", "L", "XL", "2XL"];

  // Split title for styling
  const nameParts = (product.name || "ICE DRIFT JACKET")
    .toUpperCase()
    .split(" ");
  const lastWord = nameParts.length > 1 ? nameParts.pop() : "";
  const firstPart = nameParts.join(" ");

  const productHref = product.slug
    ? `/products/${product.slug}`
    : `/products/${product.id}`;

  return (
    <section
      ref={sectionRef}
      className="py-28 overflow-hidden bg-gradient-to-br from-landing-featured-start via-landing-featured-mid to-landing-featured-end"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div
          className="grid lg:grid-cols-2 gap-16 items-center"
          style={{ minHeight: "72vh" }}
        >
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="w-6 h-px bg-landing-accent-glow" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-accent-glow font-display">
                Featured Drop
              </span>
            </div>
            <h2
              className="leading-none tracking-tight mb-8 font-black text-white font-display"
              style={{
                fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
              }}
            >
              {firstPart ? (
                <>
                  {firstPart}
                  <br />
                </>
              ) : null}
              {lastWord ? (
                <span className="text-landing-accent-glow">{lastWord}</span>
              ) : null}
            </h2>
            <p className="text-[15px] leading-relaxed max-w-sm mb-10 text-landing-dark-muted">
              {product.description ||
                "Engineered for the elements. Technical shell construction with premium wool lining for unmatched warmth-to-weight ratio."}
            </p>

            <div className="flex items-center gap-8 mb-10">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-white font-display">
                    ${product.salePrice ?? product.price}
                  </span>
                  {product.salePrice ? (
                    <span className="text-lg line-through text-white/40 font-display">
                      ${product.price}
                    </span>
                  ) : null}
                </div>
                <div className="text-[11px] font-medium mt-1 text-landing-accent-glow">
                  Free shipping worldwide
                </div>
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-10">
              <div className="text-[11px] font-black tracking-[0.2em] uppercase mb-3 text-landing-accent-glow font-display">
                Size
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-10 h-10 px-3 rounded-full text-[12px] font-black transition-all cursor-pointer font-display border-[1.5px] text-white ${
                      selectedSize === s
                        ? "border-landing-primary bg-landing-primary shadow-lg shadow-landing-primary/30"
                        : "border-white/20 bg-transparent hover:border-white/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={productHref}
                className="px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all cursor-pointer bg-landing-primary text-white font-display hover:bg-landing-primary-hover shadow-lg shadow-landing-primary/25"
              >
                Shop the Look
              </Link>
              <button
                type="button"
                className="px-8 py-3.5 text-[13px] font-black tracking-[0.12em] uppercase rounded-full transition-all flex items-center gap-2 cursor-pointer border-[1.5px] border-white/20 hover:border-white/50 text-white font-display"
              >
                <Play size={13} /> Video
              </button>
            </div>
          </motion.div>

          {/* Product image */}
          <div className="flex items-center justify-center w-full max-w-full">
            <motion.div style={{ rotate, scale }} className="relative max-w-full">
              <div
                className="w-[280px] h-[340px] sm:w-[380px] sm:h-[450px] lg:w-[440px] lg:h-[520px] rounded-3xl lg:rounded-[32px] overflow-hidden"
                style={{
                  boxShadow:
                    "0 40px 120px rgba(26,63,240,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Glow rings */}
              <div
                className="absolute -inset-4 rounded-[48px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(26,63,240,0.25) 0%, transparent 70%)",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
