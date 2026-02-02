# 🎙️ Voice Analysis Feature Guide

## Overview
The Voice Analysis feature allows you to upload a short audio recording of the owner speaking. The AI will analyze the speaking style, tone, vocabulary, and personality traits to make all generated social media content sound authentically like the owner.

## How It Works

### 1. **Upload Voice Sample** 
- Go to `/admin-brand-voice` page
- Find the "Voice Sample Analysis" section (purple gradient box at the top)
- Click "Choose File" and select an audio recording (MP3, WAV, M4A, or OGG format)
- Max file size: 10MB
- Recommended duration: 10-30 seconds

### 2. **AI Analysis Process**
When you click "Upload & Analyze Voice", the system:
1. **Uploads** the audio to Supabase Storage
2. **Transcribes** it using OpenAI Whisper API
3. **Analyzes** speaking style using GPT-4:
   - Tone (enthusiastic, conversational, professional, etc.)
   - Sentence structure (short/choppy, medium/balanced, long/flowing, varied)
   - Vocabulary level (everyday, descriptive, sophisticated, mixed)
   - Personality traits (warm, direct, thoughtful, passionate, etc.)
   - Speaking patterns
   - Common phrases the owner uses
   - Formality level (1-5 scale)
   - Emotional expression (1-5 scale)
   - Pacing (fast/energetic, moderate/steady, slow/deliberate, varied)
4. **Saves** the analysis to the database

### 3. **View Analysis Results**
Once analyzed, you'll see:
- ✅ Audio player (listen to the original recording)
- 📊 Analysis summary (tone, formality, emotional expression, pacing)
- 💬 Common phrases the owner uses
- 📅 When it was analyzed

### 4. **Replace Voice Sample**
- You can upload a new voice sample anytime
- The new analysis will replace the old one
- Previous recordings are not deleted (stored in Supabase)

## Recording Tips for Best Results

### ✅ DO:
- Record 10-30 seconds of natural speech
- Talk about your candles, business, or products
- Speak naturally, as if talking to a customer or friend
- Use clear audio quality (phone voice memo is fine)
- Include some personality and emotion

### ❌ DON'T:
- Use background music or noise
- Read from a script (be natural!)
- Record in noisy environments
- Use voice changers or filters
- Record less than 5 seconds

## Example Recording Scripts

### Option 1: Product Talk (Recommended)
*"Hey! So I just finished pouring this new autumn spice candle and oh my gosh, it smells incredible! It's got cinnamon, clove, a hint of orange zest... you know, all those cozy fall vibes. I love how the amber vessel looks with it too. I think our customers are gonna go crazy for this one!"*

### Option 2: Business Story
*"I started making candles in my kitchen about two years ago, just as a hobby. But then my friends kept asking for more, and I realized this could be something special. Now here we are with hundreds of happy customers and I still get excited every time I pour a new batch!"*

### Option 3: Customer Interaction
*"Oh thank you so much for your order! I'm actually packing it right now. I added a little sample of our lavender vanilla scent because I think you'll love it. Let me know what you think when it arrives, okay?"*

## Technical Details

### Database Schema
```sql
-- Added to brand_voice_memory table:
voice_sample_url TEXT -- Supabase Storage URL
voice_sample_duration INTEGER -- Duration in seconds
voice_analysis JSONB -- Full analysis results
voice_analyzed_at TIMESTAMPTZ -- When it was analyzed
```

### API Endpoint
`POST /api/analyze-voice`

**Request:**
```json
{
  "audioUrl": "https://your-project.supabase.co/storage/v1/object/public/media/voice-samples/123.mp3"
}
```

**Response:**
```json
{
  "transcription": "Hey! So I just finished pouring...",
  "analysis": {
    "tone": "enthusiastic and warm",
    "sentence_structure": "varied with natural flow",
    "vocabulary_level": "everyday with descriptive touches",
    "personality_traits": ["warm", "passionate", "authentic", "approachable"],
    "speaking_patterns": ["Uses 'oh my gosh' for excitement", "Ends with questions to engage"],
    "common_phrases": ["oh my gosh", "you know", "I think", "gonna love"],
    "formality_level": 2,
    "emotional_expression": 4,
    "pacing": "moderate with enthusiastic bursts",
    "writing_recommendations": "Use contractions, exclamation points sparingly..."
  },
  "duration": 23
}
```

### Storage Location
- Bucket: `media`
- Path: `voice-samples/{timestamp}.{ext}`
- Access: Public (needed for Whisper API)

## How It Affects Content Generation

Once a voice sample is analyzed, the content generator will:

1. **Match Tone**: Use the detected tone (enthusiastic, warm, professional, etc.)
2. **Mirror Sentence Structure**: Replicate short/long/varied sentence patterns
3. **Use Common Phrases**: Naturally incorporate phrases the owner uses
4. **Adjust Formality**: Match the formality level (1-5)
5. **Express Emotion**: Match emotional expression intensity (1-5)
6. **Follow Pacing**: Adapt content pacing to match speaking style

### Before Voice Analysis:
```
"Introducing our new Autumn Spice candle. Features notes of cinnamon, clove, and orange zest. Available in amber vessel. #FallCandles #CozyVibes"
```

### After Voice Analysis:
```
"Oh my gosh, you guys! Just finished pouring this new autumn spice candle and it smells INCREDIBLE 😍 Cinnamon, clove, a hint of orange zest... all the cozy fall vibes! The amber vessel looks so perfect with it. I think you're gonna love this one! ✨ #FallCandles #CozyVibes"
```

## Troubleshooting

### "Failed to analyze voice"
- **Check**: OpenAI API key is set in `.env.local`
- **Check**: Audio file is under 10MB
- **Check**: File format is supported (MP3, WAV, M4A, OGG)

### "No sound in audio player"
- **Check**: File uploaded successfully to Supabase Storage
- **Check**: Storage bucket "media" has public access
- **Try**: Refresh the page

### "Analysis seems off"
- **Try**: Record a longer sample (20-30 seconds)
- **Try**: Speak more naturally (don't read from script)
- **Try**: Include more personality and emotion
- **Try**: Upload a new sample with different content

### "Voice_sample_url is null"
- **Check**: Database schema has been updated with new columns
- **Run**: `database/social-media-enhancement-schema.sql` (has voice fields)

## Privacy & Security

- ✅ Voice samples stored in your Supabase project (you control the data)
- ✅ Only used for AI analysis (not shared externally)
- ✅ Can be deleted anytime (delete from Supabase Storage manually)
- ✅ Transcription/analysis happens via OpenAI API (follows OpenAI's data policies)

## Next Steps

1. **Upload Voice Sample**: Go to `/admin-brand-voice` and upload first recording
2. **Review Analysis**: Check if the detected tone/style matches reality
3. **Generate Content**: Create a social media post to test the voice
4. **Compare**: Generate with and without voice analysis to see difference
5. **Refine**: Upload new voice sample if needed

---

**Need Help?** Check the main [SOCIAL_MEDIA_MANAGER_ENHANCEMENT.md](./SOCIAL_MEDIA_MANAGER_ENHANCEMENT.md) guide.
