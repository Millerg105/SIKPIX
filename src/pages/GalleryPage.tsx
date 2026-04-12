import { useState, useMemo } from "react";
import PublicSiteShell from "@/components/PublicSiteShell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { imageMap, galleryImageMap } from "@/hooks/useImageMap";
import ProtectedImage from "@/components/ProtectedImage";

// Category filter labels matching our 8 car art styles
const filterCategories = [
  "All",
  "GTA Street",
  "Neon Night",
  "Street Racer",
  "Cartoon",
  "Lowrider",
  "Drift",
];

// Car art gallery items matching our 8 products and their substyles
const galleryItems = [
  // GTA STREET (5 images)
  { id: "gta-street", name: "GTA Street", slug: "gta-street", category: "GTA Street", subtheme: "Vice City Sunset", isProduct: true },
  { id: "gta-heist", name: "Desert Heist", slug: "gta-street", category: "GTA Street", subtheme: "Desert Highway" },
  { id: "gta-police", name: "Police Chase", slug: "gta-street", category: "GTA Street", subtheme: "Night City" },
  { id: "gta-sunset", name: "Loading Screen", slug: "gta-street", category: "GTA Street", subtheme: "Vice City Sunset" },

  // NEON NIGHT (5 images)
  { id: "neon-night", name: "Neon Night", slug: "neon-night", category: "Neon Night", subtheme: "Tokyo Drift", isProduct: true },
  { id: "neon-tokyo", name: "Tokyo Drift", slug: "neon-night", category: "Neon Night", subtheme: "Tokyo Drift" },
  { id: "neon-rain", name: "Rain Reflections", slug: "neon-night", category: "Neon Night", subtheme: "Rain Reflections" },
  { id: "neon-alley", name: "Cyberpunk City", slug: "neon-night", category: "Neon Night", subtheme: "Cyberpunk City" },
  { id: "neon-underground", name: "Purple Haze", slug: "neon-night", category: "Neon Night", subtheme: "Purple Haze" },

  // STREET RACER V1 (5 images)
  { id: "street-racer-v1", name: "Street Racer", slug: "street-racer-v1", category: "Street Racer", subtheme: "Midnight Run", isProduct: true },
  { id: "racer-highway", name: "Highway Hunter", slug: "street-racer-v1", category: "Street Racer", subtheme: "Highway Hunter" },
  { id: "racer-tunnel", name: "Tunnel Vision", slug: "street-racer-v1", category: "Street Racer", subtheme: "Tunnel Vision" },
  { id: "racer-apex", name: "Midnight Run", slug: "street-racer-v1", category: "Street Racer", subtheme: "Midnight Run" },
  { id: "racer-launch", name: "Dark Pursuit", slug: "street-racer-v1", category: "Street Racer", subtheme: "Dark Pursuit" },

  // STREET RACER V2 (5 images)
  { id: "street-racer-v2", name: "Street Racer Dark", slug: "street-racer-v2", category: "Street Racer", subtheme: "Underground", isProduct: true },
  { id: "racer2-underground", name: "Underground", slug: "street-racer-v2", category: "Street Racer", subtheme: "Underground" },
  { id: "racer2-warehouse", name: "Warehouse Meet", slug: "street-racer-v2", category: "Street Racer", subtheme: "Warehouse Meet" },
  { id: "racer2-ramp", name: "Industrial Night", slug: "street-racer-v2", category: "Street Racer", subtheme: "Industrial Night" },
  { id: "racer2-rooftop", name: "Abandoned Strip", slug: "street-racer-v2", category: "Street Racer", subtheme: "Abandoned Strip" },

  // CARTOON (5 images)
  { id: "cartoon", name: "Cartoon", slug: "cartoon", category: "Cartoon", subtheme: "Clean Vector", isProduct: true },
  { id: "cartoon-fiesta", name: "Clean Vector", slug: "cartoon", category: "Cartoon", subtheme: "Clean Vector" },
  { id: "cartoon-corsa", name: "Pop Art", slug: "cartoon", category: "Cartoon", subtheme: "Pop Art" },
  { id: "cartoon-civic", name: "Comic Book", slug: "cartoon", category: "Cartoon", subtheme: "Comic Book" },
  { id: "cartoon-m4", name: "Graffiti Style", slug: "cartoon", category: "Cartoon", subtheme: "Graffiti Style" },

  // LOWRIDER V1 (5 images)
  { id: "lowrider-v1", name: "Lowrider", slug: "lowrider-v1", category: "Lowrider", subtheme: "Golden Hour", isProduct: true },
  { id: "lowrider-sunset", name: "Golden Hour", slug: "lowrider-v1", category: "Lowrider", subtheme: "Golden Hour" },
  { id: "lowrider-palmbeach", name: "Palm Beach", slug: "lowrider-v1", category: "Lowrider", subtheme: "Palm Beach" },
  { id: "lowrider-avenue", name: "Sunset Boulevard", slug: "lowrider-v1", category: "Lowrider", subtheme: "Sunset Boulevard" },
  { id: "lowrider-coastroad", name: "West Coast Classic", slug: "lowrider-v1", category: "Lowrider", subtheme: "West Coast Classic" },

  // LOWRIDER V2 (5 images)
  { id: "lowrider-v2", name: "Lowrider Night", slug: "lowrider-v2", category: "Lowrider", subtheme: "Neon Strip", isProduct: true },
  { id: "lowrider2-neonstrip", name: "Neon Strip", slug: "lowrider-v2", category: "Lowrider", subtheme: "Neon Strip" },
  { id: "lowrider2-nightcruise", name: "Night Cruise", slug: "lowrider-v2", category: "Lowrider", subtheme: "Night Cruise" },
  { id: "lowrider2-corner", name: "Under The Lights", slug: "lowrider-v2", category: "Lowrider", subtheme: "Under The Lights" },
  { id: "lowrider2-petrolstation", name: "Late Night Show", slug: "lowrider-v2", category: "Lowrider", subtheme: "Late Night Show" },

  // DRIFT STYLE (5 images)
  { id: "drift-style", name: "Drift Style", slug: "drift-style", category: "Drift", subtheme: "Touge Run", isProduct: true },
  { id: "drift-touge", name: "Touge Run", slug: "drift-style", category: "Drift", subtheme: "Touge Run" },
  { id: "drift-smoke", name: "Tyre Smoke", slug: "drift-style", category: "Drift", subtheme: "Tyre Smoke" },
  { id: "drift-rain", name: "Track Attack", slug: "drift-style", category: "Drift", subtheme: "Track Attack" },
  { id: "drift-tandem", name: "Sideways Send", slug: "drift-style", category: "Drift", subtheme: "Sideways Send" },
];

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Get image for gallery item
  const getImage = (id: string, isProduct?: boolean) => {
    if (isProduct) {
      return imageMap[id] || "";
    }
    return galleryImageMap[id] || imageMap[id] || "";
  };

  // Filter and order gallery items
  const filteredItems = useMemo(() => {
    let items = activeFilter === "All" 
      ? galleryItems 
      : galleryItems.filter(item => item.category === activeFilter);
    
    // Sort: non-product images first for variety
    const priorityOrder = ["GTA Street", "Neon Night", "Street Racer", "Cartoon", "Lowrider", "Drift"];
    items = [...items].sort((a, b) => {
      if (!a.isProduct && b.isProduct) return -1;
      if (a.isProduct && !b.isProduct) return 1;
      return priorityOrder.indexOf(a.category) - priorityOrder.indexOf(b.category);
    });
    
    return items;
  }, [activeFilter]);

  return (
    <PublicSiteShell>
      <div>
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-6">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              Our Work
            </p>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground md:text-6xl uppercase">
              Gallery
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground">
              Explore our collection of custom car artworks — each one a unique one-of-one by Big Mon.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="pb-8">
          <div className="container mx-auto px-6">
            <div className="scrollbar-hide -mx-6 overflow-x-auto px-6">
              <div className="flex justify-center gap-2 md:flex-wrap md:gap-3">
                {filterCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs tracking-wide uppercase transition-all duration-300 md:px-6 md:text-sm ${
                      activeFilter === category
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  className={`group relative overflow-hidden transition-all duration-500 ${
                    item.isProduct && (index === 0 || index === 7) ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  style={{
                    animation: `fadeInScale 0.5s ease-out ${Math.min(index * 0.05, 0.5)}s both`,
                  }}
                >
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <ProtectedImage
                      src={getImage(item.id, item.isProduct)}
                      alt={`${item.name} - ${item.subtheme}`}
                      loading="lazy"
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="mb-1 font-body text-xs tracking-widest uppercase text-primary">
                        {item.category}
                      </p>
                      <span className="font-display text-lg font-bold text-foreground text-center px-4">
                        {item.name}
                      </span>
                      <span className="mt-1 font-body text-xs text-muted-foreground">
                        {item.subtheme}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl uppercase">
              Ready to Get Yours?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-muted-foreground">
              Upload your car and get a custom one-of-one artwork by Big Mon.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="luxury" size="lg" asChild>
                <Link to="/create">Upload Your Car</Link>
              </Button>
              <Button variant="luxuryOutline" size="lg" asChild>
                <Link to="/styles">View All Styles</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </PublicSiteShell>
  );
};

export default GalleryPage;
