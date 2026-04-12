import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// =============================================
// ADMIN ORDERS API
// Protected endpoint for viewing orders and generating POD jobs
// Includes Gelato POD integration with multi-print support
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

// =============================================
// GELATO PRODUCT MAPPING
// Map internal POD option names to Gelato product UIDs
// Structure: productType -> size -> Gelato UID
// =============================================
const GELATO_PRODUCTS = {
  fine_art: {
    A4: "fine_arts_poster_geo_simplified_product_12-0_ver_a4-8x12-inch_200-gsm-80lb-enhanced-uncoated",
    A3: "fine_arts_poster_geo_simplified_product_12-0_ver_a3_200-gsm-80lb-enhanced-uncoated",
    A2: "fine_arts_poster_geo_simplified_product_12-0_ver_a2_200-gsm-80lb-enhanced-uncoated",
  },
  wood_frame: {
    A3: "framed_poster_mounted_premium_a3_black_wood_w20xt20-mm_plexiglass_a3_250-gsm-100lb-uncoated-offwhite-archival_4-0_ver",
    A2: "framed_poster_mounted_premium_a2_black_wood_w20xt20-mm_plexiglass_a2_250-gsm-100lb-uncoated-offwhite-archival_4-0_ver",
  },
  canvas: {
    A3: "canvas_300x400-mm-12x16-inch_canvas_wood-fsc-thick_4-0_ver",
    A2: "canvas_500x700-mm-20x28-inch_canvas_wood-fsc-thick_4-0_ver",
  },
  framed_canvas: {
    A3: "framed_canvas_geo_simplified_300x400-mm-12x16-inch_black_352x452-mm-14x18-inch_wood-fsc-slim_ver_wood_w14xt42-mm_canvas_4-0",
    A2: "framed_canvas_geo_simplified_500x700-mm-20x28-inch_black_552x752-mm-22x30-inch_wood-fsc-slim_ver_wood_w14xt42-mm_canvas_4-0",
  },
} as const;

// Get Gelato API configuration
function getGelatoConfig() {
  const apiKey = Deno.env.get('GELATO_API_KEY');
  const env = Deno.env.get('GELATO_ENV') || 'sandbox';
  
  if (!apiKey) {
    throw new Error('GELATO_API_KEY not configured');
  }
  
  const baseUrl = 'https://order.gelatoapis.com/v4';
  
  return { apiKey, env, baseUrl };
}

// Parsed print item from pod_options
interface ParsedPrintItem {
  styleName: string;      // e.g., "Vogue Cover Portrait"
  printOption: string;    // e.g., "A3 Canvas Print"
  fullOption: string;     // e.g., "Vogue Cover Portrait: A3 Canvas Print (+£39.00)"
}

// Validation error detail
interface ValidationErrorDetail {
  itemId: string;
  styleName: string;
  field: string;
  message: string;
}

// POD Job structure for provider integration
interface PodJob {
  orderId: string;
  shopifyOrderNumber: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    zip: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    lineItemId: string;
    itemId: string;
    styleName: string;
    printOption: string;
    fullOption: string;
    quantity: number;
    artworkUrl?: string;
  }>;
  createdAt: string;
}

