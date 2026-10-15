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
      className="relative w-full max-w-md select-none font-display"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-landing-primary">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder="Search collection..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-28 py-3 text-xs font-bold rounded-full bg-white/95 border border-landing-primary/20 text-landing-dark placeholder:text-landing-primary-muted/70 focus:outline-none focus:ring-2 focus:ring-landing-primary/20 focus:border-landing-primary transition-all shadow-xs"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full bg-landing-primary hover:bg-landing-primary-hover text-white text-[10px]  tracking-[0.12em] uppercase transition-all cursor-pointer shadow-sm active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
