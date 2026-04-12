import { useEffect } from "react";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: "snapback",
    name: "Snapback Caps",
    category: "Headwear",
    shortDescription: "Premium SikPix branded snapbacks. Represent the culture.",
    basePrice: 24.99,
    image: "/images/threads/snapback.png",
    comingSoon: false,
  },
  {
    id: "tshirt",
    name: "Graphic T-Shirts",
    category: "Apparel",
    shortDescription: "Heavyweight streetwear tees featuring exclusive car art prints.",
    basePrice: 34.99,
    image: "/images/threads/tshirt.png",
    comingSoon: true,
  },
  {
    id: "hoodie",
    name: "Premium Hoodies",
    category: "Apparel",
    shortDescription: "Stay warm, look sharp. High-quality hoodies with custom logos.",
    basePrice: 59.99,
    image: "/images/threads/hoodie.png",
    comingSoon: true,
  },
  {
    id: "stickers",
    name: "Sticker Packs",
    category: "Accessories",
    shortDescription: "Die-cut car art and JDM stickers. Built to withstand the elements.",
    basePrice: 9.99,
    image: "/images/threads/stickers.png",
    comingSoon: false,
  },
];

const SickThreadsPage = () => {
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
              Merch by SikPix
            </p>
            <h1 className="font-display text-5xl font-medium tracking-tight text-foreground md:text-6xl uppercase">
              Sick Threads
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              Streetwear by Big Mon. Rep the culture.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="group relative overflow-hidden flex flex-col cursor-pointer" onClick={() => { if(!product.comingSoon) window.location.href = "https://sikpix.myshopify.com/collections/threads" }}>
                  <div className="card-luxury aspect-[3/4] overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                    
                    {product.comingSoon && (
                      <div className="absolute left-4 top-4">
                        <span className="bg-primary/20 border border-primary/50 text-white backdrop-blur-sm px-3 py-1 font-body text-xs font-medium tracking-widest uppercase">
                          Coming Soon
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col">
                      <p className="mb-1 font-body text-xs tracking-widest uppercase text-primary">
                        {product.category}
                      </p>
                      <h3 className="font-display text-xl font-medium text-foreground">
                        {product.name}
                      </h3>
                      <p className="mt-2 font-body text-sm text-muted-foreground line-clamp-2">
                        {product.shortDescription}
                      </p>
                      <div className="mt-4 flex items-baseline gap-2 mb-4">
                        <span className="font-body text-lg font-semibold text-foreground">
                          From £{product.basePrice.toFixed(2)}
                        </span>
                      </div>
                      
                      <Button variant="luxury" className="w-full" disabled={product.comingSoon}>
                        {product.comingSoon ? "COMING SOON" : "SHOP NOW"}
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

export default SickThreadsPage;
