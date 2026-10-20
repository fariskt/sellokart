"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = React.useState(activeSearch);

  // Sync search input state with URL changes
  React.useEffect(() => {
    setSearchTerm(activeSearch);
  }, [activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchTerm.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", searchTerm);
    }

    // Reset page to 1 on search change
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="relative w-full max-w-md select-none"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-24 py-2.5 text-xs font-medium rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-xs active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
