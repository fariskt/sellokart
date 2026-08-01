"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";
import { Coupon } from "../lib/types";
import { createCoupon, updateCoupon } from "../lib/coupons.action";

// Schema for coupon input form
const couponFormSchema = z
  .object({
    code: z
      .string()
      .min(1, "Coupon code is required")
      .max(50, "Code cannot exceed 50 characters")
      .transform((val) => val.trim().toUpperCase()),
    description: z.string().max(250, "Description cannot exceed 250 characters").optional(),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.coerce.number().gt(0, "Discount value must be greater than 0"),
    minimum_order_amount: z.coerce.number().nonnegative("Minimum order amount cannot be negative"),
    maximum_discount: z.coerce.number().nonnegative("Maximum discount cannot be negative").optional(),
    usage_limit: z.coerce.number().int().gt(0, "Usage limit must be at least 1"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    is_active: z.enum(["true", "false"]),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      if (data.discount_type === "percentage") {
        return data.discount_value <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discount_value"],
    }
  );

type CouponFormData = z.infer<typeof couponFormSchema>;

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  onSuccess?: () => void;
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return "";
  return dateStr.split("T")[0] || "";
}

export function CouponDialog({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: CouponDialogProps) {
  const [isPending, startTransition] = useTransition();

  const isEdit = !!coupon;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema) as any,
    defaultValues: {
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      minimum_order_amount: 0,
      maximum_discount: 0,
      usage_limit: 1,
      start_date: "",
      end_date: "",
      is_active: "true",
    },
  });

  const watchedType = watch("discount_type");

  // Sync form defaults when coupon is supplied
  useEffect(() => {
    if (coupon) {
      reset({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        minimum_order_amount: coupon.minimum_order_amount,
        maximum_discount: coupon.maximum_discount || 0,
        usage_limit: coupon.usage_limit,
        start_date: formatDateForInput(coupon.start_date),
        end_date: formatDateForInput(coupon.end_date),
        is_active: coupon.is_active ? "true" : "false",
      });
    } else {
      reset({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        minimum_order_amount: 0,
        maximum_discount: 0,
        usage_limit: 100,
        start_date: "",
        end_date: "",
        is_active: "true",
      });
    }
  }, [coupon, reset, open]);

  function onSubmit(data: CouponFormData) {
    const formattedData = {
      ...data,
      is_active: data.is_active === "true",
      maximum_discount: data.discount_type === "percentage" && data.maximum_discount ? data.maximum_discount : null,
      // Convert date string input directly to ISO-String timestamp for Supabase
      start_date: new Date(data.start_date + "T00:00:00").toISOString(),
      end_date: new Date(data.end_date + "T23:59:59").toISOString(),
    };

    startTransition(async () => {
      let result;
      if (isEdit && coupon) {
        result = await updateCoupon(coupon.id, formattedData);
      } else {
        result = await createCoupon(formattedData);
      }

      if (result.success) {
        toast.success(result.message ?? `Coupon saved successfully`);
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message ?? `Failed to save coupon`);
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
      title={isEdit ? "Edit Coupon" : "Create Coupon"}
      description={isEdit ? `Modifying coupon: ${coupon?.code}` : "Configure a new discount code campaign"}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Coupon Code
            </label>
            <Input
              placeholder="e.g. SUMMER50"
              {...register("code")}
              disabled={isPending}
              className="h-10 text-sm uppercase"
            />
            {errors.code && (
              <p className="text-xs font-semibold text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <Input
              placeholder="e.g. ₹500 off on minimum purchase of..."
              {...register("description")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.description && (
              <p className="text-xs font-semibold text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Discount & Type Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Discount Type
            </label>
            <AppSelect
              key={`discount-type-${watchedType}`}
              name="discount_type"
              value={watchedType}
              onValueChange={(val) => setValue("discount_type", val as any)}
              options={[
                { label: "Percentage (%)", value: "percentage" },
                { label: "Fixed Amount (₹)", value: "fixed" },
              ]}
              disabled={isPending}
            />
            {errors.discount_type && (
              <p className="text-xs font-semibold text-destructive">{errors.discount_type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Discount Value
            </label>
            <Input
              type="number"
              placeholder={watchedType === "percentage" ? "e.g. 15" : "e.g. 500"}
              {...register("discount_value")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.discount_value && (
              <p className="text-xs font-semibold text-destructive">{errors.discount_value.message}</p>
            )}
          </div>
        </div>

        {/* Restrictions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Min Order Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="e.g. 999"
              {...register("minimum_order_amount")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.minimum_order_amount && (
              <p className="text-xs font-semibold text-destructive">{errors.minimum_order_amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Max Discount Amount (₹)
            </label>
            <Input
              type="number"
              placeholder={watchedType === "percentage" ? "e.g. 1000 (0 for unlimited)" : "Not applicable"}
              {...register("maximum_discount")}
              disabled={isPending || watchedType !== "percentage"}
              className="h-10 text-sm"
            />
            {errors.maximum_discount && (
              <p className="text-xs font-semibold text-destructive">{errors.maximum_discount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Usage Limit
            </label>
            <Input
              type="number"
              placeholder="e.g. 100"
              {...register("usage_limit")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.usage_limit && (
              <p className="text-xs font-semibold text-destructive">{errors.usage_limit.message}</p>
            )}
          </div>
        </div>

        {/* Validity & Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Start Date
            </label>
            <Input
              type="date"
              {...register("start_date")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.start_date && (
              <p className="text-xs font-semibold text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              End Date
            </label>
            <Input
              type="date"
              {...register("end_date")}
              disabled={isPending}
              className="h-10 text-sm"
            />
            {errors.end_date && (
              <p className="text-xs font-semibold text-destructive">{errors.end_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Initial Status
            </label>
            <AppSelect
              key={`active-${watch("is_active")}`}
              name="is_active"
              value={watch("is_active")}
              onValueChange={(val) => setValue("is_active", val as any)}
              options={[
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
              disabled={isPending}
            />
            {errors.is_active && (
              <p className="text-xs font-semibold text-destructive">{errors.is_active.message}</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
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
            {isPending ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}
