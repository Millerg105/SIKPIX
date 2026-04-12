import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { bundleDiscounts, BASE_PRICE } from "@/data/shopifyConfig";

const BundlesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
            Bundle & Save
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl uppercase">
            Multi-Car Discounts
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-muted-foreground">
            Order multiple car artworks and save. Discounts applied automatically at checkout.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {bundleDiscounts.map((bundle) => {
            const savings = bundle.compareAtPrice - bundle.finalPrice;
            
            return (
              <div
                key={bundle.id}
                className="card-luxury group relative overflow-hidden p-8 text-center"
              >
                {/* Discount badge */}
                <div className="absolute right-3 top-3">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded font-body text-xs font-semibold tracking-wide">
                      {bundle.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold text-foreground uppercase">
                  {bundle.name}
                  </h3>
                <p className="mt-2 font-body text-sm text-muted-foreground">
                  {bundle.description}
                </p>

                <div className="mt-6 flex flex-col items-center gap-1">
                    <span className="font-price text-sm text-muted-foreground line-through">
                      £{bundle.compareAtPrice.toFixed(2)}
                    </span>
                    <span className="font-price text-3xl font-bold text-primary">
                      £{bundle.finalPrice.toFixed(2)}
                    </span>
                  <span className="font-body text-xs text-primary">
                    Save £{savings.toFixed(2)}
                  </span>
                </div>

                <Button
                  variant="luxuryOutline"
                  size="sm"
                  className="mt-6 w-full"
                  asChild
                >
                  <Link to="/styles">Choose Styles</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center font-body text-xs text-muted-foreground">
          Base price: £{BASE_PRICE.toFixed(2)} per car artwork. Bundle pricing applied automatically.
        </p>
      </div>
    </section>
  );
};

export default BundlesSection;
