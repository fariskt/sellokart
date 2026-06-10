"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AppPaginationProps {
  page: number;
  totalPages: number;

  onPageChange?: (
    page: number
  ) => void;
}

export function AppPagination({
  page,
  totalPages,
  onPageChange,
}: AppPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (page > 1) {
                onPageChange?.(
                  page - 1
                );
              }
            }}
          />
        </PaginationItem>

        {pages.map((current) => (
          <PaginationItem
            key={current}
          >
            <PaginationLink
              href="#"
              isActive={
                current === page
              }
              onClick={(e) => {
                e.preventDefault();

                onPageChange?.(
                  current
                );
              }}
            >
              {current}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();

              if (
                page < totalPages
              ) {
                onPageChange?.(
                  page + 1
                );
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}