import { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteShell from "@/components/PublicSiteShell";
import { products } from "@/data/products";
import { imageMap } from "@/hooks/useImageMap";
import ProtectedImage from "@/components/ProtectedImage";

const StylesPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <PublicSiteShell>
      <div>
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-6">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              8 Custom Art Styles
            </p>
            <h1 className="font-display text-5xl font-medium tracking-tight text-foreground md:text-6xl">
              Choose Your Style
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              From GTA street scenes to cartoon illustrations, find the perfect style for your car.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="group relative overflow-hidden"
                >
                  <div className="card-luxury aspect-[3/4] overflow-hidden">
                    <ProtectedImage
                      src={imageMap[product.id]}
                      alt={product.name}
                      loading="lazy"
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                    
                    {product.isBestseller && (
                      <div className="absolute left-4 top-4">
                        <span className="bg-primary px-3 py-1 font-body text-xs font-medium tracking-widest uppercase text-primary-foreground">
                          Bestseller
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="mb-1 font-body text-xs tracking-widest uppercase text-primary">
                        {product.category}
                      </p>
                      <h3 className="font-display text-xl font-medium text-foreground">
                        {product.name}
                      </h3>
                      <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="font-body text-lg font-semibold text-foreground">
                          From £{product.basePrice.toFixed(2)}
                        </span>
                        <span className="font-body text-sm text-muted-foreground">
                          / base
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default StylesPage;
