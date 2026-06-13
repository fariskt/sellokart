"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "@/features/audit-logs/lib/audit-log.action";
import {
  GetReviewsParams,
  RatingDistribution,
  Review,
  ReviewStats,
} from "./types";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const reviewStatusSchema = z.enum(["pending", "approved", "rejected"], {
  required_error: "Status is required",
  invalid_type_error: "Invalid review status",
});

const replySchema = z.object({
  reply: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

const reviewIdSchema = z.string().uuid("Invalid review ID");

// ─── Shared Select ────────────────────────────────────────────────────────────

const REVIEW_SELECT = `
  *,
  products:product_id (
    id,
    name,
    product_images (
      image_url,
      is_primary
    )
  ),
  profiles:user_id (
    id,
    name,
    email
  )
`;

// ─── Get All Reviews ──────────────────────────────────────────────────────────

/**
 * Fetch all reviews without pagination (used internally)
 */
export async function getReviews(): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Review[];
}

// ─── Get Paginated Reviews ────────────────────────────────────────────────────

/**
 * Fetch filtered, paginated reviews with store-wide stats
 */
export async function getReviewsPaginated({
  page = 1,
  limit = 10,
  search,
  status,
  rating,
  dateRange,
  startDate,
  endDate,
}: GetReviewsParams) {
  const supabase = await createClient();

  // 1. Compute store-wide stats from ALL reviews
  const { data: allReviews, error: statsError } = await supabase
    .from("reviews")
    .select("status, rating");

  if (statsError) {
    console.error("Error fetching review stats:", statsError.message);
  }

  const allArr = allReviews ?? [];
  const stats: ReviewStats = {
    total: allArr.length,
    pending: allArr.filter((r) => r.status === "pending").length,
    approved: allArr.filter((r) => r.status === "approved").length,
    rejected: allArr.filter((r) => r.status === "rejected").length,
    averageRating:
      allArr.length > 0
        ? Math.round((allArr.reduce((s, r) => s + Number(r.rating), 0) / allArr.length) * 10) / 10
        : 0,
  };

  // 2. Build filtered query
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" });

  // Status filter
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  // Rating filter
  if (rating && rating !== "all") {
    query = query.eq("rating", Number(rating));
  }

  // Search: by comment, product name, or customer name
  if (search) {
    const s = search.trim();

    // Find matching products
    const { data: matchingProducts } = await supabase
      .from("products")
      .select("id")
      .ilike("name", `%${s}%`);
    const productIds = matchingProducts?.map((p) => p.id) ?? [];

    // Find matching customers
    const { data: matchingProfiles } = await supabase
      .from("profiles")
      .select("id")
      .ilike("name", `%${s}%`);
    const profileIds = matchingProfiles?.map((p) => p.id) ?? [];

    let orCondition = `comment.ilike.%${s}%`;
    if (productIds.length > 0) {
      orCondition += `,product_id.in.(${productIds.join(",")})`;
    }
    if (profileIds.length > 0) {
      orCondition += `,user_id.in.(${profileIds.join(",")})`;
    }

    query = query.or(orCondition);
  }

  // Date range filter
  if (dateRange && dateRange !== "all") {
    const now = new Date();
    if (dateRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = query.gte("created_at", start.toISOString());
    } else if (dateRange === "this_week") {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      query = query.gte("created_at", start.toISOString());
    } else if (dateRange === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte("created_at", start.toISOString());
    } else if (dateRange === "custom" && startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte("created_at", start.toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte("created_at", end.toISOString());
      }
    }
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const totalCount = count ?? 0;

  return {
    data: (data ?? []) as unknown as Review[],
    stats,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

// ─── Get Review by ID ─────────────────────────────────────────────────────────

/**
 * Fetch a single review with all related data
 */
export async function getReviewById(reviewId: string) {
  const validation = reviewIdSchema.safeParse(reviewId);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid review ID",
      data: null,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("id", reviewId)
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }

  return {
    success: true,
    data: data as unknown as Review,
  };
}

// ─── Approve Review ───────────────────────────────────────────────────────────

/**
 * Approve a pending review
 */
export async function approveReview(reviewId: string) {
  const idValidation = reviewIdSchema.safeParse(reviewId);
  if (!idValidation.success) {
    return { success: false, message: "Invalid review ID" };
  }

  const supabase = await createClient();

  const { data: rev } = await supabase
    .from("reviews")
    .select("products:product_id(name)")
    .eq("id", reviewId)
    .single();
  const entityName = (rev?.products as any)?.name ? `Review for ${(rev.products as any).name}` : "Product Review";

  const { error } = await supabase
    .from("reviews")
    .update({ status: "approved" })
    .eq("id", reviewId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");

  await createAuditLog({
    action: "Review Approved",
    tableName: "reviews",
    recordId: reviewId,
    entityName: entityName,
    metadata: {
      status: "approved",
    },
  });

  return { success: true, message: "Review approved successfully" };
}

// ─── Reject Review ────────────────────────────────────────────────────────────

/**
 * Reject a pending review
 */
export async function rejectReview(reviewId: string) {
  const idValidation = reviewIdSchema.safeParse(reviewId);
  if (!idValidation.success) {
    return { success: false, message: "Invalid review ID" };
  }

  const supabase = await createClient();

  const { data: rev } = await supabase
    .from("reviews")
    .select("products:product_id(name)")
    .eq("id", reviewId)
    .single();
  const entityName = (rev?.products as any)?.name ? `Review for ${(rev.products as any).name}` : "Product Review";

  const { error } = await supabase
    .from("reviews")
    .update({ status: "rejected" })
    .eq("id", reviewId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");

  await createAuditLog({
    action: "Review Rejected",
    tableName: "reviews",
    recordId: reviewId,
    entityName: entityName,
    metadata: {
      status: "rejected",
    },
  });

  return { success: true, message: "Review rejected successfully" };
}

// ─── Reply to Review ──────────────────────────────────────────────────────────

/**
 * Save or update an admin reply for a review
 */
export async function replyToReview(reviewId: string, reply: string) {
  const idValidation = reviewIdSchema.safeParse(reviewId);
  if (!idValidation.success) {
    return { success: false, message: "Invalid review ID" };
  }

  const replyValidation = replySchema.safeParse({ reply });
  if (!replyValidation.success) {
    return {
      success: false,
      message: replyValidation.error.issues[0]?.message ?? "Invalid reply",
    };
  }

  const supabase = await createClient();

  const { data: rev } = await supabase
    .from("reviews")
    .select("products:product_id(name)")
    .eq("id", reviewId)
    .single();
  const entityName = (rev?.products as any)?.name ? `Review for ${(rev.products as any).name}` : "Product Review";

  const { error } = await supabase
    .from("reviews")
    .update({ admin_reply: reply.trim() })
    .eq("id", reviewId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");

  await createAuditLog({
    action: "Review Replied",
    tableName: "reviews",
    recordId: reviewId,
    entityName: entityName,
    metadata: {
      reply: reply.trim(),
    },
  });

  return { success: true, message: "Reply saved successfully" };
}

// ─── Delete Review ────────────────────────────────────────────────────────────

/**
 * Permanently delete a review
 */
export async function deleteReview(reviewId: string) {
  const idValidation = reviewIdSchema.safeParse(reviewId);
  if (!idValidation.success) {
    return { success: false, message: "Invalid review ID" };
  }

  const supabase = await createClient();

  const { data: rev } = await supabase
    .from("reviews")
    .select("products:product_id(name)")
    .eq("id", reviewId)
    .single();
  const entityName = (rev?.products as any)?.name ? `Review for ${(rev.products as any).name}` : "Product Review";

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/reviews");

  await createAuditLog({
    action: "Review Deleted",
    tableName: "reviews",
    recordId: reviewId,
    entityName: entityName,
    metadata: {
      id: reviewId,
    },
  });

  return { success: true, message: "Review deleted successfully" };
}

// ─── Get Review Stats ─────────────────────────────────────────────────────────

/**
 * Fetch store-wide review statistics and rating distribution
 */
export async function getReviewStats(): Promise<{
  stats: ReviewStats;
  distribution: RatingDistribution[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("reviews").select("status, rating");

  if (error) {
    console.error("getReviewStats error:", error.message);
    return {
      stats: { total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 },
      distribution: [],
    };
  }

  const arr = data ?? [];
  const total = arr.length;

  const stats: ReviewStats = {
    total,
    pending: arr.filter((r) => r.status === "pending").length,
    approved: arr.filter((r) => r.status === "approved").length,
    rejected: arr.filter((r) => r.status === "rejected").length,
    averageRating:
      total > 0
        ? Math.round((arr.reduce((s, r) => s + Number(r.rating), 0) / total) * 10) / 10
        : 0,
  };

  // Rating distribution
  const distribution: RatingDistribution[] = [5, 4, 3, 2, 1].map((rating) => {
    const count = arr.filter((r) => Number(r.rating) === rating).length;
    return {
      rating,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return { stats, distribution };
}

// ─── Get Product Reviews ──────────────────────────────────────────────────────

/**
 * Fetch all reviews for a specific product
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Review[];
}

