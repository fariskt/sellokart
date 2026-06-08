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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useWishlistStore, WishlistItem } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export default function WishlistPage() {
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [mounted, setMounted] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Hydration fix & Analytics: Wishlist Viewed
  useEffect(() => {
    setMounted(true);
    console.log("Analytics: Wishlist Viewed", wishlistItems);
  }, []);

  const getProductSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleRemoveItem = (id: number, name: string) => {
    removeFromWishlist(id);
    console.log(`Analytics: Wishlist Item Removed - ID: ${id}, Name: ${name}`);
    
    // Adjust pagination if page becomes empty
    const totalPagesAfterRemove = Math.ceil((wishlistItems.length - 1) / itemsPerPage);
    if (currentPage > totalPagesAfterRemove && currentPage > 1) {
      setCurrentPage(totalPagesAfterRemove);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
    console.log(`Analytics: Wishlist Item Added To Cart - ID: ${item.id}, Name: ${item.name}`);
    alert(`Added ${item.name} to cart!`);
  };

  const handleMoveToCart = (item: WishlistItem) => {
    // 1. Add to cart
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
    // 2. Remove from wishlist
    removeFromWishlist(item.id);
    console.log(`Analytics: Wishlist Product Action (Move to Cart) - ID: ${item.id}, Name: ${item.name}`);
    alert(`Moved ${item.name} to cart!`);

    // Adjust pagination if page becomes empty
    const totalPagesAfterRemove = Math.ceil((wishlistItems.length - 1) / itemsPerPage);
    if (currentPage > totalPagesAfterRemove && currentPage > 1) {
      setCurrentPage(totalPagesAfterRemove);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(wishlistItems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = wishlistItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Wishlist"
        description="Review your favorite products, monitor pricing, and transfer items to your cart."
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
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-white p-8">
          <div className="w-12 h-12 rounded-2xl bg-destructive/5 flex items-center justify-center text-destructive mx-auto mb-4">
            <Heart className="w-8 h-8 fill-destructive/10" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-1">Your wishlist is empty</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            Tap the heart icon on any product details card in the store to save items here.
          </p>
          <Button
            asChild
            className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            <Link href="/products">
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6 select-none">
          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {paginatedItems.map((item) => {
                // Hardcode stock for mockup aesthetic values
                const stockStatus = item.id % 3 === 0 ? "Only 2 left" : "In Stock";
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border border-border hover:border-primary/20 bg-white rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group"
                  >
                    <div className="p-5 flex gap-4">
                      {/* Product Image */}
                      <Link 
                        href={`/products/${getProductSlug(item.name)}`}
                        className="w-20 h-20 bg-muted/30 rounded-xl border border-border/40 shrink-0 cursor-pointer overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="space-y-1">
                        <Link 
                          href={`/products/${getProductSlug(item.name)}`}
                          className="font-bold text-foreground text-sm leading-snug line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          {item.name}
                        </Link>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-foreground">
                            ₹{item.price.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-[10px] line-through font-semibold">
                            ₹{(item.price * 1.3).toFixed(0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-bold border",
                            stockStatus === "In Stock" 
                              ? "bg-green-50 text-green-700 border-green-100" 
                              : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                          )}>
                            {stockStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="bg-muted/15 border-t border-border/40 p-4 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/20 rounded-xl transition-all cursor-pointer"
                        title="Remove"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-bold border-border/60 hover:bg-secondary/15 transition-all text-xs cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                          <span>Add to Cart</span>
                        </Button>

                        <Button
                          onClick={() => handleMoveToCart(item)}
                          size="sm"
                          className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] transition-all text-xs cursor-pointer"
                        >
                          <span>Move to Cart</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 rounded-xl border-border/60 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-xs font-bold text-muted-foreground select-none">
                Page {currentPage} of {totalPages}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 rounded-xl border-border/60 cursor-pointer disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
