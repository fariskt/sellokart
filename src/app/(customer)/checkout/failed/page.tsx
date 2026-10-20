"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  X,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "The payment transaction could not be completed.";
  const orderId = searchParams.get("order_id");

  return (
    <div className="max-w-xl mx-auto pt-8 pb-20 sm:py-16 px-4 font-sans text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-6 sm:space-y-8"
      >
        {/* Solid Circular Red X */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto shadow-sm">
          <X className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Payment failed
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your payment couldn't be completed. You can try again or return to your cart.
          </p>
        </div>

        {/* Payment Summary / Issue Card */}
        <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs text-left space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Transaction Details
          </h2>

          <div className="space-y-3 divide-y divide-border/60 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-medium">Status</span>
              <span className="font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full text-xs">
                Failed
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-muted-foreground font-medium">Payment Gateway</span>
              <span className="font-semibold text-foreground">Razorpay</span>
            </div>

            {orderId && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium">Reference ID</span>
                <span className="font-mono font-semibold text-foreground text-xs">
                  #{orderId.slice(0, 10).toUpperCase()}
                </span>
              </div>
            )}

            <div className="pt-3 space-y-1">
              <span className="text-muted-foreground font-medium block">Reason</span>
              <p className="text-foreground/90 font-medium text-xs leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/60">
                {reason}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span className="text-[11px] leading-relaxed">
              If your bank account was debited, your bank or Razorpay will automatically reverse the charge within 3-5 business days.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="w-full sm:w-auto rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs sm:text-sm px-8 py-3 h-auto cursor-pointer shadow-xs transition-colors"
          >
            <Link href="/checkout">
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              <span>Retry Payment</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl border border-foreground/80 bg-background text-foreground hover:bg-muted font-semibold text-xs sm:text-sm px-8 py-3 h-auto cursor-pointer shadow-2xs transition-colors"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-foreground animate-spin" />
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
