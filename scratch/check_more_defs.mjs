import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkMoreDefs() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const spec = await res.json();
  console.log("coupon_usage:", spec.definitions.coupon_usage);
  console.log("returns:", spec.definitions.returns);
}

checkMoreDefs().catch(console.error);
