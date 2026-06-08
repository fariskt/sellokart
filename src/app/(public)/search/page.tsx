import * as React from "react";
import { SearchPageClient } from "@/components/search/search-page-client";
import { SectionTitle } from "@/components/ui/title";

// -------------------------------------------------------------
// MOCK CATALOG DATA (Synchronized with Listing Page)
// -------------------------------------------------------------
const mockProducts = [
  { id: 1, name: "Studio Headset Pro", slug: "studio-headset-pro", price: 11999, oldPrice: "₹16,999", rating: 4.8, reviews: 124, badge: "-30% OFF", image: "/images/headphones.png", category: "Electronics" },
  { id: 2, name: "Creative Minimalist Desk Mat", slug: "creative-minimalist-desk-mat", price: 3999, oldPrice: "₹4,999", rating: 4.6, reviews: 88, badge: "Popular", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 3, name: "Aesthetic Premium Jacket", slug: "aesthetic-premium-jacket", price: 7499, oldPrice: "₹9,999", rating: 4.7, reviews: 92, badge: "Hot Deal", image: "/images/fashion.png", category: "Fashion" },
  { id: 4, name: "Lossless Audio Earbuds", slug: "lossless-audio-earbuds", price: 5499, oldPrice: "₹7,999", rating: 4.5, reviews: 64, badge: "Featured", image: "/images/headphones.png", category: "Electronics" },
  { id: 5, name: "Handcrafted Oak Desktop Shelf", slug: "handcrafted-oak-desktop-shelf", price: 8999, oldPrice: "₹11,999", rating: 4.9, reviews: 215, badge: "Best Seller", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 6, name: "Active Noise-Cancelling ANC Over-Ear", slug: "active-noise-cancelling-anc-over-ear", price: 18999, oldPrice: "₹24,999", rating: 4.8, reviews: 180, badge: "Top Rated", image: "/images/headphones.png", category: "Electronics" },
  { id: 7, name: "Sustainable Tailored Blazer", slug: "sustainable-tailored-blazer", price: 12499, oldPrice: "₹15,999", rating: 4.7, reviews: 74, badge: "Recommended", image: "/images/fashion.png", category: "Fashion" },
  { id: 8, name: "Minimalist Dual-Sided Desk Pad", slug: "minimalist-dual-sided-desk-pad", price: 2499, oldPrice: "₹3,499", rating: 4.6, reviews: 95, badge: "Best Value", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 9, name: "Contemporary Wool Overcoat", slug: "contemporary-wool-overcoat", price: 15999, rating: 4.9, reviews: 32, isNew: true, image: "/images/fashion.png", category: "Fashion" },
  { id: 10, name: "High-Fidelity Studio Monitor Headphones", slug: "high-fidelity-studio-monitor-headphones", price: 22999, rating: 4.8, reviews: 40, isNew: true, image: "/images/headphones.png", category: "Electronics" },
  { id: 11, name: "Premium Leather Workspace Valet", slug: "premium-leather-workspace-valet", price: 4499, rating: 4.7, reviews: 28, isNew: true, image: "/images/workspace.png", category: "Living & Decor" },
  { id: 12, name: "Seamless Knit Activewear Set", slug: "seamless-knit-activewear-set", price: 6999, rating: 4.6, reviews: 18, isNew: true, image: "/images/fashion.png", category: "Fashion" },
  { id: 13, name: "Slim Mechanical Keyboard", slug: "slim-mechanical-keyboard", price: 9999, rating: 4.7, reviews: 45, badge: "Hot Drop", image: "/images/workspace.png", category: "Electronics" },
  { id: 14, name: "Ergonomic Office Chair", slug: "ergonomic-office-chair", price: 14999, rating: 4.8, reviews: 80, badge: "Premium", image: "/images/workspace.png", category: "Living & Decor" },
  { id: 15, name: "Leather Messenger Bag", slug: "leather-messenger-bag", price: 8499, rating: 4.5, reviews: 52, badge: "Classic", image: "/images/fashion.png", category: "Fashion" },
  { id: 16, name: "Portable Wireless Speaker", slug: "portable-wireless-speaker", price: 6499, rating: 4.4, reviews: 70, badge: "Compact", image: "/images/headphones.png", category: "Electronics" }
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q || "";

  // Simulated PostgreSQL Full-Text Search (FTS) logic:
  // Splits the query into multiple keyword terms and filters products.
  let filteredResults: typeof mockProducts = [];

  if (initialQuery.trim() !== "") {
    const searchTerms = initialQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 0);
    
    filteredResults = mockProducts.filter((prod) => {
      const titleLower = prod.name.toLowerCase();
      const catLower = prod.category.toLowerCase();
      
      // Every term in the search query must match either product title or category.
      return searchTerms.every((term) => 
        titleLower.includes(term) || catLower.includes(term)
      );
    });
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container-page space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <SectionTitle
            badge="Search Engine"
            title="Search Catalog"
            subtitle="Find the exact acoustics, styles, or minimalist tools you need to elevate your modern routine."
            align="center"
            spacing="none"
          />
        </div>

        {/* Client Search Panel */}
        <SearchPageClient
          initialQuery={initialQuery}
          results={filteredResults}
          allProducts={mockProducts}
        />
        
      </div>
    </div>
  );
}
