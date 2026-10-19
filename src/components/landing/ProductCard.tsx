"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
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
    <div className="group bg-white rounded-xl p-2 sm:p-3.5 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col md:justify-between md:h-full">
      <div>
        {/* Rounded Image Frame */}
        <Link href={href} className="block">
          <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#f7f7f9] flex items-center justify-center">
            <img
              src={product?.image || "/placeholder-image.jpg"}
              alt={product?.name || "Product"}
              className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="mt-3 px-1">
          <Link href={href} className="block">
            <h3 className="font-bold text-base sm:text-[17px] text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-landing-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Description line */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed min-h-[32px]">
            {description}
          </p>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600 ml-1">
              4.8
            </span>
          </div>

          {/* Price & Discount Pill Row */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              ₹{currentPrice}
            </span>

            {hasDiscount && (
              <>
                <span className="text-xs sm:text-sm text-slate-400 line-through font-normal">
                  ₹{originalPrice}
                </span>
                <span className="rounded-full bg-black text-white text-[10px] font-bold px-2 py-0.5">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mt-3.5 pt-1 px-1">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 py-2.5 px-3 rounded-full bg-black hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold text-center transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
