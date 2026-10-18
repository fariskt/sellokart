"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Tag,
  HelpCircle,
  Loader2,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SavedAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface UserProfile {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setUser] = useState<UserProfile | null>(null);

  // Form states matching image & backend
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState(""); // Description / Street Address

  // Shipping Method selection (Free vs Express)
  const [shippingMethod, setShippingMethod] = useState<"free" | "express">("free");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percent?: number;
    discountAmount?: number;
  } | null>(null);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Hydration & user session resolution
  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        setUser(authUser);
        if (authUser.email) setEmail(authUser.email);

        const fullName = authUser.user_metadata?.full_name || "";
        if (fullName) {
          const parts = fullName.trim().split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (authUser.user_metadata?.phone) {
          setPhone(authUser.user_metadata.phone);
        }

        // Fetch customer addresses if logged in
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", authUser.id)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const addresses = data as SavedAddress[];
              setSavedAddresses(addresses);
              const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
              if (defaultAddr) {
                if (defaultAddr.full_name) {
                  const parts = defaultAddr.full_name.trim().split(" ");
                  setFirstName(parts[0] || "");
                  setLastName(parts.slice(1).join(" ") || "");
                }
                if (defaultAddr.phone) setPhone(defaultAddr.phone);
                setDescription(defaultAddr.address_line_1);
                setCity(defaultAddr.city);
                setState(defaultAddr.state);
                setZipCode(defaultAddr.postal_code);
              }
            }
          });
      }
    });
  }, []);

  // Price calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Shipping calculation
  const expressFee = 150;
  const standardFee = subtotal >= 1999 || appliedCoupon?.code === "FREESHIP" ? 0 : 70;
  const baseShipping = shippingMethod === "express" ? expressFee : standardFee;
  const shippingFee = items.length === 0 ? 0 : baseShipping;

  // Tax calculation (18% GST)
  const tax = Math.round(subtotal * 0.18);

  // Discount calculation
  const discountAmount = appliedCoupon
    ? appliedCoupon.percent
      ? Math.round((subtotal * appliedCoupon.percent) / 100)
      : appliedCoupon.discountAmount || 0
    : 0;

  const total = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  // Coupon handling
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "SAVE10") {
      setAppliedCoupon({ code: "SAVE10", percent: 10 });
      toast.success("Coupon SAVE10 applied (10% off)");
    } else if (code === "SAVE20") {
      setAppliedCoupon({ code: "SAVE20", percent: 20 });
      toast.success("Coupon SAVE20 applied (20% off)");
    } else if (code === "FREESHIP") {
      setAppliedCoupon({ code: "FREESHIP", percent: 0, discountAmount: 0 });
      toast.success("Coupon FREESHIP applied (Free Shipping)");
    } else {
      toast.error("Invalid coupon code. Try SAVE10, SAVE20, or FREESHIP.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Payment Initiation Handler
  const handleInitiatePayment = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!firstName.trim()) {
      toast.error("Please enter your First Name.");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Please enter your Last Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid Email address.");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid Phone number.");
      return;
    }
    if (!city.trim() || !state.trim()) {
      toast.error("Please enter your City and State.");
      return;
    }
    if (!zipCode.trim()) {
      toast.error("Please enter your Zip / Postal Code.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter your Address / Description.");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment SDK is initializing. Please wait a moment and try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call server endpoint to create order authoritatively
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: fullName,
            email: email.trim(),
            phone: phone.trim(),
          },
          shippingAddress: {
            addressLine1: description.trim(),
            addressLine2: null,
            city: city.trim(),
            state: state.trim(),
            postalCode: zipCode.trim(),
            country: "India",
          },
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment session with server.");
      }

      const { orderId, orderNumber, razorpayOrderId, amount, currency, keyId } = orderData;

      // 2. Open Razorpay Standard Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Sellokart",
        description: `Order #${orderNumber}`,
        image: "/icon.png",
        order_id: razorpayOrderId,
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 3. Send payment signatures to server verification endpoint
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed on the server.");
            }

            // 4. Verification successful: clear cart and redirect to success page
            clearCart();
            toast.success("Payment verified successfully!");
            router.push(
              `/checkout/success?order_id=${encodeURIComponent(orderId)}&order_number=${encodeURIComponent(
                orderNumber
              )}`
            );
          } catch (verifyErr: unknown) {
            console.error("Verification error:", verifyErr);
            const verifyMsg =
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment was received, but server verification is pending.";
            toast.error(verifyMsg);
            setIsProcessing(false);
            router.push(
              `/checkout/failed?order_id=${encodeURIComponent(orderId)}&reason=${encodeURIComponent(
                verifyMsg
              )}`
            );
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        notes: {
          localOrderId: orderId,
          orderNumber: orderNumber,
        },
        theme: {
          color: "#111111", // Sleek dark/primary matching the reference UI
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info("Payment window was closed. Your details remain saved.");
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);

      interface RazorpayErrorResponse {
        error?: {
          description?: string;
          code?: string;
        };
      }

      rzpInstance.on("payment.failed", function (failResponse: RazorpayErrorResponse) {
        console.error("Razorpay payment failure:", failResponse.error);
        setIsProcessing(false);
        toast.error(
          failResponse.error?.description || "Payment failed. Please try again with another method."
        );
      });

      rzpInstance.open();
    } catch (err: unknown) {
      console.error("Checkout initiation error:", err);
      const errMsg = err instanceof Error ? err.message : "Could not start payment.";
      toast.error(errMsg);
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Official Razorpay Standard Checkout Script */}
      <Script
        id="razorpay-checkout-sdk"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Breadcrumb, Shipping Address, Shipping Method */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-8">
          {/* Breadcrumbs matching image: Cart > Shipping > Payment */}
          <nav className="flex items-center space-x-2 text-xs font-semibold">
            <Link
              href="/cart"
              className="text-primary hover:underline transition-colors"
            >
              Cart
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-foreground font-bold">Shipping</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-muted-foreground/60">Payment</span>
          </nav>

          {/* Section 1: Shipping Address */}
          <div className="space-y-5">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Shipping Address
            </h2>

            {/* Saved Address quick picker if available */}
            {savedAddresses.length > 0 && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <span className="font-semibold text-muted-foreground block mb-2">
                  Select a saved address:
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((addr) => (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => {
                        const parts = (addr.full_name || "").trim().split(" ");
                        setFirstName(parts[0] || "");
                        setLastName(parts.slice(1).join(" ") || "");
                        if (addr.phone) setPhone(addr.phone);
                        setDescription(addr.address_line_1);
                        setCity(addr.city);
                        setState(addr.state);
                        setZipCode(addr.postal_code);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border bg-white hover:border-primary text-xs font-medium cursor-pointer transition-colors"
                    >
                      {addr.full_name} ({addr.city})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Row 1: First Name* | Last Name* */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
                    First Name*
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Divyansh"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium text-foreground">
                    Last Name*
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Agarwal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Row 2: Email* | Phone number* */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="divyansh@webparsh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                    Phone number*
                  </Label>
                  <div className="flex rounded-lg border border-border/80 overflow-hidden focus-within:ring-1 focus-within:ring-primary bg-white">
                    <div className="px-3 bg-muted/30 border-r border-border/60 flex items-center justify-center text-xs font-semibold text-muted-foreground select-none">
                      IND ▾
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 9377588843"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: City* | State* | Zip Code* (3 cols matching reference image) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium text-foreground">
                    City*
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-11 rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-medium text-foreground">
                    State*
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-11 rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zipCode" className="text-xs font-medium text-foreground">
                    Zip Code*
                  </Label>
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="560021"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="h-11 rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Row 4: Description* (Textarea matching image) */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium text-foreground">
                  Description*
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-lg border-border/80 focus-visible:ring-1 focus-visible:ring-primary text-sm resize-none"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Method */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Shipping Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Free Shipping */}
              <label
                onClick={() => setShippingMethod("free")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === "free"
                    ? "border-foreground bg-muted/20 ring-1 ring-foreground"
                    : "border-border/80 bg-white hover:border-border"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      shippingMethod === "free"
                        ? "border-foreground"
                        : "border-muted-foreground/60"
                    }`}
                  >
                    {shippingMethod === "free" && (
                      <div className="w-2 h-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      Free Shipping
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      7-20 Days
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground">
                  ₹0
                </span>
              </label>

              {/* Option 2: Express Shipping */}
              <label
                onClick={() => setShippingMethod("express")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  shippingMethod === "express"
                    ? "border-foreground bg-muted/20 ring-1 ring-foreground"
                    : "border-border/80 bg-white hover:border-border"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      shippingMethod === "express"
                        ? "border-foreground"
                        : "border-muted-foreground/60"
                    }`}
                  >
                    {shippingMethod === "express" && (
                      <div className="w-2 h-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      Express Shipping
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      1-3 Days
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground">
                  ₹{expressFee}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Your Cart, Discount Code, Totals, Continue CTA */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Your Cart
          </h2>

          {/* Cart Items List with Badge for Quantity */}
          <div className="divide-y divide-border/60">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5 min-w-0">
                  {/* Thumbnail with Quantity Badge on Top-Right */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-muted/30 border border-border/60 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {/* Badge */}
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Title & subtitle */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate block">
                      {item.name}
                    </h3>
                    <span className="text-[11px] text-muted-foreground block">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <span className="text-xs sm:text-sm font-bold text-foreground shrink-0 font-mono">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Discount code box matching image */}
          <div className="pt-2">
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20 text-xs">
                <div className="flex items-center space-x-2 text-success font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{appliedCoupon.code} Applied</span>
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
          </div>

          {/* Subtotal, Shipping, Estimated Taxes, Total */}
          <div className="space-y-3 pt-2 text-xs sm:text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground font-mono">
                ₹{subtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-semibold text-foreground font-mono">
                {shippingFee === 0 ? "Free" : `₹${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>Estimated taxes</span>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" />
              </span>
              <span className="font-semibold text-foreground font-mono">
                ₹{tax.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span className="font-semibold font-mono">
                  -₹{discountAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-border flex justify-between items-center text-sm sm:text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-base sm:text-lg font-black font-mono">
                ₹{total.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Continue to Payment CTA matching image */}
          <Button
            type="button"
            onClick={handleInitiatePayment}
            disabled={isProcessing}
            className="w-full h-12 rounded-xl font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <span>Continue to Payment</span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span>Encrypted 256-bit SSL transaction via Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
