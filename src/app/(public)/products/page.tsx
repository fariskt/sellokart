import * as React from "react";
import { FiltersSidebar } from "@/components/products/filters-sidebar";
import { SortDropdown } from "@/components/products/sort-dropdown";
import { SearchBar } from "@/components/products/search-bar";
import { Pagination } from "@/components/products/pagination";
import { AnalyticsTrigger } from "@/components/products/analytics-trigger";
import { SectionTitle } from "@/components/ui/title";
import { Heart, Star, ShoppingBag } from "lucide-react";

// -------------------------------------------------------------
// MOCK CATALOG DATA
// -------------------------------------------------------------
const mockProducts = [
  { id: 1, name: "Studio Headset Pro", price: 11999, oldPrice: "₹16,999", rating: 4.8, reviews: 124, badge: "-30% OFF", image: "/images/headphones.png", category: "Electronics" },
  { id: 2, name: "Creative Minimalist Desk Mat", price: 3999, oldPrice: "₹4,999", rating: 4.6, reviews: 88, badge: "Popular", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 3, name: "Aesthetic Premium Jacket", price: 7499, oldPrice: "₹9,999", rating: 4.7, reviews: 92, badge: "Hot Deal", image: "/images/fashion.png", category: "Fashion" },
  { id: 4, name: "Lossless Audio Earbuds", price: 5499, oldPrice: "₹7,999", rating: 4.5, reviews: 64, badge: "Featured", image: "/images/headphones.png", category: "Electronics" },
  { id: 5, name: "Handcrafted Oak Desktop Shelf", price: 8999, oldPrice: "₹11,999", rating: 4.9, reviews: 215, badge: "Best Seller", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 6, name: "Active Noise-Cancelling ANC Over-Ear", price: 18999, oldPrice: "₹24,999", rating: 4.8, reviews: 180, badge: "Top Rated", image: "/images/headphones.png", category: "Electronics" },
  { id: 7, name: "Sustainable Tailored Blazer", price: 12499, oldPrice: "₹15,999", rating: 4.7, reviews: 74, badge: "Recommended", image: "/images/fashion.png", category: "Fashion" },
  { id: 8, name: "Minimalist Dual-Sided Desk Pad", price: 2499, oldPrice: "₹3,499", rating: 4.6, reviews: 95, badge: "Best Value", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 9, name: "Contemporary Wool Overcoat", price: 15999, rating: 4.9, reviews: 32, isNew: true, image: "/images/fashion.png", category: "Fashion" },
  { id: 10, name: "High-Fidelity Studio Monitor Headphones", price: 22999, rating: 4.8, reviews: 40, isNew: true, image: "/images/headphones.png", category: "Electronics" },
  { id: 11, name: "Premium Leather Workspace Valet", price: 4499, rating: 4.7, reviews: 28, isNew: true, image: "/images/workspace.png", category: "Living & Decor" },
  { id: 12, name: "Seamless Knit Activewear Set", price: 6999, rating: 4.6, reviews: 18, isNew: true, image: "/images/fashion.png", category: "Fashion" },
  { id: 13, name: "Slim Mechanical Keyboard", price: 9999, rating: 4.7, reviews: 45, badge: "Hot Drop", image: "/images/workspace.png", category: "Electronics" },
  { id: 14, name: "Ergonomic Office Chair", price: 14999, rating: 4.8, reviews: 80, badge: "Premium", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 15, name: "Leather Messenger Bag", price: 8499, rating: 4.5, reviews: 52, badge: "Classic", image: "/images/fashion.png", category: "Fashion" },
  { id: 16, name: "Portable Wireless Speaker", price: 6499, rating: 4.4, reviews: 70, badge: "Compact", image: "/images/headphones.png", category: "Electronics" }
];

const categories = ["Electronics", "Fashion", "Living & Decor"];

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
  const pageSize = 8;

  // 1. FILTERING
  let filteredProducts = mockProducts.filter((prod) => {
    // Search filter
    if (searchFilter && !prod.name.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    // Category filter
    if (categoryFilter && prod.category.toLowerCase() !== categoryFilter.toLowerCase()) {
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
    // Default "popular": sort by ID / default reviews count
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  // 3. PAGINATION
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-background min-h-screen pt-24 pb-16 select-none">
      <div className="container-page">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border mb-8">
          <SectionTitle
            badge="Explore Catalog"
            title="Our Products"
            subtitle="Discover modern tailoring, pristine acoustics, and minimalist workspace organizers."
            align="left"
            spacing="none"
          />
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
            <div className="flex items-center justify-between py-1 pb-4 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground">
                Showing {totalItems === 0 ? "0" : `${startIndex + 1} - ${Math.min(startIndex + pageSize, totalItems)}`} of {totalItems} items
              </span>
              <SortDropdown />
            </div>

            {/* Product Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedProducts.map((prod) => (
                  <div key={prod.id} className="product-card overflow-hidden flex flex-col justify-between group">
                    {/* Analytics Trigger to log impressions */}
                    <AnalyticsTrigger productId={prod.id} productName={prod.name} />

                    <div className="h-48 bg-muted/30 relative overflow-hidden">
                      {prod.badge && (
                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[9px] font-bold badge-sale rounded-md">
                          {prod.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full border border-border bg-background/80 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors shadow-xs cursor-pointer animate-in fade-in"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-5 border-t border-border/40 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{prod.category}</span>
                        <h4 className="font-bold text-foreground mt-1 mb-2 line-clamp-1 group-hover:text-primary transition-colors text-sm">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{prod.rating}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold">({prod.reviews})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex flex-col">
                          <span className="price text-base">₹{prod.price.toLocaleString()}</span>
                        </div>
                        <button
                          type="button"
                          className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors button-shadow cursor-pointer active:scale-95"
                          aria-label="Add to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl">
                <span className="text-lg font-bold text-foreground block mb-1">No products found</span>
                <span className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</span>
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
