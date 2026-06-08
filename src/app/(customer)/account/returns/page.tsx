"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  RotateCcw, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag,
  ArrowRight,
  Calendar,
  MessageSquare,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";

export default function ReturnsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Return requests & orders data
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({});
  
  // Modal toggle
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [reason, setReason] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        try {
          // 1. Fetch return requests
          const { data: returnsData, error: returnsError } = await supabase
            .from("returns")
            .select("*")
            .order("created_at", { ascending: false });
          
          if (returnsError) throw returnsError;
          setReturnsList(returnsData || []);

          // 2. Fetch orders to populate return selector
          const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "delivered")
            .order("created_at", { ascending: false });
          
          if (ordersError) throw ordersError;
          setOrders(ordersData || []);

          // 3. Fetch order items
          if (ordersData && ordersData.length > 0) {
            const orderIds = ordersData.map(o => o.id);
            const { data: itemsData, error: itemsError } = await supabase
              .from("order_items")
              .select("*")
              .in("order_id", orderIds);
            
            if (!itemsError && itemsData) {
              const map: Record<string, any[]> = {};
              itemsData.forEach(item => {
                if (!map[item.order_id]) map[item.order_id] = [];
                map[item.order_id].push(item);
              });
              setOrderItemsMap(map);
            }
          }
        } catch (dbErr) {
          setIsSandbox(true);
          // Load Mock returns
          setReturnsList([
            { id: "RET-9182", order_id: "ORD-7193", product_name: "Sustainable Tailored Blazer", quantity: 1, reason: "Wrong Size", status: "approved", comments: "A bit too tight in the shoulders.", created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "RET-8273", order_id: "ORD-9283", product_name: "Studio Headset Pro", quantity: 1, reason: "Defective/Faulty", status: "pending", comments: "Left headphone side has static noise.", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
          ]);
          
          // Load mock delivered orders
          const mockOrders = [
            { id: "ORD-7193", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: "delivered" },
            { id: "ORD-9283", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: "delivered" },
            { id: "ORD-8742", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: "delivered" }
          ];
          setOrders(mockOrders);

          setOrderItemsMap({
            "ORD-7193": [
              { id: 201, product_name: "Sustainable Tailored Blazer", quantity: 1, price: 12499 },
              { id: 202, product_name: "Aesthetic Premium Jacket", quantity: 1, price: 7499 }
            ],
            "ORD-9283": [
              { id: 203, product_name: "Studio Headset Pro", quantity: 1, price: 11999 }
            ],
            "ORD-8742": [
              { id: 204, product_name: "Creative Minimalist Desk Mat", quantity: 1, price: 3999 }
            ]
          });
        }
      } catch (err: any) {
        setError("Failed to fetch return records.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedItem || !reason) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const orderItem = orderItemsMap[selectedOrderId]?.find(
      item => item.product_name === selectedItem || String(item.id) === selectedItem
    );
    const productName = orderItem?.product_name || selectedItem;

    const returnRequest = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      order_id: selectedOrderId,
      product_name: productName,
      quantity: quantity,
      reason: reason,
      comments: comments,
      status: "pending",
      created_at: new Date().toISOString()
    };

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from("returns")
        .insert({
          order_id: selectedOrderId,
          product_name: productName,
          quantity: quantity,
          reason: reason,
          comments: comments,
          status: "pending"
        });

      if (insertError) {
        console.warn("Returns insert failed, running in simulated local fallback mode.");
        setIsSandbox(true);
      }

      setReturnsList([returnRequest, ...returnsList]);
      setSuccess("Return request submitted successfully! We are reviewing your request.");
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err?.message || "Failed to submit return request.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedOrderId("");
    setSelectedItem("");
    setReason("");
    setQuantity(1);
    setComments("");
  };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Helper formatting values
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Get active order list items to return
  const activeOrderItems = selectedOrderId ? (orderItemsMap[selectedOrderId] || []) : [];
  const selectedItemObj = activeOrderItems.find(
    item => item.product_name === selectedItem || String(item.id) === selectedItem
  );
  const maxQty = selectedItemObj?.quantity || 1;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns & Refunds"
        description="File product return requests and track your refund progress."
        icon={RotateCcw}
        action={
          <Button
            onClick={openAddModal}
            size="default"
            className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Request Return</span>
          </Button>
        }
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection unavailable. Return submissions and records are simulated locally.
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
      {success && (
        <div className="p-4 bg-success/10 text-success border border-success/20 rounded-2xl text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Returns List */}
      {returnsList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-white p-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto mb-4">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-1">No return requests found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            All your returns, replacements, and refund tracking details will appear here.
          </p>
          <Button
            onClick={openAddModal}
            className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            File Return Request
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {returnsList.map((ret) => (
            <div key={ret.id} className="border border-border rounded-2xl bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/60 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{ret.id}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Order: {ret.order_id}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-foreground text-sm leading-snug">
                    {ret.product_name} <span className="text-muted-foreground font-normal">(Qty: {ret.quantity})</span>
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-semibold">
                    <span className="text-destructive bg-destructive/5 border border-destructive/10 px-2 py-0.5 rounded-md text-[10px]">
                      Reason: {ret.reason}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Filed on {formatDate(ret.created_at)}
                    </span>
                  </div>
                  
                  {ret.comments && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic mt-2 flex items-start gap-1">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>"{ret.comments}"</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize",
                  ret.status === "approved" && "bg-green-50 text-green-700 border-green-100",
                  ret.status === "pending" && "bg-amber-50 text-amber-700 border-amber-100",
                  ret.status === "rejected" && "bg-red-50 text-red-700 border-red-100"
                )}>
                  {ret.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Request Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 border-none overflow-hidden bg-white shadow-xl rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground">
              Create Return Request
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateReturn} className="p-6 space-y-4">
            {/* Step 1: Select Order */}
            <div className="space-y-1.5">
              <label htmlFor="order" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Select Order (Delivered Only) *
              </label>
              <select
                id="order"
                required
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedItem("");
                }}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Choose Order --</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({formatDate(o.created_at)})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Item */}
            {selectedOrderId && (
              <div className="space-y-1.5">
                <label htmlFor="item" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Select Item *
                </label>
                <select
                  id="item"
                  required
                  value={selectedItem}
                  onChange={(e) => {
                    setSelectedItem(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">-- Choose Product --</option>
                  {activeOrderItems.map(item => (
                    <option key={item.id} value={item.product_name}>
                      {item.product_name} (&times; {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Select Reason */}
            <div className="space-y-1.5">
              <label htmlFor="reason" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Reason for Return *
              </label>
              <select
                id="reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">-- Choose Reason --</option>
                <option value="Wrong Size">Wrong Size / Fit Issues</option>
                <option value="Defective/Faulty">Defective / Faulty Item</option>
                <option value="Item Damaged">Item Damaged on Arrival</option>
                <option value="Not as Described">Product Not as Described</option>
                <option value="Quality Issues">Quality did not meet expectation</option>
                <option value="Other">Other / Mind Changed</option>
              </select>
            </div>

            {/* Step 4: Select Qty */}
            {selectedItem && maxQty > 1 && (
              <div className="space-y-1.5">
                <label htmlFor="quantity" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Return Quantity * (Max: {maxQty})
                </label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="h-10 border border-border"
                />
              </div>
            )}

            {/* Step 5: Comments */}
            <div className="space-y-1.5">
              <label htmlFor="comments" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Comments / Fault Details
              </label>
              <textarea
                id="comments"
                placeholder="Please provide details of why you want to return this product..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Modal actions */}
            <div className="pt-3 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
