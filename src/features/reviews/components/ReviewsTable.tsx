"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Check,
  X,
  MessageSquare,
  Trash,
} from "lucide-react";
import { Review } from "../lib/types";
import { ReviewRatingStars } from "./ReviewRatingStars";

interface ReviewsTableProps {
  reviews: Review[];
  onView: (review: Review) => void;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onReply: (review: Review) => void;
  onDelete: (review: Review) => void;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    rejected: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
        styles[status] ?? "border-border"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
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

export function ReviewsTable({
  reviews,
  onView,
  onApprove,
  onReject,
  onReply,
  onDelete,
}: ReviewsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="max-w-[280px]">Comment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {reviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold text-foreground">No reviews found</span>
                  <span className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            reviews.map((review) => {
              const product = review.products;
              const productName = product?.name || "Deleted Product";

              // Find primary image or use first image
              const images = product?.product_images ?? [];
              const primaryImage = images.find((img) => img.is_primary) ?? images[0];
              const imageUrl = primaryImage?.image_url || "/images/headphones.png";

              return (
                <TableRow
                  key={review.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Product Column */}
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted/40 rounded-md border border-border p-1 flex items-center justify-center shrink-0">
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/headphones.png";
                          }}
                        />
                      </div>
                      <span className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">
                        {productName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Customer Column */}
                  <TableCell className="min-w-[150px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm">
                        {review.profiles?.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {review.profiles?.email || "-"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Rating Column */}
                  <TableCell>
                    <ReviewRatingStars rating={review.rating} />
                  </TableCell>

                  {/* Comment Column */}
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-foreground line-clamp-2 leading-snug">
                        {review.comment || (
                          <span className="text-xs text-muted-foreground/60 italic">
                            No comment provided
                          </span>
                        )}
                      </p>
                      {review.admin_reply && (
                        <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                          <MessageSquare className="w-3 h-3" />
                          <span>Replied</span>
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell>{getStatusBadge(review.status)}</TableCell>

                  {/* Date Column */}
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(review.created_at)}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onView(review)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>

                        {review.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => onApprove(review)}>
                              <Check className="mr-2 h-4 w-4 text-emerald-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReject(review)}>
                              <X className="mr-2 h-4 w-4 text-rose-600" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuItem onClick={() => onReply(review)}>
                          <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                          {review.admin_reply ? "Edit Reply" : "Reply"}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onDelete(review)}
                          className="text-rose-600 hover:text-rose-700 focus:text-rose-700"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