// Gelato order payload structure
interface GelatoOrderPayload {
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string;
  items: Array<{
    itemReferenceId: string;
    productUid: string;
    files: Array<{
      type: string;
      url: string;
    }>;
    quantity: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Verify admin token
function verifyAdminToken(req: Request): boolean {
  const adminToken = Deno.env.get('ADMIN_SECRET_TOKEN');
  if (!adminToken) {
    console.error('ADMIN_SECRET_TOKEN not configured');
    return false;
  }
  
  const providedToken = req.headers.get('x-admin-token');
  return providedToken === adminToken;
}

// Parse individual print items from pod_options.option string
// Format: "Vogue Cover Portrait: A3 Canvas Print (+£39.00), GQ Cover Portrait: A3 Canvas Print (+£39.00)"
function parsePrintItems(podOptionsOption: string | undefined): ParsedPrintItem[] {
  if (!podOptionsOption) return [];
  
  const items: ParsedPrintItem[] = [];
  
  // Split by comma, but be careful about prices with commas
  // Pattern: "Style Name: Print Option (+£XX.XX)"
  const regex = /([^,]+?:\s*[^(]+?\s*\(\+?£?\d+\.?\d*\))/g;
  const matches = podOptionsOption.match(regex);
  
  if (!matches) {
    // Fallback: try simple comma split
    const parts = podOptionsOption.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        const styleName = part.substring(0, colonIndex).trim();
        const printOption = part.substring(colonIndex + 1).replace(/\(\+?£?\d+\.?\d*\)/, '').trim();
        items.push({ styleName, printOption, fullOption: part });
      }
    }
    return items;
  }
  
  for (const match of matches) {
    const colonIndex = match.indexOf(':');
    if (colonIndex > 0) {
      const styleName = match.substring(0, colonIndex).trim();
      const printOption = match.substring(colonIndex + 1).replace(/\(\+?£?\d+\.?\d*\)/, '').trim();
      items.push({ styleName, printOption, fullOption: match.trim() });
    }
  }
  
  return items;
}

// Map POD option string to Gelato product UID
// Expected format: "A3 Canvas Print", "A2 Fine Art Print (Premium Matte)", "A2 Premium Wood Frame (Black)", etc.
function mapPodOptionToGelatoProduct(printOption: string): string | null {
  const normalized = printOption.toLowerCase().trim();
  
  let productType: keyof typeof GELATO_PRODUCTS | null = null;
  let size: string | null = null;
  
  // Match product types (order matters - more specific first)
  if (normalized.includes('framed canvas')) {
    productType = 'framed_canvas';
  } else if (normalized.includes('canvas')) {
    productType = 'canvas';
  } else if (normalized.includes('wood frame') || normalized.includes('premium wood frame')) {
    productType = 'wood_frame';
  } else if (normalized.includes('fine art') || normalized.includes('fine_art') || normalized.includes('print')) {
    productType = 'fine_art';
  }
  
  // Match sizes
  if (normalized.includes('a4')) {
    size = 'A4';
  } else if (normalized.includes('a3')) {
    size = 'A3';
  } else if (normalized.includes('a2')) {
    size = 'A2';
  }
  
  if (!productType || !size) {
    console.warn(`Could not parse print option: "${printOption}" -> type=${productType}, size=${size}`);
    return null;
  }
  
  const productMap = GELATO_PRODUCTS[productType];
  const productUid = productMap[size as keyof typeof productMap];
  
  if (!productUid) {
    console.warn(`No Gelato product for: ${productType} ${size}`);
    return null;
  }
  
  console.log(`Mapped "${printOption}" -> ${productType}/${size} -> ${productUid}`);
  return productUid;
}

// Validate artwork URL
function validateArtworkUrl(url: string | undefined, styleName: string): ValidationErrorDetail | null {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      itemId: '',
      styleName,
      field: 'artwork_url',
      message: `Artwork URL required for "${styleName}"`
    };
  }
  
  const trimmedUrl = url.trim();
  
  // Must start with https://
  if (!trimmedUrl.startsWith('https://')) {
    return {
      itemId: '',
      styleName,
      field: 'artwork_url',
      message: `Artwork URL for "${styleName}" must start with https://`
    };
  }
  
  // Should be from artworks bucket (not customer_uploads signed URLs)
  if (trimmedUrl.includes('/object/sign/customer_uploads/')) {
    return {
      itemId: '',
      styleName,
      field: 'artwork_url',
      message: `Artwork URL for "${styleName}" should be from the artworks bucket (public URL), not a signed customer_uploads URL`
    };
  }
  
  // Validate URL format
  try {
    new URL(trimmedUrl);
  } catch {
    return {
      itemId: '',
      styleName,
      field: 'artwork_url',
      message: `Invalid URL format for "${styleName}"`
    };
  }
  
  return null;
}

