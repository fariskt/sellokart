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
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Title } from "@/components/ui/title";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default async function AccountDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch counts and recent items with robust try-catch fallbacks
  let ordersCount = 0;
  let wishlistCount = 0;
  let notificationsCount = 0;
  let recentOrders: any[] = [];
  let recentNotifications: any[] = [];
  let dbErrorOccurred = false;

  try {
    // 1. Orders count and recent orders
    const { data: ordersData, error: ordersError, count: ordersTotal } = await supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;
    ordersCount = ordersTotal || 0;
    recentOrders = ordersData || [];
  } catch (err) {
    dbErrorOccurred = true;
    ordersCount = 3;
    recentOrders = [
      { id: "ORD-9283", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), total_amount: 11999, status: "processing", payment_method: "UPI" },
      { id: "ORD-8742", created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), total_amount: 3999, status: "shipped", payment_method: "Card" },
      { id: "ORD-7193", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), total_amount: 14999, status: "delivered", payment_method: "NetBanking" },
    ];
  }

  try {
    // 2. Wishlist count
    const { count: wishlistTotal, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    if (wishlistError) throw wishlistError;
    wishlistCount = wishlistTotal || 0;
  } catch (err) {
    dbErrorOccurred = true;
    wishlistCount = 4;
  }

  try {
    // 3. Notifications
    const { data: notifsData, error: notifsError, count: notifsTotal } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("read", false)
      .order("created_at", { ascending: false });

    if (notifsError) throw notifsError;
    notificationsCount = notifsTotal || 0;
    recentNotifications = notifsData || [];
  } catch (err) {
    dbErrorOccurred = true;
    notificationsCount = 2;
    recentNotifications = [
      { id: 1, title: "Order Shipped!", message: "Your order ORD-8742 has been dispatched and is on its way.", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 2, title: "Price Drop Alert", message: "An item in your wishlist (Studio Headset Pro) is now 10% off!", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
    ];
  }

  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hello, ${fullName}!`}
        description={user.email || ""}
        icon={UserIcon}
        action={
          <div className="flex space-x-3">
            <Link
              href="/account/profile"
              className="px-4 py-2 border border-border hover:border-primary/50 hover:bg-secondary/10 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary transition-all cursor-pointer"
            >
              Edit Profile
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold button-shadow transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            >
              Shop Now
            </Link>
          </div>
        }
      />

      {/* Database Warning Alert */}
      {dbErrorOccurred && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Database Integration Sandbox</h4>
            <p className="text-xs text-amber-700/80 mt-0.5">
              Database relations are not yet migrated in Supabase. Running in offline sandbox mode with simulated local records.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Orders Count Card */}
        <Link 
          href="/account/orders"
          className="border border-border rounded-2xl bg-white p-6 shadow-xs flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Orders Placed</span>
            <span className="text-3xl font-black text-foreground">{ordersCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>

        {/* Wishlist Count Card */}
        <Link 
          href="/wishlist"
          className="border border-border rounded-2xl bg-white p-6 shadow-xs flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Wishlist Items</span>
            <span className="text-3xl font-black text-foreground">{wishlistCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 transition-transform group-hover:scale-110">
            <Heart className="w-6 h-6" />
          </div>
        </Link>

        {/* Notifications Count Card */}
        <div className="border border-border rounded-2xl bg-white p-6 shadow-xs flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Unread Alerts</span>
            <span className="text-3xl font-black text-foreground">{notificationsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid split: Recent Orders & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-2 border border-border rounded-2xl bg-white overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Recent Orders</h3>
            <Link 
              href="/account/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-foreground font-semibold">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4 font-mono text-xs">{ord.id}</td>
                      <td className="px-6 py-4 text-xs font-normal">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {formatDate(ord.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatPrice(ord.total_amount)}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize",
                          ord.status === "delivered" && "bg-green-50 text-green-700 border-green-100",
                          ord.status === "shipped" && "bg-purple-50 text-purple-700 border-purple-100",
                          ord.status === "processing" && "bg-blue-50 text-blue-700 border-blue-100",
                          ord.status === "pending" && "bg-amber-50 text-amber-700 border-amber-100",
                          ord.status === "cancelled" && "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/account/orders/${ord.id}`}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        <div className="border border-border rounded-2xl bg-white overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-border/60">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Recent Notifications</h3>
          </div>

          <div className="divide-y divide-border/40">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No recent notifications.
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif.id} className="p-5 space-y-1 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-foreground text-xs leading-snug">{notif.title}</h4>
                    <span className="text-[9px] text-muted-foreground font-semibold shrink-0">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
