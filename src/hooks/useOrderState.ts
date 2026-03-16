import { useState, useCallback, useMemo } from "react";
import { 
  addOns, 
  podOptions, 
  bundleDiscounts, 
  BASE_PRICE,
  type CartItem 
} from "@/data/shopifyConfig";

// =============================================
// SHOPIFY-READY ORDER STATE & EXPORT TYPES
// =============================================

// Core order state interface - Shopify ready
export interface OrderState {
  baseStyleId: string;
  baseStyleName: string;
  basePrice: number;
  selectedSubstyle: string;
  digitalAddOns: { id: string; label: string; price: number }[];
  podOption: { id: string; label: string; price: number } | null;
  bundle: { size: number; discountPercent: number } | null;
  quantity: number;
  customerNotes: string;
}

export interface OrderTotals {
  basePrice: number;
  addOnsTotal: number;
  podPrice: number;
  subtotalPerItem: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  discountPercent: number;
  totalAfterDiscount: number;
  bundleLabel: string | null;
}

// Shopify Export Types
export interface ShopifyBundleExport {
  "Bundle Size": string;
  "Bundle Discount": string;
  "Bundle Compare At": string;
  "Bundle Final Price": string;
}

export interface ShopifyPodExport {
  "POD Format": string;
  "POD Price": string;
}

export interface ShopifyOrderExport {
  style: string;
  styleId: string;
  substyle: string;
  basePrice: number;
  digitalAddOns: { id: string; label: string; price: number }[];
  addOnsFormatted: string[];
  podOption: { id: string; label: string; price: number } | null;
  podFormatted: ShopifyPodExport | null;
  bundle: { size: number; discountPercent: number; discountAmount: number } | null;
  bundleFormatted: ShopifyBundleExport | null;
  quantity: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  customerNotes: string;
  // Shopify-specific metadata
  shopifyLineItemProperties: Record<string, string>;
  shopifyDiscountCode: string | null;
  shopifyTags: string[];
}

// Single source of truth: calculate all order totals
// MUST MATCH SERVER CALCULATION IN create-draft-order/index.ts
export const calculateOrderTotals = (orderState: OrderState): OrderTotals => {
  const basePrice = orderState.basePrice;
  const addOnsTotal = orderState.digitalAddOns.reduce((sum, addon) => sum + addon.price, 0);
  const podPrice = orderState.podOption?.price || 0;
  
  // Get quantity from bundle or default
  const quantity = orderState.bundle?.size || orderState.quantity || 1;
  
  // Per-item subtotal (for display purposes only)
  const subtotalPerItem = basePrice + addOnsTotal + podPrice;
  
  // CRITICAL: Match server calculation exactly!
  // Server formula: bundle-or-base artwork package + addOns + pod
  // Add-ons and POD are NOT multiplied by quantity - they apply once per order
  const baseTotal = basePrice * quantity;
  const subtotalBeforeDiscount = baseTotal + addOnsTotal + podPrice;
  
  // Apply bundle package pricing to digital artwork only
  const bundleConfig = orderState.bundle
    ? bundleDiscounts.find((b) => b.minQuantity === orderState.bundle?.size)
    : null;
  const discountPercent = bundleConfig?.discountPercent || 0;
  const bundleBasePrice = bundleConfig?.finalPrice ?? baseTotal;
  const discountAmount = bundleConfig ? Math.max(0, baseTotal - bundleBasePrice) : 0;
  const totalAfterDiscount = Math.round((bundleBasePrice + addOnsTotal + podPrice) * 100) / 100;
  
  // Bundle label
  let bundleLabel: string | null = null;
  if (orderState.bundle) {
    const bundle = bundleDiscounts.find(b => b.minQuantity === orderState.bundle?.size);
    bundleLabel = bundle ? `${bundle.name} (${bundle.discountLabel})` : null;
  }
  
  // Debug logging - remove after verification
  console.log('CLIENT TOTAL', totalAfterDiscount, {
    basePrice,
    quantity,
    baseTotal,
    addOnsTotal,
    podPrice,
    subtotalBeforeDiscount,
    discountPercent,
    discountAmount,
  });
  
  return {
    basePrice,
    addOnsTotal,
    podPrice,
    subtotalPerItem,
    subtotalBeforeDiscount,
    discountAmount,
    discountPercent,
    totalAfterDiscount,
    bundleLabel,
  };
};

// Generate Shopify-ready line item properties
export const generateShopifyLineItems = (orderState: OrderState): Record<string, string> => {
  const properties: Record<string, string> = {
    "_style": orderState.baseStyleName,
    "_style_id": orderState.baseStyleId,
  };
  
  if (orderState.selectedSubstyle) {
    properties["_substyle"] = orderState.selectedSubstyle;
  }
  
  // Add digital add-ons
  orderState.digitalAddOns.forEach((addon, index) => {
    properties[`Add-On ${index + 1}`] = `${addon.label} (+£${addon.price.toFixed(2)})`;
  });
  
  // Add POD option
  if (orderState.podOption) {
    properties["Print Option"] = `${orderState.podOption.label} (+£${orderState.podOption.price.toFixed(2)})`;
  }
  
  // Add bundle info
  if (orderState.bundle) {
    properties["Bundle Size"] = `${orderState.bundle.size} artworks`;
    properties["Bundle Discount"] = `${orderState.bundle.discountPercent}%`;
  }
  
  // Customer notes
  if (orderState.customerNotes) {
    properties["Special Requests"] = orderState.customerNotes;
  }
  
  return properties;
};

// =============================================
// SHOPIFY EXPORT GENERATOR
// Creates complete export object for Shopify Cart/Storefront API
// =============================================
export const generateShopifyExport = (orderState: OrderState): ShopifyOrderExport => {
  const totals = calculateOrderTotals(orderState);
  
  // Format add-ons for Shopify
  const addOnsFormatted = orderState.digitalAddOns.map(
    addon => `${addon.label} (+£${addon.price.toFixed(2)})`
  );
  
  // Format POD for Shopify
  let podFormatted: ShopifyPodExport | null = null;
  if (orderState.podOption) {
    podFormatted = {
      "POD Format": orderState.podOption.label,
      "POD Price": `£${orderState.podOption.price.toFixed(2)}`
    };
  }
  
  // Format bundle for Shopify (includes discountAmount)
  let bundleFormatted: ShopifyBundleExport | null = null;
  let bundleWithAmount: { size: number; discountPercent: number; discountAmount: number } | null = null;
  let shopifyDiscountCode: string | null = null;
  
  if (orderState.bundle) {
    const bundleConfig = bundleDiscounts.find(b => b.minQuantity === orderState.bundle?.size);
    bundleFormatted = {
      "Bundle Size": `${orderState.bundle.size} Artworks`,
      "Bundle Discount": `${orderState.bundle.discountPercent}%`,
      "Bundle Compare At": `£${bundleConfig?.compareAtPrice.toFixed(2) ?? (orderState.basePrice * orderState.bundle.size).toFixed(2)}`,
      "Bundle Final Price": `£${totals.totalAfterDiscount.toFixed(2)}`
    };
    bundleWithAmount = {
      size: orderState.bundle.size,
      discountPercent: orderState.bundle.discountPercent,
      discountAmount: totals.discountAmount
    };
    shopifyDiscountCode = bundleConfig?.shopifyDiscountCode || null;
  }
  
  // Generate Shopify tags
  const shopifyTags: string[] = ["Custom Car Art", "SikPix"];
  if (orderState.bundle) {
    shopifyTags.push(`bundle-${orderState.bundle.size}`);
  }
  orderState.digitalAddOns.forEach(addon => {
    const addonConfig = addOns.find(a => a.id === addon.id);
    if (addonConfig?.shopifyTag) {
      shopifyTags.push(addonConfig.shopifyTag);
    }
  });
  if (orderState.podOption) {
    const podConfig = podOptions.find(p => p.id === orderState.podOption?.id);
    if (podConfig?.shopifyTag) {
      shopifyTags.push(podConfig.shopifyTag);
    }
  }
  
  return {
    style: orderState.baseStyleName,
    styleId: orderState.baseStyleId,
    substyle: orderState.selectedSubstyle,
    basePrice: orderState.basePrice,
    digitalAddOns: orderState.digitalAddOns,
    addOnsFormatted,
    podOption: orderState.podOption,
    podFormatted,
    bundle: bundleWithAmount,
    bundleFormatted,
    quantity: orderState.bundle?.size || orderState.quantity || 1,
    totalBeforeDiscount: totals.subtotalBeforeDiscount,
    totalAfterDiscount: totals.totalAfterDiscount,
    customerNotes: orderState.customerNotes,
    shopifyLineItemProperties: generateShopifyLineItems(orderState),
    shopifyDiscountCode,
    shopifyTags,
  };
};

