-- ============================================
-- MEDIA STORAGE BUCKET SETUP
-- Configure Supabase Storage for media uploads
-- ============================================

-- STEP 1: Create/Update the media bucket (make it public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 
  'media', 
  true,  -- Public bucket
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'application/ogg', 'audio/x-m4a', 'audio/m4a']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'application/ogg', 'audio/x-m4a', 'audio/m4a'];

-- STEP 2: Drop existing storage policies (clean slate)
DROP POLICY IF EXISTS "Allow public uploads to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on media" ON storage.objects;

-- STEP 3: Create comprehensive storage policies for media bucket
-- Allow INSERT (uploads)
CREATE POLICY "Allow public uploads to media bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- Allow SELECT (downloads/reads)
CREATE POLICY "Allow public read from media bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow UPDATE (optional - for replacing files)
CREATE POLICY "Allow public update to media bucket"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Allow DELETE (optional - for removing files)
CREATE POLICY "Allow public delete from media bucket"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'media');

-- ============================================
-- VERIFICATION QUERIES (uncomment to test)
-- ============================================

-- Check if bucket exists and is public
-- SELECT * FROM storage.buckets WHERE id = 'media';

-- Check storage policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%media%';

-- ============================================
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/wevgwiuodiknxgzjderd/sql/new
-- 2. Copy and paste this ENTIRE file
-- 3. Click "Run"
-- 4. Wait for success confirmation
-- 5. Refresh your browser at localhost:3000/social-media-manager
-- 6. Try uploading an image again
-- ============================================
