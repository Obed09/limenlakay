# 🚀 Enhanced AI Social Media Manager Documentation

## Overview
This system transforms your existing social media manager into a **media-first, brand-intelligent content creation platform** that generates authentic, on-brand content using photos, videos, product data, and strategic storytelling angles.

---

## 🎯 Architecture

### Flow Diagram
```
┌─────────────────┐
│  Media Upload   │──┐
│  + Tagging      │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│  Recipe Data    │──┼──► Content
│  + Ingredients  │  │    Generation
└─────────────────┘  │    Engine
                     │      │
┌─────────────────┐  │      ├──► Brand Voice Filter
│  Story Angle    │──┘      ├──► Platform Formatter
│  Selection      │         └──► Hashtag Generator
└─────────────────┘                │
         │                         ▼
         │                  ┌─────────────────┐
         └─────────────────►│ Final Content   │
                            │ + Hashtags      │
                            │ + CTA           │
                            └─────────────────┘
```

---

## 📊 Database Schema

### New Tables

#### 1. `media_assets`
Stores uploaded photos and videos with rich metadata.

**Key Fields:**
- `file_url`, `file_type` (image/video)
- `content_type` (process, finished_piece, studio, pour, vessel_shaping, packaging, lighting, lifestyle)
- `product_type` (candle, vessel, both)
- `mood[]` (warm, earthy, minimal, luxury, ritual, calm)
- `color_palette[]`, `materials_used[]`, `scent_profile[]`
- `caption_notes`, `story_context` (admin narrative hints)
- `used_in_posts`, `is_featured`

#### 2. `story_angles`
Pre-defined narrative frameworks.

**Default Angles:**
- `craftsmanship_process` - Behind-the-scenes creation
- `slow_made_philosophy` - Intentional, mindful making
- `mood_and_ritual` - Experience of use
- `materials_and_texture` - Material story
- `gifting_and_intention` - Meaningful gift angle
- `limited_small_batch` - Exclusivity
- `studio_life_bts` - Maker's world

#### 3. `brand_voice_memory`
The brand's personality rules.

**Key Settings:**
- `primary_voice` (warm_artisan, modern_minimal, luxury_editorial)
- `formality_level` (1-5)
- `preferred_phrases[]`, `banned_phrases[]`
- `metaphor_style` (earthy, poetic, minimal, direct)
- `emoji_usage` + `allowed_emojis[]`
- `core_values[]`, `luxury_warmth_balance` (1-10)
- `never_claim[]` (factual guardrails)
- Platform-specific rules

#### 4. `generated_content_versions`
History of all generated content for A/B testing.

#### 5. `media_tags`
Flexible tagging system for advanced filtering.

---

## 🛠️ Implementation Components

### 1. Admin: Brand Voice Settings
**Location:** `/admin-brand-voice`

**Features:**
- Edit primary voice, formality, metaphor style
- Manage preferred/banned phrases
- Set emoji policy
- Define core values and guardrails
- Platform-specific rules (Instagram line breaks, email CTA softness)

**Usage:**
```
1. Navigate to /admin-brand-voice
2. Configure your brand's personality
3. Save (applies to all future content generation)
```

### 2. Media Library Component
**Component:** `components/media-library.tsx`

**Features:**
- Upload photos/videos
- Tag with content type, mood, materials, scent
- Add caption notes and story context
- Filter and search media
- Selection mode for content generation

**Integration:**
```tsx
import { MediaLibrary } from '@/components/media-library'

<MediaLibrary 
  onSelectMedia={(media) => setSelectedMedia(media)}
  selectionMode={true}
/>
```

### 3. Enhanced Content Generator
**Module:** `lib/enhanced-social-media-generator.ts`

**Main Functions:**

#### `generateEnhancedContent(params)`
Orchestrates media + recipe + brand voice + story angle.

