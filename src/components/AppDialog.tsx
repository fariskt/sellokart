"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
}

const sizes = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  "2xl": "sm:max-w-6xl",
};

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
  showCloseButton = true,
}: AppDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          "flex max-h-[90vh] flex-col p-0 gap-0",
          sizes[size]
        )}
      >
        <div className="shrink-0 border-b px-6 py-4">
          <DialogTitle>
            {title}
          </DialogTitle>

          {description && (
            <DialogDescription className="mt-1">
              {description}
            </DialogDescription>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>

        {footer && (
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <div className="flex justify-end gap-2">
              {footer}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}