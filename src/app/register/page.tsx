"use client";

import { useActionState, startTransition } from "react";
import { motion } from "framer-motion";
import { signup } from "@/features/auth/actions";
import { Title } from "@/components/ui/title";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User, CheckCircle2, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
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
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[400px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[400px] bg-accent/20 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-md bg-white border border-border rounded-2xl card-shadow p-8 z-10 backdrop-blur-md relative"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tighter bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              SELLOKART
            </span>
          </Link>
          <Title as="h1" size="md" align="center" variant="default" className="font-extrabold">
            Create An Account
          </Title>
          <p className="text-muted-foreground text-sm mt-1.5">
            Join us today and discover premium shopping and easy selling.
          </p>
        </div>

        {/* Success State */}
        {state?.success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center text-success">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Registration Successful!</h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {state.success}
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-accent/40 transition-colors"
            >
              Go to Sign In
            </Link>
          </motion.div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg"
              >
                {state.error}
              </motion.div>
            )}

            {/* Name input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary-hover button-shadow hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Registering...</span>
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
        <div className="mt-6 text-center border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
