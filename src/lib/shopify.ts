// Shopify Storefront API Configuration
export const SHOPIFY_API_VERSION = '2025-07';
export const SHOPIFY_STORE_PERMANENT_DOMAIN = 'portraitive.myshopify.com';
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = '25ffbd89630ddf51a301deafcdd84ea0';

// Supabase Edge Function URL for Draft Orders
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Storefront API helper function
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (response.status === 402) {
    throw new Error('Shopify API access requires an active Shopify billing plan.');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Shopify API error: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

// Cart Create Mutation
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Main portrait product variant ID
const PORTRAIT_VARIANT_ID = 'gid://shopify/ProductVariant/56200788836700';

// Custom line item type for SikPix orders
export interface PortraitOrderItem {
  title: string;
  quantity: number;
  properties: Record<string, string>;
}

// Create checkout with Draft Order (for portrait orders with custom pricing)
export async function createPortraitCheckout(
  orderExport: {
    styles: Array<{ styleId: string; styleName: string; styleSlug: string }>;
    totalAfterDiscount: number;
    customerName: string;
    customerEmail: string;
    bundle?: { label: string; discountPercent: number; size?: number } | null;
    digitalAddOns: Array<{ id?: string; label: string; price: number }>;
    portraitPodSelections: Array<{
      styleName: string;
      podOption: { id?: string; label: string; price: number } | null;
    }>;
    specialRequests?: string;
    referencePhotos?: string[];
  }
): Promise<string> {
  // Create payload for the edge function
  const payload = {
    styles: orderExport.styles,
    totalAfterDiscount: orderExport.totalAfterDiscount,
    customerName: orderExport.customerName,
    customerEmail: orderExport.customerEmail,
    bundle: orderExport.bundle,
    digitalAddOns: orderExport.digitalAddOns,
    portraitPodSelections: orderExport.portraitPodSelections,
    specialRequests: orderExport.specialRequests,
    referencePhotos: orderExport.referencePhotos,
  };

  // Call the edge function to create a Draft Order with custom pricing
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-draft-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }

  if (response.status === 403) {
    throw new Error('Request validation failed. Please refresh the page and try again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Draft Order creation failed:', errorData.error);
    throw new Error(errorData.error || `Failed to create checkout: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.checkoutUrl) {
    throw new Error(data.error || 'No checkout URL returned');
  }

  return data.checkoutUrl;
}

// Standard cart checkout for when products exist
export async function createStorefrontCheckout(
  items: Array<{
    variantId: string;
    quantity: number;
    attributes?: Array<{ key: string; value: string }>;
  }>
): Promise<string> {
  if (items.length === 0) {
    throw new Error('Cart is empty');
  }

  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
    attributes: item.attributes || [],
  }));

  const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines },
  });

  if (cartData.data.cartCreate.userErrors.length > 0) {
    throw new Error(
      `Cart creation failed: ${cartData.data.cartCreate.userErrors
        .map((e: { message: string }) => e.message)
        .join(', ')}`
    );
  }

  const cart = cartData.data.cartCreate.cart;

  if (!cart.checkoutUrl) {
    throw new Error('No checkout URL returned from Shopify');
  }

  // Add channel parameter for public checkout access
  const url = new URL(cart.checkoutUrl);
  url.searchParams.set('channel', 'online_store');
  
  return url.toString();
}
