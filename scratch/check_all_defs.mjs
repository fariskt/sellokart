import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkAllDefs() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const spec = await res.json();
  console.log("All tables/views in OpenAPI definitions:", Object.keys(spec.definitions || {}));
}

checkAllDefs().catch(console.error);
