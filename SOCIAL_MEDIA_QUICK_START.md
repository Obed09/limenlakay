# 🚀 Social Media Manager - Quick Start Guide

## What You Just Got

A complete, standalone **AI-powered social media management system** with:

✅ **Media Library** - Upload & organize photos/videos  
✅ **AI Vision** - Auto-tag images with GPT-4 Vision  
✅ **Brand Voice** - Enforce your unique personality  
✅ **Story Angles** - 7 narrative frameworks  
✅ **Content Calendar** - Plan & schedule posts  
✅ **Multi-Platform** - Instagram, Facebook, LinkedIn, TikTok, Email  

---

## 🏃 Get Started in 3 Steps

### Step 1: Set Up Database (2 minutes)

**Run these SQL scripts in your Supabase SQL Editor:**

1. **Social Media Enhancement Schema:**
   ```
   database/social-media-enhancement-schema.sql
   ```
   Creates: media_assets, story_angles, brand_voice_memory, generated_content_versions

2. **Scheduled Posts Schema:**
   ```
   database/scheduled-posts-schema.sql
   ```
   Creates: scheduled_posts table for calendar

3. **Create Supabase Storage Bucket:**
   - Go to Supabase → Storage → Create Bucket
   - Name: `media`
   - Public: Yes ✓

### Step 2: Configure Brand Voice (3 minutes)

Navigate to: **`/admin-brand-voice`**

1. Review default settings (already optimized for your brand)
2. Add your preferred phrases:
   - ✅ "slow-made"
   - ✅ "hand-poured"
   - ✅ "from scratch"
3. Add banned phrases:
   - ⛔ "mass-produced"
   - ⛔ "cheap"
   - ⛔ "bulk"
4. Set emoji policy (default: minimal)
5. Click **Save**

### Step 3: Create Your First Post (5 minutes)

Navigate to: **`/social-media-manager`**

1. **Upload Media** (Tab: Media Library)
   - Click "Upload Media"
   - Select a product photo
   - Click **"🤖 AI Auto-Tag"** ← Magic happens here!
   - AI analyzes the image and suggests:
     - Content type (finished_piece, process, etc.)
     - Mood (warm, luxury, minimal, etc.)
     - Colors (cream, amber, terracotta, etc.)
     - Materials (concrete, soy_wax, etc.)
     - Caption hook ("Sunday morning in the studio")
   - Review suggestions and save

2. **Generate Content** (Tab: Create Content)
   - Select your uploaded media
   - Enter product name: "Lavender Dreams"
   - Enter price: $49.99
   - Choose platform: Instagram
   - Choose tone: Casual
   - Choose story angle: "mood_and_ritual"
   - Click **✨ Generate Content**

3. **Schedule or Post**
   - Review generated caption + hashtags
   - Option A: **⏰ Schedule Post** (adds to calendar)
   - Option B: **🚀 Quick Post** (copy & paste to Instagram)

---

## 🎨 Features Breakdown

### 1. AI Vision Auto-Tagging

**What it does:**  
Analyzes uploaded images with GPT-4 Vision to suggest:
- Content type (is this BTS or finished product?)
- Mood (warm? luxury? minimal?)
- Colors visible in the image
- Materials detected
- Caption hooks ("The first light...")
- Story context suggestions

**How to use:**
1. Upload media
2. Click **"🤖 AI Auto-Tag"**
3. Review AI suggestions
4. Accept or modify
5. Tags are saved to media asset

**API Endpoint:** `/api/analyze-media`

### 2. Content Calendar

**What it does:**  
Visual monthly calendar showing all scheduled posts with status tracking.

**Status Types:**
- 🟢 **Published** - Live on social media
- 🔵 **Scheduled** - Ready to post on date
- ⚪ **Draft** - Saved but not scheduled
- 🔴 **Failed** - Posting error (future)
- ⚫ **Cancelled** - Cancelled post

**How to use:**
1. Click **Calendar** tab
2. View posts by month
3. Click a date to schedule new post
4. Click a post bubble to edit

### 3. Brand Voice Memory

**What it does:**  
Enforces your brand's unique personality across all generated content.

**Controls:**
- **Preferred Phrases** - Words to use often ("slow-made", "intentional")
- **Banned Phrases** - Words to never use ("mass-produced", "cheap")
- **Emoji Policy** - None, minimal (1-2), moderate (3-5), expressive (6+)
- **Allowed Emojis** - Only these emojis will appear (🕯️, ✨, 🌿, 🤲)
- **Luxury ↔ Warmth Balance** - Slider from luxury editorial to warm artisan
- **Never Claim** - Guardrails (never claim medical benefits, certifications, etc.)

### 4. Story Angles (7 Pre-Loaded)

**What they do:**  
Narrative frameworks that guide content focus and tone.

