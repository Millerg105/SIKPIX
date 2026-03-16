import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Shopify Admin API configuration
const SHOPIFY_STORE_DOMAIN = 'btvp1i-mb.myshopify.com';
const SHOPIFY_ADMIN_API_VERSION = '2025-01';

// =============================================
// PRICING CONFIGURATION (MUST MATCH CLIENT)
// =============================================
const BASE_PRICE = 9.99;

const ADD_ONS: Record<string, number> = {
  "extra-vehicle": 5.00,
  "phone-wallpaper": 3.99,
  "rush-24h": 9.99,
};

// POD_OPTIONS must match IDs in src/data/shopifyConfig.ts
const POD_OPTIONS: Record<string, number> = {
  // Fine Art Prints (Premium Matte)
  "print-a4-fine-art": 29.99,
  "print-a3-fine-art": 39.99,
  "print-a2-fine-art": 49.99,
  // Premium Wood Framed Prints
  "framed-a3-wood-frame": 59.99,
  "framed-a2-wood-frame": 89.99,
  // Canvas Prints
  "canvas-a3": 79.99,
  "canvas-a2": 109.99,
  // Framed Canvas
  "framed-canvas-a3": 79.99,
  "framed-canvas-a2": 99.99,
  "framed-canvas-a2-premium": 149.99,
};

const BUNDLE_CONFIG: Record<number, { discountPercent: number; finalPrice: number }> = {
  3: { discountPercent: 16.62, finalPrice: 24.99 },
  5: { discountPercent: 29.95, finalPrice: 34.99 },
};

// Valid add-on and POD IDs for validation
const VALID_ADDON_IDS = Object.keys(ADD_ONS);
const VALID_POD_IDS = Object.keys(POD_OPTIONS);
const VALID_BUNDLE_SIZES = Object.keys(BUNDLE_CONFIG).map(Number);

// =============================================
// ZOD VALIDATION SCHEMAS
// =============================================
const PortraitStyleSchema = z.object({
  styleId: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Invalid style ID format"),
  styleName: z.string().min(1).max(100).trim(),
  styleSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Invalid style slug format"),
});

const DigitalAddOnSchema = z.object({
  id: z.string().max(50).optional(),
  label: z.string().min(1).max(100).trim(),
  price: z.number().min(0).max(100),
});

const PodOptionSchema = z.object({
  id: z.string().max(50).optional(),
  label: z.string().min(1).max(100).trim(),
  price: z.number().min(0).max(500),
}).nullable();

const PodSelectionSchema = z.object({
  styleName: z.string().min(1).max(100).trim(),
  podOption: PodOptionSchema,
});

const BundleSchema = z.object({
  label: z.string().min(1).max(50).trim(),
  discountPercent: z.number().min(0).max(50),
  size: z.number().int().min(1).max(10).optional(),
}).nullable();

const DraftOrderRequestSchema = z.object({
  styles: z.array(PortraitStyleSchema).min(1).max(10),
  totalAfterDiscount: z.number().min(0).max(10000),
  customerName: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  customerEmail: z.string().email("Invalid email format").max(255, "Email too long").toLowerCase().trim(),
  bundle: BundleSchema,
  digitalAddOns: z.array(DigitalAddOnSchema).max(10),
  portraitPodSelections: z.array(PodSelectionSchema).max(10),
  specialRequests: z.string().max(1000, "Special requests too long").trim().optional(),
  referencePhotos: z.array(z.string().url().max(2000)).max(4).optional(),
});

type DraftOrderRequest = z.infer<typeof DraftOrderRequestSchema>;

// =============================================
// RATE LIMITING
// =============================================
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  
  entry.count++;
  return false;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// =============================================
