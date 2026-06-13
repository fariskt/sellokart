"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { ReviewRatingStars } from "./ReviewRatingStars";
import { Review } from "../lib/types";
import { replyToReview } from "../lib/reviews.action";

const replyFormSchema = z.object({
  reply: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

type ReplyFormData = z.infer<typeof replyFormSchema>;

interface ReviewReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  onSuccess?: () => void;
}

export function ReviewReplyDialog({
  open,
  onOpenChange,
  review,
  onSuccess,
}: ReviewReplyDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      reply: "",
    },
  });

  // Pre-fill the reply if the review already has one
  useEffect(() => {
    if (review) {
      reset({
        reply: review.admin_reply || "",
      });
    }
  }, [review, reset]);

  function onSubmit(data: ReplyFormData) {
    if (!review) return;

    startTransition(async () => {
      const result = await replyToReview(review.id, data.reply);

      if (result.success) {
        toast.success(result.message ?? "Reply submitted successfully");
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message ?? "Failed to submit reply");
      }
    });
  }

  if (!review) return null;

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          reset();
          onOpenChange(v);
        }
      }}
      title={review.admin_reply ? "Edit Admin Reply" : "Reply to Review"}
      description={`Replying to review from ${review.profiles?.name || "Anonymous"}`}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Review Context Block */}
        <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-foreground">
              {review.profiles?.name || "Anonymous"}
            </span>
            <ReviewRatingStars rating={review.rating} starClassName="w-3 h-3" />
          </div>
          <p className="text-muted-foreground italic leading-relaxed">
            "{review.comment || "No comment provided."}"
          </p>
        </div>

        {/* Textarea Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="reply-text"
            className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
          >
            Your Response
          </label>
          <textarea
            id="reply-text"
            placeholder="Thank you for your feedback! We are glad you enjoyed the product..."
            rows={5}
            {...register("reply")}
            className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
          />
          {errors.reply && (
            <p className="text-xs font-semibold text-destructive mt-0.5">
              {errors.reply.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="cursor-pointer">
            {isPending
              ? "Submitting..."
              : review.admin_reply
              ? "Update Reply"
              : "Submit Reply"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}
