"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppSelect } from "@/components/AppSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendBulkNotification, getCustomersForBulkSelect } from "../lib/notifications.action";

const bulkNotificationFormSchema = z.object({
  recipient: z.enum(["all", "selected"] as const),
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

type BulkNotificationFormData = z.infer<typeof bulkNotificationFormSchema>;

interface BulkNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkNotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkNotificationDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState<{ id: string; name: string | null; email: string | null }[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BulkNotificationFormData>({
    resolver: zodResolver(bulkNotificationFormSchema),
    defaultValues: {
      recipient: "all",
      type: "system",
      title: "",
      message: "",
      action_url: "",
    },
  });

  const watchedRecipient = watch("recipient");
  const watchedType = watch("type");

  // Load customer profiles on dialog open
  useEffect(() => {
    if (open) {
      setLoadingCustomers(true);
      getCustomersForBulkSelect()
        .then(setCustomers)
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load customer directory");
        })
        .finally(() => setLoadingCustomers(false));
    } else {
      setSelectedUserIds([]);
      setCustomerSearch("");
      reset();
    }
  }, [open, reset]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  function handleSelectUser(userId: string, checked: boolean) {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  }

  function handleToggleAllFiltered() {
    const filteredIds = filteredCustomers.map((c) => c.id);
    const allFilteredSelected = filteredIds.every((id) => selectedUserIds.includes(id));

    if (allFilteredSelected) {
      // Deselect all filtered
      setSelectedUserIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedUserIds((prev) => {
        const union = new Set([...prev, ...filteredIds]);
        return Array.from(union);
      });
    }
  }

  function onSubmit(data: BulkNotificationFormData) {
    if (data.recipient === "selected" && selectedUserIds.length === 0) {
      toast.error("Please select at least one customer to receive this notification");
      return;
    }

    startTransition(async () => {
      const result = await sendBulkNotification({
        recipient: data.recipient,
        user_ids: data.recipient === "selected" ? selectedUserIds : undefined,
        title: data.title,
        message: data.message,
        type: data.type,
        action_url: data.action_url || null,
      });

      if (result.success) {
        toast.success(result.message ?? "Bulk notification queued and sent successfully");
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message ?? "Failed to dispatch bulk notifications");
      }
    });
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
        }
      }}
      title="Bulk Dispatch Notification"
      description="Send a broadcast notification to all active customers or selected accounts"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Recipient Target & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Recipient Segment
            </label>
            <AppSelect
              key={`recipient-${watchedRecipient}`}
              name="recipient"
              value={watchedRecipient}
              onValueChange={(val) => setValue("recipient", val as any)}
              options={[
                { label: "All Customers", value: "all" },
                { label: "Selected Accounts", value: "selected" },
              ]}
              disabled={isPending}
            />
            {errors.recipient && (
              <p className="text-xs font-semibold text-destructive">{errors.recipient.message}</p>
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
                { label: "System Broadcaster", value: "system" },
                { label: "Coupon / Campaign Promotion", value: "coupon" },
                { label: "Order Broadcast Update", value: "order" },
                { label: "Payment Notice", value: "payment" },
              ]}
              disabled={isPending}
            />
            {errors.type && (
              <p className="text-xs font-semibold text-destructive">{errors.type.message}</p>
            )}
          </div>
        </div>

        {/* Selected Customer Checklist (Conditional) */}
        {watchedRecipient === "selected" && (
          <div className="space-y-2 border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Recipient Directory ({selectedUserIds.length} Selected)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Filter customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="h-8 w-full sm:w-48 text-xs bg-muted/30"
                  disabled={isPending || loadingCustomers}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleAllFiltered}
                  disabled={isPending || loadingCustomers || filteredCustomers.length === 0}
                  className="h-8 text-xs shrink-0 cursor-pointer"
                >
                  Toggle All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-44 rounded-md border border-border bg-muted/10 p-2">
              {loadingCustomers ? (
                <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
                  Syncing customer directories...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
                  No matches found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCustomers.map((customer) => {
                    const isChecked = selectedUserIds.includes(customer.id);
                    return (
                      <div
                        key={customer.id}
                        onClick={() => handleSelectUser(customer.id, !isChecked)}
                        className={`flex items-center space-x-2 rounded-md border p-2 cursor-pointer transition-colors ${isChecked ? "bg-primary/5 border-primary/35" : "bg-card border-border/60 hover:bg-muted/30"}`}
                      >
                        <Checkbox
                          id={`customer-${customer.id}`}
                          checked={isChecked}
                          onCheckedChange={(val) => handleSelectUser(customer.id, !!val)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold truncate leading-tight">
                            {customer.name || "Guest Customer"}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {customer.email || "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Broadcast Title
          </label>
          <Input
            placeholder="e.g. End of Season Sale Launch!"
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
            Broadcast Message Body
          </label>
          <Textarea
            placeholder="Write details of the broadcast alert..."
            {...register("message")}
            disabled={isPending}
            className="min-h-[100px] text-sm resize-none"
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
            placeholder="e.g. /shop or https://example.com"
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
            {isPending ? "Broadcasting..." : "Broadcast Alert"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}
