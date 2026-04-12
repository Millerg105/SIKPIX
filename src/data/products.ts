export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  basePrice: number;
  premiumPrice: number;
  image: string;
  category: string;
  substyles: string[];
  whatYouReceive: string[];
  howItWorks: string[];
  uploadInstructions: string[];
  deliveryTime: string;
  faq: { question: string; answer: string }[];
  isBestseller?: boolean;
}

export const products: Product[] = [
  {
    id: "gta-street",
    slug: "gta-street",
    name: "GTA Street",
    shortDescription: "Your car in the iconic GTA loading screen style",
    longDescription: "The one everyone wants. Your car rendered in that unmistakable Grand Theft Auto aesthetic with dramatic sunset skylines, bold colours, and cinematic composition. Looks like your ride belongs in the next Rockstar release.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-gta-street.jpg",
    category: "Street",
    substyles: ["Vice City Sunset", "San Andreas", "Night City", "Desert Highway"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a clear photo of your car",
      "Select your preferred GTA substyle",
      "Big Mon transforms your ride into art",
      "Receive your custom artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Side profile or 3/4 angle works best",
      "Shoot in good daylight if possible",
      "Clean background helps, like a car park or open road",
      "Show the full car, no cropped bumpers"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "Can you include my reg plate?", answer: "Yes! Just mention it in the notes and we'll include it in the artwork." },
      { question: "What if I'm not happy with the result?", answer: "We offer one free revision within 7 days of delivery." }
    ],
    isBestseller: true
  },
  {
    id: "neon-night",
    slug: "neon-night",
    name: "Neon Night",
    shortDescription: "Neon-lit urban night scene with your car",
    longDescription: "Wet tarmac reflections, glowing shop signs, and your car bathed in neon. This style captures the electric atmosphere of a city at night, where every car looks like it belongs in a film.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-neon-night.jpg",
    category: "Street",
    substyles: ["Tokyo Drift", "Cyberpunk City", "Rain Reflections", "Purple Haze"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a photo of your car",
      "Pick your favourite neon vibe",
      "Big Mon creates your night scene",
      "Receive your artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Side profile or 3/4 angle works best",
      "Any lighting is fine, we handle the neon",
      "Clean background preferred",
      "Include any mods you want highlighted"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "Can you match specific neon colours?", answer: "Absolutely! Let us know your preferred colour scheme in the notes." },
      { question: "Will my car's colour be accurate?", answer: "Yes, we match your car's actual colour as closely as possible in the artwork." }
    ],
    isBestseller: true
  },
  {
    id: "street-racer-v1",
    slug: "street-racer-v1",
    name: "Street Racer",
    shortDescription: "Dark, aggressive street racing artwork",
    longDescription: "Raw, aggressive, and unapologetic. Your car styled like it's about to tear up the strip. Dark backgrounds, motion blur, and that underground racing energy that gets pulses racing. Built for those who like their art like they like their cars: fast and loud.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-street-racer-v1.jpg",
    category: "Action",
    substyles: ["Midnight Run", "Tunnel Vision", "Dark Pursuit", "Highway Hunter"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a clear photo of your car",
      "Choose your street racer substyle",
      "Big Mon turns your ride into a weapon",
      "Receive your artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Front 3/4 or side angle looks most aggressive",
      "Low angles make the car look meaner",
      "Any background is fine, we replace it",
      "Show off any body kit or aero mods"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "Can you add motion blur?", answer: "Yes, the Street Racer style includes dynamic motion effects as standard." },
      { question: "Will my modifications be visible?", answer: "Absolutely. We pay close attention to your car's unique details and mods." }
    ],
    isBestseller: true
  },
  {
    id: "street-racer-v2",
    slug: "street-racer-v2",
    name: "Street Racer Dark",
    shortDescription: "Alternative street racer with underground edge",
    longDescription: "The darker sibling. If Street Racer is the highway, this is the underground. Think car park meets, industrial backdrops, and a grittier, more raw street culture feel. Your car, stripped of everything except attitude.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-street-racer-v2.jpg",
    category: "Action",
    substyles: ["Underground", "Industrial Night", "Warehouse Meet", "Abandoned Strip"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a photo of your car",
      "Pick your underground setting",
      "Big Mon crafts your dark scene",
      "Receive your artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Side profile or 3/4 angle works best",
      "Show the stance and wheel setup",
      "Any background, we create the scene",
      "Mention any specific mods to feature"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "How is this different from Street Racer?", answer: "This version has a moodier, underground feel. Think car park meets and industrial settings vs highway action." },
      { question: "Can you add other cars in the background?", answer: "Yes! Just mention it in your notes and we'll set the scene." }
    ]
  },
  {
    id: "cartoon",
    slug: "cartoon",
    name: "Cartoon",
    shortDescription: "Clean cartoon illustration of your car",
    longDescription: "Your car drawn up proper. Clean lines, bold colours, and that cartoon style that makes even a daily runner look like a show car. Perfect for stickers, phone wallpapers, and getting mates jealous at the next meet. This is the style Big Mon is known for, the OG SikPix special.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-cartoon.jpg",
    category: "Culture",
    substyles: ["Clean Vector", "Pop Art", "Comic Book", "Graffiti Style"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a clear photo of your car",
      "Pick your cartoon substyle",
      "Big Mon draws up your ride",
      "Receive your custom cartoon within 24-48 hours"
    ],
    uploadInstructions: [
      "Side profile shows off the car best",
      "Good lighting helps capture details",
      "Clean background preferred",
      "Include custom plates if you want them featured"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "Can you exaggerate certain features?", answer: "Yes! Tell us what to emphasise (wheels, stance, body kit) and we'll make it pop." },
      { question: "Can I use this for stickers or merch?", answer: "The digital file is yours to use however you like. We can also provide vector format on request." }
    ],
    isBestseller: true
  },
  {
    id: "lowrider-v1",
    slug: "lowrider-v1",
    name: "Lowrider",
    shortDescription: "Lowrider culture sunset artwork",
    longDescription: "West coast vibes. Palm trees, golden hour, and your car sitting right. This style brings the lowrider culture aesthetic to any vehicle, whether it's a Mk4 Golf or a classic Impala. The sunset glow makes everything look legendary.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-lowrider-v1.jpg",
    category: "Culture",
    substyles: ["Golden Hour", "Palm Beach", "Sunset Boulevard", "West Coast Classic"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a photo of your car",
      "Choose your lowrider setting",
      "Big Mon drops your car into the scene",
      "Receive your artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Side profile or low angle works best",
      "Show the full stance and wheels",
      "Any background, we add the sunset",
      "Mention preferred colour grading in notes"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "Does my car need to be lowered?", answer: "Not at all! Any car can look sick in this style. We adjust the stance to fit the vibe." },
      { question: "Can you add hydraulics effects?", answer: "Yes! Just mention it in your notes and we'll add that classic lowrider bounce." }
    ]
  },
  {
    id: "lowrider-v2",
    slug: "lowrider-v2",
    name: "Lowrider Night",
    shortDescription: "Alternative lowrider with nighttime feel",
    longDescription: "Same lowrider attitude, different energy. Night-time strip, cruising lights, and that after-dark show car presence. Your ride catching streetlight reflections and turning heads at 2am. The one for the night owls.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-lowrider-v2.jpg",
    category: "Culture",
    substyles: ["Neon Strip", "Night Cruise", "Under The Lights", "Late Night Show"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a photo of your car",
      "Pick your night-time vibe",
      "Big Mon creates your cruising scene",
      "Receive your artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Side profile or 3/4 angle preferred",
      "Any lighting works, we set the night scene",
      "Clean shot of full car please",
      "Tell us about any chrome or lighting details"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "How is this different from regular Lowrider?", answer: "This version swaps the sunset for neon-lit night streets. Same culture, darker energy." },
      { question: "Can you add underglow effects?", answer: "Yes! Just tell us the colour and we'll add it." }
    ]
  },
  {
    id: "drift-style",
    slug: "drift-style",
    name: "Drift Style",
    shortDescription: "Full send drifting action art",
    longDescription: "Tyre smoke, opposite lock, and send it energy. Your car captured mid-drift with dynamic angles and motion that makes it look like it's breaking traction on every wall in the house. Not for the faint-hearted.",
    basePrice: 9.99,
    premiumPrice: 19.99,
    image: "/src/assets/product-drift-style.jpg",
    category: "Action",
    substyles: ["Touge Run", "Track Attack", "Tyre Smoke", "Sideways Send"],
    whatYouReceive: [
      "High-resolution PNG (4000x5000px)",
      "Web-optimized JPG",
      "Phone wallpaper crop",
      "Print-ready CMYK version (Premium)"
    ],
    howItWorks: [
      "Upload a photo of your car",
      "Choose your drift scenario",
      "Big Mon sends your car sideways",
      "Receive your artwork within 24-48 hours"
    ],
    uploadInstructions: [
      "Side or 3/4 angle preferred",
      "Show the car's profile clearly",
      "Any background, we add the track",
      "Tell us if you want a specific drift angle"
    ],
    deliveryTime: "24-48 hours",
    faq: [
      { question: "Does my car need to be a drift car?", answer: "Any car can be made to look like it's drifting! From a Fiesta to a GT-R, we make it work." },
      { question: "Can you add tyre smoke?", answer: "Tyre smoke comes as standard in this style. We go heavy on the drama." }
    ]
  },
];
