"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Shield,
  Truck,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { AuthDrawer } from "@/features/auth/components/AuthDrawer";
import { toast } from "sonner";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [pricing, setPricing] = useState<{
    subtotal: number;
    discount: number;
    shipping: number;
    gstAmount: number;
    total: number;
    totalPaise: number;
    isFreeShipping: boolean;
    couponCode: string | null;
    couponApplied: boolean;
    couponMessage?: string;
  }>({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    gstAmount: 0,
    total: 0,
    totalPaise: 0,
    isFreeShipping: true,
    couponCode: null,
    couponApplied: false,
  });
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch authoritative pricing from server (Never trust client calculations)
  useEffect(() => {
    if (items.length === 0) {
      setPricing({
        subtotal: 0,
        discount: 0,
        shipping: 0,
        gstAmount: 0,
        total: 0,
        totalPaise: 0,
        isFreeShipping: true,
        couponCode: null,
        couponApplied: false,
      });
      return;
    }

    let isCancelled = false;
    setIsLoadingPricing(true);

    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          id: i.id,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success && data.pricing) {
          setPricing(data.pricing);
          if (data.pricing.couponApplied && appliedCoupon) {
            setCouponSuccess(`Coupon ${data.pricing.couponCode} applied successfully!`);
            setCouponError("");
          } else if (appliedCoupon && data.pricing.couponMessage) {
            setCouponError(data.pricing.couponMessage);
            setCouponSuccess("");
          }
        }
      })
      .catch((err) => {
        console.error("Cart pricing fetch failed:", err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingPricing(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [items, appliedCoupon]);

  const handleProceedToCheckout = async () => {
    setIsCheckingAuth(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthDrawerOpen(true);
      } else {
        router.push("/checkout");
      }
    } catch {
      setIsAuthDrawerOpen(true);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
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

  const handleSaveForLater = (item: CartItem) => {
    toast.success(`"${item.name}" saved for later`);
    removeFromCart(item.id);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8 ">
      {/* Top Header & 3-Step Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-3xl sm:text-4xl  tracking-tight text-foreground font-normal">
            Your Cart
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Stepper matching reference */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Step 1: Cart (Active) */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[11px]">
              1
            </span>
            <span className="font-semibold text-foreground">Cart</span>
          </div>

          <div className="w-6 sm:w-10 h-px bg-border" />

          {/* Step 2: Shipping */}
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full border border-border text-muted-foreground flex items-center justify-center font-medium text-[11px]">
              2
            </span>
            <span>Shipping</span>
          </button>

          <div className="w-6 sm:w-10 h-px bg-border" />

          {/* Step 3: Payment */}
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <span className="w-5 h-5 rounded-full border border-border/60 text-muted-foreground/60 flex items-center justify-center font-medium text-[11px]">
              3
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-border/60 p-12 text-center shadow-xs max-w-lg mx-auto space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl  font-medium text-foreground">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
              Looks like you haven&apos;t added any items to your bag yet.
            </p>
          </div>
          <Button
            asChild
            className="h-11 px-7 rounded-full font-bold text-xs bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
          >
            <Link href="/products">
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (8 cols): Individual Cart Item Cards */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-3xl border border-border/60 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row items-start justify-between gap-5 relative"
                >
                  <div className="flex items-start gap-4 sm:gap-5 w-full">
                    {/* Product Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted/30 border border-border/40 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Product Meta & Actions */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className=" text-base sm:text-lg font-medium text-foreground line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Curated Drop • Authentic Quality
                      </p>
                      <p className="text-[11px] text-muted-foreground/80  mt-0.5">
                        SKU: SK-{String(item.id).padStart(4, "0").toUpperCase()}
                      </p>

                      {/* In Stock Badge */}
                      <div className="mt-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>In Stock</span>
                        </span>
                      </div>

                      {/* Controls Row: Pill Quantity, Remove, Save for Later */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-1">
                        {/* Rounded Pill Quantity Selector */}
                        <div className="inline-flex items-center border border-border/80 rounded-full px-2 py-0.5 bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => decrementQty(item.id, item.quantity)}
                            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementQty(item.id, item.quantity)}
                            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          Remove
                        </button>

                        {/* Save for Later Action */}
                        <button
                          type="button"
                          onClick={() => handleSaveForLater(item)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          Save for later
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price at top-right */}
                  <div className="self-start sm:self-auto text-left sm:text-right shrink-0">
                    <span className="font-semibold text-lg sm:text-xl text-foreground  block">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[11px] text-muted-foreground  block mt-0.5">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom Actions: Continue Shopping & Clear Cart */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-destructive/80 hover:text-destructive hover:underline cursor-pointer transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Order Summary Card */}
          <div className="lg:col-span-5 xl:col-span-4 bg-muted/30 rounded-3xl border border-border/60 p-6 sm:p-7 shadow-2xs space-y-6 sticky top-24">
            <h2 className="text-xl sm:text-2xl  font-medium text-foreground">
              Order Summary
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                <span className="font-semibold text-foreground ">
                  ₹{pricing.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {pricing.isFreeShipping || pricing.shipping === 0 ? "Free" : `₹${pricing.shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>GST included</span>
                <span className="font-semibold text-foreground ">
                  ₹{pricing.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({pricing.couponCode || "COUPON"})</span>
                  <span className="font-semibold ">
                    -₹{pricing.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Promo Code Input matching reference design */}
            <div className="pt-2 border-t border-border/50">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-700 font-semibold pl-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{appliedCoupon} Applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-destructive font-bold text-xs hover:underline pr-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-border/80 rounded-full px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs uppercase"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 py-2.5 text-xs font-bold font-display transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-destructive mt-1.5 font-medium pl-2">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-600 mt-1.5 font-medium pl-2">{couponSuccess}</p>
              )}
            </div>

            {/* Total Row */}
            <div className="pt-4 border-t border-border/50 flex justify-between items-center">
              <span className="text-base sm:text-lg font-medium text-foreground">Total payable</span>
              <span className="text-2xl sm:text-3xl font-bold text-foreground ">
                ₹{pricing.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Proceed to Checkout Button */}
            <Button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isCheckingAuth}
              className="w-full h-13 rounded-full font-display font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {isCheckingAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span>Checking session...</span>
                </>
              ) : (
                <span>Proceed to Checkout</span>
              )}
            </Button>

            {/* Security and delivery guarantees matching reference */}
            <div className="space-y-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                <span>Secure checkout, encrypted payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                <span>
                  {pricing.isFreeShipping
                    ? "Free delivery unlocked on this order"
                    : "Free delivery on orders over ₹1,999"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login / Register Right Side Drawer Slider */}
      <AuthDrawer
        open={isAuthDrawerOpen}
        onOpenChange={setIsAuthDrawerOpen}
        next="/checkout"
      />
    </div>
  );
}
