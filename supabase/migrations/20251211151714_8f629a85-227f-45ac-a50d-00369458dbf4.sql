-- Add artwork_urls JSONB column to support multiple artwork URLs per line item (for bundles)
-- Format: { "Vogue Cover Portrait": "https://...", "GQ Cover Portrait": "https://..." }
ALTER TABLE public.portrait_order_items 
ADD COLUMN IF NOT EXISTS artwork_urls JSONB DEFAULT '{}'::jsonb;

-- Migrate existing artwork_url data to artwork_urls format
UPDATE public.portrait_order_items 
SET artwork_urls = jsonb_build_object('default', artwork_url)
WHERE artwork_url IS NOT NULL 
  AND artwork_urls = '{}'::jsonb;