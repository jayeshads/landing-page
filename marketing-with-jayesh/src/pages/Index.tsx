import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialProof from "@/components/SocialProof";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import BenefitsSection from "@/components/BenefitsSection";
import ProductPreview from "@/components/ProductPreview";
import ProductContent from "@/components/ProductContent";
import TestimonialSection from "@/components/TestimonialSection";
import PricingSection from "@/components/PricingSection";
import TrustSection from "@/components/TrustSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen relative">
    <ParticleBackground />
    <div className="relative z-10">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <ProductPreview />
      <ProductContent />
      <TestimonialSection />
      <PricingSection />
      <TrustSection />
      <FAQSection />
      <Footer />
    </div>
  </div>
);

export default Index;
