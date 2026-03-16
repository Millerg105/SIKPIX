import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { imageMap } from "@/hooks/useImageMap";
import { BASE_PRICE, addOns, bundleDiscounts, podOptions } from "@/data/shopifyConfig";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary flex-shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!product) {
    return <Navigate to="/styles" replace />;
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const printHighlights = podOptions.filter((option) => ["print-a3-fine-art", "framed-canvas-a2", "framed-canvas-a2-premium"].includes(option.id));

  return (
    <PublicSiteShell>
      <div>
        {/* Hero Block */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Product Image */}
              <div className="relative">
                <div className="card-luxury aspect-[3/4] overflow-hidden">
                  <img
                    src={imageMap[product.id]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {product.isBestseller && (
                  <div className="absolute left-4 top-4">
                    <span className="bg-primary px-4 py-2 font-body text-xs font-medium tracking-widest uppercase text-primary-foreground">
                      Bestseller
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <p className="mb-2 font-body text-xs tracking-[0.3em] uppercase text-primary">
                  {product.category}
                </p>
                <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-4 font-body text-lg text-muted-foreground">
                  {product.shortDescription}
                </p>

                {/* Key Value Props */}
                <ul className="mt-8 space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">4K+ resolution digital artwork</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">Delivered within 24-48 hours</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">Print-ready files included (Premium)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm text-foreground">Full personal use rights</span>
                  </li>
                </ul>
                <p className="mt-4 font-body text-sm text-primary">
                  Most popular package: 3 artworks for £24.99
                </p>

                {/* Price */}
                <div className="mt-8 space-y-5 rounded border border-border/50 bg-charcoal p-6">
                  <div>
                    <p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Section 1: Choose Your Style Package</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-price text-3xl font-semibold text-foreground">
                        From £{BASE_PRICE.toFixed(2)}
                      </span>
                      <span className="font-body text-sm text-muted-foreground">starter digital</span>
                    </div>
                    <p className="mt-2 font-body text-sm text-muted-foreground">
                      Base digital artwork delivered as a high-resolution JPG.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {bundleDiscounts.map((bundle) => (
                      <div key={bundle.id} className="rounded border border-primary/20 bg-background/40 p-4 text-left">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-display text-xl text-foreground">{bundle.name}</p>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 font-body text-[10px] uppercase tracking-[0.2em] text-primary">
                            {bundle.badge}
                          </span>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="font-price text-xs text-muted-foreground line-through">£{bundle.compareAtPrice.toFixed(2)}</span>
                          <span className="font-price text-2xl font-semibold text-primary">£{bundle.finalPrice.toFixed(2)}</span>
                        </div>
                        <p className="mt-2 font-body text-xs uppercase tracking-[0.2em] text-primary">{bundle.discountLabel}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Section 2: Add a Physical Print</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {printHighlights.map((option) => (
                        <div key={option.id} className="rounded border border-border/60 bg-background/30 p-4">
                          <p className="font-price text-lg font-semibold text-foreground">£{option.price.toFixed(2)}</p>
                          <p className="mt-1 font-body text-sm text-foreground">{option.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-body text-xs uppercase tracking-[0.24em] text-primary">Section 3: Add-Ons</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {addOns.map((addon) => (
                        <span key={addon.id} className="rounded border border-border/60 bg-background/30 px-3 py-2 font-body text-xs text-muted-foreground">
                          {addon.name} (+£{addon.price.toFixed(2)})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <Button variant="hero" size="hero" className="w-full sm:w-auto" asChild>
                    <Link to={`/create?style=${product.slug}`}>Create This Style</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start CTA */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 font-display text-2xl font-medium text-foreground">Ready to Create?</h2>
              <p className="mb-8 font-body text-muted-foreground">
                Customize your order with add-ons, print options, and bundle discounts in the checkout flow.
              </p>
              <Button variant="hero" size="hero" asChild>
                <Link to={`/create?style=${product.slug}`}>Start Creating Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Long Description */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-2xl font-medium text-foreground">About This Style</h2>
              <p className="mt-4 font-body text-lg leading-relaxed text-muted-foreground">
                {product.longDescription}
              </p>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-display text-2xl font-medium text-foreground">What You Get</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {product.whatYouReceive.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Substyles */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-display text-2xl font-medium text-foreground">Available Substyles</h2>
              <div className="flex flex-wrap gap-3">
                {product.substyles.map((substyle, index) => (
                  <span
                    key={index}
                    className="rounded border border-border bg-charcoal px-4 py-2 font-body text-sm text-foreground"
                  >
                    {substyle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Mini */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-display text-2xl font-medium text-foreground">How It Works</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {product.howItWorks.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="font-body text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upload Tips */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-display text-2xl font-medium text-foreground">Upload Tips for Best Results</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {product.uploadInstructions.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-display text-2xl font-medium text-foreground">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {product.faq.map((item, index) => (
                  <div key={index} className="card-luxury p-6">
                    <h3 className="font-display text-lg font-medium text-foreground">
                      {item.question}
                    </h3>
                    <p className="mt-2 font-body text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-display text-3xl font-medium text-foreground md:text-4xl">
                Ready to turn your car into wall-worthy art?
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-body text-muted-foreground">
                Transform your photo into a stunning {product.name} today.
            </p>
            <div className="mt-8">
              <Button variant="hero" size="hero" asChild>
                <Link to={`/create?style=${product.slug}`}>
                  Create Your {product.name.split(" ")[0]} Artwork
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <h2 className="mb-8 font-display text-2xl font-medium text-foreground">
                More {product.category} Styles
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/product/${related.slug}`}
                    className="group"
                  >
                    <div className="card-luxury aspect-[3/4] overflow-hidden">
                      <img
                        src={imageMap[related.id]}
                        alt={related.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="font-display text-lg font-medium text-foreground">
                        {related.name}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        From £{BASE_PRICE.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PublicSiteShell>
  );
};

export default ProductPage;
