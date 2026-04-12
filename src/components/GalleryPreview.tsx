import { Link } from "react-router-dom";
import { imageMap } from "@/hooks/useImageMap";
import ProtectedImage from "@/components/ProtectedImage";

const previewItems = [
  { id: "gta-street",      alt: "GTA Street: Audi RS3 in Rockstar Games art style" },
  { id: "neon-night",      alt: "Neon Night: Civic Type R in neon rain" },
  { id: "street-racer-v1", alt: "Street Racer: BMW M4 on dark highway" },
  { id: "street-racer-v2", alt: "Street Racer Dark: Nissan GTR in an underground meet" },
  { id: "cartoon",         alt: "Cartoon: Ford Fiesta ST illustrated" },
  { id: "lowrider-v1",     alt: "Lowrider: Golf Mk2 at golden sunset" },
  { id: "lowrider-v2",     alt: "Lowrider Night: Impala under neon streetlights" },
  { id: "drift-style",     alt: "Drift Style: BMW M3 mid-drift with tyre smoke" },
];

const GalleryPreview = () => {
  return (
    <section className="py-24 sm:py-28">
      <div className="container mx-auto px-6">
        <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="mb-4 font-body text-xs tracking-[0.3em] uppercase text-primary">
              Our Work
            </p>
            <h2 className="font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
              Gallery
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground md:mx-0">
              Custom car art by Big Mon. Every piece a one-of-one.
            </p>
          </div>
          <Link
            to="/gallery"
            className="font-body text-sm tracking-widest uppercase text-primary transition-colors hover:text-primary/80"
          >
            View Full Gallery →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {previewItems.map((item, index) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className={`group relative overflow-hidden ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className="aspect-square overflow-hidden">
                <ProtectedImage
                  src={imageMap[item.id]}
                  alt={item.alt}
                  loading="lazy"
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/20" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="font-body text-sm tracking-widest uppercase text-foreground text-center px-4">
                    {item.alt.split(":")[0]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
