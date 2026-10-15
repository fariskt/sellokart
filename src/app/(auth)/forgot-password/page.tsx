"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess("Recovery email sent! Please check your inbox for the password reset link.");
        setEmail("");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-landing-primary-light border border-landing-primary/15 text-landing-primary text-[11px] font-bold uppercase tracking-wider font-display mb-3">
              <Sparkles size={12} className="shrink-0" />
              <span>Password Recovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-landing-dark font-display tracking-tight leading-tight">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-landing-primary-muted font-display mt-2 font-medium">
              Enter your email address to receive password reset instructions.
            </p>
          </div>

          {/* Form */}
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-2xl font-display flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Email input */}
            <div className="space-y-1.5 group">
              <label
                htmlFor="email"
                className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-landing-dark font-display"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 inline-flex items-center justify-center py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 text-center border-t border-landing-primary/10 pt-5 flex items-center justify-between text-xs font-display">
            <Link
              href="/login"
              className="font-bold text-landing-primary hover:text-landing-primary-hover transition-colors"
            >
              Back to Sign In
            </Link>
            <Link
              href="/register"
              className="font-bold text-slate-600 hover:text-landing-dark transition-colors"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Footer */}
      <footer className="w-full max-w-[1400px] mx-auto text-center py-3 z-20">
        <p className="text-[11px] text-landing-primary-muted font-display">
          © {new Date().getFullYear()} Sellokart. Precision-crafted shopping experience.
        </p>
      </footer>
    </main>
  );
}
