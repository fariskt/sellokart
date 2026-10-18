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
  ArrowRight,
  Truck,
  CheckCircle2,
  Tag,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 1999;
  const isFreeShipping = subtotal >= freeShippingThreshold || discount?.code === "FREESHIP";
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : 70;
  const tax = Math.round(subtotal * 0.18);
  const discountAmount = discount ? Math.round((subtotal * discount.percent) / 100) : 0;
  const total = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SAVE10") {
      setDiscount({ code: "SAVE10", percent: 10 });
      setCouponSuccess("10% discount applied!");
    } else if (code === "SAVE20") {
      setDiscount({ code: "SAVE20", percent: 20 });
      setCouponSuccess("20% discount applied!");
    } else if (code === "FREESHIP") {
      setDiscount({ code: "FREESHIP", percent: 0 });
      setCouponSuccess("Free shipping applied!");
    } else {
      setCouponError("Invalid coupon. Try SAVE10, SAVE20, or FREESHIP.");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(null);
    setCouponSuccess("");
    setCouponCode("");
  };

  const incrementQty = (id: number | string, currentQty: number) => {
    updateQuantity(id, currentQty + 1);
  };

  const decrementQty = (id: number | string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1);
    } else {
      removeFromCart(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Breadcrumb matching the Checkout flow */}
      <nav className="flex items-center space-x-2 text-xs font-semibold">
        <span className="text-foreground font-bold">Cart</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <Link
          href="/checkout"
          className="text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          Shipping
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="text-muted-foreground/50">Payment</span>
      </nav>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border/80 p-12 text-center shadow-xs max-w-lg mx-auto space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
              Looks like you haven&apos;t added any items to your bag yet.
            </p>
          </div>
          <Button
            asChild
            className="h-11 px-6 rounded-xl font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
          >
            <Link href="/products">
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Items List & Free Shipping Progress */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})
              </h1>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            {/* Free Shipping Milestone Bar */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Truck className="w-4 h-4 text-primary" />
                  {isFreeShipping ? (
                    <span className="text-success font-bold">You unlocked Free Standard Shipping!</span>
                  ) : (
                    <span>
                      Add <strong className="text-foreground">₹{amountNeededForFreeShipping.toLocaleString()}</strong> more for Free Shipping
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">{progressPercent}%</span>
              </div>
              <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-border/60">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-muted/20 rounded-xl border border-border/60 p-2 flex items-center justify-center shrink-0">
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
                        <span className="text-xs text-muted-foreground mt-0.5 block font-mono">
                          ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border/80 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => decrementQty(item.id, item.quantity)}
                          className="p-1.5 sm:p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs sm:text-sm font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementQty(item.id, item.quantity)}
                          className="p-1.5 sm:p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for item & Delete icon */}
                      <div className="flex items-center space-x-3.5">
                        <span className="font-bold text-foreground text-sm sm:text-base font-mono">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground/60 hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer p-0"
              >
                <Link href="/products" className="inline-flex items-center">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Continue Shopping</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column (5 cols): Order Summary matching Checkout Theme */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Order Summary
            </h2>

            {/* Promo Code Box */}
            <div>
              {discount ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20 text-xs">
                  <div className="flex items-center space-x-2 text-success font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{discount.code} Applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-destructive font-bold text-xs hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleApplyCoupon}
                  className="flex items-center border border-border/80 rounded-xl px-3 py-1 bg-white focus-within:ring-1 focus-within:ring-primary"
                >
                  <Tag className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 py-2 text-xs sm:text-sm outline-none uppercase bg-transparent"
                  />
                  <button
                    type="submit"
                    className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors px-2 py-1 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-destructive mt-1.5 font-medium">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-success mt-1.5 font-medium">{couponSuccess}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground font-mono">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-foreground font-mono">
                  {shippingFee === 0 ? "Free" : `₹${shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Estimated taxes (18% GST)</span>
                <span className="font-semibold text-foreground font-mono">
                  ₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({discount?.percent}%)</span>
                  <span className="font-semibold font-mono">
                    -₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-between items-center text-sm sm:text-base font-bold text-foreground">
                <span>Total</span>
                <span className="text-base sm:text-lg font-black font-mono">
                  ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <Button
              asChild
              className="w-full h-12 rounded-xl font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Link href="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Safe & Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
