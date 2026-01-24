'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaLibrary } from '@/components/media-library'
import { ContentCalendar } from '@/components/content-calendar'
import { generateEnhancedContent, generateEnhancedHashtags } from '@/lib/enhanced-social-media-generator'
import Image from 'next/image'

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

interface StoryAngle {
  id: string
  name: string
  description: string
  focus_areas: string[]
  tone_guidance: string
}

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
}

interface ScheduledPost {
  id: string
  scheduled_date: string
  scheduled_time: string | null
  platform: string
  caption: string
  status: string
  media_asset_id: string | null
  product_name: string | null
  hashtags: string[] | null
}

export default function SocialMediaManagerPage() {
  const supabase = createClient()
  
  // Core State
  const [activeTab, setActiveTab] = useState<'create' | 'calendar' | 'media'>('create')
  const [brandVoice, setBrandVoice] = useState<BrandVoice | null>(null)
  const [storyAngles, setStoryAngles] = useState<StoryAngle[]>([])
  
  // Content Generation State
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<StoryAngle | null>(null)
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'email'>('instagram')
  const [tone, setTone] = useState<'casual' | 'luxury' | 'professional' | 'playful'>('casual')
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState(49.99)
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([])
  
  // Scheduling State
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [internalNotes, setInternalNotes] = useState('')
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [analyzingImage, setAnalyzingImage] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [voiceRes, anglesRes] = await Promise.all([
        supabase.from('brand_voice_memory').select('*').eq('is_active', true).single(),
        supabase.from('story_angles').select('*').eq('is_active', true)
      ])

      if (voiceRes.data) setBrandVoice(voiceRes.data)
      if (anglesRes.data) setStoryAngles(anglesRes.data)
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

  const handleGenerateContent = async () => {
    if (!brandVoice) {
      setError('Brand voice not configured. Please set up at /admin-brand-voice')
      return
    }

    if (!productName.trim()) {
      setError('Please enter a product name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const caption = generateEnhancedContent({
        platform,
        tone,
        storyAngle: selectedAngle || undefined,
        mediaAsset: selectedMedia || undefined,
        productName,
        price: productPrice,
        brandVoice,
        waxType: 'soy'
      })

      const hashtags = generateEnhancedHashtags(
        undefined,
        selectedMedia || undefined,
        'soy'
      )

      setGeneratedCaption(caption)
      setGeneratedHashtags(hashtags)

      // Save to content versions for tracking
      await supabase.from('generated_content_versions').insert([{
        platform,
        tone,
        story_angle_id: selectedAngle?.id || null,
        media_asset_id: selectedMedia?.id || null,
        product_sku: null,
        generated_caption: caption,
        generated_hashtags: hashtags,
        generation_params: {
          productName,
          productPrice,
          hasMedia: !!selectedMedia,
          hasStoryAngle: !!selectedAngle
        }
      }])

    } catch (err: any) {
      console.error('Error generating content:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedulePost = async (status: 'draft' | 'scheduled') => {
    if (!generatedCaption) {
      setError('Please generate content first')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: insertError } = await supabase.from('scheduled_posts').insert([{
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        platform,
        tone,
        caption: generatedCaption,
        hashtags: generatedHashtags,
        media_asset_id: selectedMedia?.id || null,
        story_angle_id: selectedAngle?.id || null,
        product_name: productName,
        product_price: productPrice,
        status,
        internal_notes: internalNotes
      }])

      if (insertError) throw insertError

      setSuccess(`Post ${status === 'draft' ? 'saved as draft' : 'scheduled'} successfully!`)
      
      // Clear form
      setTimeout(() => {
        resetForm()
      }, 2000)

    } catch (err: any) {
      console.error('Error saving post:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAIAnalyzeMedia = async () => {
    if (!selectedMedia) {
      setError('Please select media first')
      return
    }

    setAnalyzingImage(true)
    setError('')

    try {
      const response = await fetch('/api/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: selectedMedia.file_url })
      })

      if (!response.ok) throw new Error('AI analysis failed')

      const { analysis } = await response.json()

      // Update media asset with AI suggestions
      const { error: updateError } = await supabase
        .from('media_assets')
        .update({
          content_type: analysis.content_type || selectedMedia.content_type,
          product_type: analysis.product_type || selectedMedia.product_type,
          mood: analysis.mood || selectedMedia.mood,
          color_palette: analysis.color_palette || selectedMedia.color_palette,
          materials_used: analysis.materials_used || selectedMedia.materials_used,
          scent_profile: analysis.scent_profile || selectedMedia.scent_profile,
          caption_notes: analysis.caption_hook || selectedMedia.caption_notes,
          story_context: analysis.story_context || selectedMedia.story_context
        })
        .eq('id', selectedMedia.id)

      if (updateError) throw updateError

      setSuccess('AI analysis applied! Media tags updated.')
      
      // Reload the selected media to show updated tags
      const { data } = await supabase
        .from('media_assets')
        .select('*')
        .eq('id', selectedMedia.id)
        .single()
      
      if (data) setSelectedMedia(data)

    } catch (err: any) {
      console.error('AI analysis error:', err)
      setError(err.message)
    } finally {
      setAnalyzingImage(false)
    }
  }

  const resetForm = () => {
    setSelectedMedia(null)
    setSelectedAngle(null)
    setProductName('')
    setProductPrice(49.99)
    setGeneratedCaption('')
    setGeneratedHashtags([])
    setInternalNotes('')
    setSuccess('')
    setError('')
  }

  const platformIcons: Record<string, string> = {
    instagram: '📷',
    facebook: '👥',
    linkedin: '💼',
    tiktok: '🎵',
    email: '✉️'
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🚀 Social Media Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create authentic, brand-intelligent content with AI-powered media analysis
        </p>
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'create'
              ? 'border-b-2 border-amber-600 text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          ✨ Create Content
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'calendar'
              ? 'border-b-2 border-amber-600 text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📅 Calendar
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'media'
              ? 'border-b-2 border-amber-600 text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📸 Media Library
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            {/* Media Selection */}
            <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                📸 Media (Optional)
              </h3>
              
              {selectedMedia ? (
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={selectedMedia.file_url}
                      alt="Selected media"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                    <p><strong>Type:</strong> {selectedMedia.content_type.replace('_', ' ')}</p>
                    {selectedMedia.mood && (
                      <p><strong>Mood:</strong> {selectedMedia.mood.join(', ')}</p>
                    )}
                    {selectedMedia.caption_notes && (
                      <p><strong>Notes:</strong> {selectedMedia.caption_notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAIAnalyzeMedia}
                      disabled={analyzingImage}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {analyzingImage ? '🤖 Analyzing...' : '🤖 AI Auto-Tag'}
                    </Button>
                    <Button
                      onClick={() => setSelectedMedia(null)}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaLibrary(true)}
                  className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-400 transition-all text-center"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    Select Photo or Video
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Media-driven content gets 3x engagement
                  </div>
                </button>
              )}
            </section>

            {/* Product Details */}
            <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                🏷️ Product Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Lavender Dreams"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    className="mt-2"
                  />
                </div>
              </div>
            </section>

            {/* Content Settings */}
            <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                🎨 Content Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Platform</Label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="instagram">{platformIcons.instagram} Instagram</option>
                    <option value="facebook">{platformIcons.facebook} Facebook</option>
                    <option value="linkedin">{platformIcons.linkedin} LinkedIn</option>
                    <option value="tiktok">{platformIcons.tiktok} TikTok</option>
                    <option value="email">{platformIcons.email} Email</option>
                  </select>
                </div>

                <div>
                  <Label>Tone</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="casual">Casual</option>
                    <option value="luxury">Luxury</option>
                    <option value="professional">Professional</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>

                <div>
                  <Label>Story Angle (Optional)</Label>
                  <select
                    value={selectedAngle?.id || ''}
                    onChange={(e) => {
                      const angle = storyAngles.find(a => a.id === e.target.value)
                      setSelectedAngle(angle || null)
                    }}
                    className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="">No specific angle</option>
                    {storyAngles.map(angle => (
                      <option key={angle.id} value={angle.id}>
                        {angle.name.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {selectedAngle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {selectedAngle.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateContent}
              disabled={loading || !brandVoice}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 text-lg font-bold"
            >
              {loading ? '⚡ Generating...' : '✨ Generate Content'}
            </Button>
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="space-y-6">
            {generatedCaption ? (
              <>
                {/* Caption Preview */}
                <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {platformIcons[platform]} {platform.charAt(0).toUpperCase() + platform.slice(1)} Caption
                    </h3>
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedCaption)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      📋 Copy
                    </Button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
                      {generatedCaption}
                    </pre>
                  </div>
                </section>

                {/* Hashtags */}
                {(platform === 'instagram' || platform === 'facebook' || platform === 'tiktok') && (
                  <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        #️⃣ Hashtags ({generatedHashtags.length})
                      </h3>
                      <Button
                        onClick={() => navigator.clipboard.writeText(generatedHashtags.join(' '))}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        📋 Copy All
                      </Button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {generatedHashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Scheduling */}
                <section className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    📅 Schedule Post
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Internal Notes (Optional)</Label>
                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Add notes for your team..."
                        className="w-full mt-2 p-2 border rounded-lg h-20 dark:bg-gray-800"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSchedulePost('draft')}
                        disabled={saving}
                        variant="outline"
                        className="flex-1"
                      >
                        💾 Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSchedulePost('scheduled')}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ⏰ Schedule Post
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Quick Actions */}
                <section className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4">
                    🚀 Quick Post
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const fullContent = `${generatedCaption}\n\n${generatedHashtags.join(' ')}`
                        navigator.clipboard.writeText(fullContent)
                        window.open('https://www.instagram.com/', '_blank')
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      📷 Instagram
                    </button>
                    <button
                      onClick={() => {
                        const fullContent = `${generatedCaption}\n\n${generatedHashtags.join(' ')}`
                        navigator.clipboard.writeText(fullContent)
                        window.open('https://www.facebook.com/', '_blank')
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      👥 Facebook
                    </button>
                  </div>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-3">
                    Content copied - paste when page opens
                  </p>
                </section>
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Content Preview
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Fill in the details and click Generate to see AI-powered content
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <ContentCalendar 
          onSelectDate={(date) => {
            setScheduledDate(date)
            setActiveTab('create')
          }}
          onEditPost={(post) => {
            // Load post data into form
            setPlatform(post.platform as any)
            setProductName(post.product_name || '')
            setGeneratedCaption(post.caption)
            setGeneratedHashtags(post.hashtags || [])
            setScheduledDate(post.scheduled_date)
            setScheduledTime(post.scheduled_time || '09:00')
            setActiveTab('create')
          }}
        />
      )}

      {activeTab === 'media' && (
        <MediaLibrary 
          onSelectMedia={(media) => {
            setSelectedMedia(media)
            setActiveTab('create')
          }}
          selectionMode={false}
        />
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Select Media</h2>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
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
    </div>
  )
}
