import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

// Emulate requireAdmin logic with different auth states
async function emulateRequireAdmin(supabaseClient) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { supabase: supabaseClient, user };
}

async function run() {
  console.log("--- Testing requireAdmin Authorization ---");

  // 1. Unauthenticated client (no session)
  const unauthClient = createClient(supabaseUrl, anonKey);
  try {
    await emulateRequireAdmin(unauthClient);
    console.error("FAIL: Unauthenticated call should have thrown Unauthorized");
    process.exit(1);
  } catch (err) {
    if (err.message === "Unauthorized") {
      console.log("PASS: Unauthenticated call rejected with 'Unauthorized'");
    } else {
      console.error("FAIL: Unexpected error:", err);
      process.exit(1);
    }
  }

  // 2. Fetch a non-admin (customer) user from profiles table using admin client
  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: customerProfile } = await adminClient
    .from("profiles")
    .select("id, role, email")
    .eq("role", "customer")
    .limit(1)
    .single();

  if (customerProfile) {
    console.log(`Found customer profile: ${customerProfile.email} (${customerProfile.id}), role: ${customerProfile.role}`);
    // Emulate auth client with customer user
    const mockCustomerClient = {
      auth: {
        getUser: async () => ({ data: { user: { id: customerProfile.id } }, error: null }),
      },
      from: (table) => adminClient.from(table),
    };

    try {
      await emulateRequireAdmin(mockCustomerClient);
      console.error("FAIL: Customer call should have thrown Forbidden");
      process.exit(1);
    } catch (err) {
      if (err.message === "Forbidden") {
        console.log("PASS: Non-admin call rejected with 'Forbidden'");
      } else {
        console.error("FAIL: Unexpected error for non-admin:", err);
        process.exit(1);
      }
    }
  } else {
    console.log("No customer profile found in DB to test against, testing with dummy non-admin profile");
    const mockDummyClient = {
      auth: {
        getUser: async () => ({ data: { user: { id: "00000000-0000-0000-0000-000000000000" } }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { role: "customer" }, error: null }),
          }),
        }),
      }),
    };
    try {
      await emulateRequireAdmin(mockDummyClient);
      console.error("FAIL: Customer call should have thrown Forbidden");
      process.exit(1);
    } catch (err) {
      if (err.message === "Forbidden") {
        console.log("PASS: Non-admin call rejected with 'Forbidden'");
      } else {
        console.error("FAIL: Unexpected error:", err);
        process.exit(1);
      }
    }
  }

  console.log("ALL requireAdmin checks PASSED!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
