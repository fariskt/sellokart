"use client";

import { useActionState, startTransition, useState } from "react";
import { motion } from "framer-motion";
import { signup } from "@/features/auth/actions";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <main className="w-full min-h-screen bg-landing-hero-bg flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Landing Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-landing-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-landing-accent-glow/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-2 sm:py-0 z-20">
        <Link href="/" className="inline-flex items-center transition-transform hover:scale-105 duration-200">
          <Image
            src="/logo4.png"
            alt="Sellokart"
            width={250}
            height={70}
            className="h-20 sm:h-28 w-full object-cover"
            priority
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-landing-primary/15 bg-white/70 hover:bg-white text-xs font-bold text-landing-dark hover:text-landing-primary transition-all font-display shadow-xs backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Store</span>
          <span className="sm:hidden">Store</span>
        </Link>
      </header>

      {/* Card Content */}
      <div className="w-full flex-1 flex items-center justify-center py-6 sm:py-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-white/85 backdrop-blur-xl border border-landing-primary/10 rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 shadow-xl shadow-landing-primary/5 relative"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-landing-dark font-display tracking-tight leading-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-landing-primary-muted font-display mt-2 font-medium">
              Join us today and discover premium shopping and easy selling.
            </p>
          </div>

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
                href="/login"
                className="mt-4 inline-flex items-center justify-center py-3 px-7 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {state?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-2xl font-display"
                >
                  {state.error}
                </motion.div>
              )}

              {/* Name input */}
              <div className="space-y-1.5 group">
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
                    placeholder="John Doe"
                    disabled={isPending}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                  />
                </div>
              </div>

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
                    disabled={isPending}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1.5 group">
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
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
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
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-2xl border border-landing-primary/15 bg-white/80 hover:bg-white focus:bg-white text-sm text-landing-dark placeholder:text-slate-400 focus:outline-none focus:border-landing-primary focus:ring-4 focus:ring-landing-primary/10 transition-all font-medium disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-landing-dark cursor-pointer transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-3 inline-flex items-center justify-center py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
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
          )}

          {/* Footer */}
          <div className="mt-6 text-center border-t border-landing-primary/10 pt-5">
            <p className="text-xs sm:text-sm text-slate-500 font-display">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-landing-dark hover:text-landing-primary underline underline-offset-4 transition-colors font-display"
              >
                Sign In
              </Link>
            </p>
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
