"use client";

import { useActionState, startTransition, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { signup } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/common/Logo";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ShoppingBag,
} from "lucide-react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [state, formAction, isPending] = useActionState(signup, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [oauthError, setOauthError] = useState("");

  const isCheckoutRedirect = next === "/checkout";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGooglePending(true);
      setOauthError("");
      const supabase = createClient();
      const origin = window.location.origin;
      const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setOauthError(error.message);
        setIsGooglePending(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Google sign in.";
      setOauthError(msg);
      setIsGooglePending(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-landing-hero-bg flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Decorative Landing Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-landing-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-landing-accent-glow/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-2 sm:py-0 z-20">
        <Logo variant="landing" />
        <Link
          href={isCheckoutRedirect ? "/cart" : "/"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-landing-primary/15 bg-white/70 hover:bg-white text-xs font-bold text-landing-dark hover:text-landing-primary transition-all font-display shadow-xs backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{isCheckoutRedirect ? "Back to Cart" : "Back to Store"}</span>
        </Link>
      </header>

      {/* Card Content */}
      <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white/85 backdrop-blur-xl border border-landing-primary/10 rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 shadow-xl shadow-landing-primary/5 relative"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl fond-medium text-landing-dark font-display tracking-tight leading-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-landing-primary-muted font-display mt-2 font-medium">
              {isCheckoutRedirect
                ? "Create your account to complete checkout and track your order."
                : "Join Sellokart to shop, track orders, and discover curated drops."}
            </p>
          </div>

          {/* Checkout notice banner */}
          {isCheckoutRedirect && (
            <div className="mb-5 p-3 rounded-2xl bg-landing-primary-light/70 border border-landing-primary/20 flex items-center gap-2.5 text-xs text-landing-dark font-semibold">
              <ShoppingBag className="w-4 h-4 text-landing-primary shrink-0" />
              <span>Your cart items will be ready when you complete registration.</span>
            </div>
          )}

          {/* Success State */}
          {state?.success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-landing-dark font-display">
                Registration Successful!
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xs leading-relaxed font-display">
                {state.success}
              </p>
              <Link
                href={next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"}
                className="mt-4 inline-flex items-center justify-center py-3 px-7 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Error Alert */}
              {(state?.error || oauthError) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-2xl font-display"
                >
                  {state?.error || oauthError}
                </motion.div>
              )}

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isPending || isGooglePending}
                className="w-full mb-4 inline-flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-border bg-white hover:bg-slate-50 text-landing-dark font-display text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGooglePending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-landing-dark" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-landing-primary/10 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase font-bold text-landing-primary-muted absolute font-display">
                  Or with email
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <input type="hidden" name="next" value={next} />

                {/* Name */}
                <div className="space-y-1 group">
                  <label
                    htmlFor="name"
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      disabled={isPending}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1 group">
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
                      disabled={isPending}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1 group">
                  <label
                    htmlFor="password"
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Password
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
                      autoComplete="new-password"
                      placeholder="••••••••"
                      disabled={isPending}
                      className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-landing-dark cursor-pointer transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1 group">
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
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      disabled={isPending}
                      className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-landing-dark cursor-pointer transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isPending || isGooglePending}
                  className="w-full mt-3 inline-flex items-center justify-center py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center border-t border-landing-primary/10 pt-4">
            <p className="text-xs sm:text-sm text-slate-500 font-display">
              Already have an account?{" "}
              <Link
                href={next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"}
                className="font-bold text-landing-dark hover:text-landing-primary underline underline-offset-4 transition-colors font-display"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <footer className="w-full max-w-[1400px] mx-auto text-center py-3 z-20">
        <p className="text-[11px] text-landing-primary-muted font-display">
          © {new Date().getFullYear()} Sellokart. Precision-crafted shopping experience.
        </p>
      </footer>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-landing-hero-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-landing-primary" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
