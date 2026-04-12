import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";
import ProtectedImage from "@/components/ProtectedImage";
import { ridesProducts } from "@/data/ridesProducts";
import { toast } from "sonner";

const RidesProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = ridesProducts.find((p) => p.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!product) {
    return <Navigate to="/sick-rides" replace />;
  }

  const handleBuyNow = () => {
    toast.info("Shopify checkout coming soon");
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Quote Request: ${product.name}`);
    const body = encodeURIComponent(
      `Name: ${quoteForm.name}\nEmail: ${quoteForm.email}\n\nProduct: ${product.name}\n\nDetails:\n${quoteForm.message}`
    );
    window.location.href = `mailto:bigmon270@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <PublicSiteShell>
      <div>
        {/* Breadcrumb */}
        <section className="pt-8 pb-4">
          <div className="container mx-auto px-6">
            <nav className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/sick-rides" className="hover:text-primary transition-colors">Sick Rides</Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </section>

        {/* Product Detail */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-12 lg:grid-cols-2">
                {/* Image */}
                <div className="card-luxury overflow-hidden">
                  <ProtectedImage
                    src={product.image}
                    alt={product.name}
                    wrapperClassName="aspect-square w-full"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center">
                  <p className="mb-2 font-body text-xs tracking-[0.3em] uppercase text-primary">
                    {product.category}
                  </p>
                  <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
                    {product.name}
                  </h1>
                  <p className="mt-6 font-body text-base leading-relaxed text-muted-foreground">
                    {product.longDescription}
                  </p>

                  {product.isQuote ? (
                    /* Quote Form */
                    <form onSubmit={handleQuoteSubmit} className="mt-8 space-y-4">
                      <div>
                        <label htmlFor="quote-name" className="mb-2 block font-body text-sm text-foreground">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="quote-name"
                          required
                          value={quoteForm.name}
                          onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                          placeholder="Your name"
                          className="w-full rounded border border-border bg-charcoal px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-email" className="mb-2 block font-body text-sm text-foreground">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="quote-email"
                          required
                          value={quoteForm.email}
                          onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                          placeholder="your@email.com"
                          className="w-full rounded border border-border bg-charcoal px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-message" className="mb-2 block font-body text-sm text-foreground">
                          Tell us what you want *
                        </label>
                        <textarea
                          id="quote-message"
                          required
                          rows={4}
                          value={quoteForm.message}
                          onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                          placeholder="Describe your car, what you're after, and any reference images or ideas..."
                          className="w-full rounded border border-border bg-charcoal px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <Button type="submit" variant="luxury" size="lg" className="w-full mt-2">
                        REQUEST QUOTE
                      </Button>
                      <p className="text-center font-body text-xs text-muted-foreground">
                        Opens your email client with your details prefilled.
                      </p>
                    </form>
                  ) : (
                    /* Buy Section */
                    <div className="mt-8 space-y-6">
                      <div>
                        <span className="font-price text-3xl font-bold text-primary">
                          {product.price}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-4">
                        <span className="font-body text-sm text-foreground">Quantity</span>
                        <div className="flex items-center rounded border border-border">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-charcoal transition-colors"
                          >
                            -
                          </button>
                          <span className="flex h-10 w-12 items-center justify-center border-x border-border font-body text-sm text-foreground">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-charcoal transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <Button variant="hero" size="hero" className="w-full" onClick={handleBuyNow}>
                        BUY NOW
                      </Button>
                      <p className="text-center font-body text-xs text-muted-foreground">
                        Secure checkout powered by Shopify.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default RidesProductPage;
