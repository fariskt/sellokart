"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import {
  Heart,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProductCard } from "@/components/landing/ProductCard";
import { CatalogProduct } from "@/features/products/lib/formatCatalogProduct";

export interface ProductDetailsClientProps {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
}

export function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.items.some((i) => String(i.id) === String(product.id)),
  );

  // Local state
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState(product.image);
  const [selectedSize, setSelectedSize] = React.useState("M");
  const [addedAnimation, setAddedAnimation] = React.useState(false);

  // Gallery thumbnails
  const thumbnails =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const sizes = ["XS", "S", "M", "L", "XL", "2XL"];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: activeImage || product.image,
      });
    }

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: activeImage || product.image,
    });
  };

  const reviews = [
    {
      id: 1,
      author: "Aria Chen",
      rating: 5,
      date: "2 days ago",
      comment:
        "The quality is unreal. Feels like a second skin — I've never gotten so many compliments on a single piece.",
    },
    {
      id: 2,
      author: "Marcus Webb",
      rating: 5,
      date: "1 week ago",
      comment:
        "Clean silhouette, premium craftsmanship, and comfortable all day long. Exceeded all expectations.",
    },
  ];

  return (
    <div className="space-y-20 select-none font-display">
      {/* Product Information Card */}
      <div className="bg-white/90 backdrop-blur-2xl border border-landing-primary/10 rounded-3xl p-5 sm:p-8 lg:p-12 shadow-[0_24px_80px_rgba(26,63,240,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image Showcase */}
            <div className="h-[320px] sm:h-[440px] md:h-[520px] rounded-3xl bg-landing-primary-light relative flex items-center justify-center p-6 sm:p-8 overflow-hidden group shadow-inner">
              {product.tag && (
                <div className="absolute top-5 left-5 text-[10px] font-black px-3 py-1.5 rounded-full bg-landing-primary text-white font-display tracking-[0.15em] z-10 shadow-md">
                  {product.tag}
                </div>
              )}
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail row */}
            {thumbnails.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(thumb)}
                    className={cn(
                      "w-20 h-20 bg-white/95 border-2 rounded-2xl p-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0 shadow-xs",
                      activeImage === thumb
                        ? "border-landing-primary ring-4 ring-landing-primary/15 scale-102"
                        : "border-landing-primary/15 hover:border-landing-primary/50 opacity-80 hover:opacity-100",
                    )}
                  >
                    <img
                      src={thumb}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="lg:col-span-6 space-y-6 lg:pl-4">
            <div>
              {/* Category pill */}
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="w-6 h-px bg-landing-primary" />
                <span className="text-[11px] font-black tracking-[0.25em] uppercase text-landing-primary font-display">
                  {product.category}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-landing-dark font-display tracking-tight leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-landing-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="currentColor"
                      className="text-landing-primary"
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-landing-dark font-display">
                  {product.rating}
                </span>
                <span className="text-xs font-semibold text-landing-primary-muted font-display">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="py-4 border-y border-landing-primary/10 flex items-baseline gap-4">
              <span className="text-4xl font-black text-landing-primary font-display">
                ${product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="text-base text-landing-primary-muted line-through font-display">
                  {product.oldPrice}
                </span>
              )}
              <span className="text-[11px] font-bold text-landing-dark-muted px-2.5 py-1 rounded-full bg-landing-primary-light">
                Free Worldwide Shipping
              </span>
            </div>

            <p className="text-[15px] leading-relaxed text-landing-dark/80 font-display">
              {product.description}
            </p>

            {/* Colors Swatch */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black tracking-[0.2em] uppercase text-landing-primary-muted font-display">
                  Color Options
                </span>
                <div className="flex gap-2">
                  {product.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-landing-primary/20"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-black tracking-[0.2em] uppercase text-landing-primary-muted font-display">
                Select Size
              </span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      "min-w-11 h-11 px-3.5 rounded-full text-xs font-black transition-all cursor-pointer font-display border-[1.5px]",
                      selectedSize === s
                        ? "border-landing-primary bg-landing-primary text-white shadow-md shadow-landing-primary/30"
                        : "border-landing-primary/20 bg-white/80 text-landing-dark hover:border-landing-primary/50",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Counter & Add Buttons */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Quantity & Mobile Wishlist Row */}
                <div className="flex items-center gap-3">
                  {/* Quantity Pill */}
                  <div className="flex items-center border border-landing-primary/20 rounded-full bg-white px-2 py-1 shadow-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-landing-dark hover:bg-landing-primary-light cursor-pointer active:scale-90 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-landing-dark font-display">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-landing-dark hover:bg-landing-primary-light cursor-pointer active:scale-90 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mobile-only Wishlist Button */}
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={cn(
                      "sm:hidden w-11 h-11 shrink-0 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ml-auto",
                      isInWishlist
                        ? "border-landing-primary bg-landing-primary text-white"
                        : "border-landing-dark/80 bg-white text-landing-dark hover:bg-landing-dark hover:text-white",
                    )}
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={cn("w-5 h-5", isInWishlist && "fill-current")}
                    />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 py-4 px-6 sm:px-8 rounded-full text-xs font-black tracking-[0.15em] uppercase font-display transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                    addedAnimation
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : "bg-landing-primary hover:bg-landing-primary-hover text-white shadow-landing-primary/25",
                  )}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Bag
                    </>
                  )}
                </button>

                {/* Desktop/Tablet Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={cn(
                    "hidden sm:flex w-13 h-13 shrink-0 rounded-full border-2 items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs",
                    isInWishlist
                      ? "border-landing-primary bg-landing-primary text-white"
                      : "border-landing-dark/80 bg-white text-landing-dark hover:bg-landing-dark hover:text-white",
                  )}
                  aria-label="Wishlist"
                >
                  <Heart
                    className={cn("w-5 h-5", isInWishlist && "fill-current")}
                  />
                </button>
              </div>
            </div>

            {/* Policy & Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-6 border-t border-landing-primary/10 text-xs sm:text-[11px] font-bold text-landing-dark font-display">
              <div className="flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-0 p-3 sm:p-3.5 rounded-2xl bg-landing-primary-light/60 border border-landing-primary/10">
                <ShieldCheck className="w-5 h-5 text-landing-primary sm:mb-1.5 shrink-0" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-0 p-3 sm:p-3.5 rounded-2xl bg-landing-primary-light/60 border border-landing-primary/10">
                <Truck className="w-5 h-5 text-landing-primary sm:mb-1.5 shrink-0" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-0 p-3 sm:p-3.5 rounded-2xl bg-landing-primary-light/60 border border-landing-primary/10">
                <RefreshCw className="w-5 h-5 text-landing-primary sm:mb-1.5 shrink-0" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-8">
        <div className="flex items-end justify-between border-b border-landing-primary/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="w-6 h-px bg-landing-primary" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
                Real Customer Feedback
              </span>
            </div>
            <h3 className="text-3xl font-black text-landing-dark font-display">
              Verified Reviews ({product.reviews})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white/85 backdrop-blur-xl border border-landing-primary/10 rounded-3xl p-7 shadow-xs space-y-3 font-display"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-landing-dark font-display">
                  {rev.author}
                </span>
                <span className="text-[11px] text-landing-primary-muted font-bold font-display">
                  {rev.date}
                </span>
              </div>
              <div className="flex items-center gap-1 text-landing-primary">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    fill="currentColor"
                    className="text-landing-primary"
                  />
                ))}
              </div>
              <p className="text-[14px] text-landing-dark/80 leading-relaxed font-display">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-8 pt-6">
          <div className="flex items-end justify-between border-b border-landing-primary/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-3 mb-2">
                <span className="w-6 h-px bg-landing-primary" />
                <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
                  Complete The Look
                </span>
              </div>
              <h3 className="text-3xl font-black text-landing-dark font-display">
                You May Also Like
              </h3>
            </div>
            <Link
              href="/products"
              className="hidden lg:flex items-center gap-2 text-sm font-black tracking-wide transition-colors group text-landing-dark font-display hover:text-landing-primary"
            >
              Browse Catalog{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="h-[380px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
