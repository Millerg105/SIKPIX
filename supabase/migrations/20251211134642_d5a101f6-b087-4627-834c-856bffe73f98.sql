-- Create private storage bucket for customer uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer_uploads', 'customer_uploads', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for service role only access to customer_uploads bucket
-- No public policies - only edge functions with service role can access
CREATE POLICY "Service role can manage customer_uploads"
ON storage.objects
FOR ALL
USING (bucket_id = 'customer_uploads')
WITH CHECK (bucket_id = 'customer_uploads');

-- Add reference_photos column to portrait_order_items
ALTER TABLE public.portrait_order_items
ADD COLUMN IF NOT EXISTS reference_photos TEXT[] NULL;