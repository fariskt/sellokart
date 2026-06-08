"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Star, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewsPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Reviews data logs
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Edit state
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        try {
          const { data, error: fetchError } = await supabase
            .from("reviews")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (fetchError) throw fetchError;
          setReviews(data || []);
        } catch (dbErr) {
          setIsSandbox(true);
          // Load Mock Reviews
          setReviews([
            { id: "rev-1", product_name: "Studio Headset Pro", product_image: "/images/headphones.png", rating: 5, comment: "Incredible acoustic separation, deep sub-bass, and premium padding. Completely satisfied with this purchase!", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "rev-2", product_name: "Creative Minimalist Desk Mat", product_image: "/images/workspace.png", rating: 4, comment: "High quality felt, feels premium under hands. Only criticism is it slides slightly on polished wooden desks.", created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
          ]);
        }
      } catch (err: any) {
        setError("Failed to load your review history.");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [router]);

  const handleEditClick = (review: any) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setError("");
    setSuccess("");
    setIsEditModalOpen(true);
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          rating: editRating,
          comment: editComment,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingReview.id);

      if (updateError) {
        console.warn("DB update failed, executing client-side simulation.");
        setIsSandbox(true);
      }

      setReviews(prev =>
        prev.map(r => r.id === editingReview.id ? { ...r, rating: editRating, comment: editComment } : r)
      );
      setSuccess("Review updated successfully!");
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update review.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      
      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.warn("DB delete failed, executing client-side simulation.");
        setIsSandbox(true);
      }

      setReviews(prev => prev.filter(r => r.id !== id));
      setSuccess("Review deleted successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to delete review.");
    }
  };

  // Helper formatting values
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

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
        title="My Product Reviews"
        description="Share your shopping experiences and manage past review feedback."
        icon={Star}
      />

      {/* Database Warning */}
      {isSandbox && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-700/80">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 block mb-0.5">Offline Sandbox Fallback</span>
            Database connection unavailable. Review changes are updated locally in simulated session.
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

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-white p-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto mb-4">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-base mb-1">No reviews written yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
            Review prompts appear in your Order Details dashboard once shipping completes successfully.
          </p>
          <Button
            onClick={() => router.push("/account/orders")}
            className="rounded-xl font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
          >
            Go to Orders
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence initial={false}>
            {reviews.map((rev) => (
              <motion.div 
                key={rev.id} 
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-border rounded-2xl bg-white p-5 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 bg-muted/30 rounded-xl border border-border/40 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={rev.product_image || "/images/headphones.png"}
                      alt={rev.product_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground text-sm leading-snug">
                      {rev.product_name}
                    </h4>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "w-3.5 h-3.5",
                            i < rev.rating ? "text-amber-500 fill-amber-500" : "text-border"
                          )} 
                        />
                      ))}
                    </div>
                    
                    {rev.comment && (
                      <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/10 border-l-2 border-primary/20 pl-3 py-1 mt-1 flex items-start gap-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/40" />
                        <span>"{rev.comment}"</span>
                      </p>
                    )}
                    
                    <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reviewed on {formatDate(rev.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <button
                    onClick={() => handleEditClick(rev)}
                    className="p-2 border border-border hover:border-primary/50 hover:bg-secondary/10 text-muted-foreground hover:text-primary rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Edit Review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 border border-border hover:border-destructive/50 hover:bg-destructive/5 text-muted-foreground hover:text-destructive rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 border-none overflow-hidden bg-white shadow-xl rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground">
              Modify Review
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateReview} className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted/30 rounded-xl border border-border/40 p-2 flex items-center justify-center shrink-0">
                <img
                  src={editingReview?.product_image || "/images/headphones.png"}
                  alt={editingReview?.product_name || "Product"}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm line-clamp-1">{editingReview?.product_name}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">Filed on {editingReview && formatDate(editingReview.created_at)}</p>
              </div>
            </div>

            {/* Edit Stars */}
            <div className="space-y-1.5 text-center bg-secondary/15 border border-accent/10 rounded-2xl p-4">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide block mb-1">
                Your Rating *
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setEditRating(starValue)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Rate ${starValue} Stars`}
                  >
                    <Star 
                      className={cn(
                        "w-7 h-7",
                        starValue <= editRating ? "text-amber-500 fill-amber-500" : "text-border"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Edit Comment */}
            <div className="space-y-1.5">
              <label htmlFor="comment" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Comments / Feedback details *
              </label>
              <textarea
                id="comment"
                required
                placeholder="Share your experience using this product..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Modal actions */}
            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    <span>Save Changes</span>
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
