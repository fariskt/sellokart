import { HeroSlider } from "@/components/hero-slider";
import { SectionTitle } from "@/components/ui/title";
import { Laptop, Shirt, Home as HomeIcon, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-background">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Categories Section (Centered SectionTitle) */}
      <section className="container-page section-padding">
        <SectionTitle
          badge="Curated Collections"
          title="Browse by Category"
          subtitle="Explore our carefully selected product ranges tailored for your modern lifestyle."
          align="center"
          titleVariant="default"
          titleSize="lg"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          {/* Tech Card */}
          <div className="product-card p-8 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-secondary-foreground mb-6 transition-transform group-hover:scale-110">
              <Laptop className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Electronics</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Immerse yourself in state-of-the-art gadgets, sound systems, and workspace items.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline"
            >
              <span>Explore Tech</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Fashion Card */}
          <div className="product-card p-8 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-secondary-foreground mb-6 transition-transform group-hover:scale-110">
              <Shirt className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Apparel</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Discover contemporary fashion silhouettes designed for absolute comfort and styling.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline"
            >
              <span>Explore Apparel</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Home Card */}
          <div className="product-card p-8 flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-secondary-foreground mb-6 transition-transform group-hover:scale-110">
              <HomeIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Living & Decor</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Furnish your modern environment with plants, organizers, and cozy accents.
            </p>
            <a
              href="#"
              className="inline-flex items-center text-sm font-semibold text-primary group-hover:underline"
            >
              <span>Explore Living</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Promos Section (Left-Aligned SectionTitle) */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container-page section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 flex flex-col justify-center">
              <SectionTitle
                badge="Flash Promotion"
                title="Weekly Hot Deals"
                subtitle="Don't miss out on our seasonal discounts. Upgrade your gear and styles with up to 50% discount. Limited quantities available."
                align="left"
                spacing="none"
                titleVariant="gradient"
                titleSize="lg"
              />
              
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all bg-primary text-primary-foreground hover:bg-primary-hover button-shadow cursor-pointer hover:translate-y-[-2px] active:translate-y-0"
                >
                  View All Offers
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all border border-border text-foreground hover:bg-background cursor-pointer hover:translate-y-[-2px] active:translate-y-0"
                >
                  Read T&C
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Card 1 */}
              <div className="product-card overflow-hidden">
                <div className="h-48 bg-muted relative flex items-center justify-center p-6">
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold badge-sale rounded-md">
                    -30% OFF
                  </span>
                  <img
                    src="/images/headphones.png"
                    alt="Wireless headphones"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-foreground mb-1 text-lg">Studio Headset Pro</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="price sale-price">₹11,999</span>
                    <span className="old-price">₹16,999</span>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-accent/40 transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Card 2 */}
              <div className="product-card overflow-hidden">
                <div className="h-48 bg-muted relative flex items-center justify-center p-6">
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold badge-stock rounded-md">
                    IN STOCK
                  </span>
                  <img
                    src="/images/workspace.png"
                    alt="Desk mat"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-foreground mb-1 text-lg">Creative Desk Mat</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="price">₹3,999</span>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-accent/40 transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
