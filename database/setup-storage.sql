-- ============================================
-- Setup Supabase Storage for Vessel Images
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the storage bucket for vessel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vessel-images', 'vessel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public read and anon/authenticated write
CREATE POLICY "Public can view vessel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vessel-images');

CREATE POLICY "Anyone can upload vessel images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vessel-images');

CREATE POLICY "Anyone can update vessel images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vessel-images');

CREATE POLICY "Anyone can delete vessel images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vessel-images');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'vessel-images';
