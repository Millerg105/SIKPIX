import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ProductGrid from "@/components/ProductGrid";
import Bestsellers from "@/components/Bestsellers";
import GalleryPreview from "@/components/GalleryPreview";
import LandingMarqueeSection from "@/components/LandingMarqueeSection";
import BundlesSection from "@/components/BundlesSection";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import PublicSiteShell from "@/components/PublicSiteShell";

const Index = () => {
  return (
    <PublicSiteShell hero={<HeroSection />}>
      <div className="relative">
        <HowItWorks />
        <LandingMarqueeSection />
        <ProductGrid />
        <Bestsellers />
        <GalleryPreview />
        <BundlesSection />
        <Testimonials />
        <CTASection />
        {/* Perfect For Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 text-center">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              Perfect For
            </p>
            <p className="font-body text-lg text-muted-foreground">
              Birthdays • Garage Art • Car Meets • New Car Gifts • Modified Builds • Car Clubs
            </p>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default Index;
