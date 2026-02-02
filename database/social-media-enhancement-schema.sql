-- ============================================
-- AI SOCIAL MEDIA MANAGER ENHANCEMENT SCHEMA
-- Media-First + Brand Voice Intelligence
-- ============================================

-- Media Assets Table
-- Stores uploaded photos/videos for content creation
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Media Info
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  mime_type TEXT,
  
  -- Content Classification
  content_type TEXT CHECK (content_type IN (
    'process', 
    'finished_piece', 
    'studio', 
    'pour', 
    'vessel_shaping',
    'packaging',
    'lighting',
    'lifestyle'
  )),
  
  product_type TEXT CHECK (product_type IN ('candle', 'vessel', 'both')),
  
  -- Product Association (optional - links to existing product if available)
  product_sku TEXT,
  recipe_id UUID,
  
  -- Aesthetic & Mood
  mood TEXT[], -- ['warm', 'earthy', 'minimal', 'luxury', 'ritual', 'calm']
  color_palette TEXT[], -- ['amber', 'cream', 'terracotta', 'black']
  
  -- Materials & Scent
  materials_used TEXT[], -- ['concrete', 'soy_wax', 'wood', 'coconut_wax']
  scent_profile TEXT[], -- ['floral', 'citrus', 'earthy', 'spicy']
  scent_name TEXT,
  
  -- Admin Notes
  caption_notes TEXT, -- Admin's notes on what to highlight
  story_context TEXT, -- Background story for this specific piece
  
  -- Usage Tracking
  used_in_posts INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false
);

-- Media Tags (flexible tagging system)
CREATE TABLE IF NOT EXISTS media_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  tag_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Angles (narrative frameworks)
CREATE TABLE IF NOT EXISTS story_angles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  focus_areas TEXT[], -- ['time', 'texture', 'ritual', 'limited_batch']
  tone_guidance TEXT, -- AI prompt additions for this angle
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Voice Memory (the brand's personality rules)
CREATE TABLE IF NOT EXISTS brand_voice_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Voice Characteristics
  primary_voice TEXT DEFAULT 'warm_artisan', -- warm_artisan, modern_minimal, luxury_editorial
  formality_level INTEGER DEFAULT 3 CHECK (formality_level BETWEEN 1 AND 5), -- 1=casual, 5=formal
  
  -- Language Preferences
  preferred_phrases TEXT[], -- ['slow-made', 'hand-poured', 'mindful moments']
  banned_phrases TEXT[], -- ['mass-produced', 'fast shipping', 'bulk']
  metaphor_style TEXT DEFAULT 'earthy', -- earthy, poetic, minimal, direct
  
  -- Emoji Policy
  emoji_usage TEXT DEFAULT 'minimal', -- none, minimal, moderate, expressive
  allowed_emojis TEXT[], -- ['🕯️', '✨', '🌿', '🤲']
  
  -- Brand Values (influences all content)
  core_values TEXT[] DEFAULT ARRAY['craftsmanship', 'intention', 'slow_living', 'authenticity'],
  luxury_warmth_balance INTEGER DEFAULT 6 CHECK (luxury_warmth_balance BETWEEN 1 AND 10), -- 1=luxury, 10=warm
  
  -- Never Claim (factual guardrails)
  never_claim TEXT[] DEFAULT ARRAY['certified', 'medical_benefits', 'mass_scale', 'automation'],
  
  -- Platform-Specific Rules
  instagram_line_break_style TEXT DEFAULT 'natural', -- natural, spaced, compact
  linkedin_business_focus BOOLEAN DEFAULT true,
  email_cta_softness INTEGER DEFAULT 7 CHECK (email_cta_softness BETWEEN 1 AND 10), -- 1=hard sell, 10=soft
  
  -- Voice Sample (Audio Upload)
  voice_sample_url TEXT, -- URL to uploaded audio file in Supabase Storage
  voice_sample_duration INTEGER, -- Duration in seconds
  voice_analysis JSONB, -- AI analysis of speaking style, tone, patterns
  voice_analyzed_at TIMESTAMPTZ,
  
  -- Active Status
  is_active BOOLEAN DEFAULT true
);

-- Generated Content Versions (history & A/B testing)
CREATE TABLE IF NOT EXISTS generated_content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content Details
  platform TEXT NOT NULL, -- instagram, facebook, linkedin, tiktok, email
  tone TEXT NOT NULL, -- casual, luxury, professional, playful
  story_angle_id UUID REFERENCES story_angles(id),
  
  -- Source Material
  media_asset_id UUID REFERENCES media_assets(id),
  recipe_id UUID,
  product_sku TEXT,
  
  -- Generated Output
  generated_caption TEXT NOT NULL,
  generated_hashtags TEXT[],
  generated_subject_line TEXT, -- for email
  
  -- Performance Tracking (future)
  was_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  engagement_score INTEGER, -- future: likes, comments, shares
  
  -- Version Control
  version_number INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES generated_content_versions(id),
  
  -- AI Metadata
  ai_model_used TEXT DEFAULT 'rule_based_v1',
  generation_params JSONB -- store all inputs for reproducibility
);

