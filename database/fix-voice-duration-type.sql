-- ============================================
-- FIX VOICE DURATION COLUMN TYPE
-- Changes voice_sample_duration from INTEGER to NUMERIC
-- ============================================

-- Change voice_sample_duration to accept decimal values
ALTER TABLE brand_voice_memory 
ALTER COLUMN voice_sample_duration TYPE NUMERIC(10,2);

-- Verify the change
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns 
WHERE table_name = 'brand_voice_memory' 
AND column_name = 'voice_sample_duration';

-- ============================================
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/wevgwiuodiknxgzjderd/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- 4. You should see: voice_sample_duration | numeric | 10 | 2
-- 5. Refresh your browser and try uploading voice again
-- ============================================
