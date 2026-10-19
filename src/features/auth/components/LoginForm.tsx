"use client";

import { useActionState, startTransition, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login, signup } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoginFormProps {
  initialMode?: "login" | "register";
  next?: string;
  isDrawer?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export function LoginForm({
  initialMode = "login",
  next = "/checkout",
  isDrawer = false,
  onClose,
  className,
}: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [oauthError, setOauthError] = useState("");

  const [loginState, loginFormAction, isLoginPending] = useActionState(login, null);
  const [signupState, signupFormAction, isSignupPending] = useActionState(signup, null);

  const isCheckoutRedirect = next === "/checkout";

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOauthError("");
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      loginFormAction(formData);
    });
  };

  const handleSignupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOauthError("");
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      signupFormAction(formData);
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

  const isPending = isLoginPending || isSignupPending;
  const currentError = oauthError || (mode === "login" ? loginState?.error : signupState?.error);

  return (
    <div className={cn("w-full flex flex-col font-sans", className)}>
      {/* Mode Switcher Pills */}
      <div className="flex p-1 bg-slate-100/90 rounded-full border border-landing-primary/10 mb-5 relative">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setOauthError("");
          }}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-full font-display transition-all duration-200 cursor-pointer text-center",
            mode === "login"
              ? "bg-white text-landing-dark shadow-xs"
              : "text-slate-500 hover:text-landing-dark"
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setOauthError("");
          }}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-full font-display transition-all duration-200 cursor-pointer text-center",
            mode === "register"
              ? "bg-white text-landing-dark shadow-xs"
              : "text-slate-500 hover:text-landing-dark"
          )}
        >
          Create Account
        </button>
      </div>

      {/* Error alert */}
      {currentError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-2xl font-display"
        >
          {currentError}
        </motion.div>
      )}

      {/* Registration Success State (if email confirmation required) */}
      {mode === "register" && signupState?.success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center py-6 space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-landing-dark font-display">
            Registration Successful!
          </h3>
          <p className="text-slate-600 text-xs max-w-xs leading-relaxed font-display">
            {signupState.success}
          </p>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="mt-2 inline-flex items-center justify-center py-3 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md cursor-pointer"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </motion.div>
      ) : (
        <>
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
            <span>
              {mode === "login" ? "Continue with Google" : "Sign up with Google"}
            </span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-landing-primary/10 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-landing-primary-muted absolute font-display">
              Or with email
            </span>
          </div>

          {/* Form Switch with Framer Motion */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit}
                className="space-y-3.5"
              >
                <input type="hidden" name="next" value={next} />

                {/* Email input */}
                <div className="space-y-1.5 group">
                  <label
                    htmlFor={isDrawer ? "drawer-login-email" : "email"}
                    className="text-[11px] font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id={isDrawer ? "drawer-login-email" : "email"}
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

                {/* Password input */}
                <div className="space-y-1.5 group">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={isDrawer ? "drawer-login-password" : "password"}
                      className="text-[11px] font-bold uppercase tracking-wider text-landing-dark font-display"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      onClick={() => onClose?.()}
                      className="text-xs font-bold text-landing-primary hover:text-landing-primary-hover font-display transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id={isDrawer ? "drawer-login-password" : "password"}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || isGooglePending}
                  className="w-full mt-2 inline-flex items-center justify-center py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoginPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignupSubmit}
                className="space-y-3"
              >
                <input type="hidden" name="next" value={next} />

                {/* Name */}
                <div className="space-y-1 group">
                  <label
                    htmlFor={isDrawer ? "drawer-register-name" : "register-name"}
                    className="text-[11px] font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id={isDrawer ? "drawer-register-name" : "register-name"}
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
                    htmlFor={isDrawer ? "drawer-register-email" : "register-email"}
                    className="text-[11px] font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id={isDrawer ? "drawer-register-email" : "register-email"}
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
                    htmlFor={isDrawer ? "drawer-register-password" : "register-password"}
                    className="text-[11px] font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id={isDrawer ? "drawer-register-password" : "register-password"}
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
                    htmlFor={isDrawer ? "drawer-register-confirm-password" : "register-confirm-password"}
                    className="text-[11px] font-bold uppercase tracking-wider text-landing-dark font-display"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-landing-primary transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id={isDrawer ? "drawer-register-confirm-password" : "register-confirm-password"}
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
                  className="w-full mt-2 inline-flex items-center justify-center py-3.5 px-6 rounded-full font-display font-bold uppercase tracking-wider text-xs bg-landing-dark text-white hover:bg-landing-primary transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSignupPending ? (
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
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Footer Switch */}
      <div className="mt-5 text-center border-t border-landing-primary/10 pt-4">
        <p className="text-xs text-slate-500 font-display">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setOauthError("");
                }}
                className="font-bold text-landing-dark hover:text-landing-primary underline underline-offset-4 transition-colors font-display cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setOauthError("");
                }}
                className="font-bold text-landing-dark hover:text-landing-primary underline underline-offset-4 transition-colors font-display cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
