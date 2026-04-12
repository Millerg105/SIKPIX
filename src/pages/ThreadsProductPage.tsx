import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicSiteShell from "@/components/PublicSiteShell";
import ProtectedImage from "@/components/ProtectedImage";
import { Button } from "@/components/ui/button";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { getThreadsProductBySlug } from "@/data/threadsData";

const SIZES = ["S", "M", "L", "XL"] as const;

const ThreadsProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = slug ? getThreadsProductBySlug(slug) : undefined;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!product) {
    return (
      <PublicSiteShell>
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">
            Product Not Found
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            We could not find that product.
          </p>
          <Button variant="luxury" onClick={() => navigate("/sick-threads")}>
            Back to Sick Threads
          </Button>
        </div>
      </PublicSiteShell>
    );
  }

  const handleBuyNow = () => {
    if (product.hasSizes && !selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    toast.info("Shopify checkout coming soon.");
  };

  return (
    <PublicSiteShell>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <nav className="container mx-auto px-6 pt-8 pb-4">
          <ol className="flex items-center gap-1 font-body text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link
                to="/sick-threads"
                className="hover:text-primary transition-colors"
              >
                Sick Threads
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3 w-3" />
            </li>
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Product Detail */}
        <section className="container mx-auto px-6 pb-32">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <div className="card-luxury overflow-hidden aspect-square">
              <ProtectedImage
                src={product.image}
                alt={product.name}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <p className="mb-2 font-body text-xs tracking-[0.3em] uppercase text-primary">
                {product.category}
              </p>

              <h1 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl uppercase">
                {product.name}
              </h1>

              <p className="mt-6 font-body text-base leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <p className="mt-8 font-display text-3xl text-foreground">
                £{product.basePrice.toFixed(2)}
              </p>

              {/* Size Selector */}
              {product.hasSizes && (
                <div className="mt-8">
                  <p className="mb-3 font-body text-sm font-medium text-foreground">
                    Size
                  </p>
                  <div className="flex gap-3">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-11 w-11 items-center justify-center border font-body text-sm font-medium transition-all ${
                          selectedSize === size
                            ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.15)]"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              <div className="mt-8">
                <p className="mb-3 font-body text-sm font-medium text-foreground">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center border-x border-border font-body text-sm font-medium text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                    disabled={quantity >= 5}
                    className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Buy Now */}
              <div className="mt-10">
                <Button
                  variant="luxury"
                  size="lg"
                  className="w-full sm:w-auto px-16 py-6 text-sm"
                  onClick={handleBuyNow}
                >
                  BUY NOW
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default ThreadsProductPage;
