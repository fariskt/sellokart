"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Truck, 
  Check, 
  Package, 
  Download, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Play,
  RotateCcw,
  Star,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

interface OrderDetailsProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [payment, setPayment] = useState<any>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const [error, setError] = useState("");

  // Simulated status progression
  const [simStatus, setSimStatus] = useState<string>("processing");
  const [simAutoplay, setSimAutoplay] = useState(false);

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("Session expired. Please log in.");
          setLoading(false);
          return;
        }

        try {
          // 1. Fetch Order
          const { data: orderData, error: orderErr } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (orderErr) throw orderErr;
          setOrder(orderData);
          setSimStatus(orderData.status);

          // 2. Fetch Order Items
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*, products(*)")
            .eq("order_id", orderId);
          setOrderItems(itemsData || []);

          // 3. Fetch Payment details
          const { data: payData } = await supabase
            .from("payments")
            .select("*")
            .eq("order_id", orderId)
            .single();
          setPayment(payData);

          // 4. Fetch Shipment details
          const { data: shipData } = await supabase
            .from("shipments")
            .select("*")
            .eq("order_id", orderId)
            .single();
          setShipment(shipData);
        } catch (dbErr) {
          setIsSandbox(true);
          // Set Sandbox Mock details
          const totalAmount = orderId === "ORD-9283" ? 11999 : orderId === "ORD-8742" ? 3999 : 14999;
          const status = orderId === "ORD-9283" ? "processing" : orderId === "ORD-8742" ? "shipped" : "delivered";
          const payMethod = orderId === "ORD-9283" ? "UPI" : orderId === "ORD-8742" ? "Card" : "NetBanking";
          
          setSimStatus(status);
          setOrder({
            id: orderId,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            total_amount: totalAmount,
            status: status,
            payment_method: payMethod
          });

          // Mock items based on total
          if (totalAmount === 11999) {
            setOrderItems([
              { id: 101, quantity: 1, price: 11999, product_name: "Studio Headset Pro", image: "/images/headphones.png", category: "Electronics" }
            ]);
          } else if (totalAmount === 3999) {
            setOrderItems([
              { id: 102, quantity: 1, price: 3999, product_name: "Creative Minimalist Desk Mat", image: "/images/workspace.png", category: "Living & Decor" }
            ]);
          } else {
            setOrderItems([
              { id: 103, quantity: 2, price: 7499, product_name: "Aesthetic Premium Jacket", image: "/images/fashion.png", category: "Fashion" }
            ]);
          }

          setPayment({
            payment_method: payMethod,
            payment_status: "completed",
            amount: totalAmount,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          });

          setShipment({
            carrier: "BlueDart Express",
            tracking_number: `BD-${orderId.split("-")[1] || "83719"}-IN`,
            status: status === "delivered" ? "delivered" : "in_transit",
            estimated_delivery: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          });
        }
      } catch (err: any) {
        setError("Failed to resolve order details.");
      } finally {
        setLoading(false);
      }
    }

    loadOrderDetails();
  }, [orderId]);

  // Autoplay simulator logic
  useEffect(() => {
    if (!simAutoplay) return;

    const stages = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = stages.indexOf(simStatus);
    
    if (currentIndex === stages.length - 1) {
      setSimAutoplay(false);
      return;
    }

    const timer = setTimeout(() => {
      setSimStatus(stages[currentIndex + 1]);
    }, 6000);

    return () => clearTimeout(timer);
  }, [simStatus, simAutoplay]);

  const handleNextStage = () => {
    const stages = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = stages.indexOf(simStatus);
    if (currentIndex < stages.length - 1) {
      setSimStatus(stages[currentIndex + 1]);
    }
  };

  const handleResetStage = () => {
    setSimStatus("pending");
    setSimAutoplay(false);
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Order details failed</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/account/orders" className="text-sm text-primary hover:underline font-bold">
          Return to Orders
        </Link>
      </div>
    );
  }

  // Invoice calculations
  const itemsSubtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = Math.round(itemsSubtotal * 0.18);
  const shippingCharge = itemsSubtotal >= 1999 ? 0 : 150;
  const grandTotal = itemsSubtotal + shippingCharge + gst;

  // Timeline helper
  const timelineStages = [
    { label: "Ordered", status: "pending", desc: "Order details received", icon: Package },
    { label: "Confirmed", status: "processing", desc: "Payment cleared, packing items", icon: Clock },
    { label: "Shipped", status: "shipped", desc: "Dispatched from warehouse hub", icon: Truck },
    { label: "Delivered", status: "delivered", desc: "Order delivered safely", icon: Check }
  ];

  const getStageState = (stageStatus: string) => {
    const stages = ["pending", "processing", "shipped", "delivered"];
    const targetIdx = stages.indexOf(stageStatus);
    const currentIdx = stages.indexOf(simStatus);

    if (currentIdx >= targetIdx) {
      return "completed";
    }
    if (currentIdx + 1 === targetIdx) {
      return "active";
    }
    return "upcoming";
  };

  return (
    <div className="space-y-8 print:p-0 print:border-none">
      <PageHeader
        title="Order Details"
        description={`Order ID: ${orderId} • Review purchase receipt and live tracking timeline.`}
        icon={Package}
        action={
          <div className="flex items-center gap-3 print:hidden">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center px-4 py-2 border border-border hover:border-primary/50 hover:bg-secondary/10 text-muted-foreground hover:text-primary rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Orders</span>
            </Link>
            
            <Button
              onClick={printInvoice}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold border-border/60 hover:bg-secondary/10 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Print Invoice</span>
            </Button>
          </div>
        }
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80 print:hidden">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Loading mockup database entities. Updates and progressions are simulated locally.
          </div>
        </div>
      )}

      {/* Progression Simulator Panel */}
      <div className="bg-slate-900 border border-border-dark text-white rounded-2xl p-6 shadow-md space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
              Real-time Status Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate order shipping stages to preview real-time timeline modifications.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSimAutoplay(!simAutoplay)}
              className={cn(
                "inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                simAutoplay ? "bg-amber-500 hover:bg-amber-600 text-slate-950" : "bg-slate-800 hover:bg-slate-700 text-white"
              )}
            >
              <Play className={cn("w-3.5 h-3.5 mr-1", simAutoplay && "animate-pulse")} />
              <span>{simAutoplay ? "Pause Autoplay" : "Autoplay (6s)"}</span>
            </button>

            <button
              onClick={handleNextStage}
              disabled={simStatus === "delivered" || simAutoplay}
              className="px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Next Stage
            </button>

            <button
              onClick={handleResetStage}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-white"
              aria-label="Reset status"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Progression Column */}
      <div className="border border-border rounded-2xl bg-white p-6 md:p-8 shadow-xs space-y-6">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/40 pb-4">
          Shipping Progress Tracker
        </h3>

        {/* Timeline Horizontal Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {timelineStages.map((stage, idx) => {
            const state = getStageState(stage.status);
            const Icon = stage.icon;
            return (
              <div key={stage.label} className="flex flex-col items-center text-center space-y-3 relative group">
                {/* Horizontal connect line */}
                {idx < 3 && (
                  <div className={cn(
                    "hidden sm:block absolute top-5 left-1/2 right-[-50%] h-[2px] z-0 transition-colors duration-500",
                    getStageState(timelineStages[idx + 1].status) === "completed" 
                      ? "bg-green-500" 
                      : getStageState(stage.status) === "completed" 
                      ? "bg-primary animate-pulse" 
                      : "bg-border"
                  )} />
                )}

                {/* Node Ring circle */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 relative",
                  state === "completed" && "bg-green-500 border-green-500 text-white",
                  state === "active" && "bg-white border-primary text-primary shadow-xs ring-4 ring-primary/10 scale-105",
                  state === "upcoming" && "bg-white border-border text-muted-foreground"
                )}>
                  {state === "completed" ? (
                    <Check className="w-5 h-5 stroke-[3px]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Text Description details */}
                <div className="space-y-0.5">
                  <h4 className={cn(
                    "text-xs font-bold leading-tight transition-colors",
                    state === "completed" && "text-green-600",
                    state === "active" && "text-primary",
                    state === "upcoming" && "text-muted-foreground"
                  )}>
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-muted-foreground max-w-[140px] mx-auto">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main split details: Left Invoice Items, Right Shipment and Payment details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Order Items & Pricing Invoice Summary */}
        <div className="lg:col-span-2 border border-border rounded-2xl bg-white overflow-hidden shadow-xs space-y-6">
          <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Itemized Invoice</h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {order ? new Date(order.created_at).toLocaleDateString() : ""}
            </span>
          </div>

          {/* List items */}
          <div className="divide-y divide-border/40 px-6">
            {orderItems.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted/30 rounded-xl border border-border/40 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={item.image || (item.products?.image)}
                      alt={item.product_name || (item.products?.name)}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm line-clamp-1">
                      {item.product_name || (item.products?.name)}
                    </h4>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Qty: {item.quantity} &times; ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <span className="font-extrabold text-foreground text-sm">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="bg-muted/15 border-t border-border/60 p-6 space-y-3 text-sm divide-y divide-border/30">
            <div className="flex justify-between pt-1 font-semibold">
              <span className="text-muted-foreground">Items Subtotal</span>
              <span className="text-foreground">₹{itemsSubtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between pt-3 font-semibold">
              <span className="text-muted-foreground">Estimated GST (18%)</span>
              <span className="text-foreground">₹{gst.toLocaleString()}</span>
            </div>

            <div className="flex justify-between pt-3 font-semibold">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span className="text-foreground">
                {shippingCharge === 0 ? (
                  <span className="text-success font-bold">FREE</span>
                ) : (
                  `₹${shippingCharge}`
                )}
              </span>
            </div>

            <div className="flex justify-between pt-4 text-base font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-lg text-primary font-black">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping details and Payments */}
        <div className="space-y-6">
          {/* Shipment Tracking details */}
          {shipment && (
            <div className="border border-border rounded-2xl bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/40 pb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                <span>Delivery Status</span>
              </h3>

              <div className="space-y-3.5 text-xs font-semibold">
                {/* Carrier info */}
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Carrier Partner</span>
                  <span className="text-foreground text-sm font-extrabold">{shipment.carrier}</span>
                </div>

                {/* Tracking ID */}
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Tracking ID</span>
                  <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border/60 text-[10px]">
                    {shipment.tracking_number}
                  </span>
                </div>

                {/* Estimated Delivery */}
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Estimated Arrival</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    {new Date(shipment.estimated_delivery).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Card details */}
          {payment && (
            <div className="border border-border rounded-2xl bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/40 pb-3 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Payment Summary</span>
              </h3>

              <div className="space-y-3.5 text-xs font-semibold">
                {/* Method */}
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Payment Method</span>
                  <span className="text-foreground capitalize">{payment.payment_method}</span>
                </div>

                {/* Status */}
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Transaction Status</span>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize mt-0.5",
                    payment.payment_status === "completed" && "bg-green-50 text-green-700 border-green-100",
                    payment.payment_status === "pending" && "bg-amber-50 text-amber-700 border-amber-100",
                    payment.payment_status === "failed" && "bg-red-50 text-red-700 border-red-100"
                  )}>
                    {payment.payment_status}
                  </span>
                </div>

                {/* Total amount */}
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">Amount Transacted</span>
                  <span className="text-foreground text-sm font-extrabold">{payment.amount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
