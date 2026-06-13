"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppDialog } from "@/components/AppDialog";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";
import { updateOrderStatus, updatePaymentStatus } from "../lib/orders.action";
import { Order, OrderStatus, PaymentStatus } from "../lib/types";
import { toast } from "sonner";

// Zod validation schema for updating status
const updateStatusSchema = z.object({
  status: z.enum(
    ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"],
    {
      required_error: "Order status is required",
    }
  ),
  payment_status: z.enum(
    ["pending", "paid", "failed", "refunded"],
    {
      required_error: "Payment status is required",
    }
  ),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface UpdateOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const orderStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const paymentStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export function UpdateOrderStatusDialog({
  open,
  onOpenChange,
  order,
}: UpdateOrderStatusDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: "pending",
      payment_status: "pending",
    },
  });

  // Sync state when order changes
  useEffect(() => {
    if (order) {
      reset({
        status: order.status,
        payment_status: order.payment_status,
      });
    }
  }, [order, reset]);

  const onSubmit = async (values: UpdateStatusFormValues) => {
    if (!order) return;

    setIsSaving(true);
    try {
      const [statusResult, paymentResult] = await Promise.all([
        updateOrderStatus(order.id, values.status as OrderStatus),
        updatePaymentStatus(order.id, values.payment_status as PaymentStatus),
      ]);

      if (statusResult.success && paymentResult.success) {
        toast.success("Order and payment statuses updated successfully.");
        onOpenChange(false);
      } else {
        if (!statusResult.success) {
          toast.error(`Order status error: ${statusResult.message}`);
        }
        if (!paymentResult.success) {
          toast.error(`Payment status error: ${paymentResult.message}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred while updating status.");
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="update-status-form"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update Status"
      description={order ? `Manage status for Order #${order.order_number}` : undefined}
      size="md"
      footer={footer}
    >
      {!order ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading status...
        </div>
      ) : (
        <form
          id="update-status-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            {/* Order Status Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Order Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    name="status"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={orderStatusOptions}
                    placeholder="Select Order Status"
                  />
                )}
              />
              {errors.status && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Payment Status Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Payment Status
              </label>
              <Controller
                name="payment_status"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    name="payment_status"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={paymentStatusOptions}
                    placeholder="Select Payment Status"
                  />
                )}
              />
              {errors.payment_status && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {errors.payment_status.message}
                </p>
              )}
            </div>
          </div>
        </form>
      )}
    </AppDialog>
  );
}
