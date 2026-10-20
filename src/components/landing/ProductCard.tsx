"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedLandingProduct } from "@/features/products/lib/formatLandingProduct";
import { useCartStore } from "@/store/cart-store";

export interface ProductType {
  id: string | number;
  name: string;
  price: number;
  salePrice?: number | null;
  sale_price?: number | null;
  tag?: string | null;
  colors?: string[];
  image: string;
  description?: string;
  slug?: string;
}

interface ProductCardProps {
  product: FormattedLandingProduct | ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const href =
    "slug" in product && product.slug
      ? `/products/${product.slug}`
      : `/products/${product.id}`;

  const currentPrice =
    "salePrice" in product && product.salePrice != null
      ? product.salePrice
      : "sale_price" in product && product.sale_price != null
        ? product.sale_price
        : product.price;

  const originalPrice =
    "salePrice" in product && product.salePrice != null
      ? product.price
      : "sale_price" in product && product.sale_price != null
        ? product.price
        : null;

  const hasDiscount = originalPrice != null && originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const description =
    product.description ||
    "Premium crafted piece engineered with refined materials for exceptional comfort and lasting durability.";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group bg-card rounded-2xl p-3 sm:p-3.5 border border-border shadow-2xs hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full select-none"
    >
      <div>
        {/* Rounded Image Frame */}
        <Link href={href} className="block overflow-hidden rounded-xl">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/40 flex items-center justify-center">
            <motion.img
              src={product?.image || "/placeholder-image.jpg"}
              alt={product?.name || "Product"}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="mt-3 px-0.5">
          <Link href={href} className="block">
            <h3 className="font-semibold text-base sm:text-[17px] text-foreground tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Description line */}
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
            {description}
          </p>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className="fill-amber-500 text-amber-500"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground ml-1">
              4.8
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Block: Price and Action Button always aligned */}
      <div className="mt-3 px-0.5">
        {/* Price & Discount Pill Row */}
        <div className="flex items-baseline gap-2 mb-3.5">
          <span className="text-xl sm:text-2xl font-bold text-foreground font-display">
            ₹{currentPrice}
          </span>

          {hasDiscount && (
            <>
              <span className="text-xs sm:text-sm text-muted-foreground line-through font-normal">
                ₹{originalPrice}
              </span>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <motion.button
          type="button"
          onClick={handleAddToCart}
          whileTap={{ scale: 0.96 }}
          className="w-full py-2.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold text-center transition-colors cursor-pointer shadow-xs select-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="inline-block"
              >
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="inline-block"
              >
                Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
