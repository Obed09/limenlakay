-- ============================================
-- CONTENT SCHEDULING SYSTEM
-- For planning and tracking social media posts
-- ============================================

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Scheduling Info
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Platform & Content
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'tiktok', 'email')),
  tone TEXT NOT NULL CHECK (tone IN ('casual', 'luxury', 'professional', 'playful')),
  
  -- Generated Content
  caption TEXT NOT NULL,
  hashtags TEXT[],
  subject_line TEXT, -- for email
  
  -- Source Material
  media_asset_id UUID REFERENCES media_assets(id),
  recipe_id UUID,
  story_angle_id UUID REFERENCES story_angles(id),
  product_name TEXT,
  product_price NUMERIC(10,2),
  
  -- Status Tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  
  -- Publishing Details
  external_post_id TEXT, -- ID from Instagram/Facebook API after publishing
  external_post_url TEXT,
  
  -- Performance Metrics (future integration)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  
  -- Notes
  internal_notes TEXT,
  
  -- Approval Workflow (future)
  requires_approval BOOLEAN DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_scheduled_posts_date ON scheduled_posts(scheduled_date);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_scheduled_posts_media_asset ON scheduled_posts(media_asset_id);

-- RLS Policies
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on scheduled_posts" ON scheduled_posts FOR SELECT USING (true);
CREATE POLICY "Allow all operations on scheduled_posts" ON scheduled_posts FOR ALL USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scheduled_posts_updated_at
BEFORE UPDATE ON scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_posts_updated_at();

COMMENT ON TABLE scheduled_posts IS 'Scheduled social media content with tracking';
