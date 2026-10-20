import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./UsersClient";

export const metadata = {
  title: "Users & Staff | Admin",
  description: "View and manage registered user accounts and administrator profiles.",
};

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <UsersClient initialProfiles={profiles || []} />;
}
