-- Fix Supabase Storage policies for vessel-images bucket
-- Make sure images are publicly accessible

-- Drop all existing policies on vessel-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload vessel images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update vessel images" ON storage.objects;

-- Create new permissive policies
CREATE POLICY "Public read access for vessel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vessel-images');

CREATE POLICY "Public insert access for vessel images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vessel-images');

CREATE POLICY "Public update access for vessel images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vessel-images');

CREATE POLICY "Public delete access for vessel images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vessel-images');
