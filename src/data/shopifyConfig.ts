// =============================================
// SHOPIFY-READY CONFIGURATION - SIKPIX
// All pricing, add-ons, POD items, bundles, and metadata
// structured for Shopify export/integration
// =============================================

// Base digital car artwork price (GBP)
export const BASE_PRICE = 9.99;

// Digital add-ons with Shopify metadata
// Type: checkbox (multiple can be selected)
export const addOns = [
  { 
    id: "extra-vehicle", 
    name: "Extra Vehicle in Scene", 
    price: 5.00, 
    description: "Add another car to the same artwork",
    type: "checkbox" as const,
    sku: "ADDON-EXTRA-VEHICLE",
    shopifyTag: "add-ons",
    shopifyVariantTag: "extra-vehicle"
  },
  { 
    id: "phone-wallpaper", 
    name: "Phone Wallpaper Export", 
    price: 3.99,
    description: "Vertical crop optimized for mobile",
    type: "checkbox" as const,
    sku: "ADDON-PHONE-WALLPAPER",
    shopifyTag: "add-ons",
    shopifyVariantTag: "phone-wallpaper"
  },
  { 
    id: "rush-24h", 
    name: "Rush 12hr Delivery", 
    price: 9.99, 
    description: "Priority delivery within 12 hours",
    type: "checkbox" as const,
    sku: "ADDON-RUSH-24H",
    shopifyTag: "add-ons",
    shopifyVariantTag: "rush-delivery"
  },
];

// POD (Print-on-Demand) options with Shopify metadata
// Type: radio (only one can be selected)
// Names must match backend's mapPodOptionToGelatoProduct parsing:
// - "fine art" + size → fine_art products
// - "wood frame" + size → wood_frame products  
// - "canvas" + size → canvas products
// - "framed canvas" + size → framed_canvas products
export const podOptions = [
  // Fine Art Prints (Premium Matte)
  { 
    id: "print-a4-fine-art", 
    name: "A4 Fine Art Print (Premium Matte)", 
    price: 29.99, 
    description: "Museum-quality print on premium matte paper",
    type: "radio" as const,
    sku: "POD-A4-FINE-ART",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a4-fine-art",
    fulfillmentService: "gelato"
  },
  { 
    id: "print-a3-fine-art", 
    name: "A3 Fine Art Print (Premium Matte)", 
    price: 39.99, 
    description: "Large format print on premium matte paper",
    type: "radio" as const,
    sku: "POD-A3-FINE-ART",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a3-fine-art",
    fulfillmentService: "gelato"
  },
  { 
    id: "print-a2-fine-art", 
    name: "A2 Fine Art Print (Premium Matte)", 
    price: 49.99, 
    description: "Extra large format print on premium matte paper",
    type: "radio" as const,
    sku: "POD-A2-FINE-ART",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a2-fine-art",
    fulfillmentService: "gelato"
  },
  // Premium Wood Framed Prints
  { 
    id: "framed-a3-wood-frame", 
    name: "A3 Premium Wood Frame (Black)", 
    price: 59.99, 
    description: "Ready to hang, premium black wood frame with plexiglass",
    type: "radio" as const,
    sku: "POD-A3-WOOD-FRAME",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a3-wood-frame",
    fulfillmentService: "gelato"
  },
  { 
    id: "framed-a2-wood-frame", 
    name: "A2 Premium Wood Frame (Black)", 
    price: 89.99, 
    description: "Large format, premium black wood frame with plexiglass",
    type: "radio" as const,
    sku: "POD-A2-WOOD-FRAME",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a2-wood-frame",
    fulfillmentService: "gelato"
  },
  // Canvas Prints
  { 
    id: "canvas-a3", 
    name: "A3 Canvas Print", 
    price: 79.99, 
    description: "Gallery-quality canvas on thick wooden stretcher",
    type: "radio" as const,
    sku: "POD-A3-CANVAS",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a3-canvas",
    fulfillmentService: "gelato"
  },
  { 
    id: "canvas-a2", 
    name: "A2 Canvas Print", 
    price: 109.99, 
    description: "Large gallery-quality canvas on thick wooden stretcher",
    type: "radio" as const,
    sku: "POD-A2-CANVAS",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a2-canvas",
    fulfillmentService: "gelato"
  },
  // Framed Canvas
  { 
    id: "framed-canvas-a3", 
    name: "A3 Framed Canvas", 
    price: 79.99, 
    description: "Canvas print in black floating frame, ready to hang",
    type: "radio" as const,
    sku: "POD-A3-FRAMED-CANVAS",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a3-framed-canvas",
    fulfillmentService: "gelato"
  },
  { 
    id: "framed-canvas-a2", 
    name: "A2 Framed Canvas", 
    price: 99.99, 
    description: "Large canvas print in black floating frame, ready to hang",
    type: "radio" as const,
    sku: "POD-A2-FRAMED-CANVAS",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a2-framed-canvas",
    fulfillmentService: "gelato"
  },
  {
    id: "framed-canvas-a2-premium",
    name: "A2 Premium Framed Canvas",
    price: 149.99,
    description: "Prestige oversized framed canvas for statement walls and premium gifts",
    type: "radio" as const,
    sku: "POD-A2-PREMIUM-FRAMED-CANVAS",
    shopifyTag: "pod-print",
    shopifyVariantTag: "a2-premium-framed-canvas",
    fulfillmentService: "gelato"
  },
];

// Bundle discount tiers
// Applies discounted pricing to the digital artwork package only
export const bundleDiscounts = [
  { 
    id: "bundle-3", 
    name: "3 Artwork Bundle",
    description: "Any three car art styles with built-in savings",
    minQuantity: 3, 
    discountPercent: 16.62,
    finalPrice: 24.99,
    compareAtPrice: 29.97,
    discountLabel: "Save 17%",
    badge: "Most Popular",
    shopifyTag: "bundle-discount",
    shopifyDiscountCode: "BUNDLE3"
  },
  { 
    id: "bundle-5", 
    name: "5 Artwork Bundle",
    description: "Five styles for the full collector treatment",
    minQuantity: 5, 
    discountPercent: 29.95,
    finalPrice: 34.99,
    compareAtPrice: 49.95,
    discountLabel: "Save 30%",
    badge: "Best Savings",
    shopifyTag: "bundle-discount",
    shopifyDiscountCode: "BUNDLE5"
  },
];

// Product category tags for Shopify filtering
export const productTags = {
  category: {
    street: "car-style:street",
    action: "car-style:action",
    culture: "car-style:culture",
  },
  productType: "Custom Car Art",
  vendor: "SikPix",
};

// Cart item structure for Shopify checkout
export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  basePrice: number;
  selectedSubstyle?: string;
  addOns: string[];
  podOption?: string;
  quantity: number;
  // Calculated fields
  addOnsTotal: number;
  podPrice: number;
  lineTotal: number;
  // Shopify metadata
  shopifyTags: string[];
  shopifyProperties: Record<string, string>;
}

// Calculate cart totals with bundle discounts
export const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Apply bundle package pricing if applicable (sorted desc by quantity to get best bundle)
  let discount = 0;
  let appliedBundle = null;

  for (const bundle of bundleDiscounts.sort((a, b) => b.minQuantity - a.minQuantity)) {
    if (itemCount >= bundle.minQuantity) {
      const compareAt = BASE_PRICE * bundle.minQuantity;
      discount = compareAt - bundle.finalPrice;
      appliedBundle = bundle;
      break;
    }
  }
  
  return {
    subtotal,
    discount,
    appliedBundle,
    total: subtotal - discount,
    itemCount,
  };
};

// Generate Shopify line item properties from cart item
export const generateShopifyProperties = (item: CartItem): Record<string, string> => {
  const properties: Record<string, string> = {
    _style: item.productName,
    _product_id: item.productId,
  };
  
  if (item.selectedSubstyle) {
    properties._substyle = item.selectedSubstyle;
  }
  
  // Add each add-on as a property
  item.addOns.forEach((addonId, index) => {
    const addon = addOns.find(a => a.id === addonId);
    if (addon) {
      properties[`Add-On ${index + 1}`] = `${addon.name} (+£${addon.price.toFixed(2)})`;
    }
  });
  
  // Add POD option as a property
  if (item.podOption) {
    const pod = podOptions.find(p => p.id === item.podOption);
    if (pod) {
      properties["Print Option"] = `${pod.name} (+£${pod.price.toFixed(2)})`;
    }
  }
  
  return properties;
};

// Export type definitions for TypeScript
export type AddOn = typeof addOns[number];
export type PodOption = typeof podOptions[number];
export type BundleDiscount = typeof bundleDiscounts[number];
