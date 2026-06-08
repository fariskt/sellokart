"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles,
  Star
} from "lucide-react";
import { useWishlistStore, WishlistItem } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default function WishlistPage() {
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Helper to generate slug from product name
  const getProductSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleAddToCart = (item: WishlistItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
    alert(`Added ${item.name} to cart!`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Wishlist"
        description="Keep track of items you love and add them to cart anytime"
        icon={Heart}
        action={
          <Link
            href="/products"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl bg-white p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/5 flex items-center justify-center text-destructive mb-6">
              <Heart className="w-8 h-8 fill-destructive/10" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              Tap the heart icon on any product page or catalog listing to save items here for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {wishlistItems.map((item) => {
                const slug = getProductSlug(item.name);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="product-card overflow-hidden flex flex-col justify-between group relative border border-border rounded-2xl bg-white"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full border border-destructive/10 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      aria-label="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Image Link */}
                    <Link
                      href={`/products/${slug}`}
                      className="h-48 bg-muted/30 relative overflow-hidden block"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Content Section */}
                    <div className="p-5 border-t border-border/40 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm min-h-[40px]">
                          <Link href={`/products/${slug}`}>{item.name}</Link>
                        </h4>
                        
                        {/* Rating decoration */}
                        <div className="flex items-center gap-1 mt-1 mb-3">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                          <span className="text-xs font-bold text-foreground">4.8</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">(Customer Favorite)</span>
                        </div>
                      </div>

                      {/* Add to Cart & Price */}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="price text-base">₹{item.price.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(item, e)}
                          className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors button-shadow cursor-pointer active:scale-95"
                          aria-label="Add to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
    </div>
  );
}
