"use client";

import * as React from "react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  ShoppingBag,
  Printer,
  CreditCard,
  ShieldCheck,
  Loader2,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ConfirmedOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  unit_price?: number;
  discount?: number;
  gst_rate?: number;
  gst_amount?: number;
  total_paise?: number;
}

interface ConfirmedOrder {
  id: string;
  order_number: string;
  total: number;
  total_paise?: number;
  subtotal?: number;
  tax?: number;
  gst_amount?: number;
  discount?: number;
  shipping_fee?: number;
  status?: string;
  created_at: string;
  shipping_address?: {
    full_name?: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone?: string;
  } | null;
  order_items?: ConfirmedOrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const orderNumber = searchParams.get("order_number") || "SK-ORDER";

  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [orderItems, setOrderItems] = useState<ConfirmedOrderItem[]>([]);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    let isCancelled = false;

    async function loadOrder() {
      if (!orderId) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .maybeSingle();

        if (!isCancelled && !error && data) {
          setOrder(data as unknown as ConfirmedOrder);
          setOrderItems((data.order_items as unknown as ConfirmedOrderItem[]) || []);
        }
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  const displayTotal = order
    ? order.total_paise != null
      ? order.total_paise / 100
      : Number(order.total)
    : 0;

  const displaySubtotal = order?.subtotal != null ? Number(order.subtotal) : displayTotal;
  const displayGst = order?.gst_amount != null ? Number(order.gst_amount) : Number(order?.tax || 0);
  const displayDiscount = order?.discount != null ? Number(order.discount) : 0;
  const displayShipping = order?.shipping_fee != null ? Number(order.shipping_fee) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 sm:py-12 px-4 sm:px-6 font-sans">
      {/* Success Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="border border-border/60 rounded-3xl bg-white p-6 sm:p-10 text-center shadow-xs space-y-6"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full inline-block">
            Payment Verified &amp; Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground pt-1">
            Thank you for your order!
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Your payment via Razorpay was securely verified. We are preparing your package for fast dispatch.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto grid grid-cols-2 gap-4 text-left">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Order Number
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
              {order?.order_number || orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Payment Method
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Razorpay (Paid)</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Total Paid
            </span>
            <span className="text-xs sm:text-sm font-bold text-foreground">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin inline-block text-muted-foreground" />
              ) : (
                `₹${displayTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              )}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Est. Delivery
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-muted-foreground" />
              <span>3-5 Business Days</span>
            </span>
          </div>
        </div>

        {/* Shipping Address Summary if present */}
        {order?.shipping_address && (
          <div className="max-w-lg mx-auto p-4 rounded-2xl bg-muted/20 border border-border/50 text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Delivery Destination</span>
            </div>
            <p className="text-muted-foreground text-[11px] pl-5">
              {order.shipping_address.full_name && `${order.shipping_address.full_name}, `}
              {order.shipping_address.address_line_1}, {order.shipping_address.city},{" "}
              {order.shipping_address.state} - {order.shipping_address.postal_code}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {orderId && (
            <Button
              asChild
              className="w-full sm:w-auto rounded-full px-6 py-2.5 font-bold text-xs bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
            >
              <Link href={`/account/orders/${orderId}`}>
                <Package className="w-3.5 h-3.5 mr-2" />
                <span>Track Your Order</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-full px-6 py-2.5 font-semibold text-xs border-border/80 hover:bg-muted/50 cursor-pointer"
          >
            <Link href="/products">
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
              <span>Continue Shopping</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => window.print()}
            className="w-full sm:w-auto rounded-full px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </motion.div>

      {/* Itemized Order Summary Breakdown */}
      {orderItems.length > 0 && (
        <div className="border border-border/60 rounded-3xl bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-foreground" />
              <span>Purchased Items</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              {orderItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {orderItems.map((item) => {
              const itemTotal =
                item.total_paise != null
                  ? item.total_paise / 100
                  : (item.unit_price || item.price) * item.quantity - (item.discount || 0);

              return (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-foreground block">
                      {item.product_name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Qty: {item.quantity} &times; ₹
                      {Number(item.unit_price || item.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {item.gst_rate ? ` (${item.gst_rate}% GST included)` : ""}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">
                    ₹{itemTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary */}
          <div className="pt-3 border-t border-border/50 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                ₹{displaySubtotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className="font-semibold text-foreground">
                {displayShipping === 0 ? (
                  <span className="text-emerald-600 font-bold">Free</span>
                ) : (
                  `₹${displayShipping.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>GST included</span>
              <span className="font-semibold text-foreground">
                ₹{displayGst.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {displayDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span className="font-semibold">
                  -₹{displayDiscount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-border/50 flex justify-between items-center text-sm sm:text-base font-bold text-foreground">
              <span>Total Paid</span>
              <span className="text-lg sm:text-xl">
                ₹{displayTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Security & Notification Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>A tax invoice and order confirmation have been sent to your registered email.</span>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-foreground animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
