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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ConfirmedOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface ConfirmedOrder {
  id: string;
  order_number: string;
  total: number;
  created_at: string;
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      {/* Success Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="border border-border rounded-3xl bg-white p-8 md:p-12 text-center shadow-xs space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-success bg-success/10 px-3 py-1 rounded-full">
            Payment Verified & Confirmed
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground pt-2">
            Thank you for your order!
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your payment via Razorpay was successful. We have received your order and are currently preparing it for shipment.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 md:p-6 max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
              Order Number
            </span>
            <span className="text-sm font-extrabold text-foreground font-mono">
              {order?.order_number || orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
              Payment Method
            </span>
            <span className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Razorpay</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
              Total Paid
            </span>
            <span className="text-sm font-extrabold text-primary">
              ₹{order ? Number(order.total).toLocaleString() : "Confirmed"}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
              Est. Delivery
            </span>
            <span className="text-sm font-extrabold text-foreground flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>3-5 Business Days</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {orderId && (
            <Button
              asChild
              className="w-full sm:w-auto rounded-xl px-6 py-5 font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow cursor-pointer"
            >
              <Link href={`/account/orders/${orderId}`}>
                <Package className="w-4 h-4 mr-2" />
                <span>Track Your Order</span>
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl px-6 py-5 font-bold text-sm border-border cursor-pointer"
          >
            <Link href="/products">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Continue Shopping</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => window.print()}
            className="w-full sm:w-auto rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </motion.div>

      {/* Itemized Order Summary if Available */}
      {orderItems.length > 0 && (
        <div className="border border-border rounded-2xl bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/60 pb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span>Ordered Items</span>
          </h2>

          <div className="divide-y divide-border/40">
            {orderItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-foreground block">
                    {item.product_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Qty: {item.quantity} &times; ₹{Number(item.price).toLocaleString()}
                  </span>
                </div>
                <span className="font-extrabold text-foreground">
                  ₹{(Number(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Footer Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
        <ShieldCheck className="w-4 h-4 text-success" />
        <span>A confirmation email with tax invoice has been queued to your registered email address.</span>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
