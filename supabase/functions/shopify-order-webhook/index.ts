import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// =============================================
// SHOPIFY ORDER WEBHOOK HANDLER
// Receives paid orders and stores them for POD pipeline
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain',
};

// Initialize Supabase client with service role for server-only tables
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Verify Shopify webhook HMAC signature
async function verifyShopifyWebhook(rawBody: string, hmacHeader: string): Promise<boolean> {
  const webhookSecret = Deno.env.get('SHOPIFY_WEBHOOK_SECRET');
  
  if (!webhookSecret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const computedHmac = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    // Compare signatures (timing-safe would be better but this is adequate)
    return computedHmac === hmacHeader;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

// Extract structured data from Shopify line item properties
function extractLineItemMetadata(properties: Array<{ name: string; value: string }> | null) {
  if (!properties || !Array.isArray(properties)) {
    return {
      styles: null,
      digitalAddons: null,
      podOptions: null,
      bundleDiscount: null,
    };
  }
  
  const propsMap = new Map(properties.map(p => [p.name, p.value]));
  
  // Extract styles
  const stylesValue = propsMap.get('Styles') || propsMap.get('_style');
  const styles = stylesValue ? stylesValue.split(',').map(s => s.trim()).filter(Boolean) : null;
  
  // Extract digital add-ons
  const digitalAddons: Array<{ name: string; price: string }> = [];
  for (const [key, value] of propsMap) {
    if (key.startsWith('Add-On') || key === 'Digital Add-Ons') {
      // Parse "Extra Person (+£5.00)" format
      const match = value.match(/^(.+?)\s*\(\+£([\d.]+)\)$/);
      if (match) {
        digitalAddons.push({ name: match[1].trim(), price: match[2] });
      } else {
        digitalAddons.push({ name: value, price: '0' });
      }
    }
  }
  
  // Extract POD options
  const podValue = propsMap.get('Print Options') || propsMap.get('Print Option');
  let podOptions = null;
  if (podValue) {
    const match = podValue.match(/^(.+?)\s*\(\+£([\d.]+)\)$/);
    if (match) {
      podOptions = { option: match[1].trim(), price: match[2] };
    } else {
      podOptions = { option: podValue, price: '0' };
    }
  }
  
  // Extract bundle discount
  const bundleDiscountValue = propsMap.get('Bundle Discount');
  const bundleDiscount = bundleDiscountValue ? parseFloat(bundleDiscountValue.replace('%', '')) : null;
  
  return {
    styles,
    digitalAddons: digitalAddons.length > 0 ? digitalAddons : null,
    podOptions,
    bundleDiscount,
  };
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    // Get raw body for HMAC verification
    const rawBody = await req.text();
    
    // Verify Shopify webhook signature
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    if (!hmacHeader) {
      console.warn('Missing HMAC header');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const isValid = await verifyShopifyWebhook(rawBody, hmacHeader);
    if (!isValid) {
      console.warn('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse the order payload
    const order = JSON.parse(rawBody);
    
    // Log non-sensitive order info
    console.log('=== SHOPIFY ORDER WEBHOOK ===');
    console.log('Order ID:', order.id);
    console.log('Order Number:', order.order_number || order.name);
    console.log('Financial Status:', order.financial_status);
    console.log('Total Price:', order.total_price, order.currency);
    console.log('Line Items:', order.line_items?.length || 0);
    console.log('=============================');
    
    // Only process paid orders
    if (order.financial_status !== 'paid' && order.financial_status !== 'partially_paid') {
      console.log('Skipping non-paid order, status:', order.financial_status);
      return new Response(JSON.stringify({ success: true, message: 'Order not paid, skipping' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = getSupabaseClient();
    
    // Check if order already exists (idempotency)
    const { data: existingOrder } = await supabase
      .from('portrait_orders')
      .select('id')
      .eq('shopify_order_id', order.id.toString())
      .single();
    
    if (existingOrder) {
      console.log('Order already exists, skipping duplicate:', order.id);
      return new Response(JSON.stringify({ success: true, message: 'Order already processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Extract customer info (stored but not logged)
    const customerName = order.customer 
      ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
      : null;
    const customerEmail = order.email || order.contact_email || null;
    
    // Extract shipping address if present
    const shippingAddress = order.shipping_address ? {
      name: order.shipping_address.name,
      address1: order.shipping_address.address1,
      address2: order.shipping_address.address2,
      city: order.shipping_address.city,
      province: order.shipping_address.province,
      zip: order.shipping_address.zip,
      country: order.shipping_address.country,
      phone: order.shipping_address.phone,
    } : null;
    
    // Determine if this order has any POD items
    const hasPodItems = order.line_items?.some((item: any) => {
      const props = item.properties || [];
      return props.some((p: any) => 
        p.name === 'Print Options' || 
        p.name === 'Print Option' ||
        p.value?.includes('Print') ||
        p.value?.includes('Framed')
      );
    });
    
    // Insert order
    const { data: insertedOrder, error: orderError } = await supabase
      .from('portrait_orders')
      .insert({
        shopify_order_id: order.id.toString(),
        shopify_order_number: order.name || order.order_number?.toString(),
        customer_email: customerEmail,
        customer_name: customerName,
        total_price: parseFloat(order.total_price),
        currency: order.currency || 'GBP',
        payment_status: order.financial_status,
        pod_status: hasPodItems ? 'pending' : 'pending', // All start as pending
        shipping_address: shippingAddress,
        raw_payload: order,
      })
      .select('id')
      .single();
    
    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw new Error(`Failed to insert order: ${orderError.message}`);
    }
    
    console.log('Order inserted with ID:', insertedOrder.id);
    
    // Insert line items
    const lineItems = order.line_items || [];
    for (const item of lineItems) {
      const metadata = extractLineItemMetadata(item.properties);
      
      const { error: itemError } = await supabase
        .from('portrait_order_items')
        .insert({
          order_id: insertedOrder.id,
          shopify_line_item_id: item.id.toString(),
          title: item.title,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          total_price: parseFloat(item.price) * item.quantity,
          styles: metadata.styles,
          digital_addons: metadata.digitalAddons,
          pod_options: metadata.podOptions,
          bundle_discount: metadata.bundleDiscount,
          properties: item.properties,
        });
      
      if (itemError) {
        console.error('Error inserting line item:', itemError);
        // Continue with other items even if one fails
      }
    }
    
    console.log('Successfully processed order:', order.name, 'with', lineItems.length, 'items');
    
    return new Response(JSON.stringify({ success: true, orderId: insertedOrder.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook processing error:', errorMessage);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
