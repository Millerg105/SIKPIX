import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// =============================================
// SEND PREVIEW EMAIL
// Sends a watermarked preview link to the customer via Resend.
// Triggered when admin sets order status to preview_sent.
// =============================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

function verifyAdminToken(req: Request): boolean {
  const adminToken = Deno.env.get("ADMIN_SECRET_TOKEN");
  if (!adminToken) return false;
  return req.headers.get("x-admin-token") === adminToken;
}

interface PreviewItem {
  styleName: string;
  previewUrl: string;
}

function buildEmailHtml(
  customerName: string,
  orderNumber: string,
  previewItems: PreviewItem[]
): string {
  const itemsHtml = previewItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #2a2a2a;">
          <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #ffffff;">
            ${item.styleName}
          </p>
          <a href="${item.previewUrl}"
             style="display: inline-block; padding: 10px 24px; background: #39FF14; color: #0a0a0a;
                    text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px;
                    letter-spacing: 0.05em; text-transform: uppercase;">
            View Preview
          </a>
        </td>
      </tr>`
    )
    .join("\n");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td style="padding: 0 0 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.1em; color: #39FF14;">
                SIKPIX
              </h1>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #141414; border: 1px solid #2a2a2a; border-radius: 12px; padding: 32px;">

              <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">
                Your preview is ready!
              </h2>

              <p style="margin: 0 0 24px; font-size: 15px; color: #a0a0a0; line-height: 1.6;">
                Hi ${customerName}, your SikPix artwork for order
                <strong style="color: #ffffff;">${orderNumber}</strong>
                is ready to preview. Take a look below.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>

              <p style="margin: 24px 0 0; font-size: 13px; color: #666666; line-height: 1.5;">
                The preview includes a watermark for security. Your final artwork will be
                delivered without the watermark once your order is complete.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #444444;">
                SikPix. Custom AI car portraits.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!verifyAdminToken(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "Missing order_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = getSupabaseClient();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("portrait_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!order.customer_email) {
      return new Response(
        JSON.stringify({ error: "No customer email on this order" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch order items to build preview links
    const { data: items, error: itemsError } = await supabase
      .from("portrait_order_items")
      .select("id, artwork_urls, styles, pod_options")
      .eq("order_id", order_id);

    if (itemsError) throw itemsError;

    // Build preview URLs for each artwork that has been uploaded
    const previewItems: PreviewItem[] = [];

    for (const item of items || []) {
      const artworkUrls: Record<string, string> = item.artwork_urls || {};

      for (const [styleName, _url] of Object.entries(artworkUrls)) {
        if (styleName === "default") continue;
        const previewUrl = `${supabaseUrl}/functions/v1/serve-preview?order_id=${encodeURIComponent(order_id)}&item_id=${encodeURIComponent(item.id)}&style_name=${encodeURIComponent(styleName)}`;
        previewItems.push({ styleName, previewUrl });
      }

      // Handle legacy single artwork_url (keyed as "default")
      if (artworkUrls["default"] && previewItems.length === 0) {
        const previewUrl = `${supabaseUrl}/functions/v1/serve-preview?order_id=${encodeURIComponent(order_id)}&item_id=${encodeURIComponent(item.id)}&style_name=default`;
        previewItems.push({ styleName: "Your Portrait", previewUrl });
      }
    }

    if (previewItems.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No artwork uploaded yet. Upload artwork before sending a preview.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const customerName = order.customer_name || "there";
    const orderNumber = order.shopify_order_number || order_id.slice(0, 8);

    const emailHtml = buildEmailHtml(customerName, orderNumber, previewItems);

    // Determine from address. Resend requires a verified domain.
    // Use the configured domain, falling back to Resend's test sender.
    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN") || "sikpix.com";
    const fromAddress = `SikPix <noreply@${fromDomain}>`;

    // Send via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [order.customer_email],
        subject: "Your SikPix preview is ready",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({
          error: `Email send failed: ${resendData.message || resendData.statusCode || "Unknown error"}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Preview email sent:", {
      orderId: order_id,
      to: order.customer_email,
      resendId: resendData.id,
      previewCount: previewItems.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        email_id: resendData.id,
        sent_to: order.customer_email,
        preview_count: previewItems.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Send preview email error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
