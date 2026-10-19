import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tables = [
  "orders",
  "order_items",
  "payments",
  "products",
  "product_variants",
  "inventory_logs",
  "profiles",
  "returns",
  "webhook_events",
  "coupons",
];

async function inspect() {
  console.log("Checking table existence and sample columns...");
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`Table [${table}]: ERROR - ${error.message} (code: ${error.code})`);
    } else {
      const cols = data && data[0] ? Object.keys(data[0]) : "(empty table, exists)";
      console.log(`Table [${table}]: EXISTS. Sample columns:`, cols);
    }
  }
}

inspect().catch(console.error);
