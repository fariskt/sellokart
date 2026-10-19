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

async function check() {
  const { data: p, error: pErr } = await supabase.from("products").select("id, gst_rate, hsn_code").limit(1);
  console.log("products gst_rate:", { p, pErr });

  const { data: c, error: cErr } = await supabase.from("categories").select("id, gst_rate").limit(1);
  console.log("categories gst_rate:", { c, cErr });

  const { data: oi, error: oiErr } = await supabase.from("order_items").select("id, unit_price, discount, gst_rate, gst_amount, total_paise").limit(1);
  console.log("order_items snapshot:", { oi, oiErr });

  const { data: o, error: oErr } = await supabase.from("orders").select("id, total_paise, gst_amount").limit(1);
  console.log("orders snapshot:", { o, oErr });
}

check();