// SERVER-SIDE PRICE CALCULATION
// =============================================
function calculateServerTotal(orderData: DraftOrderRequest): { 
  calculatedTotal: number; 
  breakdown: string;
} {
  const quantity = orderData.bundle?.size || orderData.styles.length || 1;

  // Base price for the digital artwork package
  const compareAtBaseTotal = BASE_PRICE * quantity;
  const bundleConfig = orderData.bundle ? BUNDLE_CONFIG[orderData.bundle.size || quantity] : undefined;
  const baseTotal = bundleConfig ? bundleConfig.finalPrice : compareAtBaseTotal;
  
  // Add-ons total
  let addOnsTotal = 0;
  for (const addon of orderData.digitalAddOns) {
    // Try to match by ID first, then by known prices
    if (addon.id && ADD_ONS[addon.id] !== undefined) {
      addOnsTotal += ADD_ONS[addon.id];
    } else {
      // Validate against known add-on prices
      const validPrice = Object.values(ADD_ONS).includes(addon.price);
      if (validPrice) {
        addOnsTotal += addon.price;
      } else {
        console.warn(`Invalid add-on price rejected: ${addon.price}`);
      }
    }
  }
  
  // POD total
  let podTotal = 0;
  for (const selection of orderData.portraitPodSelections) {
    if (selection.podOption) {
      const podId = selection.podOption.id;
      if (podId && POD_OPTIONS[podId] !== undefined) {
        podTotal += POD_OPTIONS[podId];
      } else {
        // Validate against known POD prices
        const validPrice = Object.values(POD_OPTIONS).includes(selection.podOption.price);
        if (validPrice) {
          podTotal += selection.podOption.price;
        } else {
          console.warn(`Invalid POD price rejected: ${selection.podOption.price}`);
        }
      }
    }
  }
  
  // Subtotal after package pricing
  const subtotal = baseTotal + addOnsTotal + podTotal;

  // Apply bundle validation for display only
  let discountPercent = 0;
  let discountAmount = 0;
  if (orderData.bundle) {
    const bundleSize = orderData.bundle.size || quantity;
    const validBundle = BUNDLE_CONFIG[bundleSize];
    if (validBundle !== undefined && Math.abs(validBundle.discountPercent - orderData.bundle.discountPercent) < 0.02) {
      discountPercent = validBundle.discountPercent;
      discountAmount = compareAtBaseTotal - validBundle.finalPrice;
    } else {
      console.warn(`Invalid bundle discount rejected: ${orderData.bundle.discountPercent}% for size ${bundleSize}`);
    }
  }

  const calculatedTotal = Math.round(subtotal * 100) / 100;
  
  // Debug logging - matches client format
  console.log('SERVER TOTAL', calculatedTotal, {
    basePrice: baseTotal,
    quantity,
    baseTotal,
    compareAtBaseTotal,
    addOnsTotal,
    podTotal,
    subtotal,
    discountPercent,
    discountAmount,
  });
  
  const breakdown = `Base package: £${baseTotal.toFixed(2)} (compare at £${compareAtBaseTotal.toFixed(2)}), Add-ons: £${addOnsTotal.toFixed(2)}, POD: £${podTotal.toFixed(2)}, Bundle discount: ${discountPercent}%`;
  
  return { calculatedTotal, breakdown };
}

