import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./server";

/**
 * Creates an administrative or server-privileged Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY if configured (bypassing RLS for trusted webhook & order operations).
 * If SUPABASE_SERVICE_ROLE_KEY is not configured, gracefully falls back to the server client.
 */
export async function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (serviceRoleKey && supabaseUrl) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  // Fallback to server client with cookies / anon key
  return await createServerClient();
}
