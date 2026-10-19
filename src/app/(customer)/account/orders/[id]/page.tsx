import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintInvoiceButton } from "@/features/orders/components/PrintInvoiceButton";

export const dynamic = "force-dynamic";

interface OrderDetailsProps {
  params: Promise<{ id: string }>;
}

interface ShippingAddressData {
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface ProductImageRelation {
  image_url: string;
  is_primary?: boolean;
}

interface ProductRelation {
  id: string;
  name?: string | null;
  product_images?: ProductImageRelation[] | null;
}

interface OrderItemData {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  price: number;
  created_at: string;
  products?: ProductRelation | null;
}

interface PaymentData {
  id: string;
  gateway: string | null;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  amount: number | null;
  status: string | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string | null;
}

interface ShipmentData {
  id: string;
  courier_name?: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  shipment_status?: string | null;
  estimated_delivery?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

interface OrderRecord {
  id: string;
  order_number: string | null;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddressData | null;
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  discount: number | null;
  total: number | null;
  status: string;
  payment_status: string;
  razorpay_order_id: string | null;
  created_at: string;
  updated_at?: string | null;
  order_items?: OrderItemData[];
  payments?: PaymentData[] | PaymentData | null;
}

export default async function OrderDetailsPage({ params }: OrderDetailsProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/account/orders/${orderId}`);
  }

  const cleanOrderId = orderId.replace(/[,()\\%"_]/g, "").trim().slice(0, 50);

  // 1. Authoritatively fetch Order with relations directly on server
  let { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        product_sku,
        quantity,
        price,
        created_at,
        products (
          id,
          name,
          product_images (
            image_url,
            is_primary
          )
        )
      ),
      payments (
        id,
        gateway,
        gateway_order_id,
        gateway_payment_id,
        amount,
        status,
        currency,
        paid_at,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .or(`id.eq.${cleanOrderId},order_number.eq.${cleanOrderId}`)
    .maybeSingle();

  // Resilient fallback query if relation schema mismatch occurs
  if (!orderData) {
    const fallbackRes = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          order_id,
          product_id,
          product_name,
          product_sku,
          quantity,
          price,
          created_at
        ),
        payments (
          id,
          gateway,
          gateway_order_id,
          gateway_payment_id,
          amount,
          status,
          currency,
          paid_at,
          created_at
        )
      `
      )
      .eq("user_id", user.id)
      .or(`id.eq.${cleanOrderId},order_number.eq.${cleanOrderId}`)
      .maybeSingle();

    if (fallbackRes.data) {
      orderData = fallbackRes.data;
      orderErr = null;
    }
  }

  if (orderErr) {
    console.error("Order lookup error:", orderErr.message);
  }

