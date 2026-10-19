import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Calendar,
  ChevronRight,
  CreditCard,
  Package,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface OrderRowItem {
  id: string;
  quantity: number;
  product_name: string;
}

interface OrderRow {
  id: string;
  order_number: string | null;
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  discount: number | null;
  total: number | null;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderRowItem[];
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/orders");
  }

  let orders: OrderRow[] = [];
  let queryError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          quantity,
          product_name
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch user orders:", error.message);
      queryError = "Unable to load orders at this moment. Please refresh the page.";
    } else {
      orders = (data as unknown as OrderRow[]) || [];
    }
  } catch (err: unknown) {
    console.error("Unexpected error in OrdersPage:", err);
    queryError = "A connection error occurred while loading your orders.";
  }

  const formatPrice = (value: number | null | undefined) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  const getPaymentStatusBadgeClass = (paymentStatus: string) => {
    switch (paymentStatus?.toLowerCase()) {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Orders"
        description="Review purchase details and live shipping status for all your placed orders."
        icon={ShoppingBag}
        action={
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <Link href="/products">
              <span>Continue Shopping</span>
            </Link>
          </Button>
        }
      />

      {queryError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center space-x-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-semibold">{queryError}</p>
        </div>
      )}

      {/* Orders Grid/Table */}
      {orders.length === 0 && !queryError ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card p-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-1">No orders found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            You haven&apos;t placed any orders yet. Explore our catalog to find items you love!
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/products">Explore Catalog</Link>
          </Button>
        </div>
      ) : orders.length > 0 ? (
        <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Placed On</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-foreground font-semibold">
                {orders.map((ord) => {
                  const totalItems =
                    ord.order_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ||
                    ord.order_items?.length ||
                    1;
                  const displayOrderNumber = ord.order_number || ord.id.slice(0, 8).toUpperCase();

                  return (
                    <tr key={ord.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/account/orders/${ord.id}`}
                          className="font-mono text-xs text-primary font-bold hover:underline"
                        >
                          {displayOrderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs font-normal">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {formatDate(ord.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-normal">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Package className="w-3.5 h-3.5 shrink-0" />
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-bold text-[10px]",
                            getPaymentStatusBadgeClass(ord.payment_status)
                          )}
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>{ord.payment_status || "Pending"}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize font-bold text-[10px]",
                            getOrderStatusBadgeClass(ord.status)
                          )}
                        >
                          <span>{ord.status || "Pending"}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="outline" size="sm" className="cursor-pointer">
                          <Link href={`/account/orders/${ord.id}`}>
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