```typescript
const content = generateEnhancedContent({
  platform: 'instagram',
  tone: 'casual',
  storyAngle: selectedAngle,
  mediaAsset: selectedMedia,
  recipe: currentRecipe,
  productName: 'Lavender Dreams',
  price: 49.99,
  brandVoice: brandVoiceSettings,
  waxType: 'soy'
})
```

#### `generateEnhancedHashtags(recipe, mediaAsset, waxType)`
Smart hashtag generation combining scent + mood + media type.

```typescript
const hashtags = generateEnhancedHashtags(
  recipe,
  mediaAsset,
  'soy'
)
// Returns: ['#LimenLakay', '#HandmadeCandles', '#BehindTheScenes', ...]
```

---

## 🎨 Content Generation Logic

### 1. Media Context Builder
Constructs narrative from media metadata:

```
Input: Media tagged as "process" + "warm" mood + "concrete" material
Output: "Captured in process: behind-the-scenes creation moment • warm and inviting • crafted from concrete"
```

### 2. Story Angle Modifier
Injects angle-specific language:

```
Angle: craftsmanship_process
Modifiers: ["Each piece", "Every step", "Hours of", "My hands"]
Result: "Each piece... [rest of content]"
```

### 3. Brand Voice Filter
- Removes banned phrases (`mass-produced`, `cheap`, etc.)
- Limits emojis based on policy
- Injects preferred phrases naturally
- Enforces never-claim guardrails

### 4. Platform Formatter
- **Instagram:** Applies line break style (natural/spaced/compact)
- **TikTok:** Shortens to hook + 1-2 sentences
- **LinkedIn:** Adds business hashtags if enabled
- **Email:** Adjusts CTA softness (1=hard sell, 10=soft invite)

---

## 📝 Example Outputs

### Example 1: Process Photo with Craftsmanship Angle

**Inputs:**
- Media: BTS photo of hands pouring wax
- Content Type: `process`
- Mood: `ritual`, `warm`
- Materials: `soy_wax`, `concrete`
- Story Angle: `craftsmanship_process`
- Tone: `casual`
- Product: "Slow Sunday Candle"
- Price: $45

**Generated Instagram Post:**
```
Each piece starts here 🕯️

Captured in process: behind-the-scenes creation moment • 
ritual and warm • crafted from soy wax, concrete.

The slow-poured Slow Sunday Candle. Hours of intention 
poured into every vessel. Lavender, bergamot, vanilla bean.

Perfect for your evening wind-down ritual.

$45 🛒 Shop now — link in bio!

Handcrafted in Palm Beach, FL 🌴

#LimenLakay #HandmadeCandles #BehindTheScenes #ArtisanProcess
#CozyVibes #Ritual #DailyRitual #Mindfulness #SlowLiving
#SoyCandles #EcoFriendly #Natural #SmallBusiness #PalmBeachFL
```

### Example 2: Finished Piece with Luxury Tone

**Inputs:**
- Media: Styled photo of finished candle
- Content Type: `finished_piece`
- Mood: `luxury`, `minimal`
- Story Angle: `materials_and_texture`
- Tone: `luxury`
- Product: "Concrete Elegance"
- Price: $78

**Generated Instagram Post:**
```
Concrete Elegance — the finished piece in all its glory • 
refined and elegant • clean and intentional.

An exquisite composition of sandalwood, cedarwood, amber. 
Feel the raw texture of hand-poured concrete against the 
warmth of premium coconut wax.

Available for $78. Link in bio.

#LimenLakay #LuxuryCandles #PremiumHome #ElevatedLiving
#MinimalDesign #LessIsMore #ModernHome #ConcreteCandle
#CoconutWax #CleanBurning #Sustainable #PalmBeachFL
```

### Example 3: TikTok Hook

**Same inputs as Example 1, Platform: TikTok**

**Generated TikTok Caption:**
```
Each piece starts here 🕯️ Captured in process: behind-the-scenes 
creation moment • ritual and warm • crafted from soy wax, concrete. 
$45 #LimenLakay
```

---

