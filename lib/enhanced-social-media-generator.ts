// ═══════════════════════════════════════════════════════════
// ENHANCED AI SOCIAL MEDIA CONTENT GENERATOR
// Media-First + Brand Voice + Story Angle Intelligence
// ═══════════════════════════════════════════════════════════

interface MediaAsset {
  id: string
  file_url: string
  file_type: 'image' | 'video'
  content_type: string
  product_type: string
  mood?: string[]
  color_palette?: string[]
  materials_used?: string[]
  scent_profile?: string[]
  scent_name?: string | null
  caption_notes?: string | null
  story_context?: string | null
}

interface Recipe {
  name: string
  ingredients: Record<string, number>
  profile?: string
  purpose?: string
  audience?: string
}

interface BrandVoice {
  primary_voice: string
  formality_level: number
  preferred_phrases: string[]
  banned_phrases: string[]
  metaphor_style: string
  emoji_usage: string
  allowed_emojis: string[]
  core_values: string[]
  luxury_warmth_balance: number
  never_claim: string[]
  instagram_line_break_style: string
  linkedin_business_focus: boolean
  email_cta_softness: number
}

interface StoryAngle {
  name: string
  description: string
  focus_areas: string[]
  tone_guidance: string
}

interface ContentGenerationParams {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'email'
  tone: 'casual' | 'luxury' | 'professional' | 'playful'
  storyAngle?: StoryAngle
  mediaAsset?: MediaAsset
  recipe?: Recipe
  productName: string
  price: number
  brandVoice: BrandVoice
  waxType?: string
}

// ═══════════════════════════════════════════════════════════
// BRAND VOICE FILTER
// Ensures content adheres to brand voice rules
// ═══════════════════════════════════════════════════════════

function applyBrandVoiceFilter(content: string, brandVoice: BrandVoice): string {
  let filtered = content

  // Remove banned phrases
  brandVoice.banned_phrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi')
    filtered = filtered.replace(regex, '[REDACTED]')
  })

  // Inject preferred phrases naturally (if not already present)
  // This is a basic implementation - in production, use NLP
  if (Math.random() > 0.5 && brandVoice.preferred_phrases.length > 0) {
    const randomPhrase = brandVoice.preferred_phrases[Math.floor(Math.random() * brandVoice.preferred_phrases.length)]
    if (!filtered.toLowerCase().includes(randomPhrase.toLowerCase())) {
      // Try to weave it in naturally (simplified approach)
      filtered = filtered.replace(/\. /, `. ${randomPhrase} - `)
    }
  }

  // Emoji filtering
  if (brandVoice.emoji_usage === 'none') {
    filtered = filtered.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
  } else if (brandVoice.emoji_usage === 'minimal') {
    // Keep only allowed emojis, limit to 2
    const allowedEmojiRegex = new RegExp(`[${brandVoice.allowed_emojis.join('')}]`, 'g')
    const matches = filtered.match(allowedEmojiRegex) || []
    if (matches.length > 2) {
      // Remove excess emojis
      let count = 0
      filtered = filtered.replace(/[\u{1F300}-\u{1F9FF}]/gu, (match) => {
        if (brandVoice.allowed_emojis.includes(match) && count < 2) {
          count++
          return match
        }
        return ''
      })
    }
  }

  return filtered
}

// ═══════════════════════════════════════════════════════════
// MEDIA-DRIVEN CONTENT BUILDER
// Constructs narrative context from media metadata
// ═══════════════════════════════════════════════════════════

function buildMediaContext(media: MediaAsset): string {
  const contexts: string[] = []

  // Content type context
  const contentTypeMap: Record<string, string> = {
    process: 'behind-the-scenes creation moment',
    finished_piece: 'the finished piece in all its glory',
    studio: 'from our Palm Beach studio',
    pour: 'the meditative pour',
    vessel_shaping: 'hands shaping the vessel',
    packaging: 'ready to find its home',
    lighting: 'the first light',
    lifestyle: 'in its natural habitat'
  }
  contexts.push(contentTypeMap[media.content_type] || 'this moment')

  // Mood context
  if (media.mood && media.mood.length > 0) {
    const moodDescriptors: Record<string, string> = {
      warm: 'warm and inviting',
      earthy: 'grounded and natural',
      minimal: 'clean and intentional',
      luxury: 'refined and elegant',
      ritual: 'meditative and sacred',
      calm: 'peaceful and serene'
    }
    const moodDesc = media.mood.map(m => moodDescriptors[m]).filter(Boolean).join(', ')
    if (moodDesc) contexts.push(moodDesc)
  }

  // Material context
  if (media.materials_used && media.materials_used.length > 0) {
    const materialNames = media.materials_used.map(m => m.replace('_', ' ')).join(', ')
    contexts.push(`crafted from ${materialNames}`)
  }

  // Scent context
  if (media.scent_name) {
    contexts.push(`${media.scent_name} scent profile`)
  } else if (media.scent_profile && media.scent_profile.length > 0) {
    contexts.push(`${media.scent_profile.join(' & ')} notes`)
  }

  // Story context (admin notes)
  if (media.story_context) {
    contexts.push(media.story_context)
  }

  return contexts.join(' • ')
}

