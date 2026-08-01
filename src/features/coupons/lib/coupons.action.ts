"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";
import {
  Coupon,
  CouponStats,
  CouponUsage,
  GetCouponsParams,
} from "./types";

// ─── Zod Validation Schema ───────────────────────────────────────────────────

const couponInputSchema = z
  .object({
    code: z
      .string()
      .min(1, "Coupon code is required")
      .transform((val) => val.trim().toUpperCase()),
    discount_type: z.enum(["percentage", "fixed"], {
      error: "Discount type is required",
    }),
    discount_value: z.number().gt(0, "Discount value must be greater than 0"),
    minimum_order_amount: z
      .number()
      .nonnegative("Minimum order amount cannot be negative"),
    maximum_discount: z.number().nullable().optional(),
    description: z.string().nullable().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    usage_limit: z
      .number()
      .int()
      .gt(0, "Usage limit must be at least 1"),
    is_active: z.boolean().default(true),
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

// ─── Get All Coupons ─────────────────────────────────────────────────────────

/**
 * Fetch all coupons with usage count
 */
export async function getCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("*, coupon_usage(count)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((c) => ({
    ...c,
    usage_count: c.coupon_usage?.[0]?.count ?? 0,
  })) as Coupon[];
}

// ─── Get Paginated Coupons ────────────────────────────────────────────────────

/**
 * Fetch filtered, paginated coupons with dynamic store stats
 */