## 🚀 Integration Guide

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor
\i database/social-media-enhancement-schema.sql
```

This creates:
- `media_assets`, `story_angles`, `brand_voice_memory`, etc.
- Seeds default story angles and brand voice

### Step 2: Configure Brand Voice
1. Navigate to `/admin-brand-voice`
2. Review default settings
3. Add your preferred phrases (e.g., "slow-made", "hand-poured")
4. Add banned phrases (e.g., "mass-produced", "cheap")
5. Set emoji policy and allowed emojis
6. Save

### Step 3: Upload Media
1. Add Media Library component to your marketing modal
2. Upload photos/videos
3. Tag with content type, mood, materials
4. Add caption notes (what should AI highlight?)
5. Optional: Add story context

### Step 4: Extend Vessel Calculator Marketing Modal

**In `app/vessel-calculator/page.tsx`, add:**

```typescript
import { MediaLibrary } from '@/components/media-library'
import { generateEnhancedContent, generateEnhancedHashtags } from '@/lib/enhanced-social-media-generator'

// New state
const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null)
const [selectedAngle, setSelectedAngle] = useState<StoryAngle | null>(null)
const [brandVoice, setBrandVoice] = useState<BrandVoice | null>(null)
const [storyAngles, setStoryAngles] = useState<StoryAngle[]>([])

// Fetch brand voice and story angles on mount
useEffect(() => {
  async function fetchSettings() {
    const { data: voice } = await supabase
      .from('brand_voice_memory')
      .select('*')
      .eq('is_active', true)
      .single()
    
    const { data: angles } = await supabase
      .from('story_angles')
      .select('*')
      .eq('is_active', true)
    
    setBrandVoice(voice)
    setStoryAngles(angles || [])
  }
  fetchSettings()
}, [])

// Replace generateSocialMediaPost with:
const generateSocialMediaPost = () => {
  if (!marketingRecipe || !brandVoice) return ''
  
  return generateEnhancedContent({
    platform: marketingPlatform,
    tone: marketingTone,
    storyAngle: selectedAngle,
    mediaAsset: selectedMedia,
    recipe: marketingRecipe,
    productName: marketingProductName,
    price: marketingPrice,
    brandVoice: brandVoice,
    waxType: materialPrices.waxType
  })
}

// Replace generateHashtags with:
const generateHashtags = () => {
  return generateEnhancedHashtags(
    marketingRecipe,
    selectedMedia,
    materialPrices.waxType
  )
}
```

**Add to modal UI:**
```tsx
{/* Story Angle Selector */}
<div>
  <Label>Story Angle (optional)</Label>
  <select
    value={selectedAngle?.id || ''}
    onChange={(e) => {
      const angle = storyAngles.find(a => a.id === e.target.value)
      setSelectedAngle(angle || null)
    }}
    className="w-full mt-2 p-2 border rounded-lg"
  >
    <option value="">No specific angle</option>
    {storyAngles.map(angle => (
      <option key={angle.id} value={angle.id}>
        {angle.name.replace(/_/g, ' ')}
      </option>
    ))}
  </select>
</div>

{/* Media Selector */}
<div>
  <Label>Select Media (optional)</Label>
  <button
    onClick={() => setShowMediaLibrary(true)}
    className="w-full mt-2 p-4 border-2 border-dashed rounded-lg hover:border-amber-400"
  >
    {selectedMedia ? (
      <img src={selectedMedia.file_url} className="w-20 h-20 object-cover mx-auto" />
    ) : (
      '📸 Select Photo/Video'
    )}
  </button>
</div>