// Generate POD job from order data (with multi-print support)
function generatePodJob(order: any, items: any[]): PodJob {
  const podItems: PodJob['items'] = [];
  
  for (const item of items) {
    if (!item.pod_options?.option) continue;
    
    // Parse individual print items from the combined pod_options.option string
    const printItems = parsePrintItems(item.pod_options.option);
    
    // Get artwork URLs from artwork_urls JSONB (or fall back to legacy artwork_url)
    const artworkUrls: Record<string, string> = item.artwork_urls || {};
    const legacyArtworkUrl = item.artwork_url;
    
    for (const printItem of printItems) {
      // Look up artwork URL by style name, or use legacy single URL if only one print
      let artworkUrl = artworkUrls[printItem.styleName];
      if (!artworkUrl && printItems.length === 1 && legacyArtworkUrl) {
        artworkUrl = legacyArtworkUrl;
      }
      
      podItems.push({
        lineItemId: item.shopify_line_item_id,
        itemId: item.id,
        styleName: printItem.styleName,
        printOption: printItem.printOption,
        fullOption: printItem.fullOption,
        quantity: 1, // Each print item is quantity 1
        artworkUrl: artworkUrl || undefined,
      });
    }
  }
  
  return {
    orderId: order.id,
    shopifyOrderNumber: order.shopify_order_number,
    customerName: order.customer_name || undefined,
    customerEmail: order.customer_email || undefined,
    shippingAddress: order.shipping_address || undefined,
    items: podItems,
    createdAt: order.created_at,
  };
}

// Build Gelato order payload with detailed validation
function buildGelatoPayload(
  order: any, 
  items: any[], 
  podJob: PodJob
): { 
  payload: GelatoOrderPayload | null; 
  validationErrors: ValidationErrorDetail[];
} {
  const validationErrors: ValidationErrorDetail[] = [];
  const shippingAddress = order.shipping_address || {};
  
  // Validate each print item
  for (const item of podJob.items) {
    // Validate artwork URL
    const urlError = validateArtworkUrl(item.artworkUrl, item.styleName);
    if (urlError) {
      urlError.itemId = item.itemId;
      validationErrors.push(urlError);
    }
    
    // Validate Gelato product mapping
    const productUid = mapPodOptionToGelatoProduct(item.printOption);
    if (!productUid) {
      validationErrors.push({
        itemId: item.itemId,
        styleName: item.styleName,
        field: 'pod_option',
        message: `Unknown print option "${item.printOption}" for "${item.styleName}" - cannot map to Gelato product`
      });
    }
  }
  
  if (validationErrors.length > 0) {
    return { payload: null, validationErrors };
  }
  
  // Split name into first/last
  const nameParts = (shippingAddress.name || order.customer_name || 'Customer').split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'Unknown';
  
  // Build items array for Gelato
  const gelatoItems: GelatoOrderPayload['items'] = [];
  
  let itemIndex = 0;
  for (const item of podJob.items) {
    const productUid = mapPodOptionToGelatoProduct(item.printOption);
    
    if (!productUid) continue; // Already validated above
    
    gelatoItems.push({
      itemReferenceId: `${order.shopify_order_number}-${item.lineItemId}-${itemIndex}`,
      productUid,
      files: [
        {
          type: 'default',
          url: item.artworkUrl!,
        }
      ],
      quantity: item.quantity,
    });
    itemIndex++;
  }
  
  return {
    payload: {
      orderReferenceId: order.shopify_order_number,
      customerReferenceId: order.customer_email || order.shopify_order_id,
      currency: order.currency || 'GBP',
      items: gelatoItems,
      shippingAddress: {
        firstName,
        lastName,
        addressLine1: shippingAddress.address1 || 'Address Required',
        addressLine2: shippingAddress.address2 || undefined,
        city: shippingAddress.city || 'City Required',
        state: shippingAddress.province || undefined,
        postCode: shippingAddress.zip || '00000',
        country: shippingAddress.country_code || shippingAddress.country || 'GB',
        phone: shippingAddress.phone || undefined,
        email: order.customer_email || undefined,
      },
    },
    validationErrors: [],
  };
}

