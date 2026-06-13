"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { AuditLog, AuditLogStats, GetAuditLogsParams } from "./types";

// ─── Zod Input Validation Schema ─────────────────────────────────────────────
const auditLogInputSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  action: z.string().min(1, "Action is required"),
  tableName: z.string().min(1, "Table name is required"),
  recordId: z.string().min(1, "Record ID is required"),
  entityName: z.string().nullable().optional(),
  metadata: z.any().optional(),
});

// ─── Create Audit Log ────────────────────────────────────────────────────────
export async function createAuditLog(input: {
  userId?: string | null;
  action: string;
  tableName: string;
  recordId: string;
  entityName?: string | null;
  metadata?: any;
}) {
  try {
    const validation = auditLogInputSchema.safeParse(input);
    if (!validation.success) {
      console.error("Audit Log validation failed:", validation.error.format());
      return { success: false, error: "Validation failed" };
    }

    const supabase = await createClient();

    // Determine current user if not provided
    let userId = input.userId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    // Determine IP address from headers
    let ipAddress = "127.0.0.1";
    try {
      const headerList = await headers();
      ipAddress = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1";
      if (ipAddress.includes(",")) {
        ipAddress = ipAddress.split(",")[0].trim();
      }
    } catch {
      // In static generation or builds, headers() might throw
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action: input.action,
      table_name: input.tableName,
      record_id: input.recordId,
      entity_name: input.entityName || null,
      metadata: input.metadata || {},
      ip_address: ipAddress,
    });

    if (error) {
      console.error("Failed to insert audit log row:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/audit-logs");
    return { success: true };
  } catch (err: any) {
    console.error("Unhandled error creating audit log:", err.message || err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

// ─── Get All Audit Logs ──────────────────────────────────────────────────────
export async function getAuditLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AuditLog[];
}

// ─── Get Paginated Audit Logs with Filters ────────────────────────────────────
export async function getAuditLogsPaginated(params: GetAuditLogsParams) {
  const supabase = await createClient();

  const page = params.page || 1;
  const limit = params.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("audit_logs")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        email
      )
    `, { count: "exact" });

  // 1. Search Filter (Action, Entity Name, User Name, User Email)
  if (params.search) {
    const s = params.search.trim();

    // Query profiles that match name or email to retrieve matching user IDs
    const { data: matchedProfiles } = await supabase
      .from("profiles")
      .select("id")
      .or(`name.ilike.%${s}%,email.ilike.%${s}%`);

    const userIds = matchedProfiles?.map((p) => p.id) || [];

    if (userIds.length > 0) {
      const userFilters = userIds.map((id) => `user_id.eq.${id}`).join(",");
      query = query.or(`action.ilike.%${s}%,entity_name.ilike.%${s}%,${userFilters}`);
    } else {
      query = query.or(`action.ilike.%${s}%,entity_name.ilike.%${s}%`);
    }
  }

  // 2. Table Name Filter
  if (params.tableName && params.tableName !== "all") {
    query = query.eq("table_name", params.tableName.toLowerCase());
  }

  // 3. User Filter
  if (params.userId && params.userId !== "all") {
    query = query.eq("user_id", params.userId);
  }

  // 4. Date Range Filter
  const now = new Date();
  if (params.dateRange && params.dateRange !== "all") {
    if (params.dateRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = query.gte("created_at", start.toISOString());
    } else if (params.dateRange === "last_7_days") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte("created_at", start.toISOString());
    } else if (params.dateRange === "last_30_days") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte("created_at", start.toISOString());
    } else if (params.dateRange === "custom" && params.startDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte("created_at", start.toISOString());
      if (params.endDate) {
        const end = new Date(params.endDate);
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

  return {
    data: (data ?? []) as AuditLog[],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

// ─── Get Audit Log By ID ─────────────────────────────────────────────────────
export async function getAuditLogById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
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
    return { success: false, message: error.message, data: null };
  }

  return { success: true, data: data as AuditLog };
}

// ─── Get Audit Log Statistics ────────────────────────────────────────────────
export async function getAuditLogStats(): Promise<AuditLogStats> {
  const supabase = await createClient();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [totalRes, todayRes, productRes, orderRes, securityRes] = await Promise.all([
    supabase.from("audit_logs").select("id", { count: "exact", head: true }),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).or("table_name.eq.products,table_name.eq.categories"),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).or("table_name.eq.orders,table_name.eq.payments,table_name.eq.shipments,table_name.eq.returns"),
    supabase.from("audit_logs").select("id", { count: "exact", head: true }).or("action.ilike.%role%,table_name.eq.profiles"),
  ]);

  return {
    total: totalRes.count ?? 0,
    today: todayRes.count ?? 0,
    productLogs: productRes.count ?? 0,
    orderLogs: orderRes.count ?? 0,
    securityLogs: securityRes.count ?? 0,
  };
}

// ─── Helper to Fetch Admin Users for filter dropdown ─────────────────────────
export async function getAdminUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("role", "admin")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching admin users:", error.message);
    return [];
  }

  return data || [];
}
