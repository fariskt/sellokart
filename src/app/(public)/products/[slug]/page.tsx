import * as React from "react";
import { ProductDetailsClient } from "@/components/products/product-details-client";
import { SectionTitle } from "@/components/ui/title";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// -------------------------------------------------------------
// MOCK CATALOG DATA (Synchronized with Listing Page)
// -------------------------------------------------------------
const mockProducts = [
  { id: 1, name: "Studio Headset Pro", slug: "studio-headset-pro", price: 11999, oldPrice: "₹16,999", rating: 4.8, reviews: 124, badge: "-30% OFF", image: "/images/headphones.png", category: "Electronics", description: "Experience acoustic perfection with our Studio Headset Pro. Built with custom active noise cancellation, smart ambient awareness, and up to 40 hours of playback." },
  { id: 2, name: "Creative Minimalist Desk Mat", slug: "creative-minimalist-desk-mat", price: 3999, oldPrice: "₹4,999", rating: 4.6, reviews: 88, badge: "Popular", image: "/images/workspace.png", category: "Living & Decor", description: "Handcrafted minimalist desk pad to protect your creative space. Designed with non-slip organic felt and tailoring that provides clean aesthetics." },
  { id: 3, name: "Aesthetic Premium Jacket", slug: "aesthetic-premium-jacket", price: 7499, oldPrice: "₹9,999", rating: 4.7, reviews: 92, badge: "Hot Deal", image: "/images/fashion.png", category: "Fashion", description: "Tailored jacket with contemporary styling. Made of sustainable wool fibers that provide comfort, warmth, and modern structure." },
  { id: 4, name: "Lossless Audio Earbuds", slug: "lossless-audio-earbuds", price: 5499, oldPrice: "₹7,999", rating: 4.5, reviews: 64, badge: "Featured", image: "/images/headphones.png", category: "Electronics", description: "Premium true wireless earbuds with high-definition audio drivers, active noise cancellation, and a long-lasting smart charging case." },
  { id: 5, name: "Handcrafted Oak Desktop Shelf", slug: "handcrafted-oak-desktop-shelf", price: 8999, oldPrice: "₹11,999", rating: 4.9, reviews: 215, badge: "Best Seller", image: "/images/workspace.png", category: "Living & Decor", description: "Maximize desk space and elevate your monitor to eye level. Made of sustainably harvested oak wood and solid aluminum steel legs." },
  { id: 6, name: "Active Noise-Cancelling ANC Over-Ear", slug: "active-noise-cancelling-anc-over-ear", price: 18999, oldPrice: "₹24,999", rating: 4.8, reviews: 180, badge: "Top Rated", image: "/images/headphones.png", category: "Electronics", description: "Flagship over-ear headphones with advanced hybrid ANC, custom sound profiles, high-res audio certification, and premium leather padding." },
  { id: 7, name: "Sustainable Tailored Blazer", slug: "sustainable-tailored-blazer", price: 12499, oldPrice: "₹15,999", rating: 4.7, reviews: 74, badge: "Recommended", image: "/images/fashion.png", category: "Fashion", description: "Sophisticated single-breasted blazer constructed with sustainable organic cotton blend, tailored for a clean, sharp silhouette." },
  { id: 8, name: "Minimalist Dual-Sided Desk Pad", slug: "minimalist-dual-sided-desk-pad", price: 2499, oldPrice: "₹3,499", rating: 4.6, reviews: 95, badge: "Best Value", image: "/images/workspace.png", category: "Living & Decor", description: "Reversible premium vegan leather desk pad featuring dual textures and colors. Spill-resistant and easy to clean, adding structure to any desk." },
  { id: 9, name: "Contemporary Wool Overcoat", slug: "contemporary-wool-overcoat", price: 15999, rating: 4.9, reviews: 32, isNew: true, image: "/images/fashion.png", category: "Fashion", description: "A timeless winter essential made of heavy wool blend, featuring notched lapels, single-breasted closure, and elegant pocket details." },
  { id: 10, name: "High-Fidelity Studio Monitor Headphones", slug: "high-fidelity-studio-monitor-headphones", price: 22999, rating: 4.8, reviews: 40, isNew: true, image: "/images/headphones.png", category: "Electronics", description: "Professional-grade open-back reference headphones designed for mixing, mastering, and critical listening with ultimate stereo imaging." },
  { id: 11, name: "Premium Leather Workspace Valet", slug: "premium-leather-workspace-valet", price: 4499, rating: 4.7, reviews: 28, isNew: true, image: "/images/workspace.png", category: "Living & Decor", description: "Handy tray for holding keys, watch, phone, and coins on your desk. Crafted from full-grain vegetable-tanned leather." },
  { id: 12, name: "Seamless Knit Activewear Set", slug: "seamless-knit-activewear-set", price: 6999, rating: 4.6, reviews: 18, isNew: true, image: "/images/fashion.png", category: "Fashion", description: "Highly stretchable, breathable, and sweat-wicking two-piece set designed for athletic performance and absolute comfort." },
  { id: 13, name: "Slim Mechanical Keyboard", slug: "slim-mechanical-keyboard", price: 9999, rating: 4.7, reviews: 45, badge: "Hot Drop", image: "/images/workspace.png", category: "Electronics", description: "Ultra-thin mechanical keyboard with low-profile tactile switches, white backlight, and multi-device bluetooth connectivity." },
  { id: 14, name: "Ergonomic Office Chair", slug: "ergonomic-office-chair", price: 14999, rating: 4.8, reviews: 80, badge: "Premium", image: "/images/workspace.png", category: "Living & Decor", description: "Adjustable lumbar support, breathable mesh back, and synchro-tilt mechanism to provide supreme posture health during long focus hours." },
  { id: 15, name: "Leather Messenger Bag", slug: "leather-messenger-bag", price: 8499, rating: 4.5, reviews: 52, badge: "Classic", image: "/images/fashion.png", category: "Fashion", description: "Durable classic messenger bag built from oil-tanned leather, featuring a padded laptop compartment and secure buckle straps." },
  { id: 16, name: "Portable Wireless Speaker", slug: "portable-wireless-speaker", price: 6499, rating: 4.4, reviews: 70, badge: "Compact", image: "/images/headphones.png", category: "Electronics", description: "Take pristine acoustics anywhere. Waterproof, shockproof, and delivers 360-degree sound signature with punchy bass." }
];

const getProductBySlug = (slug: string) => {
  const found = mockProducts.find((p) => p.slug === slug);
  if (found) return found;

  // Generate fallback to prevent error
  const name = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id: 999,
    name: name || "Premium Product",
    slug,
    price: 9999,
    oldPrice: "₹12,999",
    rating: 4.7,
    reviews: 42,
    badge: "Limited Edition",
    image: "/images/headphones.png",
    category: "General",
    description: `Discover the details of ${name}. This item features compromise-free craftsmanship and top-tier materials curated to fit your modern lifestyle.`
  };
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Get 4 related products in the same category (excluding current product)
  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // If we don't have enough, fill in with other products
  if (relatedProducts.length < 4) {
    const fillers = mockProducts
      .filter((p) => p.id !== product.id && !relatedProducts.some((rp) => rp.id === p.id))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...fillers);
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container-page">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Shop</span>
          </Link>
        </div>

        {/* Client Product Details */}
        <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
      </div>
    </div>
  );
}