// Send order to Gelato API
async function sendToGelato(
  order: any, 
  items: any[], 
  podJob: PodJob
): Promise<{ 
  success: boolean; 
  gelatoOrderId?: string; 
  error?: string; 
  validationErrors?: ValidationErrorDetail[];
}> {
  try {
    const { apiKey, env, baseUrl } = getGelatoConfig();
    const { payload, validationErrors } = buildGelatoPayload(order, items, podJob);
    
    // Return validation errors if any
    if (validationErrors.length > 0 || !payload) {
      console.log('Validation failed:', validationErrors);
      return {
        success: false,
        validationErrors,
        error: validationErrors.map(e => e.message).join('; '),
      };
    }
    
    // Check for test order and log warning
    const rawPayload = order.raw_payload || {};
    const isTestOrder = rawPayload.test === true || 
                        (order.shopify_order_number || '').toLowerCase().includes('test') ||
                        (rawPayload.tags || '').toLowerCase().includes('test');
    
    if (isTestOrder && env === 'production') {
      console.warn('⚠️ Sending TEST order to PRODUCTION Gelato environment');
    }
    
    // Log send attempt (no PII, no artwork URLs)
    console.log('Sending order to Gelato:', {
      orderReferenceId: payload.orderReferenceId,
      itemCount: payload.items.length,
      currency: payload.currency,
      gelatoEnv: env,
      isTestOrder,
      items: payload.items.map(i => ({ 
        ref: i.itemReferenceId, 
        product: i.productUid, 
        qty: i.quantity 
      })),
    });
    
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    if (!response.ok) {
      console.error('Gelato API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseData,
      });
      
      // Try to extract meaningful error message
      let errorMessage = `Gelato API returned ${response.status}`;
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = typeof responseData.error === 'string' 
          ? responseData.error 
          : JSON.stringify(responseData.error);
      } else if (responseData.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors.map((e: any) => e.message || e).join('; ');
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    console.log('Gelato order created:', {
      gelatoOrderId: responseData.id,
      status: responseData.orderStatus,
    });
    
    return {
      success: true,
      gelatoOrderId: responseData.id,
    };
  } catch (error) {
    console.error('Gelato API exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling Gelato API',
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  
  try {
    const supabase = getSupabaseClient();
    
    // LIST ORDERS
    if (action === 'list' || !action) {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const status = url.searchParams.get('status');
      
      let query = supabase
        .from('portrait_orders')
        .select('id, shopify_order_id, shopify_order_number, customer_name, customer_email, total_price, currency, payment_status, pod_status, pod_error, gelato_order_id, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (status) {
        query = query.eq('pod_status', status);
      }
      
      const { data: orders, error } = await query;
      
      if (error) throw error;
      
      // Get total count
      const { count } = await supabase
        .from('portrait_orders')
        .select('*', { count: 'exact', head: true });
      
      return new Response(JSON.stringify({ orders, total: count }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // GET SINGLE ORDER WITH ITEMS
    if (action === 'get') {
      const orderId = url.searchParams.get('order_id');
      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing order_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { data: order, error: orderError } = await supabase
        .from('portrait_orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      const { data: items, error: itemsError } = await supabase
        .from('portrait_order_items')
        .select('*, reference_photos, artwork_urls')
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      // Generate POD job with parsed print items
      const podJob = generatePodJob(order, items || []);
      
      return new Response(JSON.stringify({ order, items, podJob }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // UPDATE ARTWORK URL FOR A SPECIFIC STYLE IN A LINE ITEM
    if (action === 'update-artwork-url') {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = await req.json();
      const { item_id, style_name, artwork_url } = body;
      
      if (!item_id) {
        return new Response(JSON.stringify({ error: 'Missing item_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate URL format if provided
      if (artwork_url && typeof artwork_url === 'string' && artwork_url.trim()) {
        const urlError = validateArtworkUrl(artwork_url, style_name || 'artwork');
        if (urlError) {
          return new Response(JSON.stringify({ 
            error: urlError.message,
            field: urlError.field,
            styleName: urlError.styleName
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      // Get current artwork_urls
      const { data: currentItem, error: fetchError } = await supabase
        .from('portrait_order_items')
        .select('artwork_urls')
        .eq('id', item_id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update artwork_urls JSONB with style-specific URL
      const currentUrls: Record<string, string> = currentItem?.artwork_urls || {};
      
      if (style_name) {
        // Update specific style
        if (artwork_url && artwork_url.trim()) {
          currentUrls[style_name] = artwork_url.trim();
        } else {
          delete currentUrls[style_name];
        }
      } else {
        // Legacy: update default key
        if (artwork_url && artwork_url.trim()) {
          currentUrls['default'] = artwork_url.trim();
        } else {
          delete currentUrls['default'];
        }
      }
      
      const { data: updated, error: updateError } = await supabase
        .from('portrait_order_items')
        .update({ artwork_urls: currentUrls })
        .eq('id', item_id)
        .select('*, artwork_urls')
        .single();
      
      if (updateError) throw updateError;
      
      console.log('Artwork URL updated for item:', item_id, 'style:', style_name);
      
      return new Response(JSON.stringify({ success: true, item: updated }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // GENERATE POD JOB (marks order as ready_for_pod)
    if (action === 'generate-pod-job') {
      const orderId = url.searchParams.get('order_id');
      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing order_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Get order and items
      const { data: order, error: orderError } = await supabase
        .from('portrait_orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      const { data: items, error: itemsError } = await supabase
        .from('portrait_order_items')
        .select('*, artwork_urls')
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      // Generate POD job
      const podJob = generatePodJob(order, items || []);
      
      // Log POD job with PII redacted
      console.log('=== POD JOB GENERATED ===');
      console.log('Order:', podJob.shopifyOrderNumber);
      console.log('Print items:', podJob.items.length);
      console.log('Items:', podJob.items.map(i => ({ 
        style: i.styleName, 
        option: i.printOption,
        hasArtwork: !!i.artworkUrl 
      })));
      console.log('=========================');
      
      // Update order status to ready_for_pod
      const { error: updateError } = await supabase
        .from('portrait_orders')
        .update({ pod_status: 'ready_for_pod' })
        .eq('id', orderId);
      
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({ 
        success: true, 
        podJob,
        message: 'POD job generated. Order marked as ready_for_pod.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // SEND TO GELATO
    if (action === 'send-to-gelato') {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = await req.json();
      const orderId = body.order_id;
      
      if (!orderId) {
        return new Response(JSON.stringify({ error: 'Missing order_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Get order and items
      const { data: order, error: orderError } = await supabase
        .from('portrait_orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // Check if already sent
      if (order.pod_status === 'sent_to_pod' && order.gelato_order_id) {
        return new Response(JSON.stringify({ 
          status: 'already_sent',
          gelatoOrderId: order.gelato_order_id,
          message: 'Order has already been sent to Gelato' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { data: items, error: itemsError } = await supabase
        .from('portrait_order_items')
        .select('*, artwork_urls')
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      // Generate POD job
      const podJob = generatePodJob(order, items || []);
      
      // Check if there are any print items
      if (podJob.items.length === 0) {
        return new Response(JSON.stringify({ 
          status: 'error',
          error: 'No print items found in this order',
          message: 'This order does not have any POD items to send to Gelato' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Update status to ready_for_pod before sending
      await supabase
        .from('portrait_orders')
        .update({ pod_status: 'ready_for_pod', pod_error: null })
        .eq('id', orderId);
      
      // Send to Gelato
      const result = await sendToGelato(order, items || [], podJob);
      
      if (result.success) {
        // Update status to sent_to_pod
        await supabase
          .from('portrait_orders')
          .update({ 
            pod_status: 'sent_to_pod', 
            gelato_order_id: result.gelatoOrderId,
            pod_error: null 
          })
          .eq('id', orderId);
        
        return new Response(JSON.stringify({ 
          status: 'ok',
          gelatoOrderId: result.gelatoOrderId,
          message: 'Order successfully sent to Gelato' 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Format validation errors for UI
        const formattedErrors = result.validationErrors?.map(e => ({
          itemId: e.itemId,
          styleName: e.styleName,
          field: e.field,
          message: e.message
        })) || [];
        
        // Update status to error
        await supabase
          .from('portrait_orders')
          .update({ 
            pod_status: 'error', 
            pod_error: { 
              message: result.error, 
              validationErrors: formattedErrors,
              timestamp: new Date().toISOString() 
            } 
          })
          .eq('id', orderId);
        
        return new Response(JSON.stringify({ 
          status: 'error',
          error: result.error,
          validationErrors: formattedErrors,
          message: 'Failed to send order to Gelato' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // UPDATE POD STATUS
    if (action === 'update-status') {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = await req.json();
      const { order_id, status } = body;
      
      if (!order_id || !status) {
        return new Response(JSON.stringify({ error: 'Missing order_id or status' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const validStatuses = ['pending', 'ready_for_pod', 'preview_sent', 'sent_to_pod', 'fulfilled', 'error'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { error: updateError } = await supabase
        .from('portrait_orders')
        .update({ pod_status: status })
        .eq('id', order_id);
      
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin API error:', errorMessage);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
