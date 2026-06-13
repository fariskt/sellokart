"use client";

import { AppDialog } from "@/components/AppDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Review } from "../lib/types";
import { ReviewRatingStars } from "./ReviewRatingStars";
import type { ReactNode } from "react";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review?: Review | null;
}

export function ReviewDialog({
  open,
  onOpenChange,
  review,
}: ReviewDialogProps) {
  if (!review) return null;

  const product = review.products;
  const productName = product?.name || "Deleted Product";

  // Find primary image or use first image
  const images = product?.product_images ?? [];
  const primaryImage = images.find((img) => img.is_primary) ?? images[0];
  const imageUrl = primaryImage?.image_url || "/images/headphones.png";

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      rejected: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    };
    return (
      <Badge
        variant="outline"
        className={`uppercase tracking-wider text-xs font-semibold ${
          styles[status] ?? "border-border"
        }`}
      >
        {status}
      </Badge>
    );
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Review Details"
      description={`Viewing review moderation card`}
      size="xl"
    >
      <div className="space-y-5 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Product & Customer info */}
          <div className="space-y-4">
            <DetailsSection title="Product Information">
              <div className="flex items-center gap-3 p-1">
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
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                    {productName}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {review.product_id}
                  </p>
                </div>
              </div>
            </DetailsSection>

            <DetailsSection title="Customer Information">
              <div className="space-y-1 px-1">
                <p className="text-sm font-semibold text-foreground">
                  {review.profiles?.name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {review.profiles?.email || "-"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                  User ID: {review.user_id}
                </p>
              </div>
            </DetailsSection>
          </div>

          {/* Right: Review details */}
          <div className="space-y-4">
            <DetailsSection title="Review Content">
              <div className="space-y-3 px-1">
                <div className="flex items-center justify-between gap-4">
                  <ReviewRatingStars rating={review.rating} starClassName="w-4 h-4" />
                  {getStatusBadge(review.status)}
                </div>

                <div className="bg-muted/30 border-l-2 border-primary/20 rounded-r-md p-3">
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{review.comment || <span className="text-muted-foreground/60">No comment text submitted.</span>}"
                  </p>
                </div>

                <div className="text-[10px] text-muted-foreground font-semibold">
                  Submitted on {formatDate(review.created_at)}
                </div>
              </div>
            </DetailsSection>
          </div>
        </div>

        {/* Bottom: Admin Reply */}
        <DetailsSection title="Official Admin Reply">
          <div className="px-1 py-1">
            {review.admin_reply ? (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                  Admin Response:
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {review.admin_reply}
                </p>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-border rounded-lg">
                <p className="text-xs text-muted-foreground">
                  No reply has been submitted for this review yet.
                </p>
              </div>
            )}
          </div>
        </DetailsSection>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </AppDialog>
  );
}

function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border p-4 bg-card shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
