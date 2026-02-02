-- ============================================
-- ADD VOICE ANALYSIS FIELDS
-- Adds voice sample columns to brand_voice_memory table
-- ============================================

-- Add voice sample fields to brand_voice_memory table
ALTER TABLE brand_voice_memory 
ADD COLUMN IF NOT EXISTS voice_sample_url TEXT,
ADD COLUMN IF NOT EXISTS voice_sample_duration INTEGER,
ADD COLUMN IF NOT EXISTS voice_analysis JSONB,
ADD COLUMN IF NOT EXISTS voice_analyzed_at TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'brand_voice_memory' 
AND column_name LIKE 'voice%';

-- ============================================
-- INSTRUCTIONS:
-- 1. Go to: https://supabase.com/dashboard/project/wevgwiuodiknxgzjderd/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- 4. You should see 4 rows returned (voice_sample_url, voice_sample_duration, voice_analysis, voice_analyzed_at)
-- 5. Refresh your browser and try uploading voice again
-- ============================================
