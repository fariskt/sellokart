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
} from "lucide-react";

import { Button } from "@/components/ui/button";

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "The payment transaction could not be completed.";
  const orderId = searchParams.get("order_id");

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="border border-border rounded-3xl bg-white p-8 md:p-12 text-center shadow-xs space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
          <XCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-destructive bg-destructive/10 px-3 py-1 rounded-full">
            Payment Unsuccessful
          </span>
          <h1 className="text-2xl font-black text-foreground pt-2">
            Payment Could Not Be Processed
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {reason}
          </p>
        </div>

        {/* Helpful Info Alert */}
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 text-left flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Your cart items are completely safe</span>
            <p className="text-amber-700/90 leading-relaxed">
              No money has been debited from your account. If your bank account was debited, Razorpay will automatically reverse the transaction within 3-5 business days.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            asChild
            className="w-full sm:w-auto rounded-xl px-6 py-5 font-bold text-sm bg-primary text-white hover:bg-primary-hover button-shadow cursor-pointer"
          >
            <Link href="/checkout">
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Retry Payment</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl px-6 py-5 font-bold text-sm border-border cursor-pointer"
          >
            <Link href="/cart">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Review Cart</span>
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need help? Contact our 24/7 support team</span>
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
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
