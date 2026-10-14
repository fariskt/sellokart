import * as React from "react";
import { FiltersSidebar } from "@/components/products/filters-sidebar";
import { SortDropdown } from "@/components/products/sort-dropdown";
import { SearchBar } from "@/components/products/search-bar";
import { Pagination } from "@/components/products/pagination";
import { ProductCard } from "@/components/landing/ProductCard";
import { getLandingProducts } from "@/features/products/lib/product.action";
import { getCategoriesPaginated } from "@/features/products/lib/categories.action";
import { formatCatalogProduct } from "@/features/products/lib/formatCatalogProduct";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;

  // Read query parameters
  const categoryFilter = params.category || "";
  const minPriceFilter = params.minPrice ? parseInt(params.minPrice, 10) : null;
  const maxPriceFilter = params.maxPrice ? parseInt(params.maxPrice, 10) : null;
  const sortFilter = params.sort || "popular";
  const searchFilter = params.search || "";
  const currentPage = parseInt(params.page || "1", 10);
  const pageSize = 9;

  // Fetch actual products and categories from Supabase
  const [rawProducts, rawCategories] = await Promise.all([
    getLandingProducts(),
    getCategoriesPaginated({ limit: 50 }),
  ]);

  const allProducts = rawProducts.map((p, idx) =>
    formatCatalogProduct(p, idx),
  );

  // Collect category names from Supabase categories + product categories
  const categoryNamesSet = new Set<string>();
  rawCategories?.data?.forEach((c) => {
    if (c.name) categoryNamesSet.add(c.name);
  });
  allProducts.forEach((p) => {
    if (p.category && p.category !== "General") {
      categoryNamesSet.add(p.category);
    }
  });

  const categories =
    categoryNamesSet.size > 0
      ? Array.from(categoryNamesSet)
      : ["Electronics", "Fashion", "Living & Decor"];

  // 1. FILTERING
  let filteredProducts = allProducts.filter((prod) => {
    // Search filter
    if (
      searchFilter &&
      !prod.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !prod.description.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    // Category filter
    if (
      categoryFilter &&
      prod.category.toLowerCase() !== categoryFilter.toLowerCase()
    ) {
      return false;
    }
    // Min Price filter
    if (minPriceFilter !== null && prod.price < minPriceFilter) {
      return false;
    }
    // Max Price filter
    if (maxPriceFilter !== null && prod.price > maxPriceFilter) {
      return false;
    }
    return true;
  });

  // 2. SORTING
  if (sortFilter === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortFilter === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortFilter === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else {
    // Default popular / newest
    filteredProducts.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }

  // 3. PAGINATION
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize,
  );

  return (
    <div className="bg-landing-hero-bg min-h-screen pt-24 pb-28 select-none font-display">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Title & Search Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-landing-primary/10 mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-landing-primary" />
              <span className="text-[11px] font-black tracking-[0.28em] uppercase text-landing-primary font-display">
                The Full Catalog
              </span>
            </div>
            <h1
              className="leading-none tracking-tight font-black text-landing-dark font-display"
              style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)" }}
            >
              Our Products
            </h1>
            <p className="text-[15px] leading-relaxed max-w-xl mt-3 text-landing-primary-muted font-display">
              Precision-crafted essentials and statement pieces curated for your
              everyday style.
            </p>
          </div>
          <SearchBar />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <FiltersSidebar categories={categories} />
          </aside>

          {/* Product Listing Section */}
          <main className="lg:col-span-3 space-y-8">
            {/* Filter Results Summary Header */}
            <div className="flex items-center justify-between py-2 pb-5 border-b border-landing-primary/10">
              <span className="text-xs font-bold text-landing-primary-muted uppercase tracking-wider">
                Showing{" "}
                <span className="text-landing-dark">
                  {totalItems === 0
                    ? "0"
                    : `${startIndex + 1} - ${Math.min(startIndex + pageSize, totalItems)}`}
                </span>{" "}
                of <span className="text-landing-dark">{totalItems}</span> items
              </span>
              <SortDropdown />
            </div>

            {/* Product Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedProducts.map((prod) => (
                  <div key={prod.id} className="h-[390px]">
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/70 backdrop-blur-md border border-dashed border-landing-primary/20 rounded-3xl p-8">
                <span className="text-xl font-black text-landing-dark block mb-2 font-display">
                  No products found
                </span>
                <span className="text-sm font-medium text-landing-primary-muted font-display">
                  Try adjusting your filters, searching for a different keyword,
                  or clearing categories.
                </span>
              </div>
            )}

            {/* Pagination Controls */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </main>
        </div>
      </div>
    </div>
  );
}
