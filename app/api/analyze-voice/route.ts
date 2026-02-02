import { NextRequest, NextResponse } from 'next/server'

// Voice Analysis API - Analyzes audio recordings to understand speaking style
// Uses OpenAI Whisper for transcription + GPT-4 for style analysis

export async function POST(request: NextRequest) {
  try {
    const { audioUrl } = await request.json()

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      )
    }

    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Step 1: Fetch audio file
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch audio file')
    }

    const audioBlob = await audioResponse.blob()
    const audioFile = new File([audioBlob], 'voice-sample.mp3', { type: audioBlob.type })

    // Step 2: Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json'
    })

    const transcribedText = transcription.text

    // Step 3: Analyze speaking style with GPT-4
    const styleAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a linguistic analyst specializing in speaking style, tone, and voice personality analysis.`
        },
        {
          role: 'user',
          content: `Analyze this transcribed speech and provide a detailed breakdown of the speaker's communication style.

TRANSCRIPTION:
"""
${transcribedText}
"""

Provide analysis in these categories:

1. **Tone & Energy** (choose multiple that apply):
   - warm, friendly, professional, casual, formal, enthusiastic, calm, confident, humble, passionate

2. **Sentence Structure**:
   - short and punchy, medium-length, long and flowing, varied

3. **Vocabulary Level**:
   - simple and accessible, conversational, sophisticated, technical, poetic

4. **Personality Traits** (evident from speech):
   - authentic, storytelling, detail-oriented, big-picture, emotional, logical, playful, serious

5. **Speaking Patterns**:
   - uses personal anecdotes, uses metaphors, asks questions, emphasizes certain words, pauses for effect

6. **Common Phrases or Verbal Tics**:
   - Extract 3-5 phrases or expressions the speaker uses

7. **Formality Level** (1-5):
   - 1 = very casual, 5 = very formal

8. **Emotional Expression** (1-5):
   - 1 = reserved/factual, 5 = highly expressive/emotional

9. **Pacing**:
   - fast, moderate, slow, varied

10. **Writing Style Recommendations**:
    - How should written content emulate this speaking style?

Format response as JSON:
{
  "tone": ["warm", "passionate"],
  "sentence_structure": "varied",
  "vocabulary_level": "conversational",
  "personality_traits": ["authentic", "storytelling"],
  "speaking_patterns": ["uses personal anecdotes", "emphasizes certain words"],
  "common_phrases": ["you know", "at the end of the day", "from my heart"],
  "formality_level": 2,
  "emotional_expression": 4,
  "pacing": "moderate",
  "writing_recommendations": "Use short, heartfelt sentences. Include personal stories. Avoid corporate jargon. Emphasize authenticity and connection.",
  "sample_sentence": "A sentence written in this exact style",
  "confidence": "high"
}`
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    })

    const analysisContent = styleAnalysis.choices[0].message.content || ''
    
    // Extract JSON from response
    const jsonMatch = analysisContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse voice analysis as JSON')
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      analysis: analysis,
      duration: transcription.duration || 0
    })

  } catch (error: any) {
    console.error('Voice Analysis Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze voice',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
