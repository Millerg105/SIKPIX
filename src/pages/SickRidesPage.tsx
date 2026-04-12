import { useEffect } from "react";
import { Link } from "react-router-dom";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: "rims",
    name: "Custom Rim Designs",
    category: "Exterior",
    shortDescription: "Bespoke wheel concepts tailored to your vehicle's stance.",
    image: "/images/rides/rims.png",
  },
  {
    id: "wrap",
    name: "Vinyl Wrap Concepts",
    category: "Exterior",
    shortDescription: "Complete vehicle wrap designs. See it before you wrap it.",
    image: "/images/rides/wrap.png",
  },
  {
    id: "decals",
    name: "Car Stickers & Decals",
    category: "Details",
    shortDescription: "Custom graphics, racing numbers, and striking visual elements.",
    image: "/images/rides/stickers.png",
  },
  {
    id: "render",
    name: "Full Vehicle Renders",
    category: "Concept",
    shortDescription: "Complete digital transformation for your custom build project.",
    image: "/images/rides/render.png",
  },
];

const SickRidesPage = () => {
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
              Automotive Design
            </p>
            <h1 className="font-display text-5xl font-medium tracking-tight text-foreground md:text-6xl uppercase">
              Sick Rides
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              Custom automotive designs. Your car, your way.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="group relative overflow-hidden flex flex-col">
                  <div className="card-luxury aspect-[3/4] overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col h-1/2 justify-end">
                      <p className="mb-1 font-body text-xs tracking-widest uppercase text-primary">
                        {product.category}
                      </p>
                      <h3 className="font-display text-xl font-medium text-foreground">
                        {product.name}
                      </h3>
                      <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2 mb-6">
                        {product.shortDescription}
                      </p>
                      
                      <Button variant="luxury" className="w-full" asChild>
                        <Link to="/create">REQUEST CUSTOM DESIGN</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicSiteShell>
  );
};

export default SickRidesPage;
