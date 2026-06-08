"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Bell, 
  Check, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Inbox,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");
  
  // State logs
  const [notifications, setNotifications] = useState<any[]>([]);

  // 1. Fetch initial notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);

        try {
          const { data, error: fetchError } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (fetchError) throw fetchError;
          setNotifications(data || []);
        } catch (dbErr) {
          setIsSandbox(true);
          // Load Mock Notifications
          setNotifications([
            { id: "notif-1", title: "Order Shipped! 🚀", message: "Your order ORD-8742 has been dispatched from our Mumbai hub. Estimated delivery: June 11.", read: false, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
            { id: "notif-2", title: "Flash Sale Alert ⚡", message: "An item in your wishlist (Studio Headset Pro) is now 15% off for the next 4 hours!", read: false, created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
            { id: "notif-3", title: "Welcome to Sellokart 🛍️", message: "Thank you for creating an account! Start exploring premium tech, decor, and fashion.", read: true, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
          ]);
        }
      } catch (err: any) {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [router]);

  // 2. Realtime Subscriptions & Simulator
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    
    // Subscribe to Postgres changes on notifications table
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications(prev => [payload.new, ...prev]);
            setSuccess("New notification received in real-time!");
          } else if (payload.eventType === "UPDATE") {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Sandbox Realtime Simulator: push a simulated notification after 15 seconds
    let simulatorTimer: NodeJS.Timeout;
    if (isSandbox) {
      simulatorTimer = setTimeout(() => {
        const liveSimulatedNotif = {
          id: `notif-sim-${Date.now()}`,
          title: "Refund Approved! 💳",
          message: "The refund of ₹12,499 for return request RET-9182 has been successfully credited to your bank account.",
          read: false,
          created_at: new Date().toISOString()
        };
        setNotifications(prev => [liveSimulatedNotif, ...prev]);
        setSuccess("Realtime Demo: Simulated notification pushed successfully!");
      }, 15000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (simulatorTimer) clearTimeout(simulatorTimer);
    };
  }, [userId, isSandbox]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (updateError) {
        console.warn("DB update failed, executing client-side simulation.");
        setIsSandbox(true);
      }

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);

      if (updateError) {
        console.warn("DB bulk update failed, executing client-side simulation.");
        setIsSandbox(true);
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setSuccess("All notifications marked as read!");
    } catch (err) {
      setError("Failed to mark notifications as read.");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.warn("DB delete failed, executing client-side simulation.");
        setIsSandbox(true);
      }

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Helper formatting values
  const formatTimeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMin = Math.round((now - time) / (1000 * 60));
    
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short"
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        title="Inbox Notifications"
        description="Stay updated with order shipments, wishlist deals, and support news."
        icon={Bell}
        action={
          unreadCount > 0 ? (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              size="sm"
              className="rounded-xl font-bold border-border/60 hover:bg-secondary/15 transition-all cursor-pointer text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              <span>Mark all read</span>
            </Button>
          ) : undefined
        }
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection unavailable. Subscribed to local simulated state. 
            <span className="text-primary font-bold ml-1 flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              A mock realtime notification will push automatically in 15 seconds.
            </span>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs flex items-start space-x-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-success/10 text-success border border-success/20 rounded-2xl text-xs flex items-start space-x-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-white p-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-1">Your inbox is clear</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            No active notifications to show. When new events trigger, they will display here in real-time.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl bg-white overflow-hidden shadow-xs divide-y divide-border/60">
          <AnimatePresence initial={false}>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "p-5 flex items-start justify-between gap-4 transition-colors relative group",
                  !notif.read ? "bg-primary/[0.02] hover:bg-primary/[0.04]" : "hover:bg-muted/10"
                )}
              >
                {/* Unread marker bar */}
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md" />
                )}

                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border",
                    !notif.read 
                      ? "bg-primary/15 border-primary/20 text-primary" 
                      : "bg-secondary/60 border-accent/10 text-muted-foreground"
                  )}>
                    <Inbox className="w-4 h-4" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className={cn(
                      "text-sm leading-snug",
                      !notif.read ? "font-extrabold text-foreground" : "font-bold text-muted-foreground"
                    )}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                      {notif.message}
                    </p>
                    
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1.5 hover:bg-primary/10 text-primary hover:text-primary-hover rounded-lg transition-colors cursor-pointer"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
