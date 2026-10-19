"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  XCircle,
  RefreshCw,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "The payment transaction could not be completed.";
  const orderId = searchParams.get("order_id");

  return (
    <div className="max-w-xl mx-auto py-10 sm:py-16 px-4 sm:px-6 space-y-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="border border-border/60 rounded-3xl bg-white p-6 sm:p-10 text-center shadow-xs space-y-6"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2 ring-8 ring-destructive/5">
          <XCircle className="w-9 h-9 sm:w-10 sm:h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-destructive bg-destructive/10 border border-destructive/20 px-3.5 py-1 rounded-full inline-block">
            Payment Unsuccessful
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground pt-1">
            Payment Could Not Be Processed
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Helpful Info Alert */}
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 text-left flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Your cart items are completely safe</span>
            <p className="text-amber-700/90 leading-relaxed text-[11px]">
              No funds have been charged to your card. If your account was debited, your bank or Razorpay will automatically reverse the transaction within 3-5 business days.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Button
            asChild
            className="w-full sm:w-auto rounded-full px-6 py-2.5 font-bold text-xs bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer shadow-xs"
          >
            <Link href="/checkout">
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              <span>Retry Payment</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-full px-6 py-2.5 font-semibold text-xs border-border/80 hover:bg-muted/50 cursor-pointer"
          >
            <Link href="/cart">
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
              <span>Review Cart</span>
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Need help? Contact support@sellokart.com or retry with another payment mode.</span>
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
