"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  Notification,
  NotificationStats,
  GetNotificationsParams,
  CreateNotificationInput,
  BulkNotificationInput,
  NotificationType,
} from "./types";

// ─── Zod Validation Schemas ──────────────────────────────────────────────────

const notificationInputSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
  type: z.enum(["order", "payment", "shipment", "return", "coupon", "system"] as const, {
    required_error: "Notification type is required",
  }),
  action_url: z.string().url("Invalid URL format").or(z.string().startsWith("/")).nullable().optional(),
});

const bulkNotificationInputSchema = z.object({
  recipient: z.enum(["all", "selected"] as const),
  user_ids: z.array(z.string().uuid()).optional(),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
  type: z.enum(["order", "payment", "shipment", "return", "coupon", "system"] as const, {
    required_error: "Notification type is required",
  }),
  action_url: z.string().url("Invalid URL format").or(z.string().startsWith("/")).nullable().optional(),
});

// ─── Get Paginated Notifications ─────────────────────────────────────────────

export async function getNotificationsPaginated({
  page = 1,
  limit = 10,
  search,
  type,
  status,
  dateRange,
  startDate,
  endDate,
}: GetNotificationsParams) {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // We query notifications and join with profiles.
  // Using custom join profiles:user_id(id, name, email)
  let query = supabase
    .from("notifications")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email
      )
    `, { count: "exact" });

  // 1. Search Filter (matches title, message, or user's email/name)
  if (search) {
    const s = search.trim();
    // In Supabase, if we want to search in joined table, we can filter using raw query or handle filters.
    // However, profiles is a nested join. Let's search notifications' title/message first, OR user_id matches.
    // If profiles filter is needed, we can do profiles(name).ilike.etc but Supabase client allows matching.
    // Better way: query.or(`title.ilike.%${s}%,message.ilike.%${s}%`)
    // Let's also check if we can do nested filtering or just filter title/message.
    // To match orders/coupons/customers search pattern, search by title and message is minimum. Let's do that:
    query = query.or(`title.ilike.%${s}%,message.ilike.%${s}%`);
  }

  // 2. Type Filter
  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  // 3. Status Filter
  if (status && status !== "all") {
    if (status === "read") {
      query = query.eq("is_read", true);
    } else if (status === "unread") {
      query = query.eq("is_read", false);
    }
  }

  // 4. Date Range Filters
  const now = new Date();
  if (dateRange && dateRange !== "all") {
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

  const stats = await getNotificationStats();

  return {
    data: (data ?? []) as Notification[],
    stats,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

// ─── Get Notification By ID ──────────────────────────────────────────────────

export async function getNotificationById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email
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

  return {
    success: true,
    data: data as Notification,
  };
}

// ─── Create Single Notification ──────────────────────────────────────────────

export async function createNotification(input: CreateNotificationInput) {
  const validation = notificationInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid notification details",
    };
  }

  const supabase = await createClient();
  const insertData = {
    ...validation.data,
    is_read: false,
    read_at: null,
  };

  const { error } = await supabase.from("notifications").insert([insertData]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/notifications");
  return { success: true, message: "Notification sent successfully" };
}

// ─── Send Bulk Notification ──────────────────────────────────────────────────

export async function sendBulkNotification(input: BulkNotificationInput) {
  const validation = bulkNotificationInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Invalid bulk notification details",
    };
  }

  const supabase = await createClient();
  const data = validation.data;
  let userIds: string[] = [];

  if (data.recipient === "all") {
    // Fetch all customers (role = 'customer')
    const { data: customers, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "customer");

    if (fetchError) {
      return { success: false, message: `Failed to fetch customer list: ${fetchError.message}` };
    }

    userIds = (customers ?? []).map((c) => c.id);
  } else {
    userIds = data.user_ids ?? [];
  }

  if (userIds.length === 0) {
    return { success: false, message: "No recipients specified or found" };
  }

  // Build rows for bulk insert
  const rows = userIds.map((userId) => ({
    user_id: userId,
    title: data.title,
    message: data.message,
    type: data.type,
    action_url: data.action_url ?? null,
    is_read: false,
    read_at: null,
  }));

  // Chunk inserts if too many to avoid single query limits (Supabase handles large inserts, but safe chunking is good.
  // Standard limits are huge, so standard bulk insert is fine for most applications.)
  const { error } = await supabase.from("notifications").insert(rows);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/notifications");
  return {
    success: true,
    message: `Bulk notification sent to ${userIds.length} user(s) successfully`,
  };
}

// ─── Status Updates ──────────────────────────────────────────────────────────

export async function markAsRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/notifications");
  return { success: true, message: "Notification marked as read" };
}

export async function markAsUnread(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: false,
      read_at: null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/notifications");
  return { success: true, message: "Notification marked as unread" };
}

// ─── Delete Notification ─────────────────────────────────────────────────────

export async function deleteNotification(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/notifications");
  return { success: true, message: "Notification deleted successfully" };
}

// ─── Get Notification Stats ──────────────────────────────────────────────────

export async function getNotificationStats(): Promise<NotificationStats> {
  const supabase = await createClient();

  // Run queries in parallel
  const [totalRes, readRes, unreadRes, todayRes] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", true),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  return {
    total: totalRes.count ?? 0,
    read: readRes.count ?? 0,
    unread: unreadRes.count ?? 0,
    today: todayRes.count ?? 0,
  };
}

// ─── Helpers for profiles & user lookup ───────────────────────────────────────

/**
 * Fetch profiles matching a query or all customers, for select list
 */
export async function getCustomersForBulkSelect() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("role", "customer")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Look up a profile by email
 */
export async function getUserByEmail(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("email", email.trim())
    .maybeSingle();

  if (error) {
    return { success: false, message: error.message, data: null };
  }

  if (!data) {
    return { success: false, message: "User not found with this email address", data: null };
  }

  return { success: true, data };
}

// ─── Automatic Notification Helpers (For other modules) ───────────────────────

export async function createOrderNotification(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    user_id: userId,
    title: "Order Placed Successfully",
    message: `Your order #${orderNumber} has been placed successfully. Thank you for shopping with us!`,
    type: "order",
    action_url: `/account/orders/${orderId}`,
  });
}

export async function createPaymentNotification(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    user_id: userId,
    title: "Payment Received",
    message: `Payment for order #${orderNumber} has been received successfully.`,
    type: "payment",
    action_url: `/account/orders/${orderId}`,
  });
}

export async function createShipmentNotification(userId: string, orderId: string, orderNumber: string) {
  return createNotification({
    user_id: userId,
    title: "Order Shipped",
    message: `Great news! Your order #${orderNumber} has been shipped.`,
    type: "shipment",
    action_url: `/account/orders/${orderId}`,
  });
}

export async function createReturnNotification(userId: string, returnId: string) {
  return createNotification({
    user_id: userId,
    title: "Return Request Received",
    message: `Your return request (ID: ${returnId}) has been received and is being processed.`,
    type: "return",
    action_url: `/account/returns/${returnId}`,
  });
}
