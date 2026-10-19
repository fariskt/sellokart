"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Loader2,
  Lock,
  CheckCircle2,
  ShoppingBag,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
  const [user, setUser] = useState<UserProfile | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState(""); // Description / Street Address

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Server Authoritative Pricing State
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

  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [priceMismatchModal, setPriceMismatchModal] = useState<{
    newTotal: number;
    newTotalPaise: number;
  } | null>(null);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);

  // Hydration & user session resolution
  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        router.replace("/login?next=/checkout");
        return;
      }

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
        .order("is_default", { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            const addresses = data as SavedAddress[];
            setSavedAddresses(addresses);
            const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
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
    });
  }, [router]);

  // Fetch authoritative pricing from server
  useEffect(() => {
    if (items.length === 0) return;

    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          id: i.id,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
        couponCode: appliedCouponCode || null,
        destination: {
          city: city.trim(),
          state: state.trim(),
          postalCode: zipCode.trim(),
          country: "India",
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.pricing) {
          setPricing(data.pricing);
          if (data.pricing.couponApplied && appliedCouponCode) {
            setCouponSuccess(`Coupon ${data.pricing.couponCode} applied!`);
            setCouponError("");
          } else if (appliedCouponCode && data.pricing.couponMessage) {
            setCouponError(data.pricing.couponMessage);
            setCouponSuccess("");
          }
        }
      })
      .catch((err) => console.error("Checkout pricing fetch failed:", err));
  }, [items, appliedCouponCode, city, state, zipCode]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Coupon handling
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setAppliedCouponCode(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  // Payment Initiation Handler
  const handleInitiatePayment = async (confirmedPriceChange = false) => {
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
          couponCode: appliedCouponCode || null,
          expectedTotalPaise: pricing ? pricing.totalPaise : undefined,
          confirmedPriceChange,
        }),
      });

      if (response.status === 401) {
        toast.error("Your session has expired. Please sign in to proceed.");
        router.push("/login?next=/checkout");
        return;
      }

      if (response.status === 409) {
        const mismatchData = await response.json();
        setIsProcessing(false);
        setPriceMismatchModal({
          newTotal: (mismatchData.newTotalPaise || 0) / 100,
          newTotalPaise: mismatchData.newTotalPaise || 0,
        });
        return;
      }

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment session with server.");
      }

      // Save address to user's account if requested
      if (saveAddress && user?.id) {
        try {
          const supabase = createClient();
          await supabase.from("addresses").insert({
            user_id: user.id,
            full_name: fullName,
            phone: phone.trim(),
            address_line_1: description.trim(),
            address_line_2: null,
            city: city.trim(),
            state: state.trim(),
            postal_code: zipCode.trim(),
            country: "India",
            is_default: savedAddresses.length === 0,
          });
        } catch (addrErr) {
          console.warn("Could not save address to account:", addrErr);
        }
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
          setIsVerifyingPayment(true);
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
          } finally {
            setIsVerifyingPayment(false);
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
          color: "#0f172a", // Sleek dark matching theme token
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

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto pt-24 pb-16 px-4 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-landing-primary-light flex items-center justify-center mx-auto text-landing-primary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-medium text-foreground">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground">
          You don&apos;t have any items in your cart to checkout.
        </p>
        <Button asChild className="rounded-full px-7 py-2.5 font-bold text-xs bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-xs">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8 font-sans">
      {/* Official Razorpay Standard Checkout Script */}
      <Script
        id="razorpay-checkout-sdk"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      {/* Top Header & 3-Step Stepper matching Cart Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-3xl sm:text-4xl tracking-tight text-foreground font-normal">
            Checkout
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Shipping &amp; Payment Details
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Step 1: Cart (Clickable back to cart) */}
          <Link
            href="/cart"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full border border-border text-muted-foreground flex items-center justify-center font-medium text-[11px]">
              1
            </span>
            <span>Cart</span>
          </Link>

          <div className="w-6 sm:w-10 h-px bg-border" />

          {/* Step 2: Shipping (Active) */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-[11px]">
              2
            </span>
            <span className="font-semibold text-foreground">Shipping</span>
          </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column (7 cols): Shipping Address Form */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-border/60 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-xl sm:text-2xl font-medium text-foreground">
              Shipping Address
            </h2>
            <span className="text-xs text-muted-foreground">All fields with * are required</span>
          </div>

          {/* Saved Address quick picker if available */}
          {savedAddresses.length > 0 && (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Saved Delivery Addresses</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId(null);
                    setFirstName(user?.user_metadata?.full_name?.split(" ")[0] || "");
                    setLastName(user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "");
                    setPhone(user?.user_metadata?.phone || "");
                    setDescription("");
                    setCity("");
                    setState("");
                    setZipCode("");
                  }}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Enter new address
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        const parts = (addr.full_name || "").trim().split(" ");
                        setFirstName(parts[0] || "");
                        setLastName(parts.slice(1).join(" ") || "");
                        if (addr.phone) setPhone(addr.phone);
                        setDescription(addr.address_line_1);
                        setCity(addr.city);
                        setState(addr.state);
                        setZipCode(addr.postal_code);
                      }}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between text-xs space-y-1.5 shadow-2xs",
                        isSelected
                          ? "border-foreground bg-foreground/5 ring-1 ring-foreground"
                          : "border-border/80 bg-white hover:border-foreground/50"
                      )}
                    >
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span className="truncate">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[9px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {addr.address_line_1}, {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80">
                        📞 {addr.phone}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-1">
            {/* Row 1: First Name* | Last Name* */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
                  First Name*
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm"
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
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm"
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
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm"
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                  Phone number*
                </Label>
                <div className="flex rounded-xl border border-border/80 overflow-hidden focus-within:ring-1 focus-within:ring-foreground bg-white">
                  <div className="px-3 bg-muted/40 border-r border-border/60 flex items-center justify-center text-xs font-semibold text-muted-foreground select-none">
                    IND +91
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: City* | State* | Zip Code* */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-medium text-foreground">
                  City*
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm"
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
                  placeholder="Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm"
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="zipCode" className="text-xs font-medium text-foreground">
                  Zip / Postal Code*
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="400001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="h-11 rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Row 4: Street Address / Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-foreground">
                Street Address / Apartment, Suite, etc.*
              </Label>
              <Textarea
                id="description"
                placeholder="House/Flat No, Building, Street, Landmark..."
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSelectedAddressId(null);
                }}
                className="rounded-xl border-border/80 focus-visible:ring-1 focus-visible:ring-foreground text-sm resize-none"
                disabled={isProcessing}
              />
            </div>

            {/* Save Address Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="saveAddress"
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer"
              />
              <Label
                htmlFor="saveAddress"
                className="text-xs text-muted-foreground cursor-pointer select-none font-medium"
              >
                Save this shipping address to my account for future orders
              </Label>
            </div>
          </div>

          {/* Return to Cart */}
          <div className="pt-4 border-t border-border/50">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Cart</span>
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Order Summary Card matching Cart Page */}
        <div className="lg:col-span-5 xl:col-span-4 bg-muted/30 rounded-3xl border border-border/60 p-6 sm:p-7 shadow-2xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-xl sm:text-2xl font-medium text-foreground">
              Order Summary
            </h2>
            <span className="text-xs text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
          </div>

          {/* Compact Cart Items List */}
          <div className="divide-y divide-border/50 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Thumbnail with Quantity Badge */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-border/60 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-foreground truncate block">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground block">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-foreground shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Calculations Breakdown */}
          <div className="space-y-3 text-xs sm:text-sm pt-1 border-t border-border/50">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                ₹{pricing.subtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-semibold text-foreground">
                {pricing.shipping === 0 ? (
                  <span className="text-emerald-600 font-bold">Free</span>
                ) : (
                  `₹${pricing.shipping.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>GST included</span>
              <span className="font-semibold text-foreground">
                ₹{pricing.gstAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({pricing.couponCode || appliedCouponCode})</span>
                <span className="font-semibold">
                  -₹{pricing.discount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Promo code input matching Cart page */}
          <div className="pt-2 border-t border-border/50">
            {pricing.couponApplied && pricing.couponCode ? (
              <div className="flex items-center justify-between p-2.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs">
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold pl-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{pricing.couponCode} Applied</span>
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
                  className="flex-1 bg-white border border-border/80 rounded-full px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground shadow-2xs uppercase"
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

          {/* Total Payable */}
          <div className="pt-4 border-t border-border/50 flex justify-between items-center">
            <span className="text-base sm:text-lg font-medium text-foreground">Total payable</span>
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              ₹{pricing.total.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Continue to Payment CTA */}
          <Button
            type="button"
            onClick={() => handleInitiatePayment(false)}
            disabled={isProcessing}
            className="w-full h-13 rounded-full font-display font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <span>Continue to Payment</span>
            )}
          </Button>

          {/* Security and delivery guarantees matching reference */}
          <div className="space-y-2 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground/70 shrink-0" />
              <span>Secure checkout, encrypted payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground/70 shrink-0" />
              <span>Encrypted 256-bit SSL transaction via Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Page High-Trust Payment Verification Overlay */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-border/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border/80 flex items-center justify-center mx-auto text-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Verifying Payment</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We are securely confirming your transaction with the bank and issuing your order. Please do not refresh or close this tab.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 py-2.5 px-4 rounded-xl border border-border/60">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>256-bit Encrypted Bank Handshake</span>
            </div>
          </div>
        </div>
      )}

      {/* Price Mismatch Confirmation Modal */}
      {priceMismatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-border/60 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Price Updated</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The prices or discounts in your cart were updated to match the authoritative server amount.
              </p>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">New Total Payable:</span>
                <span className="font-bold text-foreground text-base">₹{priceMismatchModal.newTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-11 text-xs font-semibold"
                onClick={() => setPriceMismatchModal(null)}
              >
                Review Cart
              </Button>
              <Button
                className="flex-1 rounded-full h-11 text-xs font-bold bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  setPriceMismatchModal(null);
                  handleInitiatePayment(true);
                }}
              >
                Accept &amp; Pay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
