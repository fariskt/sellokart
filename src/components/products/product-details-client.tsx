"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Heart, Star, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: string;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  category: string;
  description: string;
}

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.items.some((i) => i.id === product.id));

  // Local state
  const [quantity, setQuantity] = React.useState(1);
  const [activeImage, setActiveImage] = React.useState(product.image);

  // Gallery thumbnails (using product.image and duplicates for mock)
  const thumbnails = [product.image, product.image, product.image];

  // Track Analytics: Product Viewed
  React.useEffect(() => {
    console.log(`Analytics Event: Product Viewed - ID: ${product.id}, Name: "${product.name}"`);
  }, [product.id, product.name]);

  const handleAddToCart = () => {
    // Add to Zustand Cart
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
    }

    // Track Analytics: Add To Cart
    console.log(`Analytics Event: Add To Cart - ID: ${product.id}, Name: "${product.name}", Qty: ${quantity}`);
    alert(`Added ${quantity} item(s) to cart successfully!`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });

    // Track Analytics: Wishlist Added (only log when we add, not remove)
    if (!isInWishlist) {
      console.log(`Analytics Event: Wishlist Added - ID: ${product.id}, Name: "${product.name}"`);
      alert("Added to wishlist successfully!");
    } else {
      alert("Removed from wishlist.");
    }
  };

  // Mock Reviews
  const mockReviews = [
    { id: 1, author: "Aarav Sharma", rating: 5, date: "2 days ago", comment: "Absolutely incredible quality. Feels extremely premium and exceeds expectations!" },
    { id: 2, author: "Neha Gupta", rating: 4, date: "1 week ago", comment: "Beautiful design, fits perfectly into my minimalist environment. Shipping was very fast." }
  ];

  return (
    <div className="space-y-16 select-none">
      {/* Product Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="h-[400px] md:h-[500px] bg-muted/20 border border-border rounded-3xl flex items-center justify-center p-12 relative overflow-hidden group">
            {product.badge && (
              <span className="absolute top-6 left-6 z-10 px-3 py-1.5 text-xs font-bold badge-sale rounded-md">
                {product.badge}
              </span>
            )}
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Thumbnail row */}
          <div className="flex gap-4">
            {thumbnails.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(thumb)}
                className={cn(
                  "w-20 h-20 bg-muted/20 border rounded-2xl p-3 flex items-center justify-center cursor-pointer transition-all",
                  activeImage === thumb ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-primary/50"
                )}
              >
                <img src={thumb} alt="" className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Specs & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl font-extrabold text-foreground mt-2 mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-bold text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground font-semibold">({product.reviews} customer reviews)</span>
            </div>
          </div>

          <div className="border-y border-border/60 py-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">₹{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through font-semibold">{product.oldPrice}</span>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">{product.description}</p>

          {/* Quantity Counter & Add Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-border rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer active:scale-90 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-foreground">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer active:scale-90 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 min-w-[200px] inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow hover:translate-y-[-1.5px] active:translate-y-0 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={cn(
                  "w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95",
                  isInWishlist
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-border bg-white text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                aria-label="Add to Wishlist"
              >
                <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Policy and Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40 text-[11px] font-bold text-muted-foreground">
            <div className="flex flex-col items-center text-center p-3 border border-border/40 rounded-2xl bg-muted/10">
              <ShieldCheck className="w-5 h-5 text-primary mb-1.5" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 border border-border/40 rounded-2xl bg-muted/10">
              <Truck className="w-5 h-5 text-primary mb-1.5" />
              <span>Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 border border-border/40 rounded-2xl bg-muted/10">
              <RefreshCw className="w-5 h-5 text-primary mb-1.5" />
              <span>7 Day Return</span>
            </div>
          </div>
        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-6 border-t border-border pt-12">
        <h3 className="text-xl font-bold text-foreground">Customer Reviews ({product.reviews})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockReviews.map((rev) => (
            <div key={rev.id} className="border border-border/60 bg-white rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{rev.author}</span>
                <span className="text-[10px] text-muted-foreground font-semibold">{rev.date}</span>
              </div>
              <div className="flex items-center text-amber-500">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products Grid */}
      <div className="space-y-8 border-t border-border pt-12">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Related Products</h3>
          <a href="/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group">
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p?.id}`}
              className="product-card overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-primary/50"
            >
              <div className="h-44 bg-muted/30 relative overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4 border-t border-border/40">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{p.category}</span>
                <h4 className="font-bold text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors text-xs">
                  {p.name}
                </h4>
                <div className="flex items-center justify-between mt-3">
                  <span className="price text-sm">₹{p.price.toLocaleString()}</span>
                  <div className="flex items-center text-[10px] font-bold text-amber-500 gap-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-foreground">{p.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
