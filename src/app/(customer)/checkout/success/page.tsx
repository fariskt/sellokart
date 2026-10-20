"use client";

import * as React from "react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Package,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";

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
  products?: {
    id?: string;
    name?: string;
    product_images?: Array<{
      image_url: string;
      is_primary?: boolean;
    }>;
  } | null;
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
  order_items?: ConfirmedOrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const orderNumber = searchParams.get("order_number") || (orderId ? orderId.slice(0, 8).toUpperCase() : "SK-ORDER");

  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [orderItems, setOrderItems] = useState<ConfirmedOrderItem[]>([]);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    // Clear cart upon reaching the confirmed order page
    useCartStore.getState().clearCart();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadOrder() {
      if (!orderId) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              product_id,
              product_name,
              quantity,
              price,
              unit_price,
              discount,
              gst_rate,
              gst_amount,
              total_paise,
              products (
                id,
                name,
                product_images (
                  image_url,
                  is_primary
                )
              )
            )
          `)
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

  const displayOrderNum = order?.order_number || orderNumber;

  return (
    <div className="max-w-xl mx-auto pt-8 pb-20 sm:py-16 px-4 font-sans text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Solid Circular Success Check */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Thank you for your purchase
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            We&apos;ve received your order and it will ship in 5-7 business days.
            <br />
            Your order number is{" "}
            <span className="font-semibold text-foreground">#{displayOrderNum}</span>
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs text-left space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Order Summary
          </h2>

          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : orderItems.length > 0 ? (
            <div className="divide-y divide-border/60">
              {orderItems.map((item) => {
                const prod = item.products;
                const imageUrl =
                  prod?.product_images?.find((img) => img.is_primary)?.image_url ||
                  prod?.product_images?.[0]?.image_url ||
                  null;

                const itemTotal =
                  item.total_paise != null
                    ? item.total_paise / 100
                    : (item.unit_price || item.price) * item.quantity - (item.discount || 0);

                return (
                  <div key={item.id} className="py-3.5 flex items-center gap-3 sm:gap-4">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-muted/40 border border-border/60 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {item.product_name}
                      </h3>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-muted-foreground mt-0.5 block font-medium">
                          Qty: {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <span className="text-xs sm:text-sm font-bold text-foreground shrink-0 text-right">
                      ₹ {itemTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-xs text-muted-foreground text-center">
              Order confirmed. Items are currently being prepared for dispatch.
            </div>
          )}

          {/* Total Line */}
          <div className="border-t border-border/60 pt-4 flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-foreground">
              Total
            </span>
            <span className="text-base sm:text-lg font-extrabold text-foreground font-display">
              ₹ {displayTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Action Button: Pill/Rounded outlined button matching reference */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl border border-foreground/80 bg-background text-foreground hover:bg-muted font-semibold text-xs sm:text-sm px-8 py-3 h-auto cursor-pointer shadow-2xs transition-colors"
          >
            <Link href="/">Back to Home</Link>
          </Button>

          {orderId && (
            <Button
              asChild
              variant="ghost"
              className="w-full sm:w-auto rounded-xl text-muted-foreground hover:text-foreground font-medium text-xs sm:text-sm px-5 py-2.5 h-auto cursor-pointer"
            >
              <Link href={`/account/orders/${orderId}`}>
                <span>Track Order</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
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
