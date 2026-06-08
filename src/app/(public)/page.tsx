import * as React from "react";
import { HeroSlider } from "@/components/hero-slider";
import { SectionTitle } from "@/components/ui/title";
import { NewsletterSection } from "@/components/newsletter-section";
import {
  Laptop,
  Shirt,
  Home as HomeIcon,
  ArrowRight,
  Star,
  Flame,
  Clock,
  Heart,
  ShoppingBag,
  Smartphone,
  Dumbbell,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

// -------------------------------------------------------------
// MOCK DATA DEFINITIONS
// -------------------------------------------------------------

const mockCategories = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: Laptop,
    count: "1.2k+ Products",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    name: "Apparel & Fashion",
    slug: "fashion",
    icon: Shirt,
    count: "850+ Products",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  {
    name: "Living & Decor",
    slug: "living",
    icon: HomeIcon,
    count: "640+ Products",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    name: "Gadgets & Mobile",
    slug: "gadgets",
    icon: Smartphone,
    count: "430+ Products",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  {
    name: "Fitness & Gym",
    slug: "fitness",
    icon: Dumbbell,
    count: "210+ Products",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  {
    name: "Adventure Gear",
    slug: "adventure",
    icon: Compass,
    count: "340+ Products",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  },
];

const mockFeaturedProducts = [
  {
    id: 1,
    name: "Studio Headset Pro",
    price: "₹11,999",
    oldPrice: "₹16,999",
    rating: 4.8,
    reviews: 124,
    badge: "-30% OFF",
    image: "/images/headphones.png",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Creative Minimalist Desk Mat",
    price: "₹3,999",
    oldPrice: "₹4,999",
    rating: 4.6,
    reviews: 88,
    badge: "Popular",
    image: "/images/workspace.png",
    category: "Living & Decor",
  },
  {
    id: 3,
    name: "Aesthetic Premium Jacket",
    price: "₹7,499",
    oldPrice: "₹9,999",
    rating: 4.7,
    reviews: 92,
    badge: "Hot Deal",
    image: "/images/fashion.png",
    category: "Fashion",
  },
  {
    id: 4,
    name: "Lossless Audio Earbuds",
    price: "₹5,499",
    oldPrice: "₹7,999",
    rating: 4.5,
    reviews: 64,
    badge: "Featured",
    image: "/images/headphones.png",
    category: "Electronics",
  },
];

const mockBestSellers = [
  {
    id: 5,
    name: "Handcrafted Oak Desktop Shelf",
    price: "₹8,999",
    oldPrice: "₹11,999",
    rating: 4.9,
    reviews: 215,
    badge: "Best Seller",
    image: "/images/workspace.png",
    category: "Living & Decor",
  },
  {
    id: 6,
    name: "Active Noise-Cancelling ANC Over-Ear",
    price: "₹18,999",
    oldPrice: "₹24,999",
    rating: 4.8,
    reviews: 180,
    badge: "Top Rated",
    image: "/images/headphones.png",
    category: "Electronics",
  },
  {
    id: 7,
    name: "Sustainable Tailored Blazer",
    price: "₹12,499",
    oldPrice: "₹15,999",
    rating: 4.7,
    reviews: 74,
    badge: "Recommended",
    image: "/images/fashion.png",
    category: "Fashion",
  },
  {
    id: 8,
    name: "Minimalist Dual-Sided Desk Pad",
    price: "₹2,499",
    oldPrice: "₹3,499",
    rating: 4.6,
    reviews: 95,
    badge: "Best Value",
    image: "/images/workspace.png",
    category: "Living & Decor",
  },
];

const mockNewArrivals = [
  {
    id: 9,
    name: "Contemporary Wool Overcoat",
    price: "₹15,999",
    rating: 4.9,
    isNew: true,
    image: "/images/fashion.png",
    category: "Fashion",
  },
  {
    id: 10,
    name: "High-Fidelity Studio Monitor Headphones",
    price: "₹22,999",
    rating: 4.8,
    isNew: true,
    image: "/images/headphones.png",
    category: "Electronics",
  },
  {
    id: 11,
    name: "Premium Leather Workspace Valet",
    price: "₹4,499",
    rating: 4.7,
    isNew: true,
    image: "/images/workspace.png",
    category: "Living & Decor",
  },
  {
    id: 12,
    name: "Seamless Knit Activewear Set",
    price: "₹6,999",
    rating: 4.6,
    isNew: true,
    image: "/images/fashion.png",
    category: "Fashion",
  },
];

const mockPromoBanners = [
  {
    title: "Cinematic Sounds Upgrade",
    subtitle: "Experience high-fidelity audio up to 40 hours.",
    discount: "Flat 30% OFF",
    cta: "Shop Audio Gear",
    bgGradient: "from-blue-950 via-slate-900 to-indigo-950",
    borderHighlight: "border-blue-500/20",
    image: "/images/headphones.png",
  },
  {
    title: "Handcrafted Workspaces",
    subtitle: "Premium wood desk organizers and desk pads.",
    discount: "Up to 25% OFF",
    cta: "Explore Collections",
    bgGradient: "from-zinc-950 via-slate-900 to-amber-950/20",
    borderHighlight: "border-amber-500/20",
    image: "/images/workspace.png",
  },
];

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-background">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Categories Grid Section */}
      <section className="container-page section-padding border-b border-border">
        <SectionTitle
          badge="Curated Collections"
          title="Browse by Category"
          subtitle="Explore our carefully selected product ranges tailored for your modern lifestyle."
          align="center"
          titleVariant="default"
          titleSize="lg"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
          {mockCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="product-card p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 relative overflow-hidden"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border mb-4 transition-all duration-300 group-hover:scale-110",
                    cat.color,
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {cat.count}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container-page section-padding border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <SectionTitle
            badge="Premium Selection"
            title="Featured Products"
            subtitle="Top recommendations and highly-voted customer favorites of the week."
            align="left"
            spacing="none"
            titleVariant="default"
            titleSize="lg"
          />
          <Link
            href="/featured"
            className="inline-flex items-center text-sm font-bold text-primary hover:underline mt-4 md:mt-0 transition-all cursor-pointer group"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockFeaturedProducts.map((prod) => (
            <div
              key={prod.id}
              className="product-card overflow-hidden flex flex-col justify-between group"
            >
              <div className="h-56 bg-muted/30 relative overflow-hidden">
                {prod.badge && (
                  <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[10px] font-bold badge-sale rounded-md">
                    {prod.badge}
                  </span>
                )}
                <button
                  type="button"
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-border bg-background/80 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors shadow-xs cursor-pointer"
                  aria-label="Add to Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <Image
                  src={prod.image}
                  alt={prod.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6 border-t border-border/40 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-foreground mt-1 mb-2 line-clamp-1 group-hover:text-primary transition-colors text-base">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {prod.rating}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      ({prod.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="price text-lg">{prod.price}</span>
                    {prod.oldPrice && (
                      <span className="old-price text-xs">{prod.oldPrice}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors button-shadow cursor-pointer"
                    aria-label="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banners Section */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container-page section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mockPromoBanners.map((banner) => (
              <div
                key={banner.title}
                className={cn(
                  "relative rounded-2xl overflow-hidden p-8 md:p-12 flex flex-col justify-between min-h-[300px] border shadow-xs group",
                  banner.borderHighlight,
                )}
              >
                {/* Background Gradient */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    banner.bgGradient,
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                {/* Floating Product Image Background */}
                <div className="absolute right-4 bottom-4 md:right-10 md:bottom-10 w-2/5 h-4/5 flex items-center justify-center pointer-events-none select-none">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="max-h-full max-w-full object-contain filter brightness-95 opacity-55 md:opacity-75 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2"
                  />
                </div>

                <div className="relative z-10 max-w-md flex flex-col justify-between h-full">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground mb-4">
                      {banner.discount}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
                      {banner.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      {banner.subtitle}
                    </p>
                  </div>

                  <a
                    href="/products"
                    className="inline-flex items-center justify-center self-start px-5 py-2.5 rounded-lg font-bold text-xs bg-white text-slate-950 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>{banner.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container-page section-padding border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <SectionTitle
            badge="Top Sales"
            title="Best Sellers"
            subtitle="The highest velocity products loved by thousands of active shoppers."
            align="left"
            spacing="none"
            titleVariant="default"
            titleSize="lg"
          />
          <a
            href="/deals"
            className="inline-flex items-center text-sm font-bold text-primary hover:underline mt-4 md:mt-0 transition-all cursor-pointer group"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockBestSellers.map((prod) => (
            <div
              key={prod.id}
              className="product-card overflow-hidden flex flex-col justify-between group"
            >
              <div className="h-56 bg-muted/30 relative overflow-hidden">
                {prod.badge && (
                  <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-md flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{prod.badge}</span>
                  </span>
                )}
                <button
                  type="button"
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-border bg-background/80 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors shadow-xs cursor-pointer"
                  aria-label="Add to Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6 border-t border-border/40 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-foreground mt-1 mb-2 line-clamp-1 group-hover:text-primary transition-colors text-base">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {prod.rating}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      ({prod.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="price text-lg">{prod.price}</span>
                    {prod.oldPrice && (
                      <span className="old-price text-xs">{prod.oldPrice}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors button-shadow cursor-pointer"
                    aria-label="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="container-page section-padding border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <SectionTitle
            badge="Just Dropped"
            title="New Arrivals"
            subtitle="The latest additions to our curated styles and premium audio gear catalogs."
            align="left"
            spacing="none"
            titleVariant="default"
            titleSize="lg"
          />
          <a
            href="/products"
            className="inline-flex items-center text-sm font-bold text-primary hover:underline mt-4 md:mt-0 transition-all cursor-pointer group"
          >
            <span>Browse All Products</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockNewArrivals.map((prod) => (
            <div
              key={prod.id}
              className="product-card overflow-hidden flex flex-col justify-between group"
            >
              <div className="h-56 bg-muted/30 relative overflow-hidden">
                {prod.isNew && (
                  <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[10px] font-bold bg-success text-white rounded-md flex items-center gap-1 shadow-xs">
                    <Clock className="w-3 h-3" />
                    <span>NEW</span>
                  </span>
                )}
                <button
                  type="button"
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-border bg-background/80 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors shadow-xs cursor-pointer"
                  aria-label="Add to Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-6 border-t border-border/40 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-foreground mt-1 mb-2 line-clamp-1 group-hover:text-primary transition-colors text-base">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {prod.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="price text-lg">{prod.price}</span>
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors button-shadow cursor-pointer"
                    aria-label="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </main>
  );
}