**Available Angles:**
1. **Craftsmanship & Process** - Behind-the-scenes, maker's touch
2. **Slow-Made Philosophy** - Intentional, mindful creation
3. **Mood & Ritual** - Sensory experience, lighting the candle
4. **Materials & Texture** - Tactile quality, natural materials
5. **Gifting & Intention** - Meaningful gift, emotional connection
6. **Limited Small-Batch** - Exclusivity, uniqueness, rarity
7. **Studio Life BTS** - Authentic peek into maker's world

**Example:**  
Same product photo + different angles = different stories:
- **Craftsmanship:** "Hours of hands-on work went into this piece..."
- **Ritual:** "Light this and create a moment of calm..."
- **Limited:** "Only 5 of these were made this batch..."

### 5. Platform-Specific Formatting

**Instagram:**
- Natural line breaks (adjustable: natural/spaced/compact)
- Hashtags grouped at bottom
- Link in bio CTA

**TikTok:**
- Short hook (2-3 sentences max)
- Trend-aware language
- Quick CTA

**LinkedIn:**
- Business angle emphasis
- Entrepreneurship focus
- Professional tone

**Facebook:**
- Longer narrative (conversational)
- Softer CTA
- More context

**Email:**
- Subject line included
- Story arc structure
- Adjustable CTA softness (1=hard sell, 10=soft invite)

---

## 📊 Calendar View

```
┌─────────────────────────────────────┐
│    January 2026                     │
│  ◀  Today  ▶                        │
├─────────────────────────────────────┤
│ Sun  Mon  Tue  Wed  Thu  Fri  Sat  │
├─────────────────────────────────────┤
│      1    2    3    4    5    6     │
│      📷        📷                   │
│           Lavender                  │
│           Dreams                    │
├─────────────────────────────────────┤
│  7   8    9   10   11   12   13     │
│  👥  📷       📷                    │
│  Holiday     Studio                 │
│  Post        Tour                   │
└─────────────────────────────────────┘

Legend:
📷 Instagram | 👥 Facebook | 💼 LinkedIn
🎵 TikTok | ✉️ Email

🟢 Published | 🔵 Scheduled | ⚪ Draft
```

---

## 🔥 Workflow Examples

### Example 1: Process Photo Post

**Scenario:** You just finished pouring wax for a new candle batch.

1. **Upload Photo** (pouring wax into concrete vessel)
2. **AI Auto-Tag** suggests:
   - Content type: `pour`
   - Mood: `warm`, `ritual`
   - Materials: `concrete`, `soy_wax`
   - Caption hook: "Sunday morning studio session"
3. **Generate Content:**
   - Story angle: `craftsmanship_process`
   - Tone: `casual`
   - Platform: `instagram`
4. **Result:**
   ```
   Sunday morning in the studio 🕯️
   
   Each pour is a meditation. Slow, intentional, mindful.
   
   This batch became Lavender Dreams — soft lavender, warm vanilla,
   a whisper of bergamot. Hand-poured into concrete vessels
   crafted from scratch.
   
   $49.99 • Link in bio
   
   Handcrafted in Palm Beach, FL 🌴
   
   #LimenLakay #BehindTheScenes #ArtisanProcess #SlowLiving...
   ```

### Example 2: Finished Product for LinkedIn

**Scenario:** Professional product shot for business audience.

1. **Upload Photo** (styled candle on desk)
2. **AI Auto-Tag** suggests:
   - Content type: `finished_piece`
   - Mood: `luxury`, `minimal`
   - Colors: `cream`, `black`, `gold`
3. **Generate Content:**
   - Story angle: `materials_and_texture`
   - Tone: `professional`
   - Platform: `linkedin`
4. **Result:**
   ```
   NEW: Concrete Elegance
   
   Our latest creation combines hand-mixed concrete with premium
   coconut wax. Each vessel takes 3 days to craft from raw materials
   to finished piece.
   
   Small-batch production means every candle is slightly unique.
   
   $78 • Learn more at limenlakay.com
   
   #SmallBusinessOwner #Entrepreneurship #MadeInUSA #Craftsmanship
   ```

### Example 3: Bulk Scheduling for Week

**Scenario:** Plan a week of content in advance.

**Monday:**
- Upload 7 photos
- AI auto-tag all
- Generate 7 posts (varying platforms, tones, angles)
- Schedule across the week

**Calendar View:**
```
Mon: Instagram (casual, mood_and_ritual)
Tue: Facebook (luxury, materials)
Wed: LinkedIn (professional, craftsmanship)
Thu: Instagram (playful, studio_bts)
Fri: TikTok (casual, limited_batch)
Sat: Email (casual, gifting)
Sun: Instagram (luxury, finished_piece)
```

---

## 🤖 AI Vision Examples

### Input Image: Candle being poured
**AI Suggests:**
```json
{
  "content_type": "pour",
  "product_type": "candle",
  "mood": ["warm", "ritual"],
  "color_palette": ["cream", "amber"],
  "materials_used": ["concrete", "soy_wax"],
  "scent_profile": ["unknown"],
  "caption_hook": "The meditative pour",
  "story_context": "Slow morning in the studio",
  "confidence": "high"
}
```

