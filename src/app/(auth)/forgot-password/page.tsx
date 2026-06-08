"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Title } from "@/components/ui/title";
import Link from "next/link";
import { ArrowRight, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <main className="w-full min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            SELLOKART
          </span>
        </Link>
      </div>

      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[400px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[400px] bg-accent/20 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-md bg-white border border-border rounded-2xl card-shadow p-8 z-10 backdrop-blur-md relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              SELLOKART
            </span>
          </Link>
          <Title as="h1" size="md" align="center" variant="default" className="font-extrabold">
            Reset Password
          </Title>
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            Enter your account email address, and we will email you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-xs font-medium bg-success/10 text-success border border-success/20 rounded-lg flex items-start space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="h-10 pl-10 border border-border"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 font-bold button-shadow hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
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
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-border pt-5 flex justify-between text-sm">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to Sign In
          </Link>
          <Link href="/register" className="font-semibold text-muted-foreground hover:text-foreground">
            Create Account
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
