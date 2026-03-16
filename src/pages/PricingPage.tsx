import { Link } from "react-router-dom";
import { useEffect } from "react";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";
import { BASE_PRICE, addOns, podOptions, bundleDiscounts } from "@/data/shopifyConfig";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary flex-shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PricingPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <PublicSiteShell>
      <div>
        {/* Hero */}
        <section className="py-16 text-center sm:py-20">
          <div className="container mx-auto px-6">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              Transparent Pricing
            </p>
            <h1 className="font-display text-5xl font-medium tracking-tight text-foreground md:text-6xl">
              Pricing & Packages
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              Simple, transparent pricing with no hidden fees. Choose the option that works best for you.
            </p>
          </div>
        </section>

        {/* Base Pricing */}
        <section className="pb-14 sm:pb-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center font-display text-3xl font-medium text-foreground">
              Digital Car Art Pricing
            </h2>
            <div className="mx-auto max-w-xl">
              {/* Base Tier */}
              <div className="card-luxury relative overflow-hidden border-primary/50 p-8 sm:p-10">
                <div className="absolute right-4 top-4">
                  <span className="bg-primary px-3 py-1 font-body text-xs font-medium tracking-widest uppercase text-primary-foreground">
                    Base Price
                  </span>
                </div>
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-medium text-foreground">Digital Artwork</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    High-resolution digital artwork delivered as JPG
                  </p>
                </div>
                <div className="mb-8">
                  <span className="font-price text-5xl font-semibold text-primary">£{BASE_PRICE.toFixed(2)}</span>
                  <span className="font-body text-lg text-muted-foreground"> / artwork</span>
                </div>
                <ul className="mb-10 space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">High-resolution digital file (4K+)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">24-48 hour delivery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">1 vehicle included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">Suitable for social media + standard printing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">Full personal use rights</span>
                  </li>
                </ul>
                <Button variant="luxury" className="w-full" asChild>
                  <Link to="/create">Get Your SikPix</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bundle & Save Section */}
        <section className="py-14 sm:py-16">
          <div className="container mx-auto px-6">
            <p className="mb-4 text-center font-body text-xs tracking-[0.3em] uppercase text-primary">
              Bundle & Save
            </p>
            <h2 className="mb-4 text-center font-display text-3xl font-medium text-foreground md:text-4xl">
              Multi-Car Discounts
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center font-body text-muted-foreground">
              Order multiple car artworks and save — discounts applied automatically at checkout.
            </p>
            
            <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
              {bundleDiscounts.map((bundle) => {
                return (
                  <div key={bundle.id} className="card-luxury relative overflow-hidden p-8 text-center">
                    {/* Discount Badge */}
                    <div className="absolute right-4 top-4">
                      <span className="rounded-full border border-primary/50 bg-background/50 px-3 py-1 font-body text-xs font-medium text-primary">
                        {bundle.badge}
                      </span>
                    </div>
                    
                    {/* Title */}
                      <h3 className="mt-4 font-display text-2xl font-medium text-foreground">
                        {bundle.name}
                      </h3>
                    <p className="mt-2 font-body text-sm text-muted-foreground">
                      {bundle.description}
                    </p>
                    
                    {/* Pricing */}
                    <div className="mt-6 space-y-1">
                      <p className="font-price text-sm text-muted-foreground line-through">
                        £{bundle.compareAtPrice.toFixed(2)}
                      </p>
                      <p className="font-price text-4xl font-semibold text-primary">
                        £{bundle.finalPrice.toFixed(2)}
                      </p>
                      <p className="font-body text-xs text-primary">
                        Save £{(bundle.compareAtPrice - bundle.finalPrice).toFixed(2)}
                      </p>
                    </div>
                    
                    {/* CTA */}
                    <Button variant="luxuryOutline" className="mt-8 w-full" asChild>
                      <Link to="/create">Choose Styles</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <p className="mx-auto mt-8 max-w-xl text-center font-body text-xs text-muted-foreground">
              Base price: £{BASE_PRICE.toFixed(2)} per digital artwork. Bundle discounts applied automatically.
            </p>
          </div>
        </section>

        {/* Add-ons */}
        <section className="py-14 sm:py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-4 text-center font-display text-3xl font-medium text-foreground">
              Add-Ons
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center font-body text-muted-foreground">
              Level up your car art with these optional extras.
            </p>
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {addOns.map((addon) => (
                <div key={addon.id} className="card-luxury p-8 text-center">
                  <p className="font-price text-3xl font-semibold text-primary">+£{addon.price.toFixed(2)}</p>
                  <p className="mt-3 font-body text-sm font-medium text-foreground">{addon.name}</p>
                  <p className="mt-2 font-body text-xs text-muted-foreground">{addon.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POD Options */}
        <section className="py-14 sm:py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-4 text-center font-display text-3xl font-medium text-foreground">
              Print Options
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center font-body text-muted-foreground">
              Get your car art printed and delivered to your door. Fulfilled via high-quality print partners.
            </p>
            
            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {podOptions.map((pod) => (
                <div key={pod.id} className="card-luxury p-8 text-center">
                  <p className="font-price text-3xl font-semibold text-primary">£{pod.price.toFixed(2)}</p>
                  <p className="mt-3 font-body text-sm font-medium text-foreground">{pod.name.replace(' (Premium Matte)', '').replace(' (Black Frame)', '')}</p>
                  <p className="mt-2 font-body text-xs text-muted-foreground">{pod.description}</p>
                </div>
              ))}
            </div>
            
            <p className="mx-auto mt-8 max-w-xl text-center font-body text-xs text-muted-foreground">
              Print prices are in addition to the £{BASE_PRICE.toFixed(2)} base digital artwork. Orders delivered worldwide.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 sm:py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/8 bg-black/20 px-6 py-10 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-[3px] sm:px-10">
              <h2 className="font-display text-3xl font-medium text-foreground md:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-body text-muted-foreground">
                Choose your style and create your masterpiece today.
              </p>
              <div className="mt-8">
                <Button variant="hero" size="hero" className="w-full sm:w-auto" asChild>
                  <Link to="/create">Get Your SikPix</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default PricingPage;