### Input Image: Finished candle on table
**AI Suggests:**
```json
{
  "content_type": "finished_piece",
  "product_type": "candle",
  "mood": ["minimal", "luxury"],
  "color_palette": ["black", "cream", "white"],
  "materials_used": ["concrete", "wax"],
  "scent_profile": ["clean"],
  "caption_hook": "Minimalist elegance",
  "story_context": "Designed for modern spaces",
  "confidence": "high"
}
```

### Input Image: Hands shaping concrete
**AI Suggests:**
```json
{
  "content_type": "vessel_shaping",
  "product_type": "vessel",
  "mood": ["earthy", "warm"],
  "color_palette": ["terracotta", "cream", "beige"],
  "materials_used": ["concrete"],
  "scent_profile": ["unknown"],
  "caption_hook": "Hands shaping intention",
  "story_context": "Every vessel begins with touch",
  "confidence": "high"
}
```

---

## 📈 Performance Tracking (Future)

The `scheduled_posts` table includes fields for:
- `likes_count`
- `comments_count`
- `shares_count`
- `reach_count`

**Future Integration:**
- Connect to Instagram Insights API
- Track which story angles perform best
- A/B test tones
- Learn which media types drive engagement

---

## 🔧 Technical Details

### API Endpoints

#### POST `/api/analyze-media`
Analyzes uploaded images with GPT-4 Vision.

**Request:**
```json
{
  "imageUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "content_type": "process",
    "mood": ["warm", "ritual"],
    ...
  }
}
```

### Database Tables

#### `media_assets`
- Stores uploaded photos/videos
- Rich metadata (mood, colors, materials, scent)
- Caption notes & story context
- Usage tracking

#### `story_angles`
- 7 pre-loaded narrative frameworks
- Extensible (add custom angles)

#### `brand_voice_memory`
- Single active record
- Enforces brand personality rules

#### `scheduled_posts`
- Calendar entries
- Status tracking (draft → scheduled → published)
- Performance metrics (future)

#### `generated_content_versions`
- History of all AI-generated content
- A/B testing data
- Reproducibility (all params saved)

---

## 🎯 Best Practices

### Media Tagging
✅ **Do:** Use AI auto-tag first, then refine  
✅ **Do:** Add caption notes ("Sunday morning pour session")  
✅ **Do:** Add story context ("Made during rainy weekend")  
❌ **Don't:** Leave mood empty  
❌ **Don't:** Skip AI analysis for process photos  

### Story Angles
✅ **Do:** Match angle to media type (process → craftsmanship)  
✅ **Do:** Vary angles across the week  
✅ **Do:** Use ritual angle for lifestyle shots  
❌ **Don't:** Use same angle for every post  
❌ **Don't:** Use limited_batch if not actually limited  

### Brand Voice
✅ **Do:** Update seasonally (holiday phrases in December)  
✅ **Do:** Review generated content before posting  
✅ **Do:** Add banned phrases as you discover them  
❌ **Don't:** Change core values frequently  
❌ **Don't:** Allow emojis not in your allowed list  

### Scheduling
✅ **Do:** Post during peak hours (9am, 12pm, 7pm EST)  
✅ **Do:** Vary platforms (don't post Instagram 7x/week)  
✅ **Do:** Plan 1 week ahead  
❌ **Don't:** Over-schedule (quality > quantity)  
❌ **Don't:** Post same content to all platforms  

---

## 🚨 Troubleshooting

### "AI Auto-Tag" button doesn't work
- Check OpenAI API key is set in `.env.local`
- Verify image URL is publicly accessible
- Try re-uploading the image

### "Brand voice not configured"
- Run `database/social-media-enhancement-schema.sql`
- Navigate to `/admin-brand-voice`
- Save default settings

### Calendar shows no posts
- Run `database/scheduled-posts-schema.sql`
- Create a post and schedule it
- Refresh the page

### Generated content looks off-brand
- Review Brand Voice settings
- Add more preferred/banned phrases
- Adjust luxury/warmth balance slider
- Check emoji policy

### Media upload fails
- Create Supabase Storage bucket named `media`
- Set bucket to Public
- Check file size (<10MB recommended)

---

## 🎉 You're Ready!

Navigate to **`/social-media-manager`** and start creating authentic, brand-intelligent content!

**Quick Links:**
- Social Media Manager: `/social-media-manager`
- Brand Voice Settings: `/admin-brand-voice`
- Full Documentation: `SOCIAL_MEDIA_MANAGER_ENHANCEMENT.md`

**Need Help?**
The system is designed to be intuitive, but if you get stuck:
1. Check this Quick Start Guide
2. Review full documentation
3. Check database schema comments
4. Examine example outputs in docs

**Happy Creating! 🚀**
