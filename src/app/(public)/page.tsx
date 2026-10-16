import { HeroSection } from "@/components/landing/HeroSection";
import { NewArrivalsSection } from "@/components/landing/NewArrivalsSection";
import { FeaturedProductSection } from "@/components/landing/FeaturedProductSection";
import { ReviewsSection } from "@/components/landing/ReviewsSection";
import { WhatsAppCta } from "@/components/landing/WhatsappCta";

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-landing-dark">
      <HeroSection />
      <NewArrivalsSection />
      <FeaturedProductSection />
      <ReviewsSection />
      <WhatsAppCta />
    </div>
  );
}
