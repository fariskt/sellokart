"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppSelect } from "@/components/AppSelect";
import { createNotification, getUserByEmail } from "../lib/notifications.action";

const notificationFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Recipient email is required"),
  type: z.enum(["order", "payment", "shipment", "return", "coupon", "system"] as const, {
    required_error: "Notification type is required",
  }),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
  action_url: z
    .string()
    .url("Invalid URL format")
    .or(z.string().startsWith("/"))
    .or(z.literal(""))
    .optional(),
});

type NotificationFormData = z.infer<typeof notificationFormSchema>;

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: NotificationDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      email: "",
      type: "system",
      title: "",
      message: "",
      action_url: "",
    },
  });

  const watchedType = watch("type");

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  function onSubmit(data: NotificationFormData) {
    startTransition(async () => {
      // 1. Resolve email to user_id
      const userRes = await getUserByEmail(data.email);
      if (!userRes.success || !userRes.data) {
        toast.error(userRes.message ?? "Failed to find recipient user");
        return;
      }

      // 2. Dispatch notification
      const result = await createNotification({
        user_id: userRes.data.id,
        title: data.title,
        message: data.message,
        type: data.type,
        action_url: data.action_url || null,
      });

      if (result.success) {
        toast.success(result.message ?? "Notification dispatched successfully");
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message ?? "Failed to send notification");
      }
    });
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          reset();
          onOpenChange(v);
        }
      }}
      title="Compose Notification"
      description="Send a direct alert/notification message to a single customer by email"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Recipient Email & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Recipient Email
            </label>
            <Input
              type="email"
              placeholder="customer@example.com"
              {...register("email")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.email && (
              <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Notification Type
            </label>
            <AppSelect
              key={`type-${watchedType}`}
              name="type"
              value={watchedType}
              onValueChange={(val) => setValue("type", val as any)}
              options={[
                { label: "System", value: "system" },
                { label: "Order Update", value: "order" },
                { label: "Payment Alert", value: "payment" },
                { label: "Shipment Alert", value: "shipment" },
                { label: "Return Update", value: "return" },
                { label: "Coupon/Promo", value: "coupon" },
              ]}
              disabled={isPending}
            />
            {errors.type && (
              <p className="text-xs font-semibold text-destructive">{errors.type.message}</p>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Notification Title
          </label>
          <Input
            placeholder="e.g. Account Verification Completed"
            {...register("title")}
            disabled={isPending}
            className="h-10 text-sm"
          />
          {errors.title && (
            <p className="text-xs font-semibold text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Message Body */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Message Body
          </label>
          <Textarea
            placeholder="Write details of the notification alert here..."
            {...register("message")}
            disabled={isPending}
            className="min-h-[120px] text-sm resize-none"
          />
          {errors.message && (
            <p className="text-xs font-semibold text-destructive">{errors.message.message}</p>
          )}
        </div>

        {/* Action URL */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Action URL (Optional redirect)
          </label>
          <Input
            placeholder="e.g. /account/orders or https://example.com"
            {...register("action_url")}
            disabled={isPending}
            className="h-10 text-sm"
          />
          {errors.action_url && (
            <p className="text-xs font-semibold text-destructive">{errors.action_url.message}</p>
          )}
        </div>

        {/* Actions */}
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
            {isPending ? "Sending..." : "Send Notification"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}