export async function getCouponsPaginated({
  page = 1,
  limit = 10,
  search,
  status,
  discountType,
}: GetCouponsParams) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Setup paginated query bounds
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("coupons")
    .select("*, coupon_usage(count)", { count: "exact" });

  // 2. Search filter (code or description)
  if (search) {
    const s = search.trim();
    query = query.or(`code.ilike.%${s}%,description.ilike.%${s}%`);
  }

  // 3. Discount type filter
  if (discountType && discountType !== "all") {
    query = query.eq("discount_type", discountType);
  }

  // 4. Status filter (active, inactive, expired)
  if (status && status !== "all") {
    if (status === "active") {
      query = query.eq("is_active", true).gte("end_date", now);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    } else if (status === "expired") {
      query = query.lt("end_date", now);
    }
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const formatted = (data ?? []).map((c) => ({
    ...c,
    usage_count: c.coupon_usage?.[0]?.count ?? 0,
  })) as Coupon[];

  // 5. Fetch store stats
  const stats = await getCouponStats();

  return {
    data: formatted,
    stats,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

// ─── Get Coupon by ID ─────────────────────────────────────────────────────────

/**
 * Fetch a single coupon with full details, usage logs, profile names, and order numbers.
 */
export async function getCouponById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select(`
      *,
      coupon_usage (
        id,
        used_at,
        profiles:user_id (
          id,
          name,
          email
        ),
        orders:order_id (
          id,
          order_number,
          total,
          status,
          payment_status,
          created_at
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }

  // Inject computed discount amount for each historical usage
  const usages = (data.coupon_usage ?? []).map((u: any) => {
    let discountAmount = 0;
    const order = u.orders;
    if (order) {
      if (data.discount_type === "fixed") {
        discountAmount = Math.min(Number(data.discount_value), Number(order.total));
      } else {
        let disc = (Number(order.total) * Number(data.discount_value)) / 100;
        if (data.maximum_discount && data.maximum_discount > 0) {
          disc = Math.min(disc, Number(data.maximum_discount));
        }
        discountAmount = disc;
      }
    }
    return {
      ...u,
      discount_amount: discountAmount,
    };
  });

  return {
    success: true,
    data: {
      ...data,
      usage_count: usages.length,
      coupon_usage: usages,
    },
  };
}

// ─── Create Coupon ───────────────────────────────────────────────────────────

export async function createCoupon(input: any) {
  const validation = couponInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid coupon details",
    };
  }

  const supabase = await createClient();
  const data = validation.data;

  // Code uniqueness check
  const { data: existing } = await supabase
    .from("coupons")
    .select("id")
    .eq("code", data.code)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Coupon code already exists" };
  }

  const { data: newCoupon, error } = await supabase
    .from("coupons")
    .insert([data])
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/coupons");

  await createAuditLog({
    action: "Coupon Created",
    tableName: "coupons",
    recordId: newCoupon?.id || "unknown",
    entityName: data.code,
    metadata: {
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      is_active: data.is_active,
    },
  });

  return { success: true, message: "Coupon created successfully" };
}

// ─── Update Coupon ───────────────────────────────────────────────────────────

export async function updateCoupon(id: string, input: any) {
  const validation = couponInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid coupon details",
    };
  }

  const supabase = await createClient();
  const data = validation.data;

  // Code uniqueness check (excluding current record)
  const { data: existing } = await supabase
    .from("coupons")
    .select("id")
    .eq("code", data.code)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Coupon code already exists" };
  }

  const { error } = await supabase.from("coupons").update(data).eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/coupons");

  await createAuditLog({
    action: "Coupon Updated",
    tableName: "coupons",
    recordId: id,
    entityName: data.code,
    metadata: {
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      is_active: data.is_active,
    },
  });

  return { success: true, message: "Coupon updated successfully" };
}

// ─── Delete Coupon ───────────────────────────────────────────────────────────

export async function deleteCoupon(id: string) {
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("code")
    .eq("id", id)
    .single();

  const entityName = coupon?.code || "Coupon";

  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/coupons");

  await createAuditLog({
    action: "Coupon Deleted",
    tableName: "coupons",
    recordId: id,
    entityName: entityName,
    metadata: {
      id,
    },
  });

  return { success: true, message: "Coupon deleted successfully" };
}

// ─── Activate Coupon ─────────────────────────────────────────────────────────

export async function activateCoupon(id: string) {
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("code")
    .eq("id", id)
    .single();

  const entityName = coupon?.code || "Coupon";

  const { error } = await supabase
    .from("coupons")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/coupons");

  await createAuditLog({
    action: "Coupon Updated",
    tableName: "coupons",
    recordId: id,
    entityName: entityName,
    metadata: {
      is_active: true,
      change: "activate",
    },
  });

  return { success: true, message: "Coupon activated successfully" };
}

// ─── Deactivate Coupon ───────────────────────────────────────────────────────

export async function deactivateCoupon(id: string) {
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("code")
    .eq("id", id)
    .single();

  const entityName = coupon?.code || "Coupon";

  const { error } = await supabase
    .from("coupons")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/coupons");

  await createAuditLog({
    action: "Coupon Updated",
    tableName: "coupons",
    recordId: id,
    entityName: entityName,
    metadata: {
      is_active: false,
      change: "deactivate",
    },
  });

  return { success: true, message: "Coupon deactivated successfully" };
}

// ─── Get Coupon Usage Logs ────────────────────────────────────────────────────

export async function getCouponUsage(couponId: string): Promise<CouponUsage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupon_usage")
    .select(`
      id,
      coupon_id,
      user_id,
      order_id,
      used_at,
      profiles:user_id (
        id,
        name,
        email
      ),
      orders:order_id (
        id,
        order_number,
        total,
        status,
        payment_status,
        created_at
      )
    `)
    .eq("coupon_id", couponId)
    .order("used_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch the parent coupon parameters for calculation
  const { data: coupon } = await supabase
    .from("coupons")
    .select("discount_type, discount_value, maximum_discount")
    .eq("id", couponId)
    .single();

  return (data ?? []).map((u: any) => {
    let discountAmount = 0;
    const order = u.orders;
    if (order && coupon) {
      if (coupon.discount_type === "fixed") {
        discountAmount = Math.min(Number(coupon.discount_value), Number(order.total));
      } else {
        let disc = (Number(order.total) * Number(coupon.discount_value)) / 100;
        if (coupon.maximum_discount && coupon.maximum_discount > 0) {
          disc = Math.min(disc, Number(coupon.maximum_discount));
        }
        discountAmount = disc;
      }
    }
    return {
      ...u,
      discount_amount: discountAmount,
    };
  }) as unknown as CouponUsage[];
}

// ─── Validate Coupon ─────────────────────────────────────────────────────────

/**
 * Validate a coupon code before checkout application
 */
export async function validateCoupon(
  code: string,
  orderAmount: number,
  userEmail?: string
) {
  const supabase = await createClient();
  const c = code.trim().toUpperCase();

  // 1. Fetch coupon and linked usages in one query
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select(`
      *,
      coupon_usage (
        id,
        user_id,
        profiles:user_id (
          email
        )
      )
    `)
    .eq("code", c)
    .maybeSingle();

  if (error || !coupon) {
    return { success: false, message: "Coupon code does not exist" };
  }

  // 2. Check activation status
  if (!coupon.is_active) {
    return { success: false, message: "This coupon is currently inactive" };
  }

  // 3. Check dates bounds
  const now = new Date();
  const start = new Date(coupon.start_date);
  const end = new Date(coupon.end_date);
  if (now < start) {
    return { success: false, message: "Coupon is not yet active" };
  }
  if (now > end) {
    return { success: false, message: "This coupon has expired" };
  }

  // 4. Check global usage limit
  const usages = coupon.coupon_usage ?? [];
  if (usages.length >= coupon.usage_limit) {
    return { success: false, message: "Coupon usage limit has been reached" };
  }

  // 5. Check if user already used this coupon (one use per customer rule)
  if (userEmail) {
    const alreadyUsed = usages.some(
      (u: any) => u.profiles?.email?.toLowerCase() === userEmail.toLowerCase()
    );
    if (alreadyUsed) {
      return { success: false, message: "You have already used this coupon" };
    }
  }

  // 6. Check order minimum threshold
  if (orderAmount < coupon.minimum_order_amount) {
    return {
      success: false,
      message: `Minimum order amount of ₹${coupon.minimum_order_amount} is not satisfied`,
    };
  }

  // 7. Compute dynamic discount value
  let discount = 0;
  if (coupon.discount_type === "fixed") {
    discount = Math.min(Number(coupon.discount_value), Number(orderAmount));
  } else {
    let disc = (Number(orderAmount) * Number(coupon.discount_value)) / 100;
    if (coupon.maximum_discount && coupon.maximum_discount > 0) {
      disc = Math.min(disc, Number(coupon.maximum_discount));
    }
    discount = disc;
  }

  return {
    success: true,
    message: "Coupon validated successfully",
    data: {
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: discount,
    },
  };
}

// ─── Get Coupon Stats ─────────────────────────────────────────────────────────

export async function getCouponStats(): Promise<CouponStats> {
  const supabase = await createClient();

  const { data: coupons, error: cError } = await supabase
    .from("coupons")
    .select("is_active, end_date");

  const { data: usages, error: uError } = await supabase
    .from("coupon_usage")
    .select(`
      id,
      coupons (
        discount_type,
        discount_value,
        maximum_discount
      ),
      orders (
        total
      )
    `);

  if (cError || uError) {
    console.error("Stats query failed:", cError?.message || uError?.message);
    return {
      total: 0,
      active: 0,
      expired: 0,
      totalUses: 0,
      totalDiscount: 0,
    };
  }

  const cArr = coupons ?? [];
  const uArr = usages ?? [];

  const total = cArr.length;
  const active = cArr.filter(
    (c) => c.is_active && new Date(c.end_date) >= new Date()
  ).length;
  const expired = cArr.filter((c) => new Date(c.end_date) < new Date()).length;

  const totalUses = uArr.length;

  // Calculate lifetime discount sum dynamically
  let totalDiscount = 0;
  uArr.forEach((u: any) => {
    const coupon = u.coupons;
    const order = u.orders;
    if (!coupon || !order) return;

    if (coupon.discount_type === "fixed") {
      totalDiscount += Math.min(Number(coupon.discount_value), Number(order.total));
    } else {
      let disc = (Number(order.total) * Number(coupon.discount_value)) / 100;
      if (coupon.maximum_discount && coupon.maximum_discount > 0) {
        disc = Math.min(disc, Number(coupon.maximum_discount));
      }
      totalDiscount += disc;
    }
  });

  return {
    total,
    active,
    expired,
    totalUses,
    totalDiscount,
  };
}