// ═══════════════════════════════════════════════════════════
// STORY ANGLE MODIFIER
// Adjusts tone and focus based on narrative angle
// ═══════════════════════════════════════════════════════════

function applyStoryAngle(baseContent: string, angle: StoryAngle, media?: MediaAsset): string {
  let modified = baseContent

  // Inject angle-specific language patterns
  const angleModifiers: Record<string, string[]> = {
    craftsmanship_process: ['Each piece', 'Every step', 'Hours of', 'My hands', 'The process'],
    slow_made_philosophy: ['Slow-poured', 'Intentionally crafted', 'Time honored', 'Mindfully made'],
    mood_and_ritual: ['Light this', 'Create a moment', 'The ritual of', 'Transform your space'],
    materials_and_texture: ['Feel the', 'Natural texture', 'Raw materials', 'Tactile experience'],
    gifting_and_intention: ['A thoughtful gift', 'Share the light', 'Meaningful gesture', 'Someone special'],
    limited_small_batch: ['Limited edition', 'Small batch', 'Only a few', 'Uniquely crafted'],
    studio_life_bts: ['In the studio', 'Sunday morning', 'The making of', 'Real work']
  }

  const modifiers = angleModifiers[angle.name.toLowerCase().replace(/\s+/g, '_')] || []
  if (modifiers.length > 0 && Math.random() > 0.5) {
    const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    // Prepend as a sentence starter if appropriate
    if (!modified.startsWith(randomModifier)) {
      modified = `${randomModifier}... ${modified}`
    }
  }

  return modified
}

// ═══════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC FORMATTER
// Adapts content structure for each platform
// ═══════════════════════════════════════════════════════════

