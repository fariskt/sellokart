"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

export function CategoryFilters({
  search,
}: {
  search: string;
}) {
  const router = useRouter();

  return (
    <Input
      defaultValue={search}
      placeholder="Search categories..."
      onChange={(e) => {
        const params =
          new URLSearchParams(
            window.location.search
          );

        if (e.target.value) {
          params.set(
            "search",
            e.target.value
          );
        } else {
          params.delete("search");
        }

        router.push(
          `?${params.toString()}`
        );
      }}
    />
  );
}