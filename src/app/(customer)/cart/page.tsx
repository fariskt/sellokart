"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  Truck, 
  Percent,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Hydration fix
  useEffect(() => {
    setMounted(true);
    console.log("Analytics: Cart Viewed", items);
  }, []);

  // Analytics: Cart Updated
  useEffect(() => {
    if (mounted) {
      console.log("Analytics: Cart Updated", items);
    }
  }, [items, mounted]);

  if (!mounted) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Subtotal calculation
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Shipping calculation (free over ₹1,999)
  const isFreeShipping = subtotal >= 1999 || (discount && discount.code === "FREESHIP");
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : 150;
  
  // Tax (18% GST)
  const tax = Math.round(subtotal * 0.18);
  
  // Discount
  const discountAmount = discount ? Math.round((subtotal * discount.percent) / 100) : 0;
  
  // Total
  const total = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SAVE10") {
      setDiscount({ code: "SAVE10", percent: 10 });
      setCouponSuccess("10% discount coupon applied successfully!");
    } else if (code === "SAVE20") {
      setDiscount({ code: "SAVE20", percent: 20 });
      setCouponSuccess("20% discount coupon applied successfully!");
    } else if (code === "FREESHIP") {
      setDiscount({ code: "FREESHIP", percent: 0 });
      setCouponSuccess("Free shipping coupon applied successfully!");
    } else {
      setCouponError("Invalid coupon code. Try 'SAVE10', 'SAVE20' or 'FREESHIP'.");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(null);
    setCouponSuccess("");
    setCouponCode("");
  };

  const incrementQty = (id: number, currentQty: number) => {
    updateQuantity(id, currentQty + 1);
  };

  const decrementQty = (id: number, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1);
    } else {
      removeFromCart(id);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Shopping Cart"
        description="Manage your selected items and proceed to checkout"
        icon={ShoppingBag}
        action={
          items.length > 0 ? (
            <Button
              onClick={clearCart}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-destructive hover:bg-destructive/5 hover:text-destructive border-border/60 hover:border-destructive/30 rounded-xl cursor-pointer"
            >
              Clear All
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl bg-white p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-6">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              Looks like you haven't added anything to your cart yet. Explore our curated collections to get started.
            </p>
            <Button
              asChild
              className="px-6 py-3 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <Link href="/products">
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items Table List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-border rounded-2xl bg-white overflow-hidden shadow-xs">
                <div className="p-6 border-b border-border/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <Button
                    onClick={clearCart}
                    variant="link"
                    className="text-xs font-bold text-destructive p-0 h-auto cursor-pointer hover:underline"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="divide-y divide-border/60">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                      >
                        {/* Image & Title */}
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-muted/30 rounded-xl border border-border/40 p-2 flex items-center justify-center shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-1">
                              {item.name}
                            </h3>
                            <span className="text-xs text-muted-foreground mt-1 block">
                              Unit Price: ₹{item.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 mt-2 sm:mt-0">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                            <button
                              onClick={() => decrementQty(item.id, item.quantity)}
                              type="button"
                              className="p-2 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => incrementQty(item.id, item.quantity)}
                              type="button"
                              className="p-2 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Item Subtotal & Delete */}
                          <div className="flex items-center space-x-4">
                            <span className="font-extrabold text-foreground text-sm sm:text-base">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/5 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Free Shipping Alert Banner */}
              {subtotal < 1999 && (
                <div className="border border-amber-500/10 bg-amber-500/5 rounded-2xl p-4 flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Add ₹{(1999 - subtotal).toLocaleString()} more for Free Shipping</h4>
                    <p className="text-xs text-amber-700/80 mt-0.5">Explore more products to avoid the ₹150 shipping charge.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary & Coupon Column */}
            <div className="space-y-6">
              {/* Coupon Form */}
              <div className="border border-border rounded-2xl bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span>Promo Code</span>
                </h3>

                {discount ? (
                  <div className="bg-success/5 border border-success/15 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-success">
                      <Percent className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold uppercase">{discount.code} Applied</span>
                    </div>
                    <Button
                      onClick={handleRemoveCoupon}
                      variant="link"
                      className="text-xs font-bold text-destructive p-0 h-auto cursor-pointer hover:underline"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. SAVE10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 uppercase border border-border h-10"
                    />
                    <Button
                      type="submit"
                      className="px-4 py-2 text-sm font-bold cursor-pointer shrink-0 rounded-xl"
                    >
                      Apply
                    </Button>
                  </form>
                )}

                {/* Messages */}
                {couponError && (
                  <div className="flex items-center space-x-1.5 text-destructive text-xs mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccess && (
                  <div className="flex items-center space-x-1.5 text-success text-xs mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccess}</span>
                  </div>
                )}

                <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                  Available coupons: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">SAVE10</code> (10% Off), <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">SAVE20</code> (20% Off), <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">FREESHIP</code> (Free Shipping).
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="border border-border rounded-2xl bg-white p-6 shadow-xs space-y-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Order Summary
                </h3>

                <div className="space-y-3 divide-y divide-border/40 text-sm">
                  {/* Subtotal */}
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {/* GST */}
                  <div className="flex justify-between pt-3">
                    <span className="text-muted-foreground">Estimated GST (18%)</span>
                    <span className="font-semibold text-foreground">₹{tax.toLocaleString()}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between pt-3">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="font-semibold text-foreground">
                      {shippingFee === 0 ? (
                        <span className="text-success font-bold">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  {/* Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between pt-3 text-success">
                      <span>Discount ({discount?.percent}%)</span>
                      <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between pt-4 text-base font-bold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-lg text-primary font-black">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full inline-flex items-center justify-center py-6 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
                >
                  <Link href="/checkout">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <div className="text-center">
                  <Link href="/products" className="text-xs font-semibold text-primary hover:underline cursor-pointer">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