{/* Media Library Modal */}
{showMediaLibrary && (
  <div className="fixed inset-0 bg-black/50 z-50">
    <div className="bg-white p-6 max-w-4xl mx-auto mt-10 rounded-xl">
      <MediaLibrary 
        onSelectMedia={(media) => {
          setSelectedMedia(media)
          setShowMediaLibrary(false)
        }}
        selectionMode={true}
      />
    </div>
  </div>
)}
```

### Step 5: Add TikTok Platform

**In platform dropdown:**
```tsx
<option value="tiktok">TikTok</option>
```

**Update platform icons:**
```tsx
{marketingPlatform === 'tiktok' ? '🎵 TikTok Post' : ...}
```

---

## 📈 Content Version History

All generated content is automatically saved to `generated_content_versions` for:
- A/B testing analysis
- Performance tracking (future: engagement metrics)
- Regeneration with same parameters
- Learning which angles/tones perform best

**Query example:**
```sql
SELECT platform, tone, story_angle_id, generated_caption, engagement_score
FROM generated_content_versions
WHERE media_asset_id = 'abc-123'
ORDER BY engagement_score DESC;
```

---

## 🎯 Best Practices

### Media Tagging
- **Be specific:** "Process" + "Pour" is more useful than just "Process"
- **Add caption notes:** Tell the AI what makes this moment special
- **Story context:** Share the human story ("Made on a rainy Sunday")

### Story Angles
- **Match to media:** Process photos → craftsmanship_process angle
- **Finished pieces:** Use mood_and_ritual or materials_and_texture
- **Lifestyle shots:** Use gifting_and_intention or studio_life_bts

### Brand Voice
- **Update seasonally:** Adjust tone for holidays, seasons
- **Test phrases:** Add new preferred phrases, monitor results
- **Guardrails:** Never claim medical benefits, certifications you don't have

### Platform Selection
- **Instagram:** Visual storytelling, spaced line breaks
- **Facebook:** Longer narrative, conversational
- **LinkedIn:** Business angle, entrepreneurship focus
- **TikTok:** Short hook, trend-aware
- **Email:** Subject line + story arc + soft CTA

---

## 🔮 Future Enhancements

### Phase 2: AI Vision Integration
- **Auto-tagging:** AI analyzes uploaded media, suggests tags
- **Color palette extraction:** Automatic color detection
- **Composition analysis:** Identify hero product, styling elements

### Phase 3: Scheduled Posting
- **Content calendar:** Plan posts in advance
- **Best time to post:** AI suggests optimal posting times
- **Auto-publish:** (with approval workflow)

### Phase 4: Performance Analytics
- **Engagement tracking:** Link to Instagram Insights
- **A/B test results:** Which angles/tones perform best
- **Content recommendations:** "Your ritual-angle posts get 2x engagement"

### Phase 5: Multi-Image Carousels
- **Story sequences:** Group media into before/after/finished
- **Process narrative:** 5-photo carousel showing entire creation

---

## 🆘 Troubleshooting

### "No media assets found"
- Run database migration
- Check Supabase Storage bucket exists: `media`
- Verify RLS policies are enabled

### "Content looks generic"
- Add caption notes to media assets
- Select a specific story angle
- Ensure brand voice memory is configured

### "Too many emojis" or "Wrong emojis"
- Check brand voice emoji policy
- Set emoji_usage to 'minimal' or 'none'
- Update allowed_emojis array

### "Banned phrases appearing"
- Brand voice filter is case-insensitive
- Check for variations (e.g., "mass produced" vs "mass-produced")
- Add all variations to banned_phrases

---

## 📚 API Reference

### `generateEnhancedContent(params: ContentGenerationParams): string`
Main generation function.

**Returns:** Formatted content string ready for platform

### `generateEnhancedHashtags(recipe, mediaAsset, waxType): string[]`
Smart hashtag array.

**Returns:** Array of up to 30 hashtags

### `applyBrandVoiceFilter(content, brandVoice): string`
Enforces brand rules.

**Returns:** Filtered content

### `buildMediaContext(media: MediaAsset): string`
Constructs narrative from metadata.

**Returns:** Human-readable context string

---

## 🎉 Result

You now have a **media-first, brand-intelligent social media manager** that:
- ✅ Creates authentic, on-brand content
- ✅ Adapts to your unique voice and values
- ✅ Tells compelling stories from your photos
- ✅ Maintains consistency across platforms
- ✅ Protects against off-brand language
- ✅ Tracks content performance over time

**No more generic templates. Every post is crafted with intention.**
