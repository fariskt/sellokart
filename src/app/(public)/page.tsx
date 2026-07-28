import { HeroSection } from "@/components/landing/HeroSection";
import { NewArrivalsSection } from "@/components/landing/NewArrivalsSection";
import { FeaturedProductSection } from "@/components/landing/FeaturedProductSection";
import { CategorySection } from "@/components/landing/CategorySection";
import { TrendingSection } from "@/components/landing/TrendingSection";
import { BrandStorySection } from "@/components/landing/BrandStorySection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { CommunitySection } from "@/components/landing/CommunitySection";

export default function App() {
  return (
    <div className="min-h-screen pt-16 overflow-x-hidden bg-landing-hero-bg">
      <HeroSection />
      <NewArrivalsSection />
      <FeaturedProductSection />
      <CategorySection />
      <TrendingSection />
      <BrandStorySection />
      <ReviewsSection />
      <CommunitySection />
    </div>
  );
}
