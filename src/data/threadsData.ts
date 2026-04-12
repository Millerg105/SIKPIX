export interface ThreadsProduct {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  image: string;
  hasSizes: boolean;
}

export const threadsProducts: ThreadsProduct[] = [
  {
    slug: "snapbacks",
    name: "Snapback Caps",
    category: "Headwear",
    shortDescription: "Premium SikPix branded snapbacks. Represent the culture.",
    description:
      "Premium quality snapback caps featuring the SikPix logo and exclusive car art designs. Adjustable strap fits all sizes. Built to last, designed to stand out.",
    basePrice: 24.99,
    image: "/images/threads/snapback.png",
    hasSizes: true,
  },
  {
    slug: "tshirts",
    name: "Graphic T-Shirts",
    category: "Apparel",
    shortDescription: "Heavyweight streetwear tees featuring exclusive car art prints.",
    description:
      "Heavyweight 100% cotton tees with exclusive SikPix car art prints. Bold graphics, premium feel, streetwear fit. Available in a range of sizes.",
    basePrice: 34.99,
    image: "/images/threads/tshirt.png",
    hasSizes: true,
  },
  {
    slug: "hoodies",
    name: "Premium Hoodies",
    category: "Apparel",
    shortDescription: "Stay warm, look sharp. High-quality hoodies with custom logos.",
    description:
      "Stay warm and look sharp with our premium heavyweight hoodies. Custom SikPix branding, brushed fleece interior, and a relaxed streetwear fit. Perfect for car meets and daily wear.",
    basePrice: 59.99,
    image: "/images/threads/hoodie.png",
    hasSizes: true,
  },
  {
    slug: "stickers",
    name: "Sticker Packs",
    category: "Accessories",
    shortDescription: "Die-cut car art and JDM stickers. Built to withstand the elements.",
    description:
      "Premium die-cut vinyl stickers featuring JDM, stance, and car culture designs. Weatherproof and UV resistant. Perfect for laptops, toolboxes, and bumpers.",
    basePrice: 9.99,
    image: "/images/threads/stickers.png",
    hasSizes: false,
  },
  {
    slug: "bombers",
    name: "Bomber Jackets",
    category: "Apparel",
    shortDescription: "Lightweight bomber jackets with embroidered SikPix detailing.",
    description:
      "Lightweight satin-finish bomber jackets with embroidered SikPix detailing on the chest and back. Ribbed cuffs and hem for a clean silhouette. Layer up for car meets or nights out.",
    basePrice: 79.99,
    image: "/images/threads/bomber.png",
    hasSizes: true,
  },
  {
    slug: "beanies",
    name: "Beanie Hats",
    category: "Headwear",
    shortDescription: "Soft-knit beanies with woven SikPix branding. One size fits all.",
    description:
      "Soft-knit acrylic beanies with woven SikPix patch branding. Double-layered for warmth, ribbed cuff for a snug fit. One size fits all.",
    basePrice: 19.99,
    image: "/images/threads/beanie.png",
    hasSizes: true,
  },
  {
    slug: "mugs",
    name: "Mugs",
    category: "Accessories",
    shortDescription: "Ceramic mugs with wraparound SikPix car art. Dishwasher safe.",
    description:
      "11oz ceramic mugs featuring full-wrap SikPix car art prints. Dishwasher and microwave safe. Start your morning right with a proper brew in a proper mug.",
    basePrice: 14.99,
    image: "/images/threads/mug.png",
    hasSizes: false,
  },
  {
    slug: "phone-cases",
    name: "Phone Cases",
    category: "Accessories",
    shortDescription: "Slim-fit phone cases with exclusive SikPix artwork. Major models supported.",
    description:
      "Slim-fit impact-resistant phone cases featuring exclusive SikPix car artwork. Available for major iPhone and Samsung Galaxy models. Protect your phone in style.",
    basePrice: 16.99,
    image: "/images/threads/phonecase.png",
    hasSizes: false,
  },
];

export function getThreadsProductBySlug(slug: string): ThreadsProduct | undefined {
  return threadsProducts.find((p) => p.slug === slug);
}
