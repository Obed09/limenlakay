'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BrandVoice {
  id: string
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
  voice_sample_url?: string | null
  voice_sample_duration?: number | null
  voice_analysis?: any
  voice_analyzed_at?: string | null
}

export default function AdminBrandVoicePage() {
  const supabase = createClient()
  const [brandVoice, setBrandVoice] = useState<BrandVoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Temporary input states for array fields
  const [newPreferredPhrase, setNewPreferredPhrase] = useState('')
  const [newBannedPhrase, setNewBannedPhrase] = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [newCoreValue, setNewCoreValue] = useState('')
  const [newNeverClaim, setNewNeverClaim] = useState('')

  // Voice upload states
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const [analyzingVoice, setAnalyzingVoice] = useState(false)
  const [voiceFile, setVoiceFile] = useState<File | null>(null)

  useEffect(() => {
    fetchBrandVoice()
  }, [])

  const fetchBrandVoice = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_voice_memory')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error) throw error
      setBrandVoice(data)
    } catch (err: any) {
      console.error('Error fetching brand voice:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!brandVoice) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('brand_voice_memory')
        .update({
          ...brandVoice,
          updated_at: new Date().toISOString()
        })
        .eq('id', brandVoice.id)

      if (error) throw error
      setSuccess('Brand voice updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error saving brand voice:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleVoiceUpload = async () => {
    if (!voiceFile) {
      setError('Please select an audio file')
      return
    }

    // Check file size (max 10MB)
    if (voiceFile.size > 10 * 1024 * 1024) {
      setError('Audio file must be less than 10MB')
      return
    }

    setUploadingVoice(true)
    setAnalyzingVoice(false)
    setError('')
    setSuccess('')

    try {
      // Upload to Supabase Storage
      const fileExt = voiceFile.name.split('.').pop()
      const fileName = `voice-samples/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('media')
        .upload(fileName, voiceFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('media')
        .getPublicUrl(fileName)

      setUploadingVoice(false)
      setAnalyzingVoice(true)

      // Call voice analysis API
      const response = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl: publicUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze voice')
      }

      const { transcription, analysis, duration } = await response.json()

      // Update brand voice with voice analysis
      const { error: updateError } = await supabase
        .from('brand_voice_memory')
        .update({
          voice_sample_url: publicUrl,
          voice_sample_duration: duration,
          voice_analysis: analysis,
          voice_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', brandVoice.id)

      if (updateError) throw updateError

      // Update local state
      setBrandVoice({
        ...brandVoice,
        voice_sample_url: publicUrl,
        voice_sample_duration: duration,
        voice_analysis: analysis,
        voice_analyzed_at: new Date().toISOString()
      })

      setSuccess('Voice analyzed successfully! Your brand voice now includes speaking style.')
      setVoiceFile(null)
      
      // Clear the file input
      const fileInput = document.getElementById('voice-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err: any) {
      console.error('Error uploading/analyzing voice:', err)
      setError(err.message || 'Failed to upload and analyze voice')
    } finally {
      setUploadingVoice(false)
      setAnalyzingVoice(false)
    }
  }

  const addToArray = (field: keyof BrandVoice, value: string, clearInput: () => void) => {
    if (!brandVoice || !value.trim()) return
    const currentArray = brandVoice[field] as string[]
    if (!currentArray.includes(value.trim())) {
      setBrandVoice({
        ...brandVoice,
        [field]: [...currentArray, value.trim()]
      })
      clearInput()
    }
  }

  const removeFromArray = (field: keyof BrandVoice, index: number) => {
    if (!brandVoice) return
    const currentArray = brandVoice[field] as string[]
    setBrandVoice({
      ...brandVoice,
      [field]: currentArray.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">Loading brand voice settings...</div>
      </div>
    )
  }

  if (!brandVoice) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">No Brand Voice Configured</h2>
          <p className="mb-4">Run the database schema to initialize brand voice memory.</p>
          <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">
            database/social-media-enhancement-schema.sql
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🎨 Brand Voice Memory
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Define your brand's personality, language preferences, and content rules for AI-generated social media posts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Voice Sample Upload */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            🎙️ Voice Sample Analysis
            <span className="text-sm font-normal text-purple-600 dark:text-purple-400">(NEW)</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Upload a short audio recording (5-30 seconds) of the owner speaking naturally. 
            The AI will analyze speaking style, tone, vocabulary, and personality traits to make all generated content sound authentically like her.
          </p>

          {brandVoice.voice_sample_url && brandVoice.voice_analysis ? (
            <div className="space-y-4">
              {/* Current Voice Analysis Display */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Current Voice Profile</h3>
                  <span className="text-xs text-gray-500">
                    Analyzed {new Date(brandVoice.voice_analyzed_at!).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Audio Player */}
                <div className="mb-4">
                  <audio 
                    controls 
                    src={brandVoice.voice_sample_url} 
                    className="w-full"
                    style={{ maxHeight: '40px' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {brandVoice.voice_sample_duration}s
                  </p>
                </div>

                {/* Analysis Results */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Tone:</span>
                    <p className="text-gray-600 dark:text-gray-400">{brandVoice.voice_analysis.tone}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Formality:</span>
                    <p className="text-gray-600 dark:text-gray-400">{brandVoice.voice_analysis.formality_level}/5</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Emotional Expression:</span>
                    <p className="text-gray-600 dark:text-gray-400">{brandVoice.voice_analysis.emotional_expression}/5</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Pacing:</span>
                    <p className="text-gray-600 dark:text-gray-400">{brandVoice.voice_analysis.pacing}</p>
                  </div>
                </div>

                {brandVoice.voice_analysis.common_phrases && brandVoice.voice_analysis.common_phrases.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Common Phrases:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {brandVoice.voice_analysis.common_phrases.slice(0, 5).map((phrase: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Replace Voice Sample */}
              <div className="border-t border-purple-200 dark:border-purple-700 pt-4">
                <Label htmlFor="voice-upload" className="text-gray-700 dark:text-gray-300">
                  Replace Voice Sample
                </Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    id="voice-upload"
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg"
                    onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                    disabled={uploadingVoice || analyzingVoice}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVoiceUpload}
                    disabled={!voiceFile || uploadingVoice || analyzingVoice}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {uploadingVoice ? '⏳ Uploading...' : analyzingVoice ? '🧠 Analyzing...' : '🔄 Replace'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Initial Upload */
            <div className="space-y-4">
              <div>
                <Label htmlFor="voice-upload" className="text-gray-700 dark:text-gray-300">
                  Upload Audio File (MP3, WAV, M4A, OGG)
                </Label>
                <Input
                  id="voice-upload"
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg"
                  onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                  disabled={uploadingVoice || analyzingVoice}
                  className="mt-2"
                />
                {voiceFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Selected: {voiceFile.name} ({(voiceFile.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleVoiceUpload}
                disabled={!voiceFile || uploadingVoice || analyzingVoice}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
              >
                {uploadingVoice ? '⏳ Uploading Voice Sample...' : analyzingVoice ? '🧠 Analyzing Speaking Style...' : '🎙️ Upload & Analyze Voice'}
              </Button>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">💡 Tips for Best Results:</h4>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• Record 10-30 seconds of natural speech</li>
                  <li>• Talk about your candles or business</li>
                  <li>• Speak naturally, as if talking to a customer</li>
                  <li>• Clear audio quality works best</li>
                  <li>• No background music or noise</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Voice Characteristics */}
        <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
            🗣️ Voice Characteristics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Primary Voice</Label>
              <select
                value={brandVoice.primary_voice}
                onChange={(e) => setBrandVoice({ ...brandVoice, primary_voice: e.target.value })}
                className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="warm_artisan">Warm Artisan</option>
                <option value="modern_minimal">Modern Minimal</option>
                <option value="luxury_editorial">Luxury Editorial</option>
              </select>
            </div>

            <div>
              <Label>Formality Level (1=Casual, 5=Formal)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="range"
                  min="1"
                  max="5"
                  value={brandVoice.formality_level}
                  onChange={(e) => setBrandVoice({ ...brandVoice, formality_level: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400 w-12 text-center">
                  {brandVoice.formality_level}
                </span>
              </div>
            </div>

            <div>
              <Label>Metaphor Style</Label>
              <select
                value={brandVoice.metaphor_style}
                onChange={(e) => setBrandVoice({ ...brandVoice, metaphor_style: e.target.value })}
                className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="earthy">Earthy</option>
                <option value="poetic">Poetic</option>
                <option value="minimal">Minimal</option>
                <option value="direct">Direct</option>
              </select>
            </div>

            <div>
              <Label>Luxury ←→ Warmth Balance (1=Luxury, 10=Warm)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={brandVoice.luxury_warmth_balance}
                  onChange={(e) => setBrandVoice({ ...brandVoice, luxury_warmth_balance: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400 w-12 text-center">
                  {brandVoice.luxury_warmth_balance}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Language Preferences */}
        <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
            💬 Language Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preferred Phrases */}
            <div>
              <Label className="text-green-700 dark:text-green-400 font-bold">✅ Preferred Phrases</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Words and phrases to use often</p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newPreferredPhrase}
                  onChange={(e) => setNewPreferredPhrase(e.target.value)}
                  placeholder="e.g., slow-made, hand-poured"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('preferred_phrases', newPreferredPhrase, () => setNewPreferredPhrase(''))
                    }
                  }}
                />
                <Button
                  onClick={() => addToArray('preferred_phrases', newPreferredPhrase, () => setNewPreferredPhrase(''))}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandVoice.preferred_phrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {phrase}
                    <button
                      onClick={() => removeFromArray('preferred_phrases', idx)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Banned Phrases */}
            <div>
              <Label className="text-red-700 dark:text-red-400 font-bold">⛔ Banned Phrases</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Words and phrases to never use</p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newBannedPhrase}
                  onChange={(e) => setNewBannedPhrase(e.target.value)}
                  placeholder="e.g., mass-produced, cheap"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('banned_phrases', newBannedPhrase, () => setNewBannedPhrase(''))
                    }
                  }}
                />
                <Button
                  onClick={() => addToArray('banned_phrases', newBannedPhrase, () => setNewBannedPhrase(''))}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandVoice.banned_phrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {phrase}
                    <button
                      onClick={() => removeFromArray('banned_phrases', idx)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Emoji Policy */}
        <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
            😊 Emoji Policy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Emoji Usage</Label>
              <select
                value={brandVoice.emoji_usage}
                onChange={(e) => setBrandVoice({ ...brandVoice, emoji_usage: e.target.value })}
                className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="none">None</option>
                <option value="minimal">Minimal (1-2 per post)</option>
                <option value="moderate">Moderate (3-5 per post)</option>
                <option value="expressive">Expressive (6+ per post)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Allowed Emojis</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Only these emojis will be used</p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="Paste emoji here"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('allowed_emojis', newEmoji, () => setNewEmoji(''))
                    }
                  }}
                />
                <Button
                  onClick={() => addToArray('allowed_emojis', newEmoji, () => setNewEmoji(''))}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandVoice.allowed_emojis.map((emoji, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-2xl flex items-center gap-2"
                  >
                    {emoji}
                    <button
                      onClick={() => removeFromArray('allowed_emojis', idx)}
                      className="text-red-600 hover:text-red-800 font-bold text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
            💎 Core Values
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Values that influence all content</p>

          <div className="flex gap-2 mb-3">
            <Input
              value={newCoreValue}
              onChange={(e) => setNewCoreValue(e.target.value)}
              placeholder="e.g., craftsmanship, authenticity"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('core_values', newCoreValue, () => setNewCoreValue(''))
                }
              }}
            />
            <Button
              onClick={() => addToArray('core_values', newCoreValue, () => setNewCoreValue(''))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandVoice.core_values.map((value, idx) => (
              <span
                key={idx}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {value}
                <button
                  onClick={() => removeFromArray('core_values', idx)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* Never Claim */}
        <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
            🚫 Never Claim (Factual Guardrails)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Claims the AI should never make (prevents false statements)
          </p>

          <div className="flex gap-2 mb-3">
            <Input
              value={newNeverClaim}
              onChange={(e) => setNewNeverClaim(e.target.value)}
              placeholder="e.g., certified_organic, medical_benefits"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('never_claim', newNeverClaim, () => setNewNeverClaim(''))
                }
              }}
            />
            <Button
              onClick={() => addToArray('never_claim', newNeverClaim, () => setNewNeverClaim(''))}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {brandVoice.never_claim.map((claim, idx) => (
              <span
                key={idx}
                className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {claim}
                <button
                  onClick={() => removeFromArray('never_claim', idx)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* Platform-Specific Rules */}
        <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
            📱 Platform-Specific Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Instagram Line Break Style</Label>
              <select
                value={brandVoice.instagram_line_break_style}
                onChange={(e) => setBrandVoice({ ...brandVoice, instagram_line_break_style: e.target.value })}
                className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
              >
                <option value="natural">Natural (standard paragraph)</option>
                <option value="spaced">Spaced (line breaks between thoughts)</option>
                <option value="compact">Compact (minimal breaks)</option>
              </select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={brandVoice.linkedin_business_focus}
                  onChange={(e) => setBrandVoice({ ...brandVoice, linkedin_business_focus: e.target.checked })}
                  className="w-5 h-5"
                />
                LinkedIn Business Focus
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Emphasize business/entrepreneurship angle on LinkedIn
              </p>
            </div>

            <div className="md:col-span-2">
              <Label>Email CTA Softness (1=Hard Sell, 10=Soft Invite)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={brandVoice.email_cta_softness}
                  onChange={(e) => setBrandVoice({ ...brandVoice, email_cta_softness: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400 w-12 text-center">
                  {brandVoice.email_cta_softness}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="px-8 py-3"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg font-bold"
          >
            {saving ? 'Saving...' : '💾 Save Brand Voice'}
          </Button>
        </div>
      </div>
    </div>
  )
}
