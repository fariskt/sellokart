import * as React from "react";
import { SearchPageClient } from "@/components/search/search-page-client";
import { getLandingProducts } from "@/features/products/lib/product.action";
import { formatCatalogProduct } from "@/features/products/lib/formatCatalogProduct";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q || "";

  // Fetch actual products from Supabase
  const rawProducts = await getLandingProducts();
  const allProducts = rawProducts.map((p, idx) =>
    formatCatalogProduct(p, idx),
  );

  let filteredResults: typeof allProducts = [];

  if (initialQuery.trim() !== "") {
    const searchTerms = initialQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    filteredResults = allProducts.filter((prod) => {
      const titleLower = prod.name.toLowerCase();
      const catLower = prod.category.toLowerCase();
      const descLower = prod.description.toLowerCase();

      // Every term in the search query matches title, category, or description
      return searchTerms.every(
        (term) =>
          titleLower.includes(term) ||
          catLower.includes(term) ||
          descLower.includes(term),
      );
    });
  }

  return (
    <div className="bg-landing-hero-bg min-h-screen pt-24 pb-28 font-display">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2 max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="w-6 h-px bg-landing-primary" />
            <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
              Search Engine
            </span>
            <span className="w-6 h-px bg-landing-primary" />
          </div>
          <h1
            className="leading-none tracking-tight font-black text-landing-dark font-display"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}
          >
            Search Catalog
          </h1>
          <p className="text-[15px] leading-relaxed text-landing-primary-muted font-display mt-2">
            Find precision-crafted apparel, accessories, and minimalist tools for
            your daily routine.
          </p>
        </div>

        {/* Client Search Panel */}
        <SearchPageClient
          initialQuery={initialQuery}
          results={filteredResults}
          allProducts={allProducts}
        />
      </div>
    </div>
  );
}
