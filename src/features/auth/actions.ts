"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(prevState: unknown, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string)?.trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }

  redirect("/");
}

export async function signup(prevState: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const next = (formData.get("next") as string)?.trim() || "/";

  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const validNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled or auto-logged in
  if (data.session) {
    redirect(validNext);
  }

  return {
    success:
      "Registration successful! Please check your email to verify your account before logging in.",
  };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
