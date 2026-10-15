"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import {
  Heart,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatalogProduct } from "@/features/products/lib/formatCatalogProduct";

export interface ProductDetailsClientProps {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
}

export function ProductDetailsClient({
  product,
  relatedProducts,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) =>
    state.items.some((i) => String(i.id) === String(product.id)),
  );

  // Gallery images (Using Unsplash high-res images for aspect ratio testing)
  const thumbnails = React.useMemo(() => {
    return [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80",
      "/placeholder-image.jpg",
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1000&auto=format&fit=crop&q=80",
    ];
  }, []);

  const [activeImage, setActiveImage] = React.useState(thumbnails[0]);
  const [quantity, setQuantity] = React.useState(1);
  const [addedAnimation, setAddedAnimation] = React.useState(false);

  // Update active image if thumbnails change
  React.useEffect(() => {
    setActiveImage(thumbnails[0]);
  }, [thumbnails]);

  // Genuine Sizes from Product
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];
  const [selectedSize, setSelectedSize] = React.useState<string | null>(
    sizes.length > 0 ? sizes[0] : null
  );

  // Genuine Colors from Product
  const colors = product.colors && product.colors.length > 0 ? product.colors : [];
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    colors.length > 0 ? colors[0] : null
  );

  // Accordion open/close states
  const [detailsOpen, setDetailsOpen] = React.useState(true);
  const [shippingOpen, setShippingOpen] = React.useState(false);

  // Complete The Look Carousel state
  const lookScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (lookScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = lookScrollRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [relatedProducts, checkScroll]);

  const scrollLook = (direction: "left" | "right") => {
    if (lookScrollRef.current) {
      const amount = lookScrollRef.current.clientWidth * 0.75;
      lookScrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Price calculation
  const currentPrice = product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : null;

  // Stock status
  const hasStockInfo = typeof product.stock === "number";
  const isOutOfStock = hasStockInfo && product.stock! <= 0;

  // Add to Bag action
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: currentPrice,
        image: activeImage || product.image,
      });
    }

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  // Buy It Now action
  const handleBuyItNow = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: activeImage || product.image,
    });
    router.push("/cart");
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: activeImage || product.image,
    });
  };

  return (
    <div className="w-full pb-16">
      {/* 2-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

        {/* LEFT COLUMN: Gallery shown in ONE BOX */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start self-start">
          {/* Thumbnails rail on the left */}
          {thumbnails.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] w-full sm:w-24 shrink-0 pb-2 sm:pb-0 scrollbar-none">
              {thumbnails.map((thumb, idx) => {
                const isActive = activeImage === thumb;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(thumb)}
                    className={cn(
                      "w-16 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f7f8f9] border-2 p-1 flex items-center justify-center shrink-0 cursor-pointer transition-all overflow-hidden",
                      isActive
                        ? "border-slate-900 ring-2 ring-slate-900/10 shadow-sm"
                        : "border-slate-200/80 hover:border-slate-400 opacity-80 hover:opacity-100"
                    )}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Single Main Image Showcase Box with locked aspect ratio */}
          <div className="relative flex-1 w-full aspect-[4/5] rounded-3xl bg-[#f7f8f9] border border-slate-100 overflow-hidden group">
            <img
              src={activeImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Mobile Wishlist overlay button on top right of box */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-800 hover:text-red-500 transition-all shadow-xs cursor-pointer z-10"
              aria-label="Save to wishlist"
            >
              <Heart
                size={17}
                className={cn(
                  "transition-colors",
                  isInWishlist && "fill-red-500 text-red-500"
                )}
              />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Information & Purchase Flow */}
        <div className="lg:col-span-5 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 ">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-slate-900 transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* Product Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-900 font-display tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                ₹{currentPrice.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-base text-slate-400 line-through font-normal">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed  whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Color Selector (Only rendered if product has genuine colors) */}
          {colors.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-bold text-slate-900 ">
                Color:{" "}
                <span className="font-normal text-slate-600">
                  {selectedColor || colors[0]}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {colors.map((color, idx) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 p-0.5 transition-all cursor-pointer",
                        isSelected
                          ? "border-slate-900 ring-2 ring-slate-900/10 scale-105"
                          : "border-transparent hover:border-slate-300"
                      )}
                      aria-label={`Color option ${color}`}
                    >
                      <div
                        className="w-full h-full rounded-md shadow-xs border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector (Only rendered if product has genuine sizes) */}
          {sizes.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 ">
                  Size: <span className="font-normal text-slate-600">{selectedSize}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "min-w-14 h-10 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer  border",
                        isSelected
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-white text-slate-800 border-slate-300 hover:border-slate-900"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {hasStockInfo && (
            <div className="flex items-center gap-1.5 text-xs font-medium pt-1">
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Out of stock</span>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Check size={14} className="stroke-[2.5]" />
                  <span>In-stock and ready to ship</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector & Add to Cart Row */}
          <div className="flex items-center gap-3 pt-2">
            {/* Quantity Pill */}
            <div className="flex items-center justify-between border border-slate-300 rounded-full bg-white px-3 py-1.5 h-12 w-28 shrink-0">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="text-xs font-bold text-slate-900">{quantity}</span>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={cn(
                "flex-1 h-12 px-6 rounded-full text-xs font-bold uppercase tracking-wider font-display transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
                addedAnimation
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : "bg-[#eae7e2] hover:bg-[#dfdbd4] text-slate-900 shadow-xs"
              )}
            >
              {isOutOfStock ? (
                "Sold Out"
              ) : addedAnimation ? (
                <>
                  <Check size={14} /> Added to Cart
                </>
              ) : (
                "Add To Cart"
              )}
            </button>
          </div>

          {/* Buy It Now Button */}
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleBuyItNow}
              className="w-full h-12 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider font-display transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              Buy It Now
            </button>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 pb-2 border-b border-slate-100 text-center text-[11px] font-medium text-slate-700">
            <div className="flex flex-col items-center gap-1.5">
              <Truck size={18} className="text-slate-800 stroke-[1.75]" />
              <span>Free shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw size={18} className="text-slate-800 stroke-[1.75]" />
              <span>Easy return</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck size={18} className="text-slate-800 stroke-[1.75]" />
              <span>Safe checkout</span>
            </div>
          </div>

          {/* Collapsible Accordions (Only real product details and shipping) */}
          <div className="divide-y divide-slate-200 pt-2">
            {/* Product Details Accordion */}
            {product.description && (
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <span>Product Details</span>
                  <ChevronDown
                    size={15}
                    className={cn(
                      "text-slate-500 transition-transform duration-200",
                      detailsOpen && "rotate-180"
                    )}
                  />
                </button>
                {detailsOpen && (
                  <div className="mt-3 text-xs text-slate-600 leading-relaxed  whitespace-pre-line animate-in fade-in duration-200">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Shipping & Returns Accordion */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => setShippingOpen(!shippingOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer"
              >
                <span>Shipping &amp; Returns</span>
                <ChevronDown
                  size={15}
                  className={cn(
                    "text-slate-500 transition-transform duration-200",
                    shippingOpen && "rotate-180"
                  )}
                />
              </button>
              {shippingOpen && (
                <div className="mt-3 text-xs text-slate-600 leading-relaxed space-y-1  animate-in fade-in duration-200">
                  <p>Standard delivery across all serviceable pincodes.</p>
                  <p>Hassle-free returns on eligible items.</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Share & Need Help */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">Share:</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  }
                }}
                className="hover:text-black cursor-pointer p-1 text-slate-700"
                aria-label="Share product"
              >
                <Share2 size={14} />
              </button>
            </div>

            <Link
              href="/contact"
              className="text-slate-800 hover:text-black font-semibold underline"
            >
              Need Help ?
            </Link>
          </div>
        </div>

      </div>

      {/* Complete The Look Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 pt-10 sm:pt-14 border-t border-slate-200/80">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-display">
                Complete The Look
              </h2>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollLook("left")}
                disabled={!canScrollLeft}
                aria-label="Previous products"
                className={cn(
                  "w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center transition-all",
                  canScrollLeft
                    ? "text-slate-800 hover:border-slate-900 hover:bg-slate-900 hover:text-white cursor-pointer shadow-xs"
                    : "text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                )}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollLook("right")}
                disabled={!canScrollRight}
                aria-label="Next products"
                className={cn(
                  "w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center transition-all",
                  canScrollRight
                    ? "text-slate-800 hover:border-slate-900 hover:bg-slate-900 hover:text-white cursor-pointer shadow-xs"
                    : "text-slate-300 border-slate-100 cursor-not-allowed opacity-50"
                )}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            ref={lookScrollRef}
            onScroll={checkScroll}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x pb-2"
          >
            {relatedProducts.map((item) => {
              const href = `/products/${item.slug || item.id}`;
              const itemPrice = item.salePrice ?? item.price;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className="group shrink-0 w-[calc((100%-12px)/2)] sm:w-[calc((100%-24px)/3)] md:w-[calc((100%-36px)/4)] snap-start flex flex-col"
                >
                  {/* Image fills the complete container */}
                  <div className="relative w-full aspect-[4/5] rounded-[18px] bg-[#f4f5f6] border border-slate-100/80 overflow-hidden mb-2.5 group-hover:bg-[#eaecee] transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Product details */}
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-landing-primary transition-colors">
                      {item.name}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs flex-wrap">
                      <span className={`font-bold ${item.salePrice ? "text-landing-primary" : "text-slate-900"}`}>
                        ₹{itemPrice.toLocaleString()}
                      </span>

                      {item.salePrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