function formatForPlatform(
  content: string,
  platform: string,
  brandVoice: BrandVoice
): string {
  switch (platform) {
    case 'instagram':
      // Natural line breaks based on preference
      if (brandVoice.instagram_line_break_style === 'spaced') {
        content = content.replace(/\. /g, '.\n\n')
      } else if (brandVoice.instagram_line_break_style === 'compact') {
        content = content.replace(/\n\n/g, '\n')
      }
      return content

    case 'tiktok':
      // Short hook + concise body
      const sentences = content.split('. ')
      return sentences.slice(0, 2).join('. ') + '.'

    case 'linkedin':
      // Add business context if enabled
      if (brandVoice.linkedin_business_focus) {
        content = content + '\n\n#SmallBusinessOwner #Entrepreneurship #MadeInUSA'
      }
      return content

    case 'email':
      // Add subject line separator
      return content

    default:
      return content
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// Orchestrates media + recipe + brand voice + story angle
// ═══════════════════════════════════════════════════════════

export function generateEnhancedContent(params: ContentGenerationParams): string {
  const {
    platform,
    tone,
    storyAngle,
    mediaAsset,
    recipe,
    productName,
    price,
    brandVoice,
    waxType = 'soy'
  } = params

  // Build narrative foundation
  let narrative = ''

  // 1. MEDIA CONTEXT (if provided)
  if (mediaAsset) {
    const mediaContext = buildMediaContext(mediaAsset)
    
    // Use caption notes as primary narrative if available
    if (mediaAsset.caption_notes) {
      narrative = mediaAsset.caption_notes + ' '
    }

    // Weave in media context
    if (mediaAsset.content_type === 'process') {
      narrative += `Captured in process: ${mediaContext}. `
    } else if (mediaAsset.content_type === 'finished_piece') {
      narrative += `${productName} — ${mediaContext}. `
    } else {
      narrative += `${mediaContext}. `
    }
  } else {
    // Fallback: product-first narrative
    narrative = `Introducing ${productName}. `
  }

  // 2. RECIPE/PRODUCT DETAILS
  if (recipe) {
    const ingredients = Object.keys(recipe.ingredients).slice(0, 3).join(', ')
    
    if (tone === 'luxury') {
      narrative += `An exquisite composition of ${ingredients}. `
    } else if (tone === 'playful') {
      narrative += `Packed with ${ingredients}! `
    } else {
      narrative += `Crafted with ${ingredients}. `
    }

    if (recipe.profile) {
      narrative += `${recipe.profile} notes. `
    }

    if (recipe.purpose) {
      narrative += `${recipe.purpose}. `
    }
  }

  // 3. PRICE & CTA
  if (platform === 'email') {
    const ctaSoftness = brandVoice.email_cta_softness
    if (ctaSoftness > 7) {
      narrative += `\n\n$${price} • Available now at limenlakay.com`
    } else if (ctaSoftness > 4) {
      narrative += `\n\n$${price} • Shop the collection: limenlakay.com`
    } else {
      narrative += `\n\n$${price} • Order yours today: limenlakay.com`
    }
  } else if (platform === 'instagram' || platform === 'facebook') {
    if (tone === 'luxury') {
      narrative += `\n\nAvailable for $${price}. Link in bio.`
    } else {
      narrative += `\n\n$${price} 🛒 Shop now — link in bio!`
    }
  } else if (platform === 'linkedin') {
    narrative += `\n\n$${price} • Learn more at limenlakay.com`
  } else if (platform === 'tiktok') {
    narrative += ` $${price} #LimenLakay`
  }

  // 4. APPLY STORY ANGLE
  if (storyAngle) {
    narrative = applyStoryAngle(narrative, storyAngle, mediaAsset)
  }

  // 5. BRAND VOICE FILTER
  narrative = applyBrandVoiceFilter(narrative, brandVoice)

  // 6. PLATFORM FORMATTING
  narrative = formatForPlatform(narrative, platform, brandVoice)

  // 7. CORE VALUES INJECTION
  if (brandVoice.core_values.includes('craftsmanship') && Math.random() > 0.6) {
    narrative += '\n\nHandcrafted in Palm Beach, FL 🌴'
  }

  return narrative.trim()
}

// ═══════════════════════════════════════════════════════════
// SMART HASHTAG GENERATOR (ENHANCED)
// Combines existing logic with media intelligence
// ═══════════════════════════════════════════════════════════

export function generateEnhancedHashtags(
  recipe: Recipe | undefined,
  mediaAsset: MediaAsset | undefined,
  waxType: string = 'soy'
): string[] {
  const hashtags: string[] = ['#LimenLakay', '#HandmadeCandles', '#CandleLover', '#HomeFragrance']

  // Scent-based hashtags
  if (recipe?.profile) {
    const scentHashtags: Record<string, string[]> = {
      'Floral': ['#FloralCandle', '#FloralScent', '#BotanicalCandle'],
      'Citrus': ['#CitrusCandle', '#FreshScent', '#Energizing'],
      'Fruity': ['#FruityCandle', '#SweetScent', '#SummerVibes'],
      'Gourmand': ['#GourmandCandle', '#FoodieCandle', '#CozyVibes'],
      'Herbal': ['#HerbalCandle', '#Aromatherapy', '#NaturalScent'],
      'Spicy': ['#SpicyCandle', '#WarmScent', '#CozyHome'],
      'Clean/Spa': ['#SpaCandle', '#CleanScent', '#Relaxing'],
      'Earthy': ['#EarthyCandle', '#WoodlandScent', '#Nature']
    }
    hashtags.push(...(scentHashtags[recipe.profile] || []))
  }

  // Media-driven hashtags
  if (mediaAsset) {
    if (mediaAsset.content_type === 'process') {
      hashtags.push('#BehindTheScenes', '#MakingOf', '#Handcrafted', '#ArtisanProcess')
    } else if (mediaAsset.content_type === 'finished_piece') {
      hashtags.push('#FinishedProduct', '#ConcreteCandle', '#CandleArt')
    }

    if (mediaAsset.mood) {
      const moodHashtags: Record<string, string[]> = {
        warm: ['#CozyVibes', '#Warmth', '#Hygge'],
        minimal: ['#MinimalDesign', '#LessIsMore', '#ModernHome'],
        luxury: ['#LuxuryCandles', '#PremiumHome', '#ElevatedLiving'],
        ritual: ['#DailyRitual', '#Mindfulness', '#SlowLiving'],
        calm: ['#CalmSpace', '#Serenity', '#PeacefulHome']
      }
      mediaAsset.mood.forEach(mood => {
        hashtags.push(...(moodHashtags[mood] || []))
      })
    }
  }

  // Wax type
  if (waxType === 'soy') {
    hashtags.push('#SoyCandles', '#EcoFriendly', '#Natural')
  } else {
    hashtags.push('#CoconutWax', '#CleanBurning', '#Sustainable')
  }

  // General popular tags
  hashtags.push('#SmallBusiness', '#SupportLocal', '#PalmBeachFL', '#CandleAddict', '#HomeDecor', '#CandleCommunity')

  // Deduplicate and limit to 30
  return [...new Set(hashtags)].slice(0, 30)
}
