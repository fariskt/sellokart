"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="py-8 flex items-center justify-center gap-2 select-none">
      {/* Prev Page Button */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground transition-all cursor-pointer hover:bg-muted shadow-2xs",
          currentPage === 1 && "pointer-events-none opacity-40",
        )}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Links */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            type="button"
            key={page}
            onClick={() => handlePageChange(page)}
            className={cn(
              "w-9 h-9 rounded-full text-xs transition-all cursor-pointer",
              isCurrent
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "border border-border bg-card text-foreground hover:bg-muted shadow-2xs font-medium",
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page Button */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground transition-all cursor-pointer hover:bg-muted shadow-2xs",
          currentPage === totalPages && "pointer-events-none opacity-40",
        )}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
