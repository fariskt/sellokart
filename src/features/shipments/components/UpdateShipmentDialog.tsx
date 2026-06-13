"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppDialog } from "@/components/AppDialog";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateShipment } from "../lib/shipments.action";
import { Shipment, ShipmentStatus } from "../lib/types";
import { toast } from "sonner";

const updateShipmentSchema = z.object({
  courier_name: z.string().trim().min(1, "Courier name is required"),
  tracking_number: z.string().trim().min(1, "Tracking number is required"),
  shipment_status: z.enum([
    "pending", "packed", "shipped", "in_transit",
    "out_for_delivery", "delivered", "returned", "cancelled",
  ], { required_error: "Shipment status is required" }),
  estimated_delivery: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

type UpdateShipmentFormValues = z.infer<typeof updateShipmentSchema>;

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "In Transit", value: "in_transit" },
  { label: "Out For Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Returned", value: "returned" },
  { label: "Cancelled", value: "cancelled" },
];

interface UpdateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
}

export function UpdateShipmentDialog({ open, onOpenChange, shipment }: UpdateShipmentDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors } } =
    useForm<UpdateShipmentFormValues>({
      resolver: zodResolver(updateShipmentSchema),
      defaultValues: {
        courier_name: "",
        tracking_number: "",
        shipment_status: "pending",
        estimated_delivery: null,
        notes: null,
      },
    });

  useEffect(() => {
    if (shipment) {
      reset({
        courier_name: shipment.courier_name ?? "",
        tracking_number: shipment.tracking_number ?? "",
        shipment_status: shipment.shipment_status,
        estimated_delivery: shipment.estimated_delivery ?? null,
        notes: shipment.notes ?? null,
      });
    }
  }, [shipment, reset]);

  const onSubmit = async (values: UpdateShipmentFormValues) => {
    if (!shipment) return;
    setIsSaving(true);
    try {
      const result = await updateShipment(shipment.id, {
        ...values,
        shipment_status: values.shipment_status as ShipmentStatus,
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
        Cancel
      </Button>
      <Button type="submit" form="update-shipment-form" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update Shipment"
      description={shipment ? `Update tracking for Order #${shipment.orders?.order_number ?? "-"}` : undefined}
      size="md"
      footer={footer}
    >
      {!shipment ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : (
        <form id="update-shipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Courier Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Courier Name
            </label>
            <Input {...register("courier_name")} placeholder="e.g. Delhivery, BlueDart" className="h-10" />
            {errors.courier_name && (
              <p className="text-xs text-destructive">{errors.courier_name.message}</p>
            )}
          </div>

          {/* Tracking Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Tracking Number
            </label>
            <Input {...register("tracking_number")} placeholder="e.g. DL12345678" className="h-10 font-mono" />
            {errors.tracking_number && (
              <p className="text-xs text-destructive">{errors.tracking_number.message}</p>
            )}
          </div>

          {/* Shipment Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Shipment Status
            </label>
            <Controller
              name="shipment_status"
              control={control}
              render={({ field }) => (
                <AppSelect
                  name="shipment_status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={statusOptions}
                  placeholder="Select Status"
                />
              )}
            />
            {errors.shipment_status && (
              <p className="text-xs text-destructive">{errors.shipment_status.message}</p>
            )}
          </div>

          {/* Estimated Delivery */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Estimated Delivery
            </label>
            <Input
              {...register("estimated_delivery")}
              type="date"
              className="h-10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Notes
            </label>
            <Input {...register("notes")} placeholder="Optional notes..." className="h-10" />
          </div>
        </form>
      )}
    </AppDialog>
  );
}