// Hook for managing order state
export const useOrderState = (initialStyleId: string = "", initialStyleName: string = "") => {
  const [orderState, setOrderState] = useState<OrderState>({
    baseStyleId: initialStyleId,
    baseStyleName: initialStyleName,
    basePrice: BASE_PRICE,
    selectedSubstyle: "",
    digitalAddOns: [],
    podOption: null,
    bundle: null,
    quantity: 1,
    customerNotes: "",
  });

  // Toggle add-on selection
  const toggleAddOn = useCallback((addonId: string) => {
    setOrderState(prev => {
      const addon = addOns.find(a => a.id === addonId);
      if (!addon) return prev;
      
      const isSelected = prev.digitalAddOns.some(a => a.id === addonId);
      
      return {
        ...prev,
        digitalAddOns: isSelected
          ? prev.digitalAddOns.filter(a => a.id !== addonId)
          : [...prev.digitalAddOns, { id: addon.id, label: addon.name, price: addon.price }]
      };
    });
  }, []);

  // Set POD option (radio - only one at a time)
  const setPodOption = useCallback((podId: string | null) => {
    setOrderState(prev => {
      if (!podId) {
        return { ...prev, podOption: null };
      }
      
      const pod = podOptions.find(p => p.id === podId);
      if (!pod) return prev;
      
      return {
        ...prev,
        podOption: { id: pod.id, label: pod.name, price: pod.price }
      };
    });
  }, []);

  // Set bundle selection
  const setBundle = useCallback((bundleSize: number | null) => {
    setOrderState(prev => {
      if (!bundleSize) {
        return { ...prev, bundle: null, quantity: 1 };
      }
      
      const bundle = bundleDiscounts.find(b => b.minQuantity === bundleSize);
      if (!bundle) return prev;
      
      return {
        ...prev,
        bundle: { size: bundle.minQuantity, discountPercent: bundle.discountPercent },
        quantity: bundle.minQuantity,
      };
    });
  }, []);

  // Set style
  const setStyle = useCallback((styleId: string, styleName: string) => {
    setOrderState(prev => ({
      ...prev,
      baseStyleId: styleId,
      baseStyleName: styleName,
    }));
  }, []);

  // Set substyle
  const setSubstyle = useCallback((substyle: string) => {
    setOrderState(prev => ({
      ...prev,
      selectedSubstyle: substyle,
    }));
  }, []);

  // Set customer notes
  const setCustomerNotes = useCallback((notes: string) => {
    setOrderState(prev => ({
      ...prev,
      customerNotes: notes,
    }));
  }, []);

  // Calculate totals
  const totals = useMemo(() => calculateOrderTotals(orderState), [orderState]);

  // Generate Shopify line item properties
  const shopifyProperties = useMemo(() => generateShopifyLineItems(orderState), [orderState]);

  // Generate complete Shopify export object for Cart/Storefront API
  const shopifyExport = useMemo(() => generateShopifyExport(orderState), [orderState]);

  // Check if add-on is selected
  const isAddOnSelected = useCallback((addonId: string) => {
    return orderState.digitalAddOns.some(a => a.id === addonId);
  }, [orderState.digitalAddOns]);

  return {
    orderState,
    setOrderState,
    toggleAddOn,
    setPodOption,
    setBundle,
    setStyle,
    setSubstyle,
    setCustomerNotes,
    isAddOnSelected,
    totals,
    shopifyProperties,
    shopifyExport,
  };
};
