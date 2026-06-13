"use client";

import { Star, MessageSquare, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomerReview } from "../lib/types";

interface CustomerReviewsTabProps {
  reviews: CustomerReview[];
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

export function CustomerReviewsTab({ reviews }: CustomerReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
        <h3 className="text-sm font-semibold text-foreground">No reviews found</h3>
        <p className="mt-1 text-xs text-muted-foreground">This customer has not submitted any product reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {reviews.map((review) => {
        const product = review.products;
        const productName = product?.name || "Deleted Product";

        // Find primary image or use first image
        const images = product?.product_images ?? [];
        const primaryImage = images.find((img) => img.is_primary) ?? images[0];
        const imageUrl = primaryImage?.image_url || "/images/headphones.png";

        return (
          <div
            key={review.id}
            className="border border-border rounded-lg bg-card p-5 shadow-2xs flex flex-col sm:flex-row items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              {/* Product Thumbnail */}
              <div className="w-14 h-14 bg-muted/40 rounded-lg border border-border p-1.5 flex items-center justify-center shrink-0">
                <img
                  src={imageUrl}
                  alt={productName}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/headphones.png";
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-semibold text-foreground text-sm leading-snug">
                  {productName}
                </h4>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < review.rating ? "text-amber-500 fill-amber-500" : "text-border"
                      )}
                    />
                  ))}
                </div>

                {review.comment && (
                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/20 border-l-2 border-primary/20 pl-3 py-1 mt-1 flex items-start gap-1">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/40" />
                    <span>"{review.comment}"</span>
                  </p>
                )}

                <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Reviewed on {formatDate(review.created_at)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
