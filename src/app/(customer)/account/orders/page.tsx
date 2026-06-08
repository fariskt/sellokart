import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  ShoppingBag, 
  Calendar, 
  ChevronRight, 
  ShieldAlert,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let orders: any[] = [];
  let dbErrorOccurred = false;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    orders = data || [];
  } catch (err) {
    dbErrorOccurred = true;
    console.warn("Supabase orders table query failed, falling back to mock data.");
    orders = [
      { id: "ORD-9283", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), total_amount: 11999, status: "processing", payment_method: "UPI" },
      { id: "ORD-8742", created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), total_amount: 3999, status: "shipped", payment_method: "Card" },
      { id: "ORD-7193", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), total_amount: 14999, status: "delivered", payment_method: "NetBanking" },
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Orders"
        description="Track shipping stages and review purchase details of your past transactions."
        icon={ShoppingBag}
        action={
          <Link
            href="/products"
            className="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2 border border-border hover:border-primary/50 hover:bg-secondary/10 text-muted-foreground hover:text-primary rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span>Continue Shopping</span>
          </Link>
        }
      />

      {/* Database Warning */}
      {dbErrorOccurred && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database relations are missing. Displaying offline simulated order details.
          </div>
        </div>
      )}

      {/* Orders Grid/Table */}
      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-white p-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-1">No orders found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            You haven't purchased anything yet. Head to the store to make your first order!
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold button-shadow transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-2xl bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Purchase Date</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm text-foreground font-semibold">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                      {ord.id}
                    </td>
                    <td className="px-6 py-4 text-xs font-normal">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {formatDate(ord.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-normal">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        {ord.payment_method || "Not Specified"}
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
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-border hover:border-primary/50 hover:bg-secondary/10 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary transition-all cursor-pointer"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
