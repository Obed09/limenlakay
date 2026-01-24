'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface MediaAsset {
  id: string
  created_at: string
  file_url: string
  file_type: 'image' | 'video'
  content_type: string
  product_type: string
  mood: string[]
  color_palette: string[]
  materials_used: string[]
  scent_profile: string[]
  scent_name: string | null
  caption_notes: string | null
  story_context: string | null
  used_in_posts: number
  is_featured: boolean
}

interface MediaLibraryProps {
  onSelectMedia?: (media: MediaAsset) => void
  selectionMode?: boolean
}

export function MediaLibrary({ onSelectMedia, selectionMode = false }: MediaLibraryProps) {
  const supabase = createClient()
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterContentType, setFilterContentType] = useState<string>('all')
  const [filterMood, setFilterMood] = useState<string>('all')
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({
    content_type: 'finished_piece',
    product_type: 'candle',
    mood: [] as string[],
    color_palette: [] as string[],
    materials_used: [] as string[],
    scent_profile: [] as string[],
    scent_name: '',
    caption_notes: '',
    story_context: ''
  })

  useEffect(() => {
    fetchMediaAssets()
  }, [])

  const fetchMediaAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMediaAssets(data || [])
    } catch (err) {
      console.error('Error fetching media:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = uploadFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `media-assets/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, uploadFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      // Save to database
      const { error: dbError } = await supabase
        .from('media_assets')
        .insert([{
          file_url: urlData.publicUrl,
          file_type: uploadFile.type.startsWith('video/') ? 'video' : 'image',
          file_size: uploadFile.size,
          mime_type: uploadFile.type,
          ...uploadData,
          mood: uploadData.mood.length > 0 ? uploadData.mood : null,
          color_palette: uploadData.color_palette.length > 0 ? uploadData.color_palette : null,
          materials_used: uploadData.materials_used.length > 0 ? uploadData.materials_used : null,
          scent_profile: uploadData.scent_profile.length > 0 ? uploadData.scent_profile : null
        }])

      if (dbError) throw dbError

      await fetchMediaAssets()
      setShowUploadModal(false)
      resetUploadForm()
    } catch (err: any) {
      console.error('Upload error:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadFile(null)
    setUploadData({
      content_type: 'finished_piece',
      product_type: 'candle',
      mood: [],
      color_palette: [],
      materials_used: [],
      scent_profile: [],
      scent_name: '',
      caption_notes: '',
      story_context: ''
    })
  }

  const toggleArrayItem = (field: 'mood' | 'color_palette' | 'materials_used' | 'scent_profile', value: string) => {
    const currentArray = uploadData[field]
    if (currentArray.includes(value)) {
      setUploadData({ ...uploadData, [field]: currentArray.filter(item => item !== value) })
    } else {
      setUploadData({ ...uploadData, [field]: [...currentArray, value] })
    }
  }

  const filteredMedia = mediaAssets.filter(media => {
    if (filterContentType !== 'all' && media.content_type !== filterContentType) return false
    if (filterMood !== 'all' && !media.mood?.includes(filterMood)) return false
    return true
  })

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            📸 Media Library
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mediaAssets.length} assets • {selectionMode ? 'Select media for content generation' : 'Manage your media'}
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          ➕ Upload Media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterContentType}
          onChange={(e) => setFilterContentType(e.target.value)}
          className="p-2 border rounded-lg dark:bg-gray-800"
        >
          <option value="all">All Content Types</option>
          <option value="process">Process</option>
          <option value="finished_piece">Finished Piece</option>
          <option value="studio">Studio</option>
          <option value="pour">Pour</option>
          <option value="vessel_shaping">Vessel Shaping</option>
          <option value="packaging">Packaging</option>
          <option value="lighting">Lighting</option>
          <option value="lifestyle">Lifestyle</option>
        </select>

        <select
          value={filterMood}
          onChange={(e) => setFilterMood(e.target.value)}
          className="p-2 border rounded-lg dark:bg-gray-800"
        >
          <option value="all">All Moods</option>
          <option value="warm">Warm</option>
          <option value="earthy">Earthy</option>
          <option value="minimal">Minimal</option>
          <option value="luxury">Luxury</option>
          <option value="ritual">Ritual</option>
          <option value="calm">Calm</option>
        </select>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12">Loading media assets...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No media assets found</p>
          <Button onClick={() => setShowUploadModal(true)} className="bg-amber-600 hover:bg-amber-700">
            Upload Your First Asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((media) => (
            <div
              key={media.id}
              className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-amber-400 transition-all cursor-pointer"
              onClick={() => selectionMode && onSelectMedia?.(media)}
            >
              {media.file_type === 'image' ? (
                <div className="aspect-square relative">
                  <Image
                    src={media.file_url}
                    alt={media.content_type}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <video src={media.file_url} className="w-full aspect-square object-cover" />
              )}

              {/* Overlay Info */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all flex items-end p-4">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-all text-sm">
                  <p className="font-bold capitalize">{media.content_type.replace('_', ' ')}</p>
                  <p className="text-xs">{media.mood?.join(', ') || 'No mood set'}</p>
                  <p className="text-xs mt-1">Used: {media.used_in_posts} times</p>
                </div>
              </div>

              {media.is_featured && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ⭐ Featured
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Upload Media Asset</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <Label>Select File</Label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full mt-2 p-2 border rounded-lg"
                />
                {uploadFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Content Classification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <select
                    value={uploadData.content_type}
                    onChange={(e) => setUploadData({ ...uploadData, content_type: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="process">Process (behind-the-scenes)</option>
                    <option value="finished_piece">Finished Piece</option>
                    <option value="studio">Studio Shot</option>
                    <option value="pour">Pour (wax pouring)</option>
                    <option value="vessel_shaping">Vessel Shaping</option>
                    <option value="packaging">Packaging</option>
                    <option value="lighting">Lighting (candle lit)</option>
                    <option value="lifestyle">Lifestyle (in use)</option>
                  </select>
                </div>

                <div>
                  <Label>Product Type</Label>
                  <select
                    value={uploadData.product_type}
                    onChange={(e) => setUploadData({ ...uploadData, product_type: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="candle">Candle</option>
                    <option value="vessel">Vessel Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <Label>Mood (select multiple)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['warm', 'earthy', 'minimal', 'luxury', 'ritual', 'calm'].map(mood => (
                    <button
                      key={mood}
                      onClick={() => toggleArrayItem('mood', mood)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        uploadData.mood.includes(mood)
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <Label>Materials Used (select multiple)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['concrete', 'soy_wax', 'wood', 'coconut_wax', 'terracotta', 'metal'].map(material => (
                    <button
                      key={material}
                      onClick={() => toggleArrayItem('materials_used', material)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        uploadData.materials_used.includes(material)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {material.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scent Profile */}
              <div>
                <Label>Scent Profile (if applicable)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['floral', 'citrus', 'earthy', 'spicy', 'fruity', 'clean', 'gourmand'].map(scent => (
                    <button
                      key={scent}
                      onClick={() => toggleArrayItem('scent_profile', scent)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        uploadData.scent_profile.includes(scent)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {scent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scent Name */}
              <div>
                <Label>Scent Name (optional)</Label>
                <Input
                  value={uploadData.scent_name}
                  onChange={(e) => setUploadData({ ...uploadData, scent_name: e.target.value })}
                  placeholder="e.g., Lavender Dreams, Vanilla Bliss"
                  className="mt-2"
                />
              </div>

              {/* Caption Notes */}
              <div>
                <Label>Caption Notes</Label>
                <textarea
                  value={uploadData.caption_notes}
                  onChange={(e) => setUploadData({ ...uploadData, caption_notes: e.target.value })}
                  placeholder="What should the AI highlight about this image?"
                  className="w-full mt-2 p-2 border rounded-lg h-20 dark:bg-gray-800"
                />
              </div>

              {/* Story Context */}
              <div>
                <Label>Story Context (optional)</Label>
                <textarea
                  value={uploadData.story_context}
                  onChange={(e) => setUploadData({ ...uploadData, story_context: e.target.value })}
                  placeholder="Any background story about this piece? (e.g., 'Made on a rainy Sunday morning')"
                  className="w-full mt-2 p-2 border rounded-lg h-20 dark:bg-gray-800"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowUploadModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {uploading ? 'Uploading...' : '📤 Upload & Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
