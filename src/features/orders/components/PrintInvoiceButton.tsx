"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintInvoiceButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      variant="outline"
      size="sm"
      className="cursor-pointer gap-1.5 print:hidden"
    >
      <Download className="w-4 h-4" />
      <span>Print Invoice</span>
    </Button>
  );
}
