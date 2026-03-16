-- Create the artworks storage bucket with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to artworks bucket
CREATE POLICY "Public read access for artworks"
ON storage.objects
FOR SELECT
USING (bucket_id = 'artworks');

-- Allow authenticated users to upload to artworks bucket (for admin uploads)
CREATE POLICY "Authenticated users can upload artworks"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'artworks');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update artworks"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'artworks');

-- Allow authenticated users to delete artworks
CREATE POLICY "Authenticated users can delete artworks"
ON storage.objects
FOR DELETE
USING (bucket_id = 'artworks');