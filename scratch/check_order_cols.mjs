import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf-8");
const getEnv = (key) => {
  const line = env.split("\n").find((l) => l.trim().startsWith(`${key}=`));
  return line ? line.split("=")[1].trim().replace(/^["']|["']$/g, "") : "";
};

const supabase = createClient(
  getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY")
);

async function main() {
  const { data, error } = await supabase.rpc("apply_order_sale", {
    p_order_id: "00000000-0000-0000-0000-000000000000"
  });
  console.log("RPC test:", { data, error });

  // Check columns of orders & order_items by inserting a dummy or checking schema
  const { data: oCol, error: oErr } = await supabase
    .from("orders")
    .insert({ user_id: "00000000-0000-0000-0000-000000000000" })
    .select();
  console.log("Orders insert test (shows column errors if any):", oErr);

  const { data: oiCol, error: oiErr } = await supabase
    .from("order_items")
    .insert({ order_id: "00000000-0000-0000-0000-000000000000" })
    .select();
  console.log("Order items insert test:", oiErr);
}

main();