// =============================================
// DRAFT ORDER CREATION
// =============================================
async function createDraftOrder(orderData: DraftOrderRequest, serverTotal: number): Promise<string> {
  const adminToken = Deno.env.get('SHOPIFY_ADMIN_API_TOKEN');
  
  if (!adminToken) {
    throw new Error('SHOPIFY_ADMIN_API_TOKEN not configured');
  }

  // Build line item title with all selections
  const stylesList = orderData.styles.map(s => s.styleName).join(', ');
  const lineItemTitle = `Custom Car Artwork${orderData.styles.length > 1 ? 's' : ''} - ${stylesList}`;
  
  // Build note attributes for order details (no PII logged)
  const noteAttributes: Array<{ name: string; value: string }> = [
    { name: 'Styles', value: stylesList },
    { name: 'Number of Artworks', value: orderData.styles.length.toString() },
  ];

  if (orderData.bundle) {
    noteAttributes.push({ name: 'Bundle', value: orderData.bundle.label });
    noteAttributes.push({ name: 'Bundle Discount', value: `${orderData.bundle.discountPercent}%` });
  }

  if (orderData.digitalAddOns.length > 0) {
    const addOnsText = orderData.digitalAddOns
      .map(a => `${a.label} (+£${a.price.toFixed(2)})`)
      .join(', ');
    noteAttributes.push({ name: 'Digital Add-Ons', value: addOnsText });
  }

  const podSelections = orderData.portraitPodSelections.filter(p => p.podOption);
  if (podSelections.length > 0) {
    const podText = podSelections
      .map(p => `${p.styleName}: ${p.podOption?.label} (+£${p.podOption?.price.toFixed(2)})`)
      .join(', ');
    noteAttributes.push({ name: 'Print Options', value: podText });
  }

  if (orderData.specialRequests) {
    noteAttributes.push({ name: 'Special Requests', value: orderData.specialRequests });
  }

  // Add reference photos if provided
  if (orderData.referencePhotos && orderData.referencePhotos.length > 0) {
    noteAttributes.push({ 
      name: 'Customer Photos', 
      value: orderData.referencePhotos.join(', ') 
    });
  }

  // Build the note for the order (no PII)
  const orderNote = [
    `Car Artwork Order: ${stylesList}`,
    orderData.bundle ? `Bundle: ${orderData.bundle.label} (${orderData.bundle.discountPercent}% off)` : null,
    orderData.digitalAddOns.length > 0 ? `Add-ons: ${orderData.digitalAddOns.map(a => a.label).join(', ')}` : null,
    podSelections.length > 0 ? `Prints: ${podSelections.map(p => `${p.styleName}: ${p.podOption?.label}`).join(', ')}` : null,
    orderData.specialRequests ? `Notes: ${orderData.specialRequests}` : null,
    orderData.referencePhotos && orderData.referencePhotos.length > 0 
      ? `Customer photos:\n${orderData.referencePhotos.join('\n')}` 
      : null,
  ].filter(Boolean).join('\n');

  // Create Draft Order using Admin API with SERVER-CALCULATED price
  const draftOrderPayload = {
    draft_order: {
      line_items: [
        {
          title: lineItemTitle,
          price: serverTotal.toFixed(2), // Use server-calculated total
          quantity: 1,
          taxable: true,
          requires_shipping: podSelections.length > 0,
          properties: noteAttributes.map(attr => ({ name: attr.name, value: attr.value })),
        }
      ],
      email: orderData.customerEmail,
      note: orderNote,
      note_attributes: [
        { name: 'Customer Name', value: orderData.customerName },
        ...noteAttributes
      ],
      tags: [
        'car-art-order',
        orderData.bundle ? `bundle-${orderData.bundle.label.toLowerCase().replace(/\s+/g, '-')}` : null,
        ...orderData.digitalAddOns.map(a => `addon-${a.label.toLowerCase().replace(/\s+/g, '-')}`),
        podSelections.length > 0 ? 'has-prints' : 'digital-only',
      ].filter(Boolean).join(', '),
      use_customer_default_address: false,
    }
  };

  console.log('Creating Draft Order with server-calculated total:', serverTotal.toFixed(2));

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/draft_orders.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(draftOrderPayload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify API Error:', response.status, errorText);
    throw new Error(`Failed to create draft order: ${response.status}`);
  }

  const data = await response.json();
  console.log('Draft Order created successfully, ID:', data.draft_order.id);

  const draftOrder = data.draft_order;
  
  if (!draftOrder.invoice_url) {
    throw new Error('No invoice URL returned from draft order');
  }

  return draftOrder.invoice_url;
}

// =============================================
// MAIN HANDLER
// =============================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';

  // Check rate limit
  if (isRateLimited(clientIp)) {
    console.warn('Rate limit exceeded for IP:', clientIp.substring(0, 8) + '...');
    return new Response(
      JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const bodyText = await req.text();
    const rawData = JSON.parse(bodyText);

    // =============================================
    // SECURITY CHECK 1: Zod Input Validation
    // =============================================
    const validationResult = DraftOrderRequestSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.warn('Input validation failed:', errors);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid request data: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const orderData = validationResult.data;

    // =============================================
    // SECURITY CHECK 2: Server-Side Price Validation
    // =============================================
    const { calculatedTotal, breakdown } = calculateServerTotal(orderData);
    const clientTotal = orderData.totalAfterDiscount;
    const priceDifference = Math.abs(calculatedTotal - clientTotal);
    
    // Allow 1p tolerance for floating point errors
    if (priceDifference > 0.01) {
      console.error('Price mismatch detected!');
      console.error(`Client total: £${clientTotal.toFixed(2)}, Server total: £${calculatedTotal.toFixed(2)}`);
      console.error(`Breakdown: ${breakdown}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Price validation failed. Please refresh and try again.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // LOGGING (NO PII)
    // =============================================
    console.log('=== DRAFT ORDER REQUEST (VALIDATED) ===');
    console.log('Styles:', orderData.styles.map(s => s.styleName).join(', '));
    console.log('Server-calculated total:', `£${calculatedTotal.toFixed(2)}`);
    console.log('Breakdown:', breakdown);
    console.log('Bundle:', orderData.bundle?.label || 'None');
    console.log('Add-ons:', orderData.digitalAddOns.map(a => a.label).join(', ') || 'None');
    console.log('POD:', orderData.portraitPodSelections.filter(p => p.podOption).length > 0 ? 'Yes' : 'No');
    console.log('Customer Photos:', orderData.referencePhotos?.length || 0);
    console.log('========================================');

    // Create draft order with SERVER-CALCULATED price
    const checkoutUrl = await createDraftOrder(orderData, calculatedTotal);

    return new Response(
      JSON.stringify({ success: true, checkoutUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing draft order:', errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to create order. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
