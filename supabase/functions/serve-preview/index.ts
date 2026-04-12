import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// =============================================
// SERVE PREVIEW
// Serves watermarked preview images with protective headers.
// Does NOT expose the clean image URL.
// =============================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const itemId = url.searchParams.get("item_id");
  const styleName = url.searchParams.get("style_name");

  if (!orderId || !itemId || !styleName) {
    return new Response(
      JSON.stringify({
        error: "Missing required params: order_id, item_id, style_name",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const supabase = getSupabaseClient();
    const safeStyleName = styleName.replace(/[^a-zA-Z0-9-_]/g, "-");
    const storagePath = `watermarked/${orderId}/${itemId}/${safeStyleName}.jpg`;

    // Download the watermarked image from storage
    const { data, error } = await supabase.storage
      .from("artworks")
      .download(storagePath);

    if (error || !data) {
      console.error("Failed to fetch watermarked image:", error);
      return new Response(
        JSON.stringify({ error: "Preview not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const imageBytes = new Uint8Array(await data.arrayBuffer());

    return new Response(imageBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Disposition": "inline",
        // Prevent embedding/hotlinking
        "X-Content-Type-Options": "nosniff",
        // Prevent framing
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Serve preview error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
