import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Bell,
  Calendar,
  ChevronRight,
  User as UserIcon,
  Package,
  RotateCcw,
  Sparkles,
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

interface OrderRecord {
  id: string;
  order_number: string | null;
  total: number | null;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderRowItem[];
}

interface NotificationRecord {
  id: string | number;
  title: string;
  message: string;
  read?: boolean;
  created_at: string;
}

export default async function AccountDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  // 1. Authoritatively fetch orders count and 5 most recent orders from database
  let ordersCount = 0;
  let recentOrders: OrderRecord[] = [];

  try {
    const { data: ordersData, count: ordersTotal, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        total,
        status,
        payment_status,
        created_at,
        order_items (
          id,
          quantity,
          product_name
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!ordersError && ordersData) {
      ordersCount = ordersTotal ?? ordersData.length;
      recentOrders = ordersData as unknown as OrderRecord[];
    }
  } catch (err) {
    console.error("AccountDashboard orders query error:", err);
  }

  // 2. Authoritatively fetch real wishlist count
  let wishlistCount = 0;
  try {
    const { count: wishlistTotal, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!wishlistError && wishlistTotal !== null) {
      wishlistCount = wishlistTotal;
    }
  } catch (err) {
    console.warn("AccountDashboard wishlist count notice:", err);
  }

  // 3. Authoritatively fetch real unread notifications
  let notificationsCount = 0;
  let recentNotifications: NotificationRecord[] = [];

  try {
    const {
      data: notifsData,
      count: notifsTotal,
      error: notifsError,
    } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (!notifsError && notifsData) {
      recentNotifications = notifsData as NotificationRecord[];
      notificationsCount =
        notifsTotal ??
        recentNotifications.filter((n) => n.read === false).length;
    }
  } catch (err) {
    console.warn("AccountDashboard notifications query notice:", err);
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

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Member";

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <PageHeader
        title={`Welcome back, ${fullName}`}
        description={`Account: ${user.email} • Track your orders, wishlist, and profile activity.`}
        icon={UserIcon}
        action={
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link href="/account/profile">Edit Profile</Link>
            </Button>
            <Button asChild size="sm" className="cursor-pointer">
              <Link href="/products">Shop Catalog</Link>
            </Button>
          </div>
        }
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Orders Count Card */}
        <Link
          href="/account/orders"
          className="border border-border rounded-2xl bg-card p-6 shadow-xs flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Orders Placed
            </span>
            <span className="text-3xl font-bold text-foreground">{ordersCount}</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>View all orders</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>

        {/* Wishlist Count Card */}
        <Link
          href="/wishlist"
          className="border border-border rounded-2xl bg-card p-6 shadow-xs flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Saved Wishlist
            </span>
            <span className="text-3xl font-bold text-foreground">{wishlistCount}</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>View saved items</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive transition-transform group-hover:scale-105">
            <Heart className="w-6 h-6" />
          </div>
        </Link>

        {/* Notifications Count Card */}
        <Link
          href="/account/notifications"
          className="border border-border rounded-2xl bg-card p-6 shadow-xs flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Alerts & Updates
            </span>
            <span className="text-3xl font-bold text-foreground">{notificationsCount}</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
              <span>View notifications</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary transition-transform group-hover:scale-105">
            <Bell className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Orders & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Orders Panel */}
        <div className="lg:col-span-2 border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium text-foreground text-sm uppercase tracking-wider">
                Recent Orders
              </h3>
              <p className="text-xs text-muted-foreground">
                Your latest purchases and their fulfillment status.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="cursor-pointer text-xs font-medium text-primary">
              <Link href="/account/orders" className="flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-foreground">No orders yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  When you make a purchase, your order history and tracking updates will appear here.
                </p>
              </div>
              <Button asChild size="sm" className="cursor-pointer mt-2">
                <Link href="/products">Explore Products</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3.5">Order #</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground font-semibold">
                  {recentOrders.map((ord) => {
                    const totalItems =
                      ord.order_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ||
                      ord.order_items?.length ||
                      1;
                    const displayOrderNumber =
                      ord.order_number || ord.id.slice(0, 8).toUpperCase();

                    return (
                      <tr key={ord.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/account/orders/${ord.id}`}
                            className="font-mono text-xs text-primary font-medium hover:underline"
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
                        <td className="px-6 py-4 text-xs font-normal text-muted-foreground">
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {formatPrice(ord.total)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize font-medium text-[10px]",
                              getOrderStatusBadgeClass(ord.status)
                            )}
                          >
                            <span>{ord.status || "Pending"}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                            <Link href={`/account/orders/${ord.id}`} className="flex items-center gap-1 text-xs">
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notifications & Shortcuts Column */}
        <div className="space-y-6">
          {/* Recent Notifications Card */}
          <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
            <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
              <h3 className="font-medium text-foreground text-sm uppercase tracking-wider">
                Notifications
              </h3>
              <Button asChild variant="ghost" size="sm" className="cursor-pointer text-xs font-medium text-primary p-0 h-auto">
                <Link href="/account/notifications">View All</Link>
              </Button>
            </div>

            <div className="divide-y divide-border/60">
              {recentNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                  <Bell className="w-5 h-5 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-foreground">No unread alerts</p>
                  <p>You are all caught up with your orders and account notices.</p>
                </div>
              ) : (
                recentNotifications.map((notif) => (
                  <div key={notif.id} className="p-5 space-y-1 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-foreground text-xs leading-snug">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="border border-border rounded-2xl bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-medium text-foreground text-sm uppercase tracking-wider border-b border-border/60 pb-3">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/account/returns"
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/20 transition-all text-xs font-semibold text-foreground group"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span>Returns & Replacements</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/products"
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/20 transition-all text-xs font-semibold text-foreground group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Featured Products</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
