import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: authData } = await adminClient.auth.admin.listUsers();
  console.log("Auth users count:", authData?.users?.length);
  if (authData?.users?.length > 0) {
    console.log("First user:", authData.users[0].id, authData.users[0].email);
  }
}

check();
