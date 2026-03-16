// Gallery data with sub-themes for each portrait style
// Structured for high-conversion ordering and Shopify export

export interface GalleryItem {
  id: string;
  style: string;
  styleSlug: string;
  subtheme: string;
  caption: string;
  image: string;
  category: string;
  priority: number; // Lower = higher priority in display
}

// Sub-themes for each style
export const subthemes: Record<string, { name: string; description: string }[]> = {
  "vogue-cover": [
    { name: "Editorial Close-Up", description: "High-fashion editorial inspired close-up portrait" },
    { name: "Soft Studio Lighting", description: "Elegant soft-lit studio portrait" },
    { name: "Black-and-Gold Fashion", description: "Luxurious black and gold themed editorial" },
  ],
  "gq-cover": [
    { name: "Sharp Suiting", description: "Crisp tailored suit editorial style" },
    { name: "Monochrome Editorial", description: "Classic black and white sophistication" },
    { name: "Gentleman Outdoors", description: "Refined outdoor gentleman portrait" },
  ],
  "museum-fine-art": [
    { name: "Renaissance Bust", description: "Classical Renaissance-style portrait bust" },
    { name: "Classical Painterly", description: "Oil painting with classical techniques" },
    { name: "Baroque Dramatic", description: "Dramatic lighting in Baroque style" },
  ],
  "comic-superhero": [
    { name: "Neon Action", description: "Vibrant neon-lit action scene" },
    { name: "Power Pose", description: "Dynamic superhero power stance" },
    { name: "Mask Reveal", description: "Dramatic mask removal moment" },
  ],
  "gta-character": [
    { name: "Urban Night", description: "Neon-lit urban nightscape scene" },
    { name: "Desert Heist", description: "Desert crime scene aesthetic" },
    { name: "Loading Screen", description: "Classic game loading screen style" },
  ],
  "nat-geo-pet": [
    { name: "Wildlife Close-Up", description: "Intimate wildlife photography style" },
    { name: "Dramatic Natural Light", description: "Stunning natural lighting portrait" },
    { name: "Playful Soft Lens", description: "Soft focus playful pet portrait" },
  ],
  "sports-athlete": [
    { name: "Stadium Spotlight", description: "Dramatic stadium lighting moment" },
    { name: "Victory Celebration", description: "Triumphant victory pose" },
    { name: "Motion Sprint", description: "Dynamic motion action shot" },
  ],
  "fitness-magazine": [
    { name: "Studio Flex", description: "Professional studio fitness pose" },
    { name: "Golden Hour Physique", description: "Golden hour outdoor fitness shot" },
    { name: "High-Contrast Gym", description: "Dramatic gym lighting portrait" },
  ],
  "video-game-sports": [
    { name: "Futuristic Arena", description: "Sci-fi sports arena backdrop" },
    { name: "Hyper-Realistic Player", description: "Ultra-realistic game render style" },
    { name: "Energetic Splash Art", description: "Dynamic splash art composition" },
  ],
  "christmas-movie": [
    { name: "Snowy Close-Up", description: "Intimate snowy scene portrait" },
    { name: "Holiday Warm", description: "Warm cozy holiday lighting" },
    { name: "Winter Glow", description: "Magical winter glow effect" },
  ],
  "spotify-wrapped": [
    { name: "Neon Audio Glow", description: "Vibrant neon audio visualization" },
    { name: "Vibrant Portrait", description: "Bold colorful gradient portrait" },
    { name: "Music Wave Abstract", description: "Abstract sound wave composition" },
  ],
  "vintage-gentleman": [
    { name: "Retro Grain", description: "Authentic vintage film grain" },
    { name: "Sepia Warm", description: "Warm sepia-toned classic portrait" },
    { name: "Cinematic Close-Up", description: "Old Hollywood cinematic style" },
  ],
};

// High-conversion priority order (1 = highest)
const stylePriority: Record<string, number> = {
  "vogue-cover": 1,
  "gq-cover": 2,
  "christmas-movie": 3, // High Q4 conversion
  "museum-fine-art": 4,
  "gta-character": 5,
  "comic-superhero": 6,
  "spotify-wrapped": 7, // High Q4 social share
  "sports-athlete": 8,
  "fitness-magazine": 9,
  "video-game-sports": 10,
  "nat-geo-pet": 11,
  "vintage-gentleman": 12,
};

// Category mapping for filters
export const categoryMapping: Record<string, string> = {
  "vogue-cover": "Vogue",
  "gq-cover": "GQ",
  "museum-fine-art": "Museum",
  "comic-superhero": "Comic",
  "gta-character": "GTA",
  "nat-geo-pet": "Pet",
  "sports-athlete": "Sports",
  "fitness-magazine": "Fitness",
  "video-game-sports": "Video Game",
  "christmas-movie": "Christmas",
  "spotify-wrapped": "Spotify",
  "vintage-gentleman": "Vintage",
};

// Style name mapping
export const styleNames: Record<string, string> = {
  "vogue-cover": "Vogue Cover Portrait",
  "gq-cover": "GQ Cover Portrait",
  "museum-fine-art": "Museum Fine Art Portrait",
  "comic-superhero": "Comic Book Superhero Poster",
  "gta-character": "GTA Character Poster",
  "nat-geo-pet": "National Geographic Pet Portrait",
  "sports-athlete": "Sports Athlete Cover",
  "fitness-magazine": "Fitness Magazine Cover",
  "video-game-sports": "Video Game Sports Cover",
  "christmas-movie": "Christmas Movie Poster",
  "spotify-wrapped": "Spotify Wrapped Poster",
  "vintage-gentleman": "Vintage 70s Gentleman Portrait",
};

// Slug mapping for navigation
export const styleSlugs: Record<string, string> = {
  "vogue-cover": "vogue-cover-portrait",
  "gq-cover": "gq-cover-portrait",
  "museum-fine-art": "museum-fine-art-portrait",
  "comic-superhero": "comic-book-superhero-poster",
  "gta-character": "gta-character-poster",
  "nat-geo-pet": "national-geographic-pet-portrait",
  "sports-athlete": "sports-athlete-cover",
  "fitness-magazine": "fitness-magazine-cover",
  "video-game-sports": "video-game-sports-cover",
  "christmas-movie": "christmas-movie-poster",
  "spotify-wrapped": "spotify-wrapped-poster",
  "vintage-gentleman": "vintage-70s-gentleman-portrait",
};

// Generate gallery items from subthemes
// Using placeholder paths - replace with actual images when available
export const generateGalleryItems = (): GalleryItem[] => {
  const items: GalleryItem[] = [];
  
  Object.entries(subthemes).forEach(([styleId, themes]) => {
    themes.forEach((theme, index) => {
      items.push({
        id: `${styleId}-sub${index + 1}`,
        style: styleNames[styleId],
        styleSlug: styleSlugs[styleId],
        subtheme: theme.name,
        caption: theme.description,
        // Using the main product image as placeholder
        // In production, these would be unique sub-theme images
        image: styleId,
        category: categoryMapping[styleId],
        priority: stylePriority[styleId],
      });
    });
  });
  
  // Sort by priority for high-conversion display
  return items.sort((a, b) => a.priority - b.priority);
};

// Get filter categories in conversion-priority order
export const getFilterCategories = (): string[] => {
  return [
    "All",
    "Vogue",
    "GQ",
    "Christmas",
    "Museum",
    "GTA",
    "Comic",
    "Spotify",
    "Sports",
    "Fitness",
    "Video Game",
    "Pet",
    "Vintage",
  ];
};

// Export gallery items
export const galleryItems = generateGalleryItems();