  // 2. Enforce strict customer ownership
  if (!orderData || (orderData.user_id && orderData.user_id !== user.id)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 border border-border rounded-2xl bg-card">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Order Not Found</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The requested order could not be located or does not belong to your account.
        </p>
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link href="/account/orders">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Orders</span>
          </Link>
        </Button>
      </div>
    );
  }

  const order = orderData as unknown as OrderRecord;
  const items = order.order_items || [];

  // 3. Fetch real shipment record from database if present
  let shipment: ShipmentData | null = null;
  try {
    const { data: shipData } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle();

    if (shipData) {
      shipment = shipData as ShipmentData;
    }
  } catch (shipErr) {
    console.warn("Shipments relation check:", shipErr);
  }

  // Payment details resolved from authoritative relation
  const payment: PaymentData | null = Array.isArray(order.payments)
    ? order.payments[0] || null
    : order.payments || null;

  // Real calculations loaded from server order record
  const subtotal = Number(
    order.subtotal ?? items.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0)
  );
  const tax = Number(order.tax ?? Math.round(subtotal * 0.18));
  const shippingFee = Number(order.shipping ?? (subtotal >= 1999 ? 0 : 150));
  const discount = Number(order.discount ?? 0);
  const total = Number(order.total ?? subtotal + tax + shippingFee - discount);

  const displayOrderNumber = order.order_number || order.id.slice(0, 8).toUpperCase();

  // Timeline configuration based purely on real server status
  const isCancelled =
    order.status?.toLowerCase() === "cancelled" || order.status?.toLowerCase() === "refunded";

  const timelineStages = [
    { label: "Order Placed", status: "pending", desc: "Order initialized & verified", icon: Package },
    {
      label: "Confirmed",
      status: "confirmed",
      desc: "Payment verified, order confirmed",
      icon: Clock,
    },
    {
      label: "Shipped",
      status: "shipped",
      desc: "Dispatched from warehouse",
      icon: Truck,
    },
    {
      label: "Delivered",
      status: "delivered",
      desc: "Delivered to shipping address",
      icon: CheckCircle2,
    },
  ];

  const normalizedStatus =
    order.status?.toLowerCase() === "processing" ? "confirmed" : order.status?.toLowerCase() || "pending";
  const stageKeys = ["pending", "confirmed", "shipped", "delivered"];
  const currentStageIndex = stageKeys.indexOf(normalizedStatus);

  const getStageState = (stageKey: string) => {
    if (isCancelled) return "cancelled";
    const stageIdx = stageKeys.indexOf(stageKey);
    if (currentStageIndex >= stageIdx) return "completed";
    if (currentStageIndex + 1 === stageIdx) return "active";
    return "upcoming";
  };

  const getOrderStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-success/15 text-success border-success/30";
      case "shipped":
        return "bg-accent text-accent-foreground border-accent-foreground/20";
      case "confirmed":
      case "processing":
      case "in_progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-warning/15 text-warning border-warning/30";
      case "cancelled":
      case "refunded":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPaymentStatusBadgeClass = (pStatus: string | null | undefined) => {
    switch (pStatus?.toLowerCase()) {
      case "paid":
        return "bg-success/15 text-success border-success/30";
      case "pending":
        return "bg-warning/15 text-warning border-warning/30";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "refunded":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const shippingAddr = order.shipping_address;

  return (
    <div className="space-y-8 print:p-0 print:border-none">
      <PageHeader
        title="Order Details"
        description={`Order #${displayOrderNumber} • Placed on ${new Date(
          order.created_at
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`}
        icon={Package}
        action={
          <div className="flex items-center gap-3 print:hidden">
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link href="/account/orders">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Back to Orders</span>
              </Link>
            </Button>
            <PrintInvoiceButton />
          </div>
        }
      />

      {/* Cancellation Notice if applicable */}
      {isCancelled && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start space-x-3 text-xs text-destructive print:hidden">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm">Order Cancelled</h4>
            <p className="text-muted-foreground">
              This order has been cancelled and is no longer in active fulfillment.
            </p>
          </div>
        </div>
      )}

      {/* Real Shipping Progress Tracker */}
      <div className="border border-border rounded-2xl bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
            Shipping Progress Tracker
          </h3>
          <Badge
            variant="outline"
            className={cn("capitalize font-bold text-[10px]", getOrderStatusBadgeClass(order.status))}
          >
            <span>{order.status}</span>
          </Badge>
        </div>

        {/* Timeline Horizontal Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {timelineStages.map((stage, idx) => {
            const state = getStageState(stage.status);
            const Icon = stage.icon;

            return (
              <div
                key={stage.label}
                className="flex flex-col items-center text-center space-y-3 relative group"
              >
                {/* Horizontal connect line */}
                {idx < 3 && !isCancelled && (
                  <div
                    className={cn(
                      "hidden sm:block absolute top-5 left-1/2 right-[-50%] h-[2px] z-0 transition-colors duration-300",
                      currentStageIndex > idx
                        ? "bg-success"
                        : currentStageIndex === idx
                        ? "bg-primary/50"
                        : "bg-border"
                    )}
                  />
                )}

                {/* Node Ring circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all relative",
                    state === "completed" && "bg-success border-success text-white",
                    state === "active" &&
                      "bg-card border-primary text-primary shadow-xs ring-4 ring-primary/10 scale-105",
                    state === "upcoming" && "bg-card border-border text-muted-foreground",
                    state === "cancelled" && "bg-muted border-border text-muted-foreground opacity-60"
                  )}
                >
                  {state === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Text Description details */}
                <div className="space-y-0.5">
                  <h4
                    className={cn(
                      "text-xs font-bold leading-tight",
                      state === "completed" && "text-success",
                      state === "active" && "text-primary",
                      state === "upcoming" && "text-muted-foreground",
                      state === "cancelled" && "text-muted-foreground"
                    )}
                  >
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
        <div className="lg:col-span-2 border border-border rounded-2xl bg-card overflow-hidden shadow-xs space-y-6">
          <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
              Itemized Invoice
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* List items */}
          <div className="divide-y divide-border/60 px-6">
            {items.length === 0 ? (
              <p className="py-6 text-xs text-muted-foreground text-center">
                No items recorded for this order.
              </p>
            ) : (
              items.map((item) => {
                const prod = item.products;
                const imageUrl =
                  prod?.product_images?.find((img) => img.is_primary)?.image_url ||
                  prod?.product_images?.[0]?.image_url ||
                  null;

                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-muted rounded-xl border border-border p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product_name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">
                          {item.product_name || prod?.name || "Purchased Product"}
                        </h4>
                        {item.product_sku && (
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            SKU: {item.product_sku}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground block">
                          Qty: {item.quantity} &times; ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-foreground text-sm">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Totals Summary */}
          <div className="bg-muted/30 border-t border-border/60 p-6 space-y-3 text-sm divide-y divide-border/40">
            <div className="flex justify-between pt-1 font-semibold">
              <span className="text-muted-foreground">Items Subtotal</span>
              <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between pt-3 font-semibold">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="text-foreground">₹{tax.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between pt-3 font-semibold">
              <span className="text-muted-foreground">Shipping Fee</span>
              <span className="text-foreground">
                {shippingFee === 0 ? (
                  <span className="text-success font-bold">FREE</span>
                ) : (
                  `₹${shippingFee.toLocaleString("en-IN")}`
                )}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between pt-3 font-semibold text-success">
                <span>Discount Applied</span>
                <span>-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between pt-4 text-base font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-lg text-primary">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Shipping details and Payments */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="border border-border rounded-2xl bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/60 pb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Shipping Address</span>
            </h3>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-sm text-foreground">
                {order.customer_name || user.user_metadata?.full_name || "Customer"}
              </p>
              {order.customer_phone && <p>Phone: {order.customer_phone}</p>}
              {order.customer_email && <p>Email: {order.customer_email}</p>}

              {shippingAddr ? (
                <div className="pt-2 border-t border-border/40 space-y-0.5 text-foreground">
                  <p>{shippingAddr.addressLine1}</p>
                  {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                  <p>
                    {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postalCode}
                  </p>
                  <p>{shippingAddr.country || "India"}</p>
                </div>
              ) : (
                <p className="text-[11px] italic">Address details attached to profile.</p>
              )}
            </div>
          </div>

          {/* Real Shipment Tracking Details */}
          <div className="border border-border rounded-2xl bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/60 pb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" />
              <span>Courier & Tracking</span>
            </h3>

            {shipment ? (
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                    Courier Partner
                  </span>
                  <span className="text-foreground text-sm font-bold">
                    {shipment.courier_name || shipment.carrier || "Standard Carrier"}
                  </span>
                </div>

                {shipment.tracking_number && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                      Tracking Reference
                    </span>
                    <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border text-[10px]">
                      {shipment.tracking_number}
                    </span>
                  </div>
                )}

                {shipment.estimated_delivery && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                      Estimated Arrival
                    </span>
                    <span className="text-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      {new Date(shipment.estimated_delivery).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Courier and tracking information will be updated automatically as soon as your package
                is dispatched from our fulfillment facility.
              </p>
            )}
          </div>

          {/* Payment Card Details */}
          <div className="border border-border rounded-2xl bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/60 pb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Payment Details</span>
            </h3>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                  Gateway
                </span>
                <span className="text-foreground capitalize">
                  {payment?.gateway || "Razorpay Online"}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                  Payment Status
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize font-bold text-[10px] mt-0.5",
                    getPaymentStatusBadgeClass(payment?.status || order.payment_status)
                  )}
                >
                  <span>{payment?.status || order.payment_status || "Pending"}</span>
                </Badge>
              </div>

              {(payment?.gateway_payment_id || order.razorpay_order_id) && (
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                    Transaction ID
                  </span>
                  <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border text-[10px] block truncate">
                    {payment?.gateway_payment_id || order.razorpay_order_id}
                  </span>
                </div>
              )}

              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block">
                  Amount Transacted
                </span>
                <span className="text-foreground text-sm font-bold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
