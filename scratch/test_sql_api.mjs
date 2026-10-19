import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testEndpoints() {
  const endpoints = [
    "/pg/v1/query",
    "/pg/query",
    "/rest/v1/rpc/exec_sql",
    "/rest/v1/rpc/run_sql",
    "/rest/v1/rpc/exec",
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${supabaseUrl}${ep}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: "SELECT 1 as val;", sql: "SELECT 1 as val;" }),
      });
      console.log(`Endpoint ${ep} returned status: ${res.status}`);
      if (res.status === 200) {
        console.log("Response:", await res.text());
      }
    } catch (e) {
      console.log(`Endpoint ${ep} error:`, e.message);
    }
  }
}

testEndpoints();
