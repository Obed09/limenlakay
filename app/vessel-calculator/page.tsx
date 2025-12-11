'use client'
// Material & Cost Calculator - 6 Vessels - BUILD: 2025-12-09-20:45

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Vessel {
  id: number
  name: string
  diameter: number
  height: number
  unit: string
  imageName?: string
  actualCapacity?: number
}

interface CustomCandle {
  id: number
  name: string
  scentCount: number
  scentNames: string[]
  cost: number
  dateCreated: string
  rating?: number  // 1-5 stars
  notes?: string   // Recipe observations and notes
  tags?: string[]  // Category tags (season, mood, etc.)
}

interface Recipe {
  id: number
  name: string
  category?: string
  profile?: string
  purpose?: string
  audience?: string
  occasion?: string
  ingredients: { [key: string]: number }
  isUserRecipe?: boolean
}

interface VesselCalculation {
  fullVolume: number
  waxVolume: number
  volumeOz: number
  waxWeight: number
  fragranceWeight: number
  cementWeight: number
  wicksNeeded: number
  waxCost: number
  fragranceCost: number
  cementCost: number
  wickCost: number
  paintCost: number
  totalCost: number
}

export default function VesselCalculator() {
  // Material prices (editable)
  const [materialPrices, setMaterialPrices] = useState({
    waxType: 'soy' as 'soy' | 'coconut',
    waxPricePerLb: 8.50,
    fragrancePricePerLb: 40.00,
    cementPricePerLb: 0.50,
    wickPrice: 0.25,
    paintPrice: 0.75,
    fillPercent: 80,
    fragranceLoad: 10,
  })

  // Vessels data based on the HTML and images
  const vessels: Vessel[] = [
    {
      id: 100,
      name: "Large Shallow",
      diameter: 8.2, // inches
      height: 2.36, // inches
      unit: "in",
      imageName: "vessel-100.png" // The large round vessel
    },
    {
      id: 101,
      name: "Medium Cylinder",
      diameter: 5.43, // inches
      height: 2.16, // inches
      unit: "in",
      actualCapacity: 10.1, // oz stated
      imageName: "vessel-101.png" // Medium size with lid
    },
    {
      id: 102,
      name: "Small Ribbed",
      diameter: 2.7, // inches (inner)
      height: 1.4, // inches
      unit: "in",
      imageName: "vessel-102.png" // Small ribbed vessel
    },
    {
      id: 103,
      name: "Ribbed Jar Mold",
      diameter: 9.5, // cm
      height: 8, // cm (estimated from 3.7in)
      unit: "cm",
      imageName: "vessel-103.png" // The ribbed jar mold
    },
    {
      id: 104,
      name: "Flower Shell",
      diameter: 3.5, // cm (from image 15.3cm/0.01in shown, using inner)
      height: 4.8, // cm (1.88in)
      unit: "cm",
      imageName: "vessel-104.png" // Flower/shell shaped vessel
    },
    {
      id: 105,
      name: "Bowl Vessel",
      diameter: 3.25, // inches 
      height: 2.125, // inches (2 1/8 from diagram)
      unit: "in",
      imageName: "vessel-105.png" // Bowl shaped vessel
    }
  ]

  // Custom candle calculator
  const [candleName, setCandleName] = useState('')
  const [scentCount, setScentCount] = useState(1)
  const [scentNames, setScentNames] = useState<string[]>([''])
  const [candleRating, setCandleRating] = useState(0)
  const [candleNotes, setCandleNotes] = useState('')
  const [candleTags, setCandleTags] = useState<string[]>([])
  const [savedCandles, setSavedCandles] = useState<CustomCandle[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['season', 'scent-profile'])

  // Recipe Database
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [scentFilter, setScentFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  // Profit calculator
  const [profitCalc, setProfitCalc] = useState({
    selectedVesselIndex: 0,
    sellingPrice: 25.00,
    quantity: 100,
  })

  const handleMaterialChange = (field: string, value: string | number) => {
    if (field === 'waxType') {
      setMaterialPrices(prev => ({
        ...prev,
        waxType: value as 'soy' | 'coconut'
      }))
    } else {
      setMaterialPrices(prev => ({
        ...prev,
        [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
      }))
    }
  }

  const handleProfitChange = (field: string, value: string) => {
    setProfitCalc(prev => ({
      ...prev,
      [field]: field === 'selectedVesselIndex' ? parseInt(value) : parseFloat(value) || 0
    }))
  }

  // Calculate volume using cylindrical formula
  const calculateVolume = (diameter: number, height: number, unit: string): number => {
    // Convert to cm if needed
    const d = unit === 'in' ? diameter * 2.54 : diameter
    const h = unit === 'in' ? height * 2.54 : height
    
    // Volume = π × r² × h
    const radius = d / 2
    const volumeCm3 = Math.PI * radius * radius * h
    
    return volumeCm3
  }

  // Calculate materials for a vessel
  const calculateMaterials = (vessel: Vessel): VesselCalculation => {
    const fillPercent = materialPrices.fillPercent / 100
    const fragranceLoad = materialPrices.fragranceLoad / 100
    
    // Wax density
    const waxDensity = materialPrices.waxType === 'soy' ? 0.9 : 0.92 // g/cm³
    const cementDensity = 2.4 // g/cm³
    
    // Calculate full volume
    const fullVolume = calculateVolume(vessel.diameter, vessel.height, vessel.unit)
    
    // Wax volume (with fill percentage)
    const waxVolume = fullVolume * fillPercent
    
    // Weights in grams
    const waxWeight = waxVolume * waxDensity
    const fragranceWeight = waxWeight * fragranceLoad
    const cementWeight = fullVolume * cementDensity
    
    // Convert grams to cost (453.6g = 1 lb)
    const waxCost = (waxWeight / 453.6) * materialPrices.waxPricePerLb
    const fragranceCost = (fragranceWeight / 453.6) * materialPrices.fragrancePricePerLb
    const cementCost = (cementWeight / 453.6) * materialPrices.cementPricePerLb
    
    // Wick calculation based on diameter
    const diameterInInches = vessel.unit === 'cm' ? vessel.diameter / 2.54 : vessel.diameter
    const wicksNeeded = diameterInInches > 4 ? 2 : 1
    const wickCost = wicksNeeded * materialPrices.wickPrice
    
    const totalCost = waxCost + fragranceCost + cementCost + wickCost + materialPrices.paintPrice
    
    // Convert volume to oz for display
    const volumeOz = waxVolume / 29.5735
    
    return {
      fullVolume,
      waxVolume,
      volumeOz,
      waxWeight,
      fragranceWeight,
      cementWeight,
      wicksNeeded,
      waxCost,
      fragranceCost,
      cementCost,
      wickCost,
      paintCost: materialPrices.paintPrice,
      totalCost
    }
  }

  // Calculate all vessels
  const vesselCalculations = vessels.map(vessel => ({
    vessel,
    calc: calculateMaterials(vessel)
  }))

  // Get average cost for custom candle (using first vessel as reference)
  const referenceCost = vesselCalculations[0]?.calc.totalCost || 0

  // Handle scent count change
  const handleScentCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(10, count))
    setScentCount(validCount)
    // Adjust scent names array to match count
    setScentNames(prev => {
      const newNames = [...prev]
      while (newNames.length < validCount) {
        newNames.push('')
      }
      return newNames.slice(0, validCount)
    })
  }

  // Handle individual scent name change
  const handleScentNameChange = (index: number, value: string) => {
    setScentNames(prev => {
      const newNames = [...prev]
      newNames[index] = value
      return newNames
    })
  }

  // Save custom candle
  const saveCustomCandle = () => {
    if (!candleName.trim()) {
      alert('Please enter a candle name')
      return
    }
    
    const newCandle: CustomCandle = {
      id: Date.now(),
      name: candleName.trim(),
      scentCount: scentCount,
      scentNames: scentNames.filter(s => s.trim() !== ''),
      cost: referenceCost,
      dateCreated: new Date().toLocaleDateString(),
      rating: candleRating > 0 ? candleRating : undefined,
      notes: candleNotes.trim() || undefined,
      tags: candleTags.length > 0 ? candleTags : undefined
    }
    
    setSavedCandles(prev => [newCandle, ...prev])
    setCandleName('')
    setScentCount(1)
    setScentNames([''])
    setCandleRating(0)
    setCandleNotes('')
    setCandleTags([])
  }

  // Delete saved candle
  const deleteCandle = (id: number) => {
    setSavedCandles(prev => prev.filter(candle => candle.id !== id))
  }

  // Load candle template
  const loadCandleTemplate = (candle: CustomCandle) => {
    setCandleName(candle.name)
    setScentCount(candle.scentCount)
    setScentNames([...candle.scentNames])
    setCandleRating(candle.rating || 0)
    setCandleNotes(candle.notes || '')
    setCandleTags(candle.tags || [])
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Tag management
  const toggleTag = (tag: string) => {
    setCandleTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const tagCategories = [
    {
      id: 'season',
      name: 'Season',
      emoji: '📅',
      tags: ['🌸 Spring', '☀️ Summer', '🍂 Fall', '❄️ Winter']
    },
    {
      id: 'scent-profile',
      name: 'Scent Profile',
      emoji: '🌺',
      tags: [
        '🌺 Floral', '🍊 Citrus', '🍓 Fruity', '🧁 Gourmand',
        '🌿 Herbal', '🌶️ Spicy', '🧼 Clean/Spa', '🌍 Earthy',
        '🌲 Woodsy', '🌊 Ocean'
      ]
    },
    {
      id: 'purpose-mood',
      name: 'Purpose/Mood',
      emoji: '😌',
      tags: [
        '😴 Sleep/Calming', '🧘 Meditation', '💪 Focus', '☀️ Uplifting',
        '🛁 Self-Care', '😌 Relaxing', '⚡ Energizing', '💝 Romantic'
      ]
    },
    {
      id: 'occasions',
      name: 'Occasions/Events',
      emoji: '🎉',
      tags: [
        '💍 Wedding', '🎂 Birthday', '💝 Anniversary', 
        '👶 Baby Shower', '🏠 Housewarming', '🎄 Holiday'
      ]
    },
    {
      id: 'target-audience',
      name: 'Target Audience',
      emoji: '👥',
      tags: ['👔 Men\'s', '👗 Women\'s', '⚖️ Unisex', '🐕 Pet-Friendly']
    },
    {
      id: 'scent-strength',
      name: 'Scent Strength',
      emoji: '💨',
      tags: ['💪 Strong', '⚖️ Medium', '🕊️ Light/Subtle']
    },
    {
      id: 'business-status',
      name: 'Business Status',
      emoji: '⭐',
      tags: [
        '⭐ Bestseller', '✨ New', '🔥 Limited Edition',
        '👑 Signature', '🧪 Testing'
      ]
    },
    {
      id: 'price-tier',
      name: 'Price Tier',
      emoji: '💰',
      tags: ['💵 Budget', '💎 Premium', '👑 Luxury']
    },
    {
      id: 'room-environment',
      name: 'Room/Environment',
      emoji: '🏠',
      tags: [
        '🛏️ Bedroom', '🛁 Bathroom', '🍳 Kitchen',
        '🛋️ Living Room', '💼 Office'
      ]
    },
    {
      id: 'time-of-day',
      name: 'Time of Day',
      emoji: '🕐',
      tags: ['🌅 Morning', '🌞 Afternoon', '🌙 Evening']
    },
    {
      id: 'color-aesthetic',
      name: 'Color/Aesthetic',
      emoji: '🎨',
      tags: ['🎨 Colorful', '⚪ Neutral', '⚫ Dark/Moody', '🌈 Pastel']
    }
  ]

  // Profit calculations based on selected vessel
  const selectedVesselCalc = vesselCalculations[profitCalc.selectedVesselIndex]?.calc || vesselCalculations[0].calc
  const profitPerUnit = profitCalc.sellingPrice - selectedVesselCalc.totalCost
  const profitMargin = selectedVesselCalc.totalCost > 0 ? ((profitPerUnit / selectedVesselCalc.totalCost) * 100) : 0
  const totalProfit = profitPerUnit * profitCalc.quantity
  const totalRevenue = profitCalc.sellingPrice * profitCalc.quantity
  const totalCost = selectedVesselCalc.totalCost * profitCalc.quantity

  // Profit color coding
  const getProfitColor = (profit: number) => {
    if (profit < 5) return 'text-red-600'
    if (profit < 15) return 'text-orange-600'
    return 'text-green-600'
  }

  // Get largest and smallest vessels by volume
  const largestVessel = vesselCalculations.reduce((max, vc) => 
    vc.calc.fullVolume > max.calc.fullVolume ? vc : max, vesselCalculations[0]
  )
  const smallestVessel = vesselCalculations.reduce((min, vc) => 
    vc.calc.fullVolume < min.calc.fullVolume ? vc : min, vesselCalculations[0]
  )

  // Force console log to verify version
  useEffect(() => {
    console.log('🚀 VESSEL CALCULATOR LOADED - BUILD: 2025-12-09-20:45')
    console.log('📊 Total Vessels:', vessels.length)
    console.log('🏺 Vessels:', vessels.map(v => v.name))
  }, [])

  // Initialize recipe database
  useEffect(() => {
    const initialRecipes: Recipe[] = [
      // Your saved candles will appear here too
      { id: 1, name: "Romantic Rose Garden", profile: "Floral", ingredients: {Rose: 40, Jasmine: 30, Vanilla: 20, Sandalwood: 10}, audience: "Women's" },
      { id: 2, name: "Lavender Dream", profile: "Floral", ingredients: {Lavender: 50, Chamomile: 20, Vanilla: 20, Cedarwood: 10}, purpose: "Sleep/Calming", audience: "Unisex" },
      { id: 3, name: "Sunshine Burst", profile: "Citrus", ingredients: {"Sweet Orange": 40, Lemon: 30, Grapefruit: 20, Bergamot: 10}, purpose: "Uplifting", audience: "Unisex" },
      { id: 4, name: "Berry Bliss", profile: "Fruity", ingredients: {Strawberry: 35, Raspberry: 25, Blueberry: 20, Vanilla: 20}, audience: "Women's" },
      { id: 5, name: "Vanilla Bean", profile: "Gourmand", ingredients: {Vanilla: 60, Cream: 20, Caramel: 15, Sugar: 5}, audience: "Women's" },
      { id: 6, name: "Spa Retreat", profile: "Herbal", ingredients: {Eucalyptus: 40, Mint: 30, Sage: 20, Lavender: 10}, purpose: "Self-Care", audience: "Unisex" },
      { id: 7, name: "Cinnamon Spice", profile: "Spicy", ingredients: {Cinnamon: 40, Clove: 25, Nutmeg: 20, Vanilla: 15}, audience: "Unisex" },
      { id: 8, name: "Fresh Linen", profile: "Clean/Spa", ingredients: {Cotton: 40, Linen: 30, Lavender: 20, Vanilla: 10}, audience: "Unisex" },
      { id: 9, name: "Forest Walk", profile: "Earthy", ingredients: {Cedarwood: 35, Pine: 30, Moss: 20, Sandalwood: 15}, audience: "Men's" },
      { id: 10, name: "Ocean Breeze", profile: "Clean/Spa", ingredients: {"Sea Salt": 35, Ozone: 30, Jasmine: 20, Driftwood: 15}, audience: "Unisex" },
    ]
    setRecipes(initialRecipes)
  }, [])

  // Update recipes when saved candles change - convert saved candles to recipes
  useEffect(() => {
    const userRecipes: Recipe[] = savedCandles.map((candle, idx) => {
      const ingredients: { [key: string]: number } = {}
      const percentPerScent = candle.scentCount > 0 ? Math.floor(100 / candle.scentCount) : 100
      let remaining = 100
      
      candle.scentNames.forEach((scent, i) => {
        if (i === candle.scentNames.length - 1) {
          ingredients[scent] = remaining
        } else {
          ingredients[scent] = percentPerScent
          remaining -= percentPerScent
        }
      })

      // Extract category info from tags
      const profile = candle.tags?.find(t => t.includes('Floral') || t.includes('Citrus') || t.includes('Fruity') || t.includes('Gourmand') || t.includes('Herbal') || t.includes('Spicy') || t.includes('Clean') || t.includes('Earthy'))?.replace(/🌺|🍊|🍓|🧁|🌿|🌶️|🧼|🌍/g, '').trim()
      const purpose = candle.tags?.find(t => t.includes('Sleep') || t.includes('Meditation') || t.includes('Focus') || t.includes('Uplifting') || t.includes('Self-Care'))?.replace(/😴|🧘|💪|☀️|🛁/g, '').trim()
      const audience = candle.tags?.find(t => t.includes("Men's") || t.includes("Women's") || t.includes('Unisex') || t.includes('Pet-Friendly'))?.replace(/👔|👗|⚖️|🐕/g, '').trim()

      return {
        id: 1000 + idx,
        name: candle.name,
        profile,
        purpose,
        audience,
        ingredients,
        isUserRecipe: true
      }
    })

    // Merge with initial recipes
    setRecipes(prev => {
      const baseRecipes = prev.filter(r => !r.isUserRecipe)
      return [...userRecipes, ...baseRecipes]
    })
  }, [savedCandles])

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchTerm === '' || 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(recipe.ingredients).some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === '' || 
      (categoryFilter === 'Scent Profile' && recipe.profile) ||
      (categoryFilter === 'Purpose/Mood' && recipe.purpose) ||
      (categoryFilter === 'Target Audience' && recipe.audience)
    
    const matchesScent = scentFilter === '' || recipe.profile === scentFilter
    const matchesAudience = audienceFilter === '' || recipe.audience === audienceFilter
    const matchesPurpose = purposeFilter === '' || recipe.purpose === purposeFilter

    return matchesSearch && matchesCategory && matchesScent && matchesAudience && matchesPurpose
  })

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('')
    setScentFilter('')
    setAudienceFilter('')
    setPurposeFilter('')
  }

  // Copy recipe to clipboard
  const copyRecipe = (recipe: Recipe) => {
    let text = `${recipe.name}\n\nIngredients:\n`
    for (const [ingredient, percent] of Object.entries(recipe.ingredients)) {
      text += `- ${ingredient}: ${percent}%\n`
    }
    text += `\nTotal: 100%`
    
    navigator.clipboard.writeText(text)
  }

  // Load recipe into Custom Candle Calculator
  const loadRecipeToCalculator = (recipe: Recipe) => {
    setCandleName(recipe.name)
    const scents = Object.keys(recipe.ingredients)
    setScentCount(scents.length)
    setScentNames(scents)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* UPDATED VERSION - 6 VESSELS */}
        <div className="mb-4 p-4 bg-green-100 border-2 border-green-500 rounded-lg text-center">
          <p className="text-green-900 font-bold text-xl">✅ NEW VERSION LOADED - 6 VESSELS ACTIVE - {new Date().toLocaleString()}</p>
        </div>
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/limen-lakay-logo.png" 
              alt="Limen Lakay Logo" 
              width={60} 
              height={60}
              className="object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                🏺 Vessel Cost Calculator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Calculate production costs for {vessels.length} vessel styles • Updated v2.0
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin-price-calculator"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🕯️ Candle Calculator
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
            >
              ← Home
            </Link>
          </div>
        </div>

        {/* Material Prices Section */}
        <Card className="mb-6 border-4 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
              ⚙️ Material Prices & Settings (Editable)
            </CardTitle>
            <p className="text-blue-700 dark:text-blue-300 mt-2 text-sm">
              Update prices anytime - all calculations update automatically!
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="waxType" className="text-blue-900 dark:text-blue-100 font-semibold block mb-2">
                  Wax Type
                </Label>
                <select
                  id="waxType"
                  value={materialPrices.waxType}
                  onChange={(e) => handleMaterialChange('waxType', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-200 dark:border-blue-700 rounded-md text-sm font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="soy">Soy Wax 454 (0.9 g/cm³)</option>
                  <option value="coconut">Coconut Apricot (0.92 g/cm³)</option>
                </select>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="waxPrice" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Wax Price per Pound
                </Label>
                <Input
                  id="waxPrice"
                  type="number"
                  step="0.01"
                  value={materialPrices.waxPricePerLb}
                  onChange={(e) => handleMaterialChange('waxPricePerLb', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  $ per lb (453.6g)
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="fragrancePrice" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Fragrance Price per 16oz
                </Label>
                <Input
                  id="fragrancePrice"
                  type="number"
                  step="0.01"
                  value={materialPrices.fragrancePricePerLb}
                  onChange={(e) => handleMaterialChange('fragrancePricePerLb', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  $ per bottle (453.6g)
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="cementPrice" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Cement Price per Pound
                </Label>
                <Input
                  id="cementPrice"
                  type="number"
                  step="0.01"
                  value={materialPrices.cementPricePerLb}
                  onChange={(e) => handleMaterialChange('cementPricePerLb', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  $ per lb (453.6g)
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="wickPrice" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Wick Price Each
                </Label>
                <Input
                  id="wickPrice"
                  type="number"
                  step="0.01"
                  value={materialPrices.wickPrice}
                  onChange={(e) => handleMaterialChange('wickPrice', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  $ per wick
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="paintPrice" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Paint/Dye per Vessel
                </Label>
                <Input
                  id="paintPrice"
                  type="number"
                  step="0.01"
                  value={materialPrices.paintPrice}
                  onChange={(e) => handleMaterialChange('paintPrice', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  $ per vessel
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="fillPercent" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Fill Percentage
                </Label>
                <Input
                  id="fillPercent"
                  type="number"
                  min="1"
                  max="100"
                  value={materialPrices.fillPercent}
                  onChange={(e) => handleMaterialChange('fillPercent', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  % of vessel volume
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="fragranceLoad" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Fragrance Load
                </Label>
                <Input
                  id="fragranceLoad"
                  type="number"
                  min="1"
                  max="15"
                  value={materialPrices.fragranceLoad}
                  onChange={(e) => handleMaterialChange('fragranceLoad', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  % of wax weight
                </p>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-5 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
              <h3 className="text-yellow-900 dark:text-yellow-100 font-bold text-lg mb-3">
                📐 Calculation Formulas Used
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p><strong className="text-yellow-800 dark:text-yellow-200">Volume:</strong> π × r² × h × (fill % / 100)</p>
                <p><strong className="text-yellow-800 dark:text-yellow-200">Wax Weight:</strong> Volume (cm³) × Wax Density (g/cm³)</p>
                <p><strong className="text-yellow-800 dark:text-yellow-200">Fragrance Weight:</strong> Wax Weight × (Fragrance Load % / 100)</p>
                <p><strong className="text-yellow-800 dark:text-yellow-200">Cement Weight:</strong> Full Vessel Volume × 2.4 g/cm³</p>
                <p><strong className="text-yellow-800 dark:text-yellow-200">Costs:</strong> (Material Weight / 453.6g) × Price per Pound</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Candle Cost Calculator */}
        <Card className="mb-6 border-4 border-pink-300 dark:border-pink-700">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-100 dark:from-pink-950 dark:to-rose-900">
            <CardTitle className="text-2xl text-pink-900 dark:text-pink-100">
              🕯️ Custom Candle Cost Calculator
            </CardTitle>
            <p className="text-pink-700 dark:text-pink-300 mt-2 text-sm">
              Calculate costs for candles with multiple scents
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <Label htmlFor="candleName" className="text-pink-900 dark:text-pink-100 font-semibold text-base">
                  Candle Name
                </Label>
                <Input
                  id="candleName"
                  type="text"
                  value={candleName}
                  onChange={(e) => setCandleName(e.target.value)}
                  placeholder="e.g., Tropical Paradise, Ocean Breeze..."
                  className="mt-2 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="scentCount" className="text-pink-900 dark:text-pink-100 font-semibold text-base">
                  Number of Scents
                </Label>
                <Input
                  id="scentCount"
                  type="number"
                  min="1"
                  max="10"
                  value={scentCount}
                  onChange={(e) => handleScentCountChange(parseInt(e.target.value) || 1)}
                  className="mt-2 text-lg font-bold"
                />
              </div>
            </div>

            {/* Scent Names Input */}
            <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border-2 border-purple-300 dark:border-purple-700">
              <Label className="text-purple-900 dark:text-purple-100 font-bold text-lg mb-4 flex items-center gap-2">
                🌸 Scent Names & Details
                <span className="text-sm font-normal text-purple-700 dark:text-purple-300">
                  (Specify each scent in your blend)
                </span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: scentCount }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Label htmlFor={`scent-${index}`} className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 block">
                      Scent #{index + 1}
                    </Label>
                    <Input
                      id={`scent-${index}`}
                      type="text"
                      value={scentNames[index] || ''}
                      onChange={(e) => handleScentNameChange(index, e.target.value)}
                      placeholder={index === 0 ? 'e.g., Vanilla' : index === 1 ? 'e.g., Lavender' : 'e.g., Rose'}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rating System */}
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg border-2 border-amber-300 dark:border-amber-700">
              <Label className="text-amber-900 dark:text-amber-100 font-bold text-lg mb-4 flex items-center gap-2">
                ⭐ Recipe Rating
                <span className="text-sm font-normal text-amber-700 dark:text-amber-300">
                  (Rate the overall quality)
                </span>
              </Label>
              <div className="flex gap-3 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCandleRating(candleRating === star ? 0 : star)}
                    className={`text-4xl transition-all transform hover:scale-110 ${
                      star <= candleRating 
                        ? 'text-yellow-500 drop-shadow-lg' 
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
                {candleRating > 0 && (
                  <span className="ml-3 text-lg font-semibold text-amber-700 dark:text-amber-300">
                    {candleRating} / 5 stars
                  </span>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <Label htmlFor="candleNotes" className="text-blue-900 dark:text-blue-100 font-bold text-lg mb-4 flex items-center gap-2">
                📝 Recipe Notes
                <span className="text-sm font-normal text-blue-700 dark:text-blue-300">
                  (Performance, scent throw, burn time, improvements)
                </span>
              </Label>
              <textarea
                id="candleNotes"
                value={candleNotes}
                onChange={(e) => setCandleNotes(e.target.value)}
                placeholder="e.g., Strong cold throw, burns evenly for 6 hours, could use less fragrance oil next time..."
                className="w-full min-h-[100px] p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                rows={4}
              />
            </div>

            {/* Tags Section */}
            <div className="mb-6 bg-teal-50 dark:bg-teal-900/20 p-5 rounded-lg border-2 border-teal-300 dark:border-teal-700">
              <Label className="text-teal-900 dark:text-teal-100 font-bold text-lg mb-4 flex items-center gap-2">
                🏷️ Category Tags
                <span className="text-sm font-normal text-teal-700 dark:text-teal-300">
                  (Select all that apply)
                </span>
              </Label>
              
              {/* Selected Tags Summary */}
              {candleTags.length > 0 && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-teal-400 dark:border-teal-600">
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
                    Selected ({candleTags.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candleTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Categories Accordion */}
              <div className="space-y-2">
                {tagCategories.map((category) => {
                  const isExpanded = expandedCategories.includes(category.id)
                  const selectedInCategory = candleTags.filter(tag => 
                    category.tags.includes(tag)
                  ).length

                  return (
                    <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 border-teal-200 dark:border-teal-800 overflow-hidden">
                      {/* Category Header */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{category.emoji}</span>
                          <span className="font-semibold text-teal-900 dark:text-teal-100">
                            {category.name}
                          </span>
                          {selectedInCategory > 0 && (
                            <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                              {selectedInCategory}
                            </span>
                          )}
                        </div>
                        <span className={`text-teal-600 dark:text-teal-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {/* Category Tags */}
                      {isExpanded && (
                        <div className="p-3 pt-0 border-t border-teal-200 dark:border-teal-800">
                          <div className="flex flex-wrap gap-2 pt-3">
                            {category.tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
                                  candleTags.includes(tag)
                                    ? 'bg-teal-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-700 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 hover:border-teal-500'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl border-2 border-pink-300 dark:border-pink-700 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">🏗️ Cement:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">${materialPrices.cementPricePerLb.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">🎨 Paint:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">${materialPrices.paintPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">🌸 Scent (${(materialPrices.fragrancePricePerLb * 0.1).toFixed(2)} × {scentCount}):</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">${((materialPrices.fragrancePricePerLb * 0.1) * scentCount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-pink-400 dark:border-pink-600 w-full">
                    <div className="text-sm text-pink-700 dark:text-pink-300 font-semibold mb-2">
                      TOTAL COST
                    </div>
                    <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                      ${(materialPrices.cementPricePerLb + materialPrices.paintPrice + (materialPrices.fragrancePricePerLb * 0.1 * scentCount)).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {scentCount} scent{scentCount > 1 ? 's' : ''} blend
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={saveCustomCandle}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                💾 Save This Candle Recipe
              </button>
            </div>

            {/* Saved Candles List */}
            {savedCandles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-pink-900 dark:text-pink-100 mb-4">
                  📋 Saved Candle Recipes ({savedCandles.length})
                </h3>
                <div className="space-y-3">
                  {savedCandles.map((candle) => (
                    <div
                      key={candle.id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                              {candle.name}
                            </h4>
                            <span className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-sm font-semibold">
                              {candle.scentCount} scent{candle.scentCount > 1 ? 's' : ''}
                            </span>
                            {/* Rating Display */}
                            {candle.rating && candle.rating > 0 && (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: candle.rating }).map((_, i) => (
                                  <span key={i} className="text-yellow-500 text-lg">★</span>
                                ))}
                                <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                                  ({candle.rating}/5)
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Scent Names Display */}
                          {candle.scentNames && candle.scentNames.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {candle.scentNames.map((scentName, idx) => (
                                <span
                                  key={idx}
                                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-300 dark:border-purple-700"
                                >
                                  🌸 {scentName}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Tags Display */}
                          {candle.tags && candle.tags.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {candle.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-semibold border border-teal-300 dark:border-teal-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Notes Display */}
                          {candle.notes && (
                            <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                📝 Notes:
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                {candle.notes}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>💰 Cost: <strong className="text-pink-600 dark:text-pink-400 text-base">${candle.cost.toFixed(2)}</strong></span>
                            <span>📅 {candle.dateCreated}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadCandleTemplate(candle)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold whitespace-nowrap"
                            title="Load this recipe as a template"
                          >
                            📝 Load
                          </button>
                          <button
                            onClick={() => deleteCandle(candle.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                            title="Delete this recipe"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipe Database */}
        <Card className="mb-6 border-4 border-indigo-300 dark:border-indigo-700">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-100 dark:from-indigo-950 dark:to-purple-900">
            <CardTitle className="text-2xl text-indigo-900 dark:text-indigo-100">
              🔍 Searchable Recipe Database
            </CardTitle>
            <p className="text-indigo-700 dark:text-indigo-300 mt-2 text-sm">
              Search, filter & discover perfect scent combinations • Your saved recipes appear here automatically
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search Box */}
              <div>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Search recipes by name or ingredient..."
                  className="w-full text-lg py-6"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-indigo-900 dark:text-indigo-100 font-semibold mb-2 block">Category</Label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Categories</option>
                    <option value="Scent Profile">Scent Profile</option>
                    <option value="Purpose/Mood">Purpose/Mood</option>
                    <option value="Target Audience">Target Audience</option>
                  </select>
                </div>

                <div>
                  <Label className="text-indigo-900 dark:text-indigo-100 font-semibold mb-2 block">Scent Type</Label>
                  <select
                    value={scentFilter}
                    onChange={(e) => setScentFilter(e.target.value)}
                    className="w-full p-2 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Scents</option>
                    <option value="Floral">Floral</option>
                    <option value="Citrus">Citrus</option>
                    <option value="Fruity">Fruity</option>
                    <option value="Gourmand">Gourmand</option>
                    <option value="Herbal">Herbal</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Clean/Spa">Clean/Spa</option>
                    <option value="Earthy">Earthy</option>
                  </select>
                </div>

                <div>
                  <Label className="text-indigo-900 dark:text-indigo-100 font-semibold mb-2 block">Target Audience</Label>
                  <select
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value)}
                    className="w-full p-2 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All</option>
                    <option value="Men's">Men's</option>
                    <option value="Women's">Women's</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Pet-Friendly">Pet-Friendly</option>
                  </select>
                </div>

                <div>
                  <Label className="text-indigo-900 dark:text-indigo-100 font-semibold mb-2 block">Purpose</Label>
                  <select
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                    className="w-full p-2 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">All Purposes</option>
                    <option value="Sleep/Calming">Sleep/Calming</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Focus">Focus/Productivity</option>
                    <option value="Uplifting">Uplifting</option>
                    <option value="Self-Care">Self-Care/Spa</option>
                  </select>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                </span>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white dark:bg-gray-800 border-3 border-indigo-200 dark:border-indigo-800 rounded-xl p-5 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => {
                      setSelectedRecipe(recipe)
                      setEditingRecipe({ ...recipe })
                      setShowRecipeModal(true)
                    }}
                  >
                    {/* Top colored bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
                    
                    {/* User Recipe Badge */}
                    {recipe.isUserRecipe && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ YOUR RECIPE
                      </div>
                    )}

                    {/* Recipe Name */}
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 mt-2">
                      {recipe.name}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.profile && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-semibold">
                          {recipe.profile}
                        </span>
                      )}
                      {recipe.purpose && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-semibold">
                          {recipe.purpose}
                        </span>
                      )}
                      {recipe.audience && (
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-semibold">
                          {recipe.audience}
                        </span>
                      )}
                    </div>

                    {/* Ingredients */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-2">
                      {Object.entries(recipe.ingredients).map(([ingredient, percent]) => (
                        <div key={ingredient} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{percent}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyRecipe(recipe)
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadRecipeToCalculator(recipe)
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        📝 Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">No Recipes Found</h3>
                <p className="text-gray-500 dark:text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Recipe Modal */}
            {showRecipeModal && selectedRecipe && editingRecipe && (
              <div
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setShowRecipeModal(false)
                  setEditingRecipe(null)
                }}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl relative">
                    <Input
                      value={editingRecipe.name}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                      className="text-2xl font-bold mb-2 bg-white/20 border-white/40 text-white placeholder:text-white/70"
                      placeholder="Recipe name..."
                    />
                    {selectedRecipe.isUserRecipe && (
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ YOUR RECIPE
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setShowRecipeModal(false)
                        setEditingRecipe(null)
                      }}
                      className="absolute top-4 right-4 bg-white text-indigo-600 w-10 h-10 rounded-full font-bold text-xl hover:bg-gray-100 transition-all"
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                      <p className="text-blue-900 dark:text-blue-100 text-sm font-semibold">
                        ✏️ Edit Mode: Click ingredient names and percentages to modify. Add new ingredients or adjust existing ones!
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {editingRecipe.profile && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                          {editingRecipe.profile}
                        </span>
                      )}
                      {editingRecipe.purpose && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                          {editingRecipe.purpose}
                        </span>
                      )}
                      {editingRecipe.audience && (
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full text-sm font-semibold">
                          {editingRecipe.audience}
                        </span>
                      )}
                    </div>

                    {/* Editable Ingredients */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Ingredients</h3>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total: {Object.values(editingRecipe.ingredients).reduce((a, b) => a + b, 0)}%
                        </span>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(editingRecipe.ingredients).map(([ingredient, percent], idx) => (
                          <div key={idx} className="flex gap-2 items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <Input
                              value={ingredient}
                              onChange={(e) => {
                                const newIngredients = { ...editingRecipe.ingredients }
                                delete newIngredients[ingredient]
                                newIngredients[e.target.value] = percent
                                setEditingRecipe({ ...editingRecipe, ingredients: newIngredients })
                              }}
                              className="flex-1 text-sm"
                              placeholder="Ingredient name"
                            />
                            <Input
                              type="number"
                              value={percent}
                              onChange={(e) => {
                                const newIngredients = { ...editingRecipe.ingredients }
                                newIngredients[ingredient] = parseInt(e.target.value) || 0
                                setEditingRecipe({ ...editingRecipe, ingredients: newIngredients })
                              }}
                              className="w-20 text-sm font-bold text-indigo-600 dark:text-indigo-400"
                              min="0"
                              max="100"
                            />
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">%</span>
                            <button
                              onClick={() => {
                                const newIngredients = { ...editingRecipe.ingredients }
                                delete newIngredients[ingredient]
                                setEditingRecipe({ ...editingRecipe, ingredients: newIngredients })
                              }}
                              className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                              title="Remove ingredient"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add New Ingredient */}
                      <button
                        onClick={() => {
                          const newIngredients = { ...editingRecipe.ingredients }
                          newIngredients['New Ingredient'] = 10
                          setEditingRecipe({ ...editingRecipe, ingredients: newIngredients })
                        }}
                        className="mt-4 w-full py-2 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                      >
                        + Add Ingredient
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          copyRecipe(editingRecipe)
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => {
                          loadRecipeToCalculator(editingRecipe)
                          setShowRecipeModal(false)
                          setEditingRecipe(null)
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-all"
                      >
                        📝 Load to Calculator
                      </button>
                      <button
                        onClick={() => {
                          // Save edited recipe to recipes list
                          setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? editingRecipe : r))
                          setShowRecipeModal(false)
                          setEditingRecipe(null)
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all"
                      >
                        💾 Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vessels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6 mb-8">
          {vesselCalculations.map(({ vessel, calc }) => {
            const diameterDisplay = vessel.unit === 'cm' ? `${vessel.diameter}cm` : `${vessel.diameter}"`
            const heightDisplay = vessel.unit === 'cm' ? `${vessel.height}cm` : `${vessel.height}"`
            
            return (
              <Card 
                key={vessel.id}
                className="border-3 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-t-lg" />
                
                <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex justify-between items-center mb-3">
                    <div className="bg-amber-600 text-white px-3 py-1.5 rounded-full font-bold text-sm">
                      {vessel.name}
                    </div>
                    <div className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                      {calc.volumeOz.toFixed(1)} oz
                    </div>
                  </div>
                  
                  {/* Vessel Image */}
                  {vessel.imageName && (
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg flex items-center justify-center mb-3 min-h-[180px]">
                      <Image
                        src={`/images/${vessel.imageName}`}
                        alt={vessel.name}
                        width={160}
                        height={160}
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-4">
                  {/* Dimensions */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-3 border-2 border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      📏 Dimensions
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Diameter:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{diameterDisplay}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Height:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{heightDisplay}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{calc.fullVolume.toFixed(0)} cm³</span>
                      </div>
                    </div>
                  </div>

                  {/* Materials Required */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-3 border-2 border-green-300 dark:border-green-700">
                    <h4 className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wider mb-2">
                      ⚖️ Materials (Grams)
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs bg-white dark:bg-gray-800 p-1.5 rounded">
                        <span className="text-gray-600 dark:text-gray-400">🕯️ Wax</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{calc.waxWeight.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-white dark:bg-gray-800 p-1.5 rounded">
                        <span className="text-gray-600 dark:text-gray-400">🌸 Fragrance</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{calc.fragranceWeight.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-white dark:bg-gray-800 p-1.5 rounded">
                        <span className="text-gray-600 dark:text-gray-400">🏗️ Cement</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{calc.cementWeight.toFixed(0)}g</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-white dark:bg-gray-800 p-1.5 rounded">
                        <span className="text-gray-600 dark:text-gray-400">🧵 Wicks</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{calc.wicksNeeded}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-3 border-2 border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                      💵 Cost Breakdown
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs pb-1 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">Wax</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">${calc.waxCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pb-1 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">Fragrance</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">${calc.fragranceCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pb-1 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">Cement</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">${calc.cementCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pb-1 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">Wicks</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">${calc.wickCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Paint/Dye</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">${calc.paintCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-3 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">TOTAL COST</span>
                      <span className="font-bold text-xl">${calc.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary Section */}
        <Card className="mb-8 border-4 border-amber-300 dark:border-amber-700">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900">
            <CardTitle className="text-2xl text-center text-amber-900 dark:text-amber-100">
              📊 Comparison Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-amber-700 text-white">
                    <th className="p-3 text-left font-bold text-sm">Vessel</th>
                    <th className="p-3 text-left font-bold text-sm">Dimensions</th>
                    <th className="p-3 text-left font-bold text-sm">Wax (g)</th>
                    <th className="p-3 text-left font-bold text-sm">Fragrance (g)</th>
                    <th className="p-3 text-left font-bold text-sm">Cement (g)</th>
                    <th className="p-3 text-left font-bold text-sm">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {vesselCalculations.map(({ vessel, calc }) => {
                    const diameterDisplay = vessel.unit === 'cm' ? `${vessel.diameter}cm` : `${vessel.diameter}"`
                    const heightDisplay = vessel.unit === 'cm' ? `${vessel.height}cm` : `${vessel.height}"`
                    
                    return (
                      <tr 
                        key={vessel.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3">
                          <strong className="text-gray-900 dark:text-gray-100">{vessel.name}</strong>
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                          {diameterDisplay} × {heightDisplay}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                          {calc.waxWeight.toFixed(1)}g
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                          {calc.fragranceWeight.toFixed(1)}g
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                          {calc.cementWeight.toFixed(0)}g
                        </td>
                        <td className="p-3">
                          <strong className="text-amber-600 dark:text-amber-400 text-base">
                            ${calc.totalCost.toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Vessels
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {vessels.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  total options
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Largest ({largestVessel.vessel.name})
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {largestVessel.calc.volumeOz.toFixed(1)} oz
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  volume
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Smallest ({smallestVessel.vessel.name})
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {smallestVessel.calc.volumeOz.toFixed(1)} oz
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  volume
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Avg Cost
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  ${(vesselCalculations.reduce((sum, vc) => sum + vc.calc.totalCost, 0) / vesselCalculations.length).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  per vessel
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Calculator */}
        <Card className="border-4 border-green-300 dark:border-green-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
            <CardTitle className="text-2xl text-center text-green-900 dark:text-green-100">
              💰 Profit Calculator
            </CardTitle>
            <p className="text-center text-green-700 dark:text-green-300 mt-2">
              Calculate your profit based on selling price
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-green-200 dark:border-green-800">
                <Label htmlFor="profitVessel" className="text-green-900 dark:text-green-100 font-bold mb-2 block">
                  Select Vessel
                </Label>
                <select
                  id="profitVessel"
                  value={profitCalc.selectedVesselIndex}
                  onChange={(e) => handleProfitChange('selectedVesselIndex', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-green-200 dark:border-green-700 rounded-md text-sm font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {vesselCalculations.map(({ vessel }, index) => (
                    <option key={vessel.id} value={index}>
                      {vessel.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Cost: ${selectedVesselCalc.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-green-200 dark:border-green-800">
                <Label htmlFor="sellingPrice" className="text-green-900 dark:text-green-100 font-bold">
                  Your Selling Price ($)
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={profitCalc.sellingPrice}
                  onChange={(e) => handleProfitChange('sellingPrice', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-green-200 dark:border-green-800">
                <Label htmlFor="quantity" className="text-green-900 dark:text-green-100 font-bold">
                  Quantity to Sell
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  value={profitCalc.quantity}
                  onChange={(e) => handleProfitChange('quantity', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border-2 border-green-200 dark:border-green-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-300 font-bold uppercase mb-2">
                    Cost Per Unit
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${selectedVesselCalc.totalCost.toFixed(2)}
                  </div>
                </div>

                <div className="text-center bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-300 font-bold uppercase mb-2">
                    Profit Per Unit
                  </div>
                  <div className={`text-3xl font-bold ${getProfitColor(profitPerUnit)}`}>
                    ${profitPerUnit.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {profitMargin.toFixed(0)}% margin
                  </div>
                </div>

                <div className="text-center bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-300 font-bold uppercase mb-2">
                    Total Profit
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${totalProfit.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {profitCalc.quantity} units
                  </div>
                </div>

                <div className="text-center bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-300 font-bold uppercase mb-2">
                    Total Revenue
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${totalRevenue.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t-2 border-dashed border-green-300 dark:border-green-700">
                Total Cost for {profitCalc.quantity} units: <span className="font-bold text-gray-900 dark:text-gray-100">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Recommendations and Important Notes */}
        <div className="mt-8 space-y-6">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-yellow-500 p-6 rounded-lg">
            <div className="font-bold text-yellow-900 dark:text-yellow-100 text-lg mb-3">
              💡 Pricing Recommendations:
            </div>
            <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <p>• <strong>Wholesale (Bulk Orders):</strong> Consider ${(selectedVesselCalc.totalCost * 2.5).toFixed(2)}-${(selectedVesselCalc.totalCost * 3.7).toFixed(2)} per vessel (2.5x-3.7x markup)</p>
              <p>• <strong>Retail (Individual):</strong> Consider ${(selectedVesselCalc.totalCost * 5).toFixed(2)}-${(selectedVesselCalc.totalCost * 7).toFixed(2)} per vessel (5x-7x markup)</p>
              <p>• <strong>Premium/Custom:</strong> Consider ${(selectedVesselCalc.totalCost * 8).toFixed(2)}-${(selectedVesselCalc.totalCost * 12).toFixed(2)} per vessel (8x-12x markup)</p>
              <p className="text-sm italic">• <strong>Don&apos;t forget:</strong> Add labor costs, overhead, packaging, and marketing to your pricing!</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
            <div className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-3">
              📝 Important Notes:
            </div>
            <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <p>• All calculations use actual cylindrical volume formulas (π × r² × h)</p>
              <p>• Wax amounts include {materialPrices.fillPercent}% fill to prevent overflow</p>
              <p>• Fragrance is calculated at {materialPrices.fragranceLoad}% of wax weight</p>
              <p>• Cement weight is for the vessel mold itself</p>
              <p>• Material densities: Soy (0.9 g/cm³), Coconut Apricot (0.92 g/cm³), Cement (2.4 g/cm³)</p>
              <p>• Update prices above anytime they change - all calculations update automatically!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
