import { Link } from "react-router-dom";
import { products } from "@/data/products";
import { imageMap } from "@/hooks/useImageMap";
import ProtectedImage from "@/components/ProtectedImage";

const bestsellers = products.filter((p) => p.isBestseller);

const Bestsellers = () => {
  return (
    <section className="py-24 sm:py-28">
      <div className="container mx-auto px-6">
        <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              Most Popular
            </p>
            <h2 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
              Bestsellers
            </h2>
          </div>
          <Link
            to="/styles"
            className="font-body text-sm tracking-widest uppercase text-primary transition-colors hover:text-primary/80"
          >
            View All Styles →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="group"
            >
              <div className="card-luxury aspect-[3/4] overflow-hidden">
                <ProtectedImage
                  src={imageMap[product.id]}
                  alt={product.name}
                  loading="lazy"
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-6 space-y-2">
                <p className="font-body text-xs tracking-widest uppercase text-primary">
                  {product.category}
                </p>
                <h3 className="font-display text-lg font-medium text-foreground">
                  {product.name}
                </h3>
                <p className="font-body text-lg font-semibold text-foreground">
                  From £{product.basePrice.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
