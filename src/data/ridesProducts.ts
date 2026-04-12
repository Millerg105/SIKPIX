export interface RidesProduct {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  price: string | null;
  priceValue: number | null;
  isQuote: boolean;
}

export const ridesProducts: RidesProduct[] = [
  {
    slug: "rims",
    name: "Custom Rim Designs",
    category: "Exterior",
    shortDescription: "Bespoke wheel concepts tailored to your vehicle's stance.",
    longDescription: "Get a custom digital render of your dream wheel setup before you buy. We design bespoke rim concepts that match your car's stance, colour, and personality. Perfect for planning your next wheel upgrade or just seeing what's possible.",
    image: "/images/rides/rims.png",
    price: null,
    priceValue: null,
    isQuote: true,
  },
  {
    slug: "wraps",
    name: "Vinyl Wrap Concepts",
    category: "Exterior",
    shortDescription: "Complete vehicle wrap designs. See it before you wrap it.",
    longDescription: "Visualise your full wrap before committing. We create realistic digital wrap concepts so you can see exactly how your car will look in any colour, finish, or design. Matte, gloss, chrome, camo, livery, you name it.",
    image: "/images/rides/wrap.png",
    price: null,
    priceValue: null,
    isQuote: true,
  },
  {
    slug: "stickers",
    name: "Car Stickers & Decals",
    category: "Details",
    shortDescription: "Custom graphics, racing numbers, and striking visual elements.",
    longDescription: "Stand out at the meet with custom-designed stickers and decals. From racing numbers and sponsor bars to windscreen banners and door graphics, every design is made to fit your car and your style. Printed on premium vinyl, built to last.",
    image: "/images/rides/stickers.png",
    price: "From £9.99",
    priceValue: 9.99,
    isQuote: false,
  },
  {
    slug: "renders",
    name: "Full Vehicle Renders",
    category: "Concept",
    shortDescription: "Complete digital transformation for your custom build project.",
    longDescription: "See your dream build come to life before you spend a penny. We create photorealistic full vehicle renders showing your car with planned mods, new colours, body kits, or complete transformations. Ideal for build planning or social media content.",
    image: "/images/rides/render.png",
    price: "From £29.99",
    priceValue: 29.99,
    isQuote: false,
  },
  {
    slug: "livery",
    name: "Livery Designs",
    category: "Motorsport",
    shortDescription: "Race-ready livery concepts for track cars and show builds.",
    longDescription: "Professional livery design for track cars, time attack builds, or show cars that need to stand out. We create full vehicle liveries with sponsor placement, number boards, and colour schemes that look the business on and off the track.",
    image: "/images/rides/livery.png",
    price: null,
    priceValue: null,
    isQuote: true,
  },
  {
    slug: "plates",
    name: "Show Plates",
    category: "Details",
    shortDescription: "Custom show plates designed to match your build's personality.",
    longDescription: "Finish your build with a proper set of show plates. We design custom plates that match your car's theme, colour scheme, and personality. Printed on high-quality acrylic, perfect for shows, meets, and photo shoots.",
    image: "/images/rides/plates.png",
    price: "From £19.99",
    priceValue: 19.99,
    isQuote: false,
  },
  {
    slug: "logos",
    name: "Logo Design",
    category: "Branding",
    shortDescription: "Custom logos for car clubs, builds, and automotive brands.",
    longDescription: "Need a logo for your car club, YouTube channel, or personal brand? We design custom automotive logos that capture your style. Clean vectors, multiple formats, and unlimited revisions until you're happy.",
    image: "/images/rides/logos.png",
    price: "From £49.99",
    priceValue: 49.99,
    isQuote: false,
  },
  {
    slug: "interiors",
    name: "Interior Renders",
    category: "Concept",
    shortDescription: "Visualise your interior upgrades before you commit.",
    longDescription: "Planning a retrim, new seats, or a full interior overhaul? We create detailed interior renders showing exactly how your upgrades will look. See different colour combos, materials, and layouts before you order anything.",
    image: "/images/rides/interior.png",
    price: "From £29.99",
    priceValue: 29.99,
    isQuote: false,
  },
];
