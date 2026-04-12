import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

// =============================================
// GENERATE WATERMARK
// Takes a clean artwork image, overlays tiled "SIKPIX" watermark at 30% opacity,
// saves to artwork/watermarked/{orderId}/{itemId}/{styleName}.jpg
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

// Draw a single character using a simple 5x7 bitmap font
// Returns pixel coordinates for the character
const FONT_5X7: Record<string, number[]> = {
  S: [
    0b01110,
    0b10001,
    0b10000,
    0b01110,
    0b00001,
    0b10001,
    0b01110,
  ],
  I: [
    0b11111,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b11111,
  ],
  K: [
    0b10001,
    0b10010,
    0b10100,
    0b11000,
    0b10100,
    0b10010,
    0b10001,
  ],
  P: [
    0b11110,
    0b10001,
    0b10001,
    0b11110,
    0b10000,
    0b10000,
    0b10000,
  ],
  X: [
    0b10001,
    0b01010,
    0b00100,
    0b00100,
    0b00100,
    0b01010,
    0b10001,
  ],
};

// Render text "SIKPIX" into pixel coordinates at a given scale
function renderTextPixels(
  text: string,
  scale: number
): { width: number; height: number; pixels: [number, number][] } {
  const charWidth = 5;
  const charHeight = 7;
  const spacing = 1;
  const totalCharWidth =
    text.length * charWidth + (text.length - 1) * spacing;
  const pixels: [number, number][] = [];

  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci];
    const bitmap = FONT_5X7[ch];
    if (!bitmap) continue;
    const offsetX = ci * (charWidth + spacing);

    for (let row = 0; row < charHeight; row++) {
      for (let col = 0; col < charWidth; col++) {
        if (bitmap[row] & (1 << (charWidth - 1 - col))) {
          // Fill scaled pixels
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              pixels.push([
                (offsetX + col) * scale + sx,
                row * scale + sy,
              ]);
            }
          }
        }
      }
    }
  }

  return {
    width: totalCharWidth * scale,
    height: charHeight * scale,
    pixels,
  };
}

// Apply tiled diagonal watermark to an image
function applyWatermark(img: Image): Image {
  const width = img.width;
  const height = img.height;

  // Scale text based on image size — larger images get larger watermark text
  const minDim = Math.min(width, height);
  const scale = Math.max(2, Math.round(minDim / 150));

  const textData = renderTextPixels("SIKPIX", scale);

  // Watermark color: white at 30% opacity (77 out of 255)
  const alpha = 77; // ~30%
  const wmR = 255,
    wmG = 255,
    wmB = 255;

  // Tile spacing
  const tileW = textData.width + scale * 12;
  const tileH = textData.height + scale * 10;

  // Rotation angle: -30 degrees
  const angle = (-30 * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // We need to cover the full image when rotated, so extend the tiling area
  const diagonal = Math.sqrt(width * width + height * height);
  const startX = -diagonal / 2;
  const startY = -diagonal / 2;
  const endX = diagonal * 1.5;
  const endY = diagonal * 1.5;

  // Center of image for rotation
  const cx = width / 2;
  const cy = height / 2;

  for (let ty = startY; ty < endY; ty += tileH) {
    for (let tx = startX; tx < endX; tx += tileW) {
      for (const [px, py] of textData.pixels) {
        // Position in unrotated space
        const ux = tx + px;
        const uy = ty + py;

        // Rotate around image center
        const rx = Math.round(
          cosA * (ux - cx) - sinA * (uy - cy) + cx
        );
        const ry = Math.round(
          sinA * (ux - cx) + cosA * (uy - cy) + cy
        );

        // Check bounds
        if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
          // Get current pixel
          const idx = (ry * width + rx) * 4;
          const existing = img.bitmap;

          // Alpha blend
          const srcR = existing[idx];
          const srcG = existing[idx + 1];
          const srcB = existing[idx + 2];
          const a = alpha / 255;

          existing[idx] = Math.round(srcR * (1 - a) + wmR * a);
          existing[idx + 1] = Math.round(srcG * (1 - a) + wmG * a);
          existing[idx + 2] = Math.round(srcB * (1 - a) + wmB * a);
          // Keep original alpha
        }
      }
    }
  }

  return img;
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
    const body = await req.json();
    const { order_id, item_id, style_name, clean_image_url } = body;

    if (!order_id || !item_id || !style_name || !clean_image_url) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: order_id, item_id, style_name, clean_image_url",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Generating watermark for:", {
      order_id,
      item_id,
      style_name,
    });

    // 1. Fetch the clean image
    const imageResponse = await fetch(clean_image_url);
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch clean image: ${imageResponse.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());

    // 2. Decode image
    let img: Image;
    try {
      img = await Image.decode(imageBuffer);
    } catch (decodeErr) {
      return new Response(
        JSON.stringify({
          error: `Failed to decode image: ${decodeErr instanceof Error ? decodeErr.message : "Unknown format"}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Apply watermark
    applyWatermark(img);

    // 4. Encode as JPEG
    const watermarkedBytes = await img.encodeJPEG(85);

    // 5. Upload to Supabase Storage
    const supabase = getSupabaseClient();
    const safeStyleName = style_name.replace(/[^a-zA-Z0-9-_]/g, "-");
    const storagePath = `watermarked/${order_id}/${item_id}/${safeStyleName}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(storagePath, watermarkedBytes, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("artworks")
      .getPublicUrl(uploadData.path);

    console.log("Watermark generated:", { storagePath, publicUrl });

    return new Response(
      JSON.stringify({
        success: true,
        watermarked_url: publicUrl,
        storage_path: storagePath,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Watermark generation error:", error);
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
