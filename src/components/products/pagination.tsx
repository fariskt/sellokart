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
    <div className="py-8 flex items-center justify-center gap-2 select-none font-display">
      {/* Prev Page Button */}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "w-10 h-10 rounded-full border border-landing-primary/20 bg-white/90 flex items-center justify-center text-landing-dark transition-all cursor-pointer hover:border-landing-primary hover:text-landing-primary shadow-xs",
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
              "w-10 h-10 rounded-full text-xs  transition-all cursor-pointer font-display",
              isCurrent
                ? "bg-landing-primary text-white shadow-md shadow-landing-primary/30"
                : "border border-landing-primary/15 bg-white/90 text-landing-dark hover:border-landing-primary hover:text-landing-primary shadow-xs",
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
          "w-10 h-10 rounded-full border border-landing-primary/20 bg-white/90 flex items-center justify-center text-landing-dark transition-all cursor-pointer hover:border-landing-primary hover:text-landing-primary shadow-xs",
          currentPage === totalPages && "pointer-events-none opacity-40",
        )}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
