import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getOpenApiSpec() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch OpenAPI spec:", res.status, res.statusText);
    return;
  }

  const spec = await res.json();
  const tables = [
    "orders",
    "order_items",
    "payments",
    "products",
    "product_variants",
    "inventory_logs",
    "profiles",
    "returns",
    "coupons",
    "webhook_events",
  ];

  console.log("=== TABLE SCHEMAS FROM OPENAPI SPEC ===");
  for (const table of tables) {
    const def = spec.definitions ? spec.definitions[table] : null;
    if (def) {
      console.log(`\n--- TABLE: ${table} ---`);
      console.log("Required fields:", def.required);
      console.log("Properties:", Object.keys(def.properties).map(k => `${k} (${def.properties[k].type}${def.properties[k].format ? ':' + def.properties[k].format : ''})`));
    } else {
      console.log(`\n--- TABLE: ${table} NOT FOUND IN DEFINITIONS ---`);
    }
  }

  // Also check existing RPCs/paths
  console.log("\n=== RPC FUNCTIONS IN OPENAPI SPEC ===");
  const rpcs = Object.keys(spec.paths || {}).filter(p => p.startsWith("/rpc/"));
  console.log("Found RPCs:", rpcs);
}

getOpenApiSpec().catch(console.error);
