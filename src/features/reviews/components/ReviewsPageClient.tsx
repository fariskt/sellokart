"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";

import { ReviewsHeader } from "./ReviewsHeader";
import { ReviewsStatsComponent } from "./ReviewsStats";
import { ReviewsFilters } from "./ReviewsFilters";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewDialog } from "./ReviewDialog";
import { ReviewReplyDialog } from "./ReviewReplyDialog";

import {
  getReviewById,
  approveReview,
  rejectReview,
  deleteReview,
} from "../lib/reviews.action";
import { Review, ReviewStats } from "../lib/types";

interface ReviewsPageClientProps {
  initialData: {
    data: Review[];
    stats: ReviewStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function ReviewsPageClient({ initialData }: ReviewsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [viewOpen, setViewOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // 1. View review details
  async function handleView(review: Review) {
    setSelectedReview(null);
    setViewOpen(true);

    const result = await getReviewById(review.id);
    if (result.success && result.data) {
      setSelectedReview(result.data);
    } else {
      setViewOpen(false);
      toast.error(result.message || "Failed to load review details.");
    }
  }

  // 2. Approve review
  function handleApprove(review: Review) {
    startTransition(async () => {
      const result = await approveReview(review.id);
      if (result.success) {
        toast.success(result.message ?? "Review approved successfully");
      } else {
        toast.error(result.message ?? "Failed to approve review");
      }
    });
  }

  // 3. Reject review
  function handleReject(review: Review) {
    startTransition(async () => {
      const result = await rejectReview(review.id);
      if (result.success) {
        toast.success(result.message ?? "Review rejected successfully");
      } else {
        toast.error(result.message ?? "Failed to reject review");
      }
    });
  }

  // 4. Open Reply Dialog
  function handleReply(review: Review) {
    setSelectedReview(review);
    setReplyOpen(true);
  }

  // 5. Delete review
  function handleDelete(review: Review) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the review from ${
        review.profiles?.name || "Anonymous"
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteReview(review.id);
      if (result.success) {
        toast.success(result.message ?? "Review deleted successfully");
      } else {
        toast.error(result.message ?? "Failed to delete review");
      }
    });
  }

  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <ReviewsHeader />

      <ReviewsStatsComponent stats={initialData.stats} />

      <ReviewsFilters />

      <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        <ReviewsTable
          reviews={initialData.data}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          onReply={handleReply}
          onDelete={handleDelete}
        />
      </div>

      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* View Details Dialog */}
      <ReviewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        review={selectedReview}
      />

      {/* Write Reply Dialog */}
      <ReviewReplyDialog
        open={replyOpen}
        onOpenChange={setReplyOpen}
        review={selectedReview}
        onSuccess={() => {
          // Re-fetch details if open, to update reply preview in place
          if (viewOpen && selectedReview) {
            handleView(selectedReview);
          }
        }}
      />
    </div>
  );
}
