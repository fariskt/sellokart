"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { adjustStock } from "../lib/inventory.action";
import { InventoryItem } from "../lib/types";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSuccess?: () => void;
}

const adjustmentSchema = z.object({
  type: z.enum(["restock", "adjustment", "damaged", "return"]),
  direction: z.enum(["add", "remove"]).optional(),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Must be a whole number")
    .positive("Quantity must be greater than 0"),
  notes: z.string().max(500).optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

const typeOptions = [
  { label: "Restock", value: "restock" },
  { label: "Return (from customer)", value: "return" },
  { label: "Damaged / Write-off", value: "damaged" },
  { label: "Manual Adjustment", value: "adjustment" },
];

const directionOptions = [
  { label: "Add to stock", value: "add" },
  { label: "Remove from stock", value: "remove" },
];

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: "restock",
      direction: "add",
      quantity: undefined,
      notes: "",
    },
  });

  const watchedType = watch("type");
  const showDirection = watchedType === "adjustment";

  function onSubmit(data: AdjustmentFormData) {
    if (!item) return;

    startTransition(async () => {
      const result = await adjustStock({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: data.quantity,
        type: data.type,
        notes: data.notes ?? null,
        direction: showDirection ? data.direction : undefined,
      });

      if (result.success) {
        toast.success(result.message ?? "Stock adjusted successfully");
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message ?? "Failed to adjust stock");
      }
    });
  }

  if (!item) return null;

  const isDeduct = watchedType === "damaged" || (showDirection && watch("direction") === "remove");

  return (
    <AppDialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          reset();
          onOpenChange(v);
        }
      }}
      title="Adjust Stock"
      description={`Adjusting stock for: ${item.name}${item.variant_name !== "-" ? ` — ${item.variant_name}` : ""}`}
      size="sm"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Adjustment"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Current Stock Display */}
        <div className="rounded-lg border border-border bg-muted/40 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Current Stock
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{item.stock}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              SKU
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{item.sku ?? "-"}</p>
          </div>
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Adjustment Type
          </label>
          <AppSelect
            name="type"
            value={watchedType}
            onValueChange={(val) =>
              setValue("type", val as AdjustmentFormData["type"], { shouldValidate: true })
            }
            options={typeOptions}
            placeholder="Select type"
          />
          {errors.type && (
            <p className="text-xs text-destructive">{errors.type.message}</p>
          )}
        </div>

        {/* Direction — only for "adjustment" type */}
        {showDirection && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Direction
            </label>
            <AppSelect
              name="direction"
              value={watch("direction") ?? "add"}
              onValueChange={(val) =>
                setValue("direction", val as "add" | "remove", { shouldValidate: true })
              }
              options={directionOptions}
              placeholder="Direction"
            />
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Quantity
          </label>
          <Input
            type="number"
            min={1}
            {...register("quantity", { valueAsNumber: true })}
            placeholder="e.g. 50"
            className="h-10"
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">{errors.quantity.message}</p>
          )}
          {isDeduct && (
            <p className="text-xs text-amber-600">
              ⚠ This will reduce stock by the entered quantity.
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Notes <span className="font-normal normal-case">(optional)</span>
          </label>
          <Input
            {...register("notes")}
            placeholder="Reason for adjustment..."
            className="h-10"
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </form>
    </AppDialog>
  );
}
