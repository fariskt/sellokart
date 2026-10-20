"use client";

import * as React from "react";
import Image from "next/image";
import { Logo } from "@/components/common/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { LoginForm } from "./LoginForm";
import { X } from "lucide-react";

export interface AuthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  next?: string;
  initialMode?: "login" | "register";
}

export function AuthDrawer({
  open,
  onOpenChange,
  next = "/checkout",
  initialMode = "login",
}: AuthDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-landing-dark/50 backdrop-blur-xs duration-300"
        className="w-full sm:max-w-[440px] p-0 border-l border-landing-primary/10 bg-white/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-2xl z-50 duration-300 data-[side=right]:duration-300 data-[side=right]:ease-out"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Authentication</SheetTitle>
          <SheetDescription>
            Log in or create an account to proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {/* Drawer Top Bar */}
        <div className="w-full px-6 pt-5 pb-3 border-b border-landing-primary/10 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Logo variant="landing" />
          </div>
          <SheetClose asChild>
            <button
              type="button"
              className="w-8 h-8 rounded-full border border-landing-primary/15 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-landing-dark flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close auth drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </SheetClose>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="w-full flex-1 overflow-y-auto px-6 py-5">
          <LoginForm
            initialMode={initialMode}
            next={next}
            isDrawer={true}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
