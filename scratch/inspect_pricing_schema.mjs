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

async function inspect() {
  const { data: p, error: pErr } = await supabase.from("products").select("*").limit(1);
  console.log("PRODUCTS COLUMNS:", p ? Object.keys(p[0] || {}) : pErr);

  const { data: c, error: cErr } = await supabase.from("categories").select("*").limit(1);
  console.log("CATEGORIES COLUMNS:", c ? Object.keys(c[0] || {}) : cErr);

  const { data: o, error: oErr } = await supabase.from("orders").select("*").limit(1);
  console.log("ORDERS COLUMNS:", o ? Object.keys(o[0] || {}) : oErr);

  const { data: oi, error: oiErr } = await supabase.from("order_items").select("*").limit(1);
  console.log("ORDER_ITEMS COLUMNS:", oi ? Object.keys(oi[0] || {}) : oiErr);
}

inspect();
