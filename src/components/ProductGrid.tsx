import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { imageMap } from "@/hooks/useImageMap";

const ProductGrid = () => {
  return (
    <section className="py-24 sm:py-28">
      <div className="container mx-auto px-6">
        <div className="mb-20 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
              <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
                8 Signature Styles
              </p>
            <h2 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
              Choose Your Style
            </h2>
              <p className="mt-6 max-w-2xl font-body text-lg text-muted-foreground">
                From GTA sunsets to neon night scenes, pick the car-art style that fits your build best.
              </p>
              <p className="mt-2 font-body text-sm text-primary">
                Most customers choose 2-3 styles for gifts, garages, and bundles.
              </p>
          </div>
          <Link
            to="/styles"
            className="font-body text-sm tracking-widest uppercase text-primary transition-colors hover:text-primary/80"
          >
            View All Styles →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="group relative overflow-hidden"
            >
              <div className="card-luxury aspect-[3/4] overflow-hidden">
                <img
                  src={imageMap[product.id]}
                  alt={product.name}
                  loading="lazy"
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
  );
};

export default ProductGrid;