-- Indexes for Performance
CREATE INDEX idx_media_assets_content_type ON media_assets(content_type);
CREATE INDEX idx_media_assets_mood ON media_assets USING GIN(mood);
CREATE INDEX idx_media_assets_active ON media_assets(is_active) WHERE is_active = true;
CREATE INDEX idx_media_tags_media_id ON media_tags(media_id);
CREATE INDEX idx_generated_content_platform ON generated_content_versions(platform);
CREATE INDEX idx_generated_content_media_id ON generated_content_versions(media_asset_id);

-- Row Level Security (same pattern as existing tables)
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_angles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voice_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content_versions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read on media_assets" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Allow public read on story_angles" ON story_angles FOR SELECT USING (true);
CREATE POLICY "Allow public read on brand_voice_memory" ON brand_voice_memory FOR SELECT USING (true);

-- Allow all operations (admin-controlled)
CREATE POLICY "Allow all operations on media_assets" ON media_assets FOR ALL USING (true);
CREATE POLICY "Allow all operations on media_tags" ON media_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on story_angles" ON story_angles FOR ALL USING (true);
CREATE POLICY "Allow all operations on brand_voice_memory" ON brand_voice_memory FOR ALL USING (true);
CREATE POLICY "Allow all operations on generated_content_versions" ON generated_content_versions FOR ALL USING (true);

-- Seed Story Angles
INSERT INTO story_angles (name, description, focus_areas, tone_guidance) VALUES
('craftsmanship_process', 'Behind-the-scenes creation story', ARRAY['time', 'hands', 'process', 'skill'], 'Emphasize the maker''s touch, time invested, and skill. Use present tense to bring reader into the moment.'),
('slow_made_philosophy', 'Slow living, intentional creation', ARRAY['patience', 'intention', 'mindfulness', 'quality'], 'Contrast with fast consumption. Use words like "slow-poured," "mindful," "intentional." Softer, reflective tone.'),
('mood_and_ritual', 'The feeling and experience of use', ARRAY['atmosphere', 'ritual', 'feeling', 'moment'], 'Focus on the sensory experience, the ritual of lighting, the mood created. Use evocative language.'),
('materials_and_texture', 'Material story and tactile quality', ARRAY['concrete', 'wax', 'texture', 'natural'], 'Highlight material choice, texture, natural quality. Use tactile language.'),
('gifting_and_intention', 'Meaningful gift angle', ARRAY['gift', 'connection', 'thoughtful', 'personal'], 'Position as a thoughtful, intentional gift. Emotional connection focus.'),
('limited_small_batch', 'Exclusivity and rarity', ARRAY['limited', 'small_batch', 'unique', 'collectible'], 'Emphasize limited availability, uniqueness. Each piece is slightly different.'),
('studio_life_bts', 'Studio culture and maker''s life', ARRAY['studio', 'process', 'authentic', 'personal'], 'Personal peek into the maker''s world. Authentic, unpolished tone.');

-- Seed Default Brand Voice Memory
INSERT INTO brand_voice_memory (
  primary_voice,
  formality_level,
  preferred_phrases,
  banned_phrases,
  metaphor_style,
  emoji_usage,
  allowed_emojis,
  core_values,
  luxury_warmth_balance,
  never_claim,
  is_active
) VALUES (
  'warm_artisan',
  3,
  ARRAY['slow-made', 'hand-poured', 'mindful moments', 'from scratch', 'small-batch', 'intentional', 'ritual', 'crafted with care'],
  ARRAY['mass-produced', 'fast shipping', 'bulk buy', 'factory', 'automated', 'cheap', 'deal', 'sale'],
  'earthy',
  'minimal',
  ARRAY['🕯️', '✨', '🌿', '🤲', '🏺', '💫', '🌾'],
  ARRAY['craftsmanship', 'intention', 'slow_living', 'authenticity', 'quality'],
  6,
  ARRAY['certified_organic', 'medical_benefits', 'therapeutic_claims', 'mass_scale', 'fully_automated'],
  true
);

-- Comments
COMMENT ON TABLE media_assets IS 'Uploaded photos and videos for social media content generation';
COMMENT ON TABLE story_angles IS 'Narrative frameworks that guide content tone and focus';
COMMENT ON TABLE brand_voice_memory IS 'Brand personality rules and language preferences';
COMMENT ON TABLE generated_content_versions IS 'History of AI-generated content for tracking and refinement';
