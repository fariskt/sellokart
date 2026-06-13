"use client";

import { Review } from "../lib/types";
import { ReviewRatingStars } from "./ReviewRatingStars";
import { RatingDistributionChart } from "./RatingDistributionChart";
import { MessageSquare, Calendar, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductReviewsTabProps {
  reviews: Review[];
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    rejected: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  return (
    <Badge
      variant="outline"
      className={`uppercase tracking-wider text-[10px] font-semibold py-0 px-2 ${
        styles[status] ?? "border-border"
      }`}
    >
      {status}
    </Badge>
  );
}

export function ProductReviewsTab({ reviews }: ProductReviewsTabProps) {
  // 1. Calculate stats on-the-fly
  const total = reviews.length;
  const pending = reviews.filter((r) => r.status === "pending").length;
  const approved = reviews.filter((r) => r.status === "approved").length;
  const rejected = reviews.filter((r) => r.status === "rejected").length;
  const averageRating =
    total > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10) / 10
      : 0;

  const stats = {
    total,
    pending,
    approved,
    rejected,
    averageRating,
  };

  // 2. Calculate distribution on-the-fly
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => Number(r.rating) === rating).length;
    return {
      rating,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card shadow-2xs">
        <h3 className="text-sm font-semibold text-foreground">No reviews found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          No customer reviews have been submitted for this product yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics chart */}
      <RatingDistributionChart distribution={distribution} stats={stats} />

      {/* Reviews feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Reviews History ({reviews.length})
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-border rounded-lg bg-card p-5 shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground text-sm">
                      {review.profiles?.name || "Anonymous"}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {review.profiles?.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ReviewRatingStars rating={review.rating} />
                  {getStatusBadge(review.status)}
                </div>
              </div>

              {/* Review Comment */}
              <div className="bg-muted/20 border-l-2 border-primary/20 p-3 rounded-r-md">
                <p className="text-xs text-muted-foreground leading-relaxed italic flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/45" />
                  <span>
                    "{review.comment || (
                      <span className="text-muted-foreground/50">
                        No comment submitted.
                      </span>
                    )}"
                  </span>
                </p>
              </div>

              {/* Date & Admin Reply */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5 border-t border-border/60 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  Reviewed on {formatDate(review.created_at)}
                </div>

                {review.admin_reply && (
                  <div className="flex items-start gap-1 bg-primary/5 text-primary px-2 py-1 rounded-md border border-primary/10 max-w-full">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="leading-snug truncate">
                      <strong>Admin Response:</strong> "{review.admin_reply}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
