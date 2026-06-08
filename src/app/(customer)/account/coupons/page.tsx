"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Ticket, 
  Copy, 
  Check, 
  Calendar, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  History,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";

export default function CouponsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Coupon Lists & Logs
  const [coupons, setCoupons] = useState<any[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCouponsData() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        console.log("Analytics: Coupon Viewed");

        try {
          // 1. Fetch available coupons
          const { data: couponsData, error: couponsError } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });

          if (couponsError) throw couponsError;
          setCoupons(couponsData || []);

          // 2. Fetch coupon usage history
          const { data: usageData, error: usageError } = await supabase
            .from("coupon_usage")
            .select("*, coupons(*)")
            .eq("user_id", user.id)
            .order("applied_at", { ascending: false });

          if (usageError) throw usageError;
          setUsageHistory(usageData || []);
        } catch (dbErr) {
          setIsSandbox(true);
          // Load Mock Coupons
          setCoupons([
            { id: "c-1", code: "SAVE10", discount_value: "10% OFF", description: "Get 10% off on electronics and fashion items.", min_purchase: 1999, expires_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), status: "active" },
            { id: "c-2", code: "SAVE20", discount_value: "20% OFF", description: "Save big on purchases above ₹4,999 storefront-wide.", min_purchase: 4999, expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), status: "active" },
            { id: "c-3", code: "FREESHIP", discount_value: "FREE SHIPPING", description: "Get zero-shipping fee delivery on any cart size.", min_purchase: 999, expires_at: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(), status: "active" },
            { id: "c-4", code: "WELCOME500", discount_value: "₹500 OFF", description: "Sign-up special discount coupon for new users.", min_purchase: 2999, expires_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "expired" }
          ]);

          // Load Mock Usage
          setUsageHistory([
            { id: "u-1", coupon_code: "SAVE10", order_id: "ORD-7193", discount_amount: 1250, applied_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "u-2", coupon_code: "FREESHIP", order_id: "ORD-9283", discount_amount: 150, applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
          ]);
        }
      } catch (err: any) {
        setError("Failed to resolve coupons dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadCouponsData();
  }, [router]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    console.log(`Analytics: Coupon Copied - Code: ${code}`);
    
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const getExpiryLabel = (dateStr: string) => {
    const expiry = new Date(dateStr).getTime();
    const now = Date.now();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { label: "Expired", className: "bg-red-50 text-red-700 border-red-100" };
    }
    if (daysLeft <= 7) {
      return { label: `Expiring Soon (${daysLeft}d left)`, className: "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" };
    }
    return { label: `Active (Expires ${new Date(dateStr).toLocaleDateString()})`, className: "bg-green-50 text-green-700 border-green-100" };
  };

  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      <PageHeader
        title="My Coupons"
        description="Browse active promotional discount codes and track your savings history."
        icon={Ticket}
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection failed. Displaying offline simulated coupons catalog.
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Available Coupons list */}
      <div className="space-y-4">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/40 pb-3 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-primary" />
          <span>Available Coupons</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => {
            const expiryDetails = getExpiryLabel(coupon.expires_at);
            const isExpired = expiryDetails.label === "Expired";
            
            return (
              <div 
                key={coupon.id} 
                className={cn(
                  "border rounded-2xl bg-white p-5 shadow-xs flex flex-col justify-between transition-all relative overflow-hidden",
                  isExpired 
                    ? "border-border opacity-70 bg-muted/10" 
                    : "border-primary/20 hover:border-primary/40 bg-linear-to-b from-white to-primary/[0.005]"
                )}
              >
                {/* Coupon Cutout Visual effect */}
                <div className="absolute top-1/2 left-[-6px] translate-y-[-50%] w-3 h-6 bg-muted/10 rounded-r-full border-r border-y border-border" />
                <div className="absolute top-1/2 right-[-6px] translate-y-[-50%] w-3 h-6 bg-muted/10 rounded-l-full border-l border-y border-border" />

                <div className="space-y-3 pl-2 pr-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-lg font-black text-primary leading-none block">
                        {coupon.discount_value}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">
                        Min. Purchase: {formatPrice(coupon.min_purchase)}
                      </span>
                    </div>

                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-bold border capitalize",
                      expiryDetails.className
                    )}>
                      {expiryDetails.label}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {coupon.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-dashed border-border flex items-center justify-between gap-4 pl-2 pr-2">
                  {/* Coupon Code display */}
                  <span className="font-mono text-xs font-bold text-slate-800 bg-secondary/60 border border-accent/25 px-2.5 py-1 rounded-lg">
                    {coupon.code}
                  </span>

                  <Button
                    onClick={() => handleCopyCode(coupon.code)}
                    disabled={isExpired}
                    variant={copiedCode === coupon.code ? "outline" : "default"}
                    size="sm"
                    className={cn(
                      "rounded-xl font-extrabold text-xs transition-all cursor-pointer",
                      copiedCode === coupon.code ? "border-green-200 text-green-600 hover:bg-green-50" : "button-shadow"
                    )}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage History Table */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider border-b border-border/40 pb-3 flex items-center gap-1.5">
          <History className="w-4 h-4 text-primary" />
          <span>Usage History</span>
        </h3>

        {usageHistory.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-white p-6">
            <p className="text-xs text-muted-foreground select-none">
              No coupon savings history recorded yet. Add codes at checkout to apply discount values.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-2xl bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Applied Coupon</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Savings Amount</th>
                    <th className="px-6 py-4 text-right">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-foreground font-semibold">
                  {usageHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                        {log.coupon_code}
                      </td>
                      <td className="px-6 py-4 text-xs font-normal">
                        <Link href={`/account/orders/${log.order_id}`} className="hover:text-primary transition-colors font-semibold">
                          {log.order_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-green-600 font-extrabold">
                        -{formatPrice(log.discount_amount)}
                      </td>
                      <td className="px-6 py-4 text-xs font-normal text-muted-foreground text-right flex items-center justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(log.applied_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
