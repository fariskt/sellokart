"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      setError(msg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-landing-hero-bg flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Decorative Landing Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-landing-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-landing-accent-glow/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-2 sm:py-4 z-20">
        <Link href="/" className="inline-flex items-center transition-transform hover:scale-105 duration-200">
          <Image
            src="/logo4.png"
            alt="Sellokart"
            width={150}
            height={38}
            className="h-8 sm:h-9 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-landing-primary/15 bg-white/70 hover:bg-white text-xs font-bold text-landing-dark hover:text-landing-primary transition-all font-display shadow-xs backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Sign In</span>
          <span className="sm:hidden">Sign In</span>
        </Link>
      </header>

      {/* Card Content */}
      <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white/85 backdrop-blur-xl border border-landing-primary/10 rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 shadow-xl shadow-landing-primary/5 relative"
        >
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl fond-medium text-landing-dark font-display tracking-tight leading-tight">
              Create New Password
            </h1>
            <p className="text-xs sm:text-sm text-landing-primary-muted font-display mt-2 font-medium">
              Enter and confirm your new secure account password.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-landing-dark font-display">
                Password Updated!
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xs leading-relaxed font-display">
                Your password has been changed successfully. Redirecting you to sign in...
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center justify-center py-3 px-7 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-2xl font-display flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* New Password input */}
              <div className="space-y-1.5 group">
                <label
                  htmlFor="password"
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-landing-dark font-display"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isPending}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-landing-dark cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password input */}
              <div className="space-y-1.5 group">
                <label
                  htmlFor="confirmPassword"
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-landing-dark font-display"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isPending}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 inline-flex items-center justify-center py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <footer className="w-full max-w-[1400px] mx-auto text-center py-3 z-20">
        <p className="text-[11px] text-landing-primary-muted font-display">
          © {new Date().getFullYear()} Sellokart. Secure account management.
        </p>
      </footer>
    </main>
  );
}
