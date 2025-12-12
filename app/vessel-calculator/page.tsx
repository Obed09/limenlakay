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
  const [showNewRecipeModal, setShowNewRecipeModal] = useState(false)

  // Batch Production
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchRecipe, setBatchRecipe] = useState<Recipe | null>(null)
  const [batchQuantity, setBatchQuantity] = useState(100)
  const [batchVesselIndex, setBatchVesselIndex] = useState(0)

  // Inventory Management
  const [inventory, setInventory] = useState({
    waxLbs: 50,
    fragranceOilLbs: 10,
    cementLbs: 25,
    wicks: 500,
    paint: 100,
  })
  const [showInventoryManager, setShowInventoryManager] = useState(false)

  // Pricing Wizard
  const [showPricingWizard, setShowPricingWizard] = useState(false)
  const [pricingVesselIndex, setPricingVesselIndex] = useState(0)
  const [targetMargin, setTargetMargin] = useState(60) // 60% profit margin
  const [marketPosition, setMarketPosition] = useState<'budget' | 'mid-range' | 'premium' | 'luxury'>('mid-range')

  // Label Generator
  const [showLabelGenerator, setShowLabelGenerator] = useState(false)
  const [labelRecipe, setLabelRecipe] = useState<Recipe | null>(null)
  const [labelVesselIndex, setLabelVesselIndex] = useState(0)
  const [labelTemplate, setLabelTemplate] = useState<'modern' | 'vintage' | 'minimalist' | 'luxury'>('modern')
  const [labelBrandName, setLabelBrandName] = useState('Limen Lakay')
  const [labelBurnTime, setLabelBurnTime] = useState('40-50 hours')
  const [labelBatchSize, setLabelBatchSize] = useState(1)

  // Production Scheduler
  interface ProductionOrder {
    id: string
    customerName: string
    recipeName: string
    quantity: number
    vesselIndex: number
    dueDate: string
    status: 'pending' | 'in-progress' | 'completed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    notes: string
  }

  const [showScheduler, setShowScheduler] = useState(false)
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      recipeName: 'Lavender Dream',
      quantity: 50,
      vesselIndex: 0,
      dueDate: '2025-12-20',
      status: 'pending',
      priority: 'high',
      notes: 'Holiday gift order'
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      recipeName: 'Vanilla Bliss',
      quantity: 100,
      vesselIndex: 1,
      dueDate: '2025-12-25',
      status: 'in-progress',
      priority: 'urgent',
      notes: 'Christmas wholesale order'
    }
  ])
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)
  const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
    customerName: '',
    recipeName: '',
    quantity: 10,
    vesselIndex: 0,
    dueDate: '',
    status: 'pending',
    priority: 'medium',
    notes: ''
  })

  // Cost Analysis & Profitability Dashboard
  const [showCostAnalysis, setShowCostAnalysis] = useState(false)
  const [analysisVesselIndex, setAnalysisVesselIndex] = useState(0)
  const [sellingPrice, setSellingPrice] = useState(25.00)
  const [monthlyOverhead, setMonthlyOverhead] = useState(500) // Rent, utilities, insurance
  const [laborHourlyRate, setLaborHourlyRate] = useState(15)
  const [laborHoursPerUnit, setLaborHoursPerUnit] = useState(0.5) // 30 minutes per candle
  const [monthlySalesGoal, setMonthlySalesGoal] = useState(200)

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
      // FLORAL
      { id: 1, name: "Romantic Rose Garden", profile: "Floral", ingredients: {Rose: 40, Jasmine: 30, Vanilla: 20, Sandalwood: 10}, audience: "Women's" },
      { id: 2, name: "Lavender Dream", profile: "Floral", ingredients: {Lavender: 50, Chamomile: 20, Vanilla: 20, Cedarwood: 10}, purpose: "Sleep/Calming", audience: "Unisex" },
      { id: 3, name: "Spring Bouquet", profile: "Floral", ingredients: {Peony: 35, Lilac: 25, Rose: 20, "White Musk": 20}, audience: "Women's" },
      { id: 4, name: "Garden Paradise", profile: "Floral", ingredients: {Gardenia: 40, Jasmine: 30, "Orange Blossom": 20, "Green Leaves": 10}, audience: "Women's" },
      
      // CITRUS
      { id: 5, name: "Sunshine Burst", profile: "Citrus", ingredients: {"Sweet Orange": 40, Lemon: 30, Grapefruit: 20, Bergamot: 10}, purpose: "Uplifting", audience: "Unisex" },
      { id: 6, name: "Mediterranean Coast", profile: "Citrus", ingredients: {Lemon: 35, Lime: 25, Basil: 20, "Sea Salt": 20}, audience: "Unisex" },
      { id: 7, name: "Citrus Grove", profile: "Citrus", ingredients: {Orange: 30, Mandarin: 25, Grapefruit: 25, Mint: 20}, purpose: "Uplifting", audience: "Unisex" },
      { id: 8, name: "Tropical Citrus", profile: "Citrus", ingredients: {Lime: 40, Pineapple: 25, Coconut: 20, Vanilla: 15}, audience: "Unisex" },
      
      // FRUITY
      { id: 9, name: "Berry Bliss", profile: "Fruity", ingredients: {Strawberry: 35, Raspberry: 25, Blueberry: 20, Vanilla: 20}, audience: "Women's" },
      { id: 10, name: "Tropical Paradise", profile: "Fruity", ingredients: {Pineapple: 30, Mango: 30, Papaya: 20, Coconut: 20}, audience: "Unisex" },
      { id: 11, name: "Autumn Harvest", profile: "Fruity", ingredients: {Apple: 40, Pear: 25, Cinnamon: 20, Clove: 15}, audience: "Unisex" },
      { id: 12, name: "Peach Orchard", profile: "Fruity", ingredients: {Peach: 50, Apricot: 25, Vanilla: 15, Almond: 10}, audience: "Women's" },
      
      // GOURMAND
      { id: 13, name: "Vanilla Bean", profile: "Gourmand", ingredients: {Vanilla: 60, Cream: 20, Caramel: 15, Sugar: 5}, audience: "Women's" },
      { id: 14, name: "Bakery Fresh", profile: "Gourmand", ingredients: {Vanilla: 30, Butter: 25, "Sugar Cookie": 25, Cinnamon: 20}, audience: "Unisex" },
      { id: 15, name: "Caramel Latte", profile: "Gourmand", ingredients: {Coffee: 35, Caramel: 30, Vanilla: 20, Cream: 15}, purpose: "Focus", audience: "Unisex" },
      { id: 16, name: "Chocolate Decadence", profile: "Gourmand", ingredients: {"Dark Chocolate": 50, Vanilla: 25, Hazelnut: 15, Coffee: 10}, audience: "Unisex" },
      
      // HERBAL
      { id: 17, name: "Spa Retreat", profile: "Herbal", ingredients: {Eucalyptus: 40, Mint: 30, Sage: 20, Lavender: 10}, purpose: "Self-Care", audience: "Unisex" },
      { id: 18, name: "Herb Garden", profile: "Herbal", ingredients: {Basil: 30, Rosemary: 25, Thyme: 25, Lemon: 20}, audience: "Unisex" },
      { id: 19, name: "Mint Refresh", profile: "Herbal", ingredients: {Peppermint: 50, Spearmint: 25, Eucalyptus: 15, Vanilla: 10}, purpose: "Focus", audience: "Unisex" },
      { id: 20, name: "Tea Time", profile: "Herbal", ingredients: {"Green Tea": 40, Jasmine: 25, Lemongrass: 20, Ginger: 15}, audience: "Unisex" },
      
      // SPICY
      { id: 21, name: "Cinnamon Spice", profile: "Spicy", ingredients: {Cinnamon: 40, Clove: 25, Nutmeg: 20, Vanilla: 15}, audience: "Unisex" },
      { id: 22, name: "Warm Chai", profile: "Spicy", ingredients: {"Chai Spice": 35, Cinnamon: 25, Cardamom: 20, Vanilla: 20}, audience: "Unisex" },
      { id: 23, name: "Pumpkin Spice", profile: "Spicy", ingredients: {Pumpkin: 35, Cinnamon: 25, Nutmeg: 20, Clove: 10, Vanilla: 10}, audience: "Unisex" },
      { id: 24, name: "Ginger Snap", profile: "Spicy", ingredients: {Ginger: 45, Cinnamon: 25, Molasses: 20, Vanilla: 10}, audience: "Unisex" },
      
      // CLEAN/SPA
      { id: 25, name: "Fresh Linen", profile: "Clean/Spa", ingredients: {Cotton: 40, Linen: 30, Lavender: 20, Vanilla: 10}, audience: "Unisex" },
      { id: 26, name: "Ocean Breeze", profile: "Clean/Spa", ingredients: {"Sea Salt": 35, Ozone: 30, Jasmine: 20, Driftwood: 15}, audience: "Unisex" },
      { id: 27, name: "White Tea", profile: "Clean/Spa", ingredients: {"White Tea": 50, Ginger: 20, Bergamot: 20, Honey: 10}, purpose: "Meditation", audience: "Unisex" },
      { id: 28, name: "Spa Day", profile: "Clean/Spa", ingredients: {Eucalyptus: 35, Spearmint: 25, Lavender: 25, Vanilla: 15}, purpose: "Self-Care", audience: "Unisex" },
      
      // EARTHY
      { id: 29, name: "Forest Walk", profile: "Earthy", ingredients: {Cedarwood: 35, Pine: 30, Moss: 20, Sandalwood: 15}, audience: "Men's" },
      { id: 30, name: "Patchouli Dream", profile: "Earthy", ingredients: {Patchouli: 45, Sandalwood: 25, Vanilla: 20, Amber: 10}, audience: "Unisex" },
      { id: 31, name: "Sandalwood Serenity", profile: "Earthy", ingredients: {Sandalwood: 50, Vanilla: 25, Amber: 15, Cedar: 10}, purpose: "Meditation", audience: "Unisex" },
      { id: 32, name: "Woodsy Cabin", profile: "Earthy", ingredients: {Cedarwood: 35, Oakmoss: 25, Pine: 20, Amber: 20}, audience: "Men's" },
      
      // SLEEP/CALMING
      { id: 33, name: "Sweet Dreams", purpose: "Sleep/Calming", ingredients: {Lavender: 50, Chamomile: 25, Vanilla: 15, Cedarwood: 10}, audience: "Unisex" },
      { id: 34, name: "Nighttime Zen", purpose: "Sleep/Calming", ingredients: {Lavender: 40, Bergamot: 25, Sandalwood: 20, "Ylang Ylang": 15}, audience: "Unisex" },
      { id: 35, name: "Peaceful Slumber", purpose: "Sleep/Calming", ingredients: {Lavender: 35, Vanilla: 30, Chamomile: 20, "Tonka Bean": 15}, audience: "Unisex" },
      
      // MEDITATION
      { id: 36, name: "Inner Peace", purpose: "Meditation", ingredients: {Sandalwood: 40, Frankincense: 25, Myrrh: 20, Lavender: 15}, audience: "Unisex" },
      { id: 37, name: "Zen Garden", purpose: "Meditation", ingredients: {"White Tea": 35, Bamboo: 25, "Green Tea": 20, Jasmine: 20}, audience: "Unisex" },
      { id: 38, name: "Mindful Moment", purpose: "Meditation", ingredients: {Sage: 35, "Palo Santo": 30, Lavender: 20, Cedar: 15}, audience: "Unisex" },
      
      // FOCUS
      { id: 39, name: "Study Session", purpose: "Focus", ingredients: {Peppermint: 40, Rosemary: 30, Lemon: 20, Basil: 10}, audience: "Unisex" },
      { id: 40, name: "Brain Boost", purpose: "Focus", ingredients: {Eucalyptus: 35, Peppermint: 30, Lemon: 20, Rosemary: 15}, audience: "Unisex" },
      { id: 41, name: "Clear Mind", purpose: "Focus", ingredients: {Lemon: 40, Peppermint: 25, Basil: 20, Ginger: 15}, audience: "Unisex" },
      
      // UPLIFTING
      { id: 42, name: "Morning Sunshine", purpose: "Uplifting", ingredients: {Orange: 40, Lemon: 25, Grapefruit: 20, Peppermint: 15}, audience: "Unisex" },
      { id: 43, name: "Energy Boost", purpose: "Uplifting", ingredients: {Grapefruit: 35, Lime: 30, Mint: 20, Ginger: 15}, audience: "Unisex" },
      { id: 44, name: "Happy Day", purpose: "Uplifting", ingredients: {"Sweet Orange": 40, Vanilla: 25, Bergamot: 20, Jasmine: 15}, audience: "Unisex" },
      
      // SELF-CARE
      { id: 45, name: "Pamper Me", purpose: "Self-Care", ingredients: {Lavender: 35, Vanilla: 25, Rose: 20, Sandalwood: 20}, audience: "Women's" },
      { id: 46, name: "Luxury Spa", purpose: "Self-Care", ingredients: {Eucalyptus: 30, Mint: 25, Jasmine: 25, Vanilla: 20}, audience: "Unisex" },
      { id: 47, name: "Relaxation Ritual", purpose: "Self-Care", ingredients: {Lavender: 40, Chamomile: 25, "Ylang Ylang": 20, Sandalwood: 15}, audience: "Unisex" },
      
      // WEDDING
      { id: 48, name: "Bridal Bouquet", occasion: "Wedding", ingredients: {Rose: 40, Peony: 25, Gardenia: 20, Vanilla: 15}, audience: "Women's" },
      { id: 49, name: "White Wedding", occasion: "Wedding", ingredients: {"White Tea": 35, Jasmine: 30, Lily: 20, Musk: 15}, audience: "Unisex" },
      { id: 50, name: "Love Story", occasion: "Wedding", ingredients: {Rose: 35, Vanilla: 30, Amber: 20, Sandalwood: 15}, audience: "Unisex" },
      
      // BIRTHDAY
      { id: 51, name: "Birthday Cake", occasion: "Birthday", ingredients: {Vanilla: 40, "Butter Cream": 25, Sugar: 20, Almond: 15}, audience: "Unisex" },
      { id: 52, name: "Celebration", occasion: "Birthday", ingredients: {Champagne: 35, Peach: 25, Vanilla: 25, Citrus: 15}, audience: "Unisex" },
      { id: 53, name: "Party Time", occasion: "Birthday", ingredients: {"Cotton Candy": 40, Vanilla: 25, Strawberry: 20, Sugar: 15}, audience: "Unisex" },
      
      // ANNIVERSARY
      { id: 54, name: "Romantic Evening", occasion: "Anniversary", ingredients: {Rose: 40, Jasmine: 25, Amber: 20, Musk: 15}, audience: "Unisex" },
      { id: 55, name: "Timeless Love", occasion: "Anniversary", ingredients: {Vanilla: 35, Sandalwood: 30, Rose: 20, Amber: 15}, audience: "Unisex" },
      
      // BABY SHOWER
      { id: 56, name: "Baby Powder", occasion: "Baby Shower", ingredients: {"Baby Powder": 50, Vanilla: 25, Cotton: 15, Lavender: 10}, audience: "Unisex" },
      { id: 57, name: "Sweet Baby", occasion: "Baby Shower", ingredients: {Vanilla: 40, Cotton: 25, Lavender: 20, Chamomile: 15}, audience: "Unisex" },
      { id: 58, name: "Nursery Fresh", occasion: "Baby Shower", ingredients: {Cotton: 45, Vanilla: 25, Lavender: 20, Powder: 10}, audience: "Unisex" },
      
      // HOUSEWARMING
      { id: 59, name: "New Home", occasion: "Housewarming", ingredients: {"Fresh Linen": 35, Vanilla: 30, Cotton: 20, Lavender: 15}, audience: "Unisex" },
      { id: 60, name: "Welcome Home", occasion: "Housewarming", ingredients: {"Apple Cinnamon": 40, Vanilla: 25, Nutmeg: 20, Clove: 15}, audience: "Unisex" },
      { id: 61, name: "Cozy Nest", occasion: "Housewarming", ingredients: {Vanilla: 35, Amber: 25, Sandalwood: 20, Cedar: 20}, audience: "Unisex" },
      
      // MEN'S
      { id: 62, name: "Gentleman's Club", audience: "Men's", ingredients: {Leather: 35, Tobacco: 25, Vanilla: 20, Cedar: 20} },
      { id: 63, name: "Mountain Man", audience: "Men's", ingredients: {Pine: 35, Cedar: 30, Oakmoss: 20, Musk: 15} },
      { id: 64, name: "Barber Shop", audience: "Men's", ingredients: {"Bay Rum": 40, Sandalwood: 25, Patchouli: 20, Vanilla: 15} },
      { id: 65, name: "Whiskey & Oak", audience: "Men's", ingredients: {Bourbon: 40, Oak: 25, Vanilla: 20, Tobacco: 15} },
      { id: 66, name: "Fresh Cologne", audience: "Men's", ingredients: {Bergamot: 35, Lavender: 25, Oakmoss: 20, Musk: 20} },
      
      // WOMEN'S
      { id: 67, name: "Floral Romance", audience: "Women's", ingredients: {Rose: 40, Jasmine: 25, Vanilla: 20, Peony: 15} },
      { id: 68, name: "Sweet Vanilla", audience: "Women's", ingredients: {Vanilla: 50, Caramel: 20, Cream: 20, Sugar: 10} },
      { id: 69, name: "Garden Party", audience: "Women's", ingredients: {Peony: 35, Rose: 25, Lily: 20, Musk: 20} },
      { id: 70, name: "Berry Sorbet", audience: "Women's", ingredients: {Strawberry: 35, Raspberry: 25, Vanilla: 25, Cream: 15} },
      { id: 71, name: "Lavender Fields", audience: "Women's", ingredients: {Lavender: 50, Vanilla: 25, Chamomile: 15, Musk: 10} },
      
      // UNISEX
      { id: 72, name: "Fresh & Clean", audience: "Unisex", ingredients: {Cotton: 40, Linen: 25, Lavender: 20, Vanilla: 15} },
      { id: 73, name: "Citrus Woods", audience: "Unisex", ingredients: {Bergamot: 35, Cedar: 25, Sandalwood: 20, Orange: 20} },
      { id: 74, name: "Vanilla Sandalwood", audience: "Unisex", ingredients: {Vanilla: 50, Sandalwood: 30, Amber: 20} },
      { id: 75, name: "Ocean Mist", audience: "Unisex", ingredients: {"Sea Salt": 40, Ozone: 25, Jasmine: 20, Driftwood: 15} },
      { id: 76, name: "Amber Noir", audience: "Unisex", ingredients: {Amber: 40, Sandalwood: 25, Vanilla: 20, Musk: 15} },
      
      // PET-FRIENDLY
      { id: 77, name: "Safe & Fresh", audience: "Pet-Friendly", ingredients: {Vanilla: 60, Lemon: 25, Chamomile: 15} },
      { id: 78, name: "Gentle Breeze", audience: "Pet-Friendly", ingredients: {Cotton: 50, Vanilla: 30, Chamomile: 20} },
      { id: 79, name: "Natural Home", audience: "Pet-Friendly", ingredients: {Lemon: 40, Vanilla: 35, Ginger: 25} },
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

  // Create new blank recipe
  const createNewRecipe = () => {
    const newRecipe: Recipe = {
      id: Date.now(),
      name: "New Recipe",
      profile: "Floral",
      purpose: undefined,
      audience: "Unisex",
      ingredients: {
        "Ingredient 1": 50,
        "Ingredient 2": 30,
        "Ingredient 3": 20
      },
      isUserRecipe: true
    }
    setEditingRecipe(newRecipe)
    setSelectedRecipe(newRecipe)
    setShowNewRecipeModal(true)
  }

  // Save new recipe
  const saveNewRecipe = () => {
    if (editingRecipe) {
      setRecipes(prev => [editingRecipe, ...prev])
      setShowNewRecipeModal(false)
      setEditingRecipe(null)
      setSelectedRecipe(null)
    }
  }

  // Open batch production planner
  const openBatchPlanner = (recipe: Recipe) => {
    setBatchRecipe(recipe)
    setBatchQuantity(100)
    setShowBatchModal(true)
  }

  // Calculate batch materials
  const calculateBatchMaterials = () => {
    if (!batchRecipe) return null

    const vesselCalc = vesselCalculations[batchVesselIndex]
    if (!vesselCalc) return null

    const singleUnitCost = vesselCalc.calc.totalCost
    const batchCost = singleUnitCost * batchQuantity

    // Calculate material totals in grams
    const waxGrams = vesselCalc.calc.waxWeight * batchQuantity
    const fragranceGrams = vesselCalc.calc.fragranceWeight * batchQuantity
    const cementGrams = vesselCalc.calc.cementWeight * batchQuantity
    const wicksNeeded = vesselCalc.calc.wicksNeeded * batchQuantity

    // Convert to pounds (453.6g = 1lb)
    const waxLbs = waxGrams / 453.6
    const fragranceLbs = fragranceGrams / 453.6
    const cementLbs = cementGrams / 453.6

    return {
      singleUnitCost,
      batchCost,
      waxGrams,
      fragranceGrams,
      cementGrams,
      waxLbs,
      fragranceLbs,
      cementLbs,
      wicksNeeded,
      vessel: vesselCalc.vessel,
      volumeOz: vesselCalc.calc.volumeOz
    }
  }

  const batchMaterials = calculateBatchMaterials()

  // Check if user can make a recipe with current inventory
  const canMakeRecipe = (recipe: Recipe, quantity: number = 1, vesselIndex: number = 0) => {
    const vesselCalc = vesselCalculations[vesselIndex]
    if (!vesselCalc) return { canMake: false, missing: [] }

    const requiredWaxLbs = (vesselCalc.calc.waxWeight * quantity) / 453.6
    const requiredFragranceLbs = (vesselCalc.calc.fragranceWeight * quantity) / 453.6
    const requiredCementLbs = (vesselCalc.calc.cementWeight * quantity) / 453.6
    const requiredWicks = vesselCalc.calc.wicksNeeded * quantity
    const requiredPaint = quantity

    const missing: string[] = []
    if (inventory.waxLbs < requiredWaxLbs) missing.push(`Wax: need ${requiredWaxLbs.toFixed(1)}lbs, have ${inventory.waxLbs.toFixed(1)}lbs`)
    if (inventory.fragranceOilLbs < requiredFragranceLbs) missing.push(`Fragrance: need ${requiredFragranceLbs.toFixed(1)}lbs, have ${inventory.fragranceOilLbs.toFixed(1)}lbs`)
    if (inventory.cementLbs < requiredCementLbs) missing.push(`Cement: need ${requiredCementLbs.toFixed(1)}lbs, have ${inventory.cementLbs.toFixed(1)}lbs`)
    if (inventory.wicks < requiredWicks) missing.push(`Wicks: need ${requiredWicks}, have ${inventory.wicks}`)
    if (inventory.paint < requiredPaint) missing.push(`Paint: need ${requiredPaint}, have ${inventory.paint}`)

    return { canMake: missing.length === 0, missing, requiredWaxLbs, requiredFragranceLbs, requiredCementLbs, requiredWicks, requiredPaint }
  }

  // Pricing Wizard Calculations
  const calculatePricingRecommendations = () => {
    const vesselCalc = vesselCalculations[pricingVesselIndex]
    if (!vesselCalc) return null

    const costPerUnit = vesselCalc.calc.totalCost
    const volumeOz = vesselCalc.calc.volumeOz

    // Calculate recommended prices based on market position
    const marketMultipliers = {
      'budget': { min: 2.0, target: 2.5, max: 3.0 },      // 100-150% markup
      'mid-range': { min: 2.5, target: 3.5, max: 4.5 },   // 150-300% markup
      'premium': { min: 4.0, target: 5.0, max: 6.0 },     // 300-500% markup
      'luxury': { min: 6.0, target: 8.0, max: 10.0 }      // 500-900% markup
    }

    const multipliers = marketMultipliers[marketPosition]
    const recommendedMin = costPerUnit * multipliers.min
    const recommendedTarget = costPerUnit * multipliers.target
    const recommendedMax = costPerUnit * multipliers.max

    // Calculate with target margin
    const priceFromMargin = costPerUnit / (1 - targetMargin / 100)

    // Price per ounce calculations
    const pricePerOzMin = recommendedMin / volumeOz
    const pricePerOzTarget = recommendedTarget / volumeOz
    const pricePerOzMax = recommendedMax / volumeOz

    // Bulk pricing tiers
    const wholesalePrice = costPerUnit * 1.5  // 50% markup
    const retailPrice = recommendedTarget
    const premiumPrice = recommendedMax

    // Break-even analysis
    const fixedCosts = 500 // Assume $500 monthly fixed costs (rent, utilities, etc.)
    const breakEvenUnits = Math.ceil(fixedCosts / (retailPrice - costPerUnit))

    return {
      costPerUnit,
      volumeOz,
      recommendedMin,
      recommendedTarget,
      recommendedMax,
      priceFromMargin,
      pricePerOzMin,
      pricePerOzTarget,
      pricePerOzMax,
      wholesalePrice,
      retailPrice,
      premiumPrice,
      breakEvenUnits,
      marginAtMin: ((recommendedMin - costPerUnit) / recommendedMin * 100),
      marginAtTarget: ((recommendedTarget - costPerUnit) / recommendedTarget * 100),
      marginAtMax: ((recommendedMax - costPerUnit) / recommendedMax * 100),
    }
  }

  const pricingData = calculatePricingRecommendations()

  // Production Scheduler Functions
  const addProductionOrder = () => {
    if (!newOrder.customerName || !newOrder.recipeName || !newOrder.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    const order: ProductionOrder = {
      id: Date.now().toString(),
      customerName: newOrder.customerName!,
      recipeName: newOrder.recipeName!,
      quantity: newOrder.quantity || 10,
      vesselIndex: newOrder.vesselIndex || 0,
      dueDate: newOrder.dueDate!,
      status: 'pending',
      priority: newOrder.priority || 'medium',
      notes: newOrder.notes || ''
    }

    setProductionOrders([...productionOrders, order])
    setShowAddOrderModal(false)
    setNewOrder({
      customerName: '',
      recipeName: '',
      quantity: 10,
      vesselIndex: 0,
      dueDate: '',
      status: 'pending',
      priority: 'medium',
      notes: ''
    })
  }

  const updateOrderStatus = (orderId: string, status: ProductionOrder['status']) => {
    setProductionOrders(productionOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ))
  }

  const deleteOrder = (orderId: string) => {
    if (confirm('Delete this order?')) {
      setProductionOrders(productionOrders.filter(order => order.id !== orderId))
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const sortedOrders = [...productionOrders].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const orderStats = {
    total: productionOrders.length,
    pending: productionOrders.filter(o => o.status === 'pending').length,
    inProgress: productionOrders.filter(o => o.status === 'in-progress').length,
    completed: productionOrders.filter(o => o.status === 'completed').length,
    totalUnits: productionOrders.reduce((sum, o) => sum + o.quantity, 0),
    urgent: productionOrders.filter(o => o.priority === 'urgent').length,
    overdue: productionOrders.filter(o => getDaysUntilDue(o.dueDate) < 0 && o.status !== 'completed').length
  }

  // Open label generator with recipe
  const openLabelGenerator = (recipe: Recipe) => {
    setLabelRecipe(recipe)
    setShowLabelGenerator(true)
  }

  // Generate label data
  const generateLabelData = () => {
    if (!labelRecipe) return null

    const vesselCalc = vesselCalculations[labelVesselIndex]
    if (!vesselCalc) return null

    const ingredients = Object.entries(labelRecipe.ingredients)
      .map(([name, percent]) => `${name} (${percent}%)`)
      .join(', ')

    const netWeight = `${vesselCalc.calc.volumeOz.toFixed(1)} oz (${(vesselCalc.calc.volumeOz * 28.35).toFixed(0)}g)`
    
    const warnings = [
      '⚠️ Keep away from children and pets',
      '🔥 Never leave burning candle unattended',
      '✂️ Trim wick to 1/4" before each use',
      '🕐 Burn for 2-4 hours at a time',
      '🧊 Stop use when 1/2" of wax remains'
    ]

    return {
      brandName: labelBrandName,
      productName: labelRecipe.name,
      scentProfile: labelRecipe.profile || 'Custom Blend',
      ingredients,
      netWeight,
      burnTime: labelBurnTime,
      warnings,
      waxType: materialPrices.waxType === 'soy' ? 'Soy Wax' : 'Coconut Wax',
      madeIn: 'Handcrafted in USA',
      batchCode: `LK-${Date.now().toString().slice(-6)}`,
      price: pricingData ? `$${pricingData.recommendedTarget.toFixed(2)}` : '$0.00'
    }
  }

  const labelData = generateLabelData()

  // Cost Analysis Calculations
  const calculateCostAnalysis = () => {
    const vesselCalc = vesselCalculations[analysisVesselIndex]
    if (!vesselCalc) return null

    // Material Costs per unit
    const materialCost = vesselCalc.calc.totalCost

    // Labor Cost per unit
    const laborCost = laborHourlyRate * laborHoursPerUnit

    // Total Cost per unit (materials + labor)
    const totalCostPerUnit = materialCost + laborCost

    // Selling Price Analysis
    const revenue = sellingPrice
    const grossProfit = revenue - totalCostPerUnit
    const grossMargin = (grossProfit / revenue) * 100

    // Monthly Analysis
    const monthlyRevenue = revenue * monthlySalesGoal
    const monthlyCOGS = totalCostPerUnit * monthlySalesGoal // Cost of Goods Sold
    const monthlyGrossProfit = grossProfit * monthlySalesGoal
    const monthlyNetProfit = monthlyGrossProfit - monthlyOverhead
    const netMargin = (monthlyNetProfit / monthlyRevenue) * 100

    // Break-even Analysis
    const breakEvenUnits = Math.ceil(monthlyOverhead / grossProfit)
    const daysToBreakEven = (breakEvenUnits / monthlySalesGoal) * 30

    // ROI Analysis
    const totalInvestment = monthlyOverhead + (materialCost * monthlySalesGoal)
    const roi = ((monthlyNetProfit / totalInvestment) * 100)

    // Cost Breakdown Percentages
    const waxCost = (vesselCalc.calc.waxWeight / 453.6) * materialPrices.waxPricePerLb
    const fragranceCost = (vesselCalc.calc.fragranceWeight / 453.6) * materialPrices.fragrancePricePerLb
    const cementCost = (vesselCalc.calc.cementWeight / 453.6) * materialPrices.cementPricePerLb
    const wickCost = vesselCalc.calc.wicksNeeded * materialPrices.wickPrice
    const paintCost = materialPrices.paintPrice

    const totalMaterialCost = waxCost + fragranceCost + cementCost + wickCost + paintCost

    return {
      materialCost,
      laborCost,
      totalCostPerUnit,
      revenue,
      grossProfit,
      grossMargin,
      monthlyRevenue,
      monthlyCOGS,
      monthlyGrossProfit,
      monthlyOverhead,
      monthlyNetProfit,
      netMargin,
      breakEvenUnits,
      daysToBreakEven,
      roi,
      totalInvestment,
      // Cost breakdown
      waxCost,
      fragranceCost,
      cementCost,
      wickCost,
      paintCost,
      totalMaterialCost,
      waxPercent: (waxCost / totalMaterialCost) * 100,
      fragrancePercent: (fragranceCost / totalMaterialCost) * 100,
      cementPercent: (cementCost / totalMaterialCost) * 100,
      wickPercent: (wickCost / totalMaterialCost) * 100,
      paintPercent: (paintCost / totalMaterialCost) * 100,
      laborPercent: (laborCost / totalCostPerUnit) * 100,
      materialPercent: (materialCost / totalCostPerUnit) * 100,
    }
  }

  const costAnalysis = calculateCostAnalysis()

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

        {/* Inventory Management */}
        <Card className="mb-6 border-4 border-emerald-300 dark:border-emerald-700">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-100">
                  📦 Inventory Manager
                </CardTitle>
                <p className="text-emerald-700 dark:text-emerald-300 mt-2 text-sm">
                  Track materials • Get low stock alerts • See what you can make
                </p>
              </div>
              <button
                onClick={() => setShowInventoryManager(!showInventoryManager)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                {showInventoryManager ? '📊 Hide' : '📊 Manage Stock'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Quick Stock Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700">
                <div className="text-amber-900 dark:text-amber-100 text-sm font-semibold mb-1">🕯️ Wax</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inventory.waxLbs} lbs</div>
                {inventory.waxLbs < 10 && <div className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Low stock!</div>}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-purple-300 dark:border-purple-700">
                <div className="text-purple-900 dark:text-purple-100 text-sm font-semibold mb-1">🌸 Fragrance</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{inventory.fragranceOilLbs} lbs</div>
                {inventory.fragranceOilLbs < 5 && <div className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Low stock!</div>}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 p-4 rounded-xl border-2 border-gray-300 dark:border-gray-700">
                <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold mb-1">🏗️ Cement</div>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{inventory.cementLbs} lbs</div>
                {inventory.cementLbs < 10 && <div className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Low stock!</div>}
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                <div className="text-orange-900 dark:text-orange-100 text-sm font-semibold mb-1">🧵 Wicks</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{inventory.wicks}</div>
                {inventory.wicks < 50 && <div className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Low stock!</div>}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                <div className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">🎨 Paint</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inventory.paint}</div>
                {inventory.paint < 20 && <div className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Low stock!</div>}
              </div>
            </div>

            {/* Detailed Inventory Manager */}
            {showInventoryManager && (
              <div className="bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Update Stock Levels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                      🕯️ Wax (lbs)
                    </Label>
                    <Input
                      type="number"
                      value={inventory.waxLbs}
                      onChange={(e) => setInventory({ ...inventory, waxLbs: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                      🌸 Fragrance Oil (lbs)
                    </Label>
                    <Input
                      type="number"
                      value={inventory.fragranceOilLbs}
                      onChange={(e) => setInventory({ ...inventory, fragranceOilLbs: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                      🏗️ Cement (lbs)
                    </Label>
                    <Input
                      type="number"
                      value={inventory.cementLbs}
                      onChange={(e) => setInventory({ ...inventory, cementLbs: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                      🧵 Wicks (count)
                    </Label>
                    <Input
                      type="number"
                      value={inventory.wicks}
                      onChange={(e) => setInventory({ ...inventory, wicks: parseInt(e.target.value) || 0 })}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                      🎨 Paint/Finishing (units)
                    </Label>
                    <Input
                      type="number"
                      value={inventory.paint}
                      onChange={(e) => setInventory({ ...inventory, paint: parseInt(e.target.value) || 0 })}
                      className="text-lg"
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setInventory({ waxLbs: 50, fragranceOilLbs: 10, cementLbs: 25, wicks: 500, paint: 100 })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    🔄 Reset to Default
                  </button>
                  <button
                    onClick={() => setInventory({ waxLbs: 100, fragranceOilLbs: 20, cementLbs: 50, wicks: 1000, paint: 200 })}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    📦 Full Stock
                  </button>
                  <button
                    onClick={() => setInventory({ waxLbs: 0, fragranceOilLbs: 0, cementLbs: 0, wicks: 0, paint: 0 })}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    🗑️ Clear All
                  </button>
                  <button
                    onClick={() => {
                      const data = JSON.stringify(inventory, null, 2)
                      navigator.clipboard.writeText(data)
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    💾 Export Data
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Wizard */}
        <Card className="mb-6 border-4 border-amber-300 dark:border-amber-700">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  💰 Pricing Wizard
                </CardTitle>
                <p className="text-amber-700 dark:text-amber-300 mt-2 text-sm">
                  Smart pricing recommendations • Profit margin calculator • Break-even analysis
                </p>
              </div>
              <button
                onClick={() => setShowPricingWizard(!showPricingWizard)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                {showPricingWizard ? '📊 Hide' : '💵 Calculate Prices'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Quick Pricing Preview */}
            {pricingData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border-2 border-green-300 dark:border-green-700">
                  <div className="text-green-900 dark:text-green-100 text-sm font-semibold mb-1">💵 Cost</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${pricingData.costPerUnit.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Per unit
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                  <div className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">🎯 Recommended</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${pricingData.recommendedTarget.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {marketPosition} tier
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-purple-300 dark:border-purple-700">
                  <div className="text-purple-900 dark:text-purple-100 text-sm font-semibold mb-1">📈 Profit</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${(pricingData.recommendedTarget - pricingData.costPerUnit).toFixed(2)}
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    {pricingData.marginAtTarget.toFixed(0)}% margin
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                  <div className="text-orange-900 dark:text-orange-100 text-sm font-semibold mb-1">⚖️ Break Even</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {pricingData.breakEvenUnits}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Units/month
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Pricing Wizard */}
            {showPricingWizard && pricingData && (
              <div className="space-y-6">
                {/* Configuration */}
                <div className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">⚙️ Pricing Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                        Vessel Type
                      </Label>
                      <select
                        value={pricingVesselIndex}
                        onChange={(e) => setPricingVesselIndex(parseInt(e.target.value))}
                        className="w-full p-3 border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base font-semibold"
                      >
                        {vessels.map((vessel, idx) => (
                          <option key={vessel.id} value={idx}>
                            {vessel.name} ({vesselCalculations[idx].calc.volumeOz.toFixed(1)} oz)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                        Market Position
                      </Label>
                      <select
                        value={marketPosition}
                        onChange={(e) => setMarketPosition(e.target.value as any)}
                        className="w-full p-3 border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base font-semibold"
                      >
                        <option value="budget">Budget (100-150% markup)</option>
                        <option value="mid-range">Mid-Range (150-300% markup)</option>
                        <option value="premium">Premium (300-500% markup)</option>
                        <option value="luxury">Luxury (500-900% markup)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">
                        Target Profit Margin (%)
                      </Label>
                      <Input
                        type="number"
                        value={targetMargin}
                        onChange={(e) => setTargetMargin(parseInt(e.target.value) || 0)}
                        min="0"
                        max="90"
                        className="text-base"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Price: ${pricingData.priceFromMargin.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Tiers */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">💎 Pricing Tiers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Minimum Price */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-green-300 dark:border-green-700">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-green-700 dark:text-green-300">Minimum</h4>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold">
                          {pricingData.marginAtMin.toFixed(0)}% margin
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        ${pricingData.recommendedMin.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>💰 Profit: ${(pricingData.recommendedMin - pricingData.costPerUnit).toFixed(2)}</div>
                        <div>📏 Per oz: ${pricingData.pricePerOzMin.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Target Price */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-blue-300 dark:border-blue-700 transform scale-105">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-blue-700 dark:text-blue-300">Target ⭐</h4>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold">
                          {pricingData.marginAtTarget.toFixed(0)}% margin
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        ${pricingData.recommendedTarget.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>💰 Profit: ${(pricingData.recommendedTarget - pricingData.costPerUnit).toFixed(2)}</div>
                        <div>📏 Per oz: ${pricingData.pricePerOzTarget.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Maximum Price */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-purple-300 dark:border-purple-700">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-purple-700 dark:text-purple-300">Maximum</h4>
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-bold">
                          {pricingData.marginAtMax.toFixed(0)}% margin
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        ${pricingData.recommendedMax.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>💰 Profit: ${(pricingData.recommendedMax - pricingData.costPerUnit).toFixed(2)}</div>
                        <div>📏 Per oz: ${pricingData.pricePerOzMax.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bulk Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">📦 Bulk Pricing Strategy</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">🏪 Wholesale</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Bulk orders (50+ units)</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ${pricingData.wholesalePrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            50% markup
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">🛍️ Retail</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Standard pricing</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${pricingData.retailPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Recommended
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">💎 Premium</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Limited editions, custom</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ${pricingData.premiumPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Maximum value
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Break-Even Analysis */}
                  <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4">⚖️ Break-Even Analysis</h3>
                    <div className="space-y-4">
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                        <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Monthly Fixed Costs</div>
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">$500</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rent, utilities, insurance</div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">Break-Even Point</div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {pricingData.breakEvenUnits} units
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          At ${pricingData.retailPrice.toFixed(2)} per unit
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Revenue Goal (100 units)</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${(pricingData.retailPrice * 100).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Profit: ${((pricingData.retailPrice - pricingData.costPerUnit) * 100 - 500).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Comparison */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">🎯 Market Positioning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${marketPosition === 'budget' ? 'bg-white dark:bg-gray-800 border-amber-500 ring-4 ring-amber-200 dark:ring-amber-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
                      <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">💵 Budget</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Walmart, Dollar stores</div>
                        <div className="mt-2 font-semibold">$8-15 range</div>
                        <div className="text-xs">Mass market appeal</div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${marketPosition === 'mid-range' ? 'bg-white dark:bg-gray-800 border-blue-500 ring-4 ring-blue-200 dark:ring-blue-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
                      <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">🛍️ Mid-Range</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Target, boutiques</div>
                        <div className="mt-2 font-semibold">$20-35 range</div>
                        <div className="text-xs">Quality-conscious buyers</div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${marketPosition === 'premium' ? 'bg-white dark:bg-gray-800 border-purple-500 ring-4 ring-purple-200 dark:ring-purple-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
                      <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">💎 Premium</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Anthropologie, specialty</div>
                        <div className="mt-2 font-semibold">$40-65 range</div>
                        <div className="text-xs">Design & craftsmanship</div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${marketPosition === 'luxury' ? 'bg-white dark:bg-gray-800 border-pink-500 ring-4 ring-pink-200 dark:ring-pink-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
                      <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">✨ Luxury</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div>Diptyque, Jo Malone</div>
                        <div className="mt-2 font-semibold">$70-150+ range</div>
                        <div className="text-xs">Ultra-premium brand</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const text = `PRICING STRATEGY - ${vessels[pricingVesselIndex].name}\n\nCost per unit: $${pricingData.costPerUnit.toFixed(2)}\nMarket Position: ${marketPosition}\n\nPRICING TIERS:\n💵 Minimum: $${pricingData.recommendedMin.toFixed(2)} (${pricingData.marginAtMin.toFixed(0)}% margin)\n🎯 Target: $${pricingData.recommendedTarget.toFixed(2)} (${pricingData.marginAtTarget.toFixed(0)}% margin)\n💎 Maximum: $${pricingData.recommendedMax.toFixed(2)} (${pricingData.marginAtMax.toFixed(0)}% margin)\n\nBULK PRICING:\n🏪 Wholesale: $${pricingData.wholesalePrice.toFixed(2)}\n🛍️ Retail: $${pricingData.retailPrice.toFixed(2)}\n💎 Premium: $${pricingData.premiumPrice.toFixed(2)}\n\nBREAK-EVEN: ${pricingData.breakEvenUnits} units/month`
                      navigator.clipboard.writeText(text)
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all text-lg"
                  >
                    📋 Copy Pricing Strategy
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-all text-lg"
                  >
                    🖨️ Print Report
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Label Generator */}
        {showLabelGenerator && labelRecipe && labelData && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowLabelGenerator(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl relative sticky top-0 z-10">
                <h2 className="text-3xl font-bold mb-2">🏷️ Label Generator</h2>
                <p className="text-white/90">Create professional candle labels instantly</p>
                <button
                  onClick={() => setShowLabelGenerator(false)}
                  className="absolute top-4 right-4 bg-white text-pink-600 w-10 h-10 rounded-full font-bold text-xl hover:bg-gray-100 transition-all"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Template Style</Label>
                    <select
                      value={labelTemplate}
                      onChange={(e) => setLabelTemplate(e.target.value as any)}
                      className="w-full p-2 border-2 border-pink-200 dark:border-pink-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="modern">Modern</option>
                      <option value="vintage">Vintage</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Vessel Type</Label>
                    <select
                      value={labelVesselIndex}
                      onChange={(e) => setLabelVesselIndex(parseInt(e.target.value))}
                      className="w-full p-2 border-2 border-pink-200 dark:border-pink-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {vessels.map((vessel, idx) => (
                        <option key={vessel.id} value={idx}>
                          {vessel.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Brand Name</Label>
                    <Input
                      type="text"
                      value={labelBrandName}
                      onChange={(e) => setLabelBrandName(e.target.value)}
                      className="border-pink-200 dark:border-pink-800"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Batch Size</Label>
                    <Input
                      type="number"
                      value={labelBatchSize}
                      onChange={(e) => setLabelBatchSize(parseInt(e.target.value) || 1)}
                      min="1"
                      className="border-pink-200 dark:border-pink-800"
                    />
                  </div>
                </div>

                {/* Label Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Front Label */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Front Label</h3>
                    <div className={`aspect-[3/4] rounded-xl p-8 flex flex-col justify-between ${
                      labelTemplate === 'modern' ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 border-4 border-indigo-300 dark:border-indigo-700' :
                      labelTemplate === 'vintage' ? 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900 border-4 border-amber-400 dark:border-amber-600' :
                      labelTemplate === 'minimalist' ? 'bg-white dark:bg-gray-900 border-4 border-gray-300 dark:border-gray-700' :
                      'bg-gradient-to-br from-purple-900 to-pink-900 text-white border-4 border-gold-400'
                    }`}>
                      {/* Brand */}
                      <div className="text-center">
                        <div className={`text-sm font-semibold mb-2 tracking-widest ${
                          labelTemplate === 'luxury' ? 'text-yellow-300' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {labelData.brandName.toUpperCase()}
                        </div>
                        <div className={`text-3xl font-bold mb-2 ${
                          labelTemplate === 'vintage' ? 'font-serif' : ''
                        }`}>
                          {labelData.productName}
                        </div>
                        <div className={`text-sm italic ${
                          labelTemplate === 'luxury' ? 'text-yellow-200' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {labelData.scentProfile}
                        </div>
                      </div>

                      {/* Center Decoration */}
                      <div className="flex justify-center items-center">
                        <div className={`text-6xl ${
                          labelTemplate === 'modern' ? '🌸' :
                          labelTemplate === 'vintage' ? '🕯️' :
                          labelTemplate === 'minimalist' ? '⚪' :
                          '✨'
                        }`}>
                          {labelTemplate === 'modern' ? '🌸' :
                           labelTemplate === 'vintage' ? '🕯️' :
                           labelTemplate === 'minimalist' ? '○' :
                           '✨'}
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="text-center space-y-1">
                        <div className="text-sm font-semibold">{labelData.netWeight}</div>
                        <div className="text-xs opacity-75">{labelData.burnTime}</div>
                        <div className="text-xs font-semibold">{labelData.waxType}</div>
                      </div>
                    </div>
                  </div>

                  {/* Back Label / Info Label */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Back Label (Safety & Info)</h3>
                    <div className="aspect-[3/4] bg-white dark:bg-gray-800 border-4 border-gray-300 dark:border-gray-700 rounded-xl p-6 text-sm space-y-3 overflow-y-auto">
                      {/* Product Info */}
                      <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-3">
                        <div className="font-bold text-gray-900 dark:text-gray-100 mb-1">{labelData.productName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Batch: {labelData.batchCode}</div>
                      </div>

                      {/* Ingredients */}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ingredients:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {labelData.waxType}, Fragrance Oils ({labelData.ingredients})
                        </div>
                      </div>

                      {/* Burn Time */}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Burn Time:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">{labelData.burnTime}</div>
                      </div>

                      {/* Safety Warnings */}
                      <div>
                        <div className="font-semibold text-red-600 dark:text-red-400 mb-2">Safety Instructions:</div>
                        <div className="space-y-1">
                          {labelData.warnings.map((warning, idx) => (
                            <div key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                              {warning}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Safety Disclaimer */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-2">
                        <div className="font-semibold text-yellow-800 dark:text-yellow-300 text-xs mb-1">⚠️ Safety:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          Use candles and wax melts responsibly and at your own risk. By lighting this candle or using wax melts, you agree to follow all safety instructions provided by "Limen Lakay"
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-2">
                        <div className="font-semibold text-blue-800 dark:text-blue-300 text-xs mb-1">📞 Contact Us:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                          <div>🌐 www.limenlakay.com</div>
                          <div>📷 @limenlakay</div>
                          <div>✉️ info@limenlakay.com</div>
                          <div>📱 +1 (561) 593 0238</div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="text-center pt-2 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">{labelData.brandName}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Palm Beach FL, USA</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Net Wt: {labelData.netWeight}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Label Info Summary */}
                <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-300 dark:border-pink-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-pink-900 dark:text-pink-100 mb-4">📋 Label Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Template</div>
                      <div className="font-bold text-gray-900 dark:text-gray-100 capitalize">{labelTemplate}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Batch Code</div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">{labelData.batchCode}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Quantity</div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">{labelBatchSize} labels</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Price</div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">{labelData.price}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      const text = `CANDLE LABEL\n\n${labelData.brandName}\n${labelData.productName}\n${labelData.scentProfile}\n\n${labelData.netWeight}\nBurn Time: ${labelData.burnTime}\n${labelData.waxType}\n\nIngredients: ${labelData.waxType}, Fragrance Oils (${labelData.ingredients})\n\nBatch: ${labelData.batchCode}\n${labelData.madeIn}\n\nSAFETY INSTRUCTIONS:\n${labelData.warnings.join('\n')}\n\n⚠️ SAFETY:\nUse candles and wax melts responsibly and at your own risk. By lighting this candle or using wax melts, you agree to follow all safety instructions provided by "Limen Lakay"\n\nCONTACT INFO:\n🌐 www.limenlakay.com\n📷 @limenlakay\n✉️ info@limenlakay.com\n📱 +1 (561) 593 0238`
                      navigator.clipboard.writeText(text)
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    📋 Copy Text
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    🖨️ Print Labels
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, this would generate a PDF
                      alert(`Generating ${labelBatchSize} label(s) as PDF...\n\nIn production, this would create a downloadable PDF file with all labels ready for printing!`)
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={() => {
                      alert(`Generating barcode/QR code for:\n\nBatch: ${labelData.batchCode}\nProduct: ${labelData.productName}\n\nIn production, this would create scannable codes for inventory tracking!`)
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    📲 Add Barcode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Production Scheduler */}
        <Card className="mb-6 border-4 border-teal-300 dark:border-teal-700">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-100 dark:from-teal-950 dark:to-cyan-900">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-teal-900 dark:text-teal-100">
                  📅 Production Scheduler
                </CardTitle>
                <p className="text-teal-700 dark:text-teal-300 mt-2 text-sm">
                  Track orders • Manage deadlines • Plan production runs
                </p>
              </div>
              <button
                onClick={() => setShowScheduler(!showScheduler)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                {showScheduler ? '📊 Hide' : '📋 View Schedule'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                <div className="text-blue-900 dark:text-blue-100 text-xs font-semibold mb-1">Total Orders</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{orderStats.total}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
                <div className="text-yellow-900 dark:text-yellow-100 text-xs font-semibold mb-1">⏳ Pending</div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{orderStats.pending}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-purple-300 dark:border-purple-700">
                <div className="text-purple-900 dark:text-purple-100 text-xs font-semibold mb-1">🔄 In Progress</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{orderStats.inProgress}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border-2 border-green-300 dark:border-green-700">
                <div className="text-green-900 dark:text-green-100 text-xs font-semibold mb-1">✅ Completed</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{orderStats.completed}</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl border-2 border-indigo-300 dark:border-indigo-700">
                <div className="text-indigo-900 dark:text-indigo-100 text-xs font-semibold mb-1">📦 Total Units</div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{orderStats.totalUnits}</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-red-300 dark:border-red-700">
                <div className="text-red-900 dark:text-red-100 text-xs font-semibold mb-1">🚨 Urgent</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{orderStats.urgent}</div>
              </div>

              <div className={`bg-gradient-to-br p-4 rounded-xl border-2 ${
                orderStats.overdue > 0 
                  ? 'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 border-red-400 dark:border-red-600'
                  : 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-300 dark:border-gray-700'
              }`}>
                <div className={`text-xs font-semibold mb-1 ${orderStats.overdue > 0 ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>
                  ⚠️ Overdue
                </div>
                <div className={`text-3xl font-bold ${orderStats.overdue > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  {orderStats.overdue}
                </div>
              </div>
            </div>

            {/* Detailed Schedule */}
            {showScheduler && (
              <div className="space-y-4">
                {/* Add Order Button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Production Queue</h3>
                  <button
                    onClick={() => setShowAddOrderModal(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    ➕ Add Order
                  </button>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {sortedOrders.map((order) => {
                    const daysUntil = getDaysUntilDue(order.dueDate)
                    const isOverdue = daysUntil < 0 && order.status !== 'completed'
                    const vesselCalc = vesselCalculations[order.vesselIndex]
                    const orderCost = vesselCalc ? vesselCalc.calc.totalCost * order.quantity : 0

                    return (
                      <div
                        key={order.id}
                        className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-5 ${
                          isOverdue ? 'border-red-500 dark:border-red-600' :
                          order.priority === 'urgent' ? 'border-orange-400 dark:border-orange-600' :
                          order.priority === 'high' ? 'border-yellow-400 dark:border-yellow-600' :
                          'border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Order Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                {order.customerName}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                order.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                order.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                order.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                                {order.priority.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                order.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Recipe:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{order.recipeName}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{order.quantity} units</span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Vessel:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">
                                  {vessels[order.vesselIndex].name}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                                <span className="ml-2 font-semibold text-teal-600 dark:text-teal-400">
                                  ${orderCost.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <div className={`font-semibold ${
                                isOverdue ? 'text-red-600 dark:text-red-400' :
                                daysUntil <= 3 ? 'text-orange-600 dark:text-orange-400' :
                                'text-gray-700 dark:text-gray-300'
                              }`}>
                                📅 Due: {new Date(order.dueDate).toLocaleDateString()} 
                                {isOverdue ? ` (${Math.abs(daysUntil)} days overdue!)` :
                                 daysUntil === 0 ? ' (DUE TODAY!)' :
                                 daysUntil === 1 ? ' (Due tomorrow)' :
                                 ` (${daysUntil} days)`}
                              </div>
                            </div>

                            {order.notes && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                                📝 {order.notes}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex md:flex-col gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'in-progress')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
                              >
                                ▶️ Start
                              </button>
                            )}
                            {order.status === 'in-progress' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
                              >
                                ✅ Complete
                              </button>
                            )}
                            {order.status === 'completed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'pending')}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
                              >
                                🔄 Reopen
                              </button>
                            )}
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {sortedOrders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                        No Orders Scheduled
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500">Click "Add Order" to start planning production</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Order Modal */}
        {showAddOrderModal && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddOrderModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">➕ Add Production Order</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Customer Name *</Label>
                    <Input
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Recipe Name *</Label>
                    <Input
                      value={newOrder.recipeName}
                      onChange={(e) => setNewOrder({ ...newOrder, recipeName: e.target.value })}
                      placeholder="Enter recipe name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Quantity</Label>
                    <Input
                      type="number"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 10 })}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Vessel Type</Label>
                    <select
                      value={newOrder.vesselIndex}
                      onChange={(e) => setNewOrder({ ...newOrder, vesselIndex: parseInt(e.target.value) })}
                      className="w-full p-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {vessels.map((vessel, idx) => (
                        <option key={vessel.id} value={idx}>{vessel.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Priority</Label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value as any })}
                      className="w-full p-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Due Date *</Label>
                  <Input
                    type="date"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Notes</Label>
                  <Input
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                    placeholder="Special instructions, delivery notes, etc."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={addProductionOrder}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  ✅ Add Order
                </button>
                <button
                  onClick={() => setShowAddOrderModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cost Analysis & Profitability Dashboard */}
        <Card className="mb-6 border-4 border-purple-300 dark:border-purple-700">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-100 dark:from-purple-950 dark:to-fuchsia-900">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">
                  💎 Cost Analysis & Profitability
                </CardTitle>
                <p className="text-purple-700 dark:text-purple-300 mt-2 text-sm">
                  Track costs • Maximize profits • ROI analysis • Break-even calculator
                </p>
              </div>
              <button
                onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                {showCostAnalysis ? '📊 Hide' : '💰 Analyze Costs'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Quick Overview */}
            {costAnalysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border-2 border-green-300 dark:border-green-700">
                  <div className="text-green-900 dark:text-green-100 text-sm font-semibold mb-1">💰 Profit/Unit</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${costAnalysis.grossProfit.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {costAnalysis.grossMargin.toFixed(1)}% margin
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                  <div className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">📈 Monthly Profit</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${costAnalysis.monthlyNetProfit.toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Net {costAnalysis.netMargin.toFixed(1)}% margin
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border-2 border-orange-300 dark:border-orange-700">
                  <div className="text-orange-900 dark:text-orange-100 text-sm font-semibold mb-1">⚖️ Break Even</div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {costAnalysis.breakEvenUnits}
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    units ({costAnalysis.daysToBreakEven.toFixed(0)} days)
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-purple-300 dark:border-purple-700">
                  <div className="text-purple-900 dark:text-purple-100 text-sm font-semibold mb-1">🎯 ROI</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {costAnalysis.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Monthly return
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Analysis */}
            {showCostAnalysis && costAnalysis && (
              <div className="space-y-6">
                {/* Configuration */}
                <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">⚙️ Analysis Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-sm">Vessel Type</Label>
                      <select
                        value={analysisVesselIndex}
                        onChange={(e) => setAnalysisVesselIndex(parseInt(e.target.value))}
                        className="w-full p-2 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        {vessels.map((vessel, idx) => (
                          <option key={vessel.id} value={idx}>
                            {vessel.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-sm">Selling Price</Label>
                      <Input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                        step="0.5"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-sm">Labor Rate ($/hr)</Label>
                      <Input
                        type="number"
                        value={laborHourlyRate}
                        onChange={(e) => setLaborHourlyRate(parseFloat(e.target.value) || 0)}
                        step="1"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-sm">Hours/Unit</Label>
                      <Input
                        type="number"
                        value={laborHoursPerUnit}
                        onChange={(e) => setLaborHoursPerUnit(parseFloat(e.target.value) || 0)}
                        step="0.1"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-sm">Monthly Sales Goal</Label>
                      <Input
                        type="number"
                        value={monthlySalesGoal}
                        onChange={(e) => setMonthlySalesGoal(parseInt(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Per Unit Cost Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">💵 Per Unit Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">Materials</span>
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          ${costAnalysis.materialCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">Labor</span>
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          ${costAnalysis.laborCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg border-2 border-amber-400 dark:border-amber-600">
                        <span className="text-amber-900 dark:text-amber-100 font-bold">Total Cost</span>
                        <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          ${costAnalysis.totalCostPerUnit.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-400 dark:border-green-600">
                        <span className="text-green-900 dark:text-green-100 font-bold">Selling Price</span>
                        <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                          ${costAnalysis.revenue.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg border-2 border-purple-400 dark:border-purple-600">
                        <span className="text-purple-900 dark:text-purple-100 font-bold">Gross Profit</span>
                        <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          ${costAnalysis.grossProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Material Cost Breakdown */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">🧪 Material Costs</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">🕯️ Wax</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {costAnalysis.waxPercent.toFixed(1)}% of materials
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${costAnalysis.waxCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">🌸 Fragrance</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {costAnalysis.fragrancePercent.toFixed(1)}% of materials
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${costAnalysis.fragranceCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">🏗️ Cement</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {costAnalysis.cementPercent.toFixed(1)}% of materials
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${costAnalysis.cementCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">🧵 Wicks</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {costAnalysis.wickPercent.toFixed(1)}% of materials
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${costAnalysis.wickCost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm">🎨 Paint</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {costAnalysis.paintPercent.toFixed(1)}% of materials
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${costAnalysis.paintCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Profitability */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4">📊 Monthly Profitability ({monthlySalesGoal} units)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${costAnalysis.monthlyRevenue.toFixed(0)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">COGS</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        -${costAnalysis.monthlyCOGS.toFixed(0)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Profit</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${costAnalysis.monthlyGrossProfit.toFixed(0)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overhead</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        -${monthlyOverhead}
                      </div>
                      <button
                        onClick={() => {
                          const newOverhead = prompt('Monthly Overhead (rent, utilities, insurance):', monthlyOverhead.toString())
                          if (newOverhead) setMonthlyOverhead(parseFloat(newOverhead) || 500)
                        }}
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 p-4 rounded-xl border-2 border-purple-400 dark:border-purple-600">
                      <div className="text-sm text-purple-700 dark:text-purple-300 mb-1 font-semibold">Net Profit</div>
                      <div className={`text-2xl font-bold ${costAnalysis.monthlyNetProfit >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        ${costAnalysis.monthlyNetProfit.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Break-Even & ROI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4">⚖️ Break-Even Analysis</h3>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Units to Break Even</div>
                        <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                          {costAnalysis.breakEvenUnits}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          ≈ {costAnalysis.daysToBreakEven.toFixed(0)} days at current pace
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <div className="flex justify-between">
                          <span>Fixed Costs (Overhead):</span>
                          <span className="font-bold">${monthlyOverhead}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit per Unit:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ${costAnalysis.grossProfit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t-2">
                          <span className="font-bold">Current Progress:</span>
                          <span className="font-bold text-orange-600 dark:text-orange-400">
                            {((monthlySalesGoal / costAnalysis.breakEvenUnits) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">🎯 ROI Analysis</h3>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Monthly Return on Investment</div>
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                          {costAnalysis.roi.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {costAnalysis.roi > 0 ? '✅ Profitable' : '⚠️ Needs Improvement'}
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <div className="flex justify-between">
                          <span>Total Investment:</span>
                          <span className="font-bold">${costAnalysis.totalInvestment.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Profit:</span>
                          <span className={`font-bold ${costAnalysis.monthlyNetProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ${costAnalysis.monthlyNetProfit.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t-2">
                          <span className="font-bold">Payback Period:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {costAnalysis.monthlyNetProfit > 0 ? `${(costAnalysis.totalInvestment / costAnalysis.monthlyNetProfit).toFixed(1)} months` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const text = `COST ANALYSIS REPORT\n\n=== PER UNIT ===\nMaterials: $${costAnalysis.materialCost.toFixed(2)}\nLabor: $${costAnalysis.laborCost.toFixed(2)}\nTotal Cost: $${costAnalysis.totalCostPerUnit.toFixed(2)}\nSelling Price: $${costAnalysis.revenue.toFixed(2)}\nGross Profit: $${costAnalysis.grossProfit.toFixed(2)} (${costAnalysis.grossMargin.toFixed(1)}%)\n\n=== MONTHLY (${monthlySalesGoal} units) ===\nRevenue: $${costAnalysis.monthlyRevenue.toFixed(0)}\nCOGS: $${costAnalysis.monthlyCOGS.toFixed(0)}\nGross Profit: $${costAnalysis.monthlyGrossProfit.toFixed(0)}\nOverhead: $${monthlyOverhead}\nNet Profit: $${costAnalysis.monthlyNetProfit.toFixed(0)} (${costAnalysis.netMargin.toFixed(1)}%)\n\n=== BREAK-EVEN ===\nUnits Needed: ${costAnalysis.breakEvenUnits}\nDays to Break Even: ${costAnalysis.daysToBreakEven.toFixed(0)}\n\n=== ROI ===\nReturn on Investment: ${costAnalysis.roi.toFixed(1)}%\nTotal Investment: $${costAnalysis.totalInvestment.toFixed(0)}`
                      navigator.clipboard.writeText(text)
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all text-lg"
                  >
                    📋 Copy Report
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-all text-lg"
                  >
                    🖨️ Print Report
                  </button>
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
                <div className="flex gap-3">
                  <button
                    onClick={createNewRecipe}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                  >
                    ✨ Create New Recipe
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
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

                    {/* Can I Make This? Indicator */}
                    {(() => {
                      const canMake = canMakeRecipe(recipe, 1, 0)
                      return (
                        <div className={`mt-3 p-3 rounded-lg border-2 ${
                          canMake.canMake 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{canMake.canMake ? '✅' : '⚠️'}</span>
                            <span className={`font-bold text-sm ${
                              canMake.canMake 
                                ? 'text-emerald-700 dark:text-emerald-300' 
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                              {canMake.canMake ? 'Ready to Make!' : 'Materials Needed'}
                            </span>
                          </div>
                          {!canMake.canMake && (
                            <div className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                              {canMake.missing.slice(0, 2).map((item, idx) => (
                                <div key={idx}>• {item}</div>
                              ))}
                              {canMake.missing.length > 2 && (
                                <div>+ {canMake.missing.length - 2} more...</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyRecipe(recipe)
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadRecipeToCalculator(recipe)
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        📝 Load
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openBatchPlanner(recipe)
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        📦 Batch
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openLabelGenerator(recipe)
                        }}
                        className="bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        🏷️ Label
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

            {/* New Recipe Modal */}
            {showNewRecipeModal && editingRecipe && (
              <div
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setShowNewRecipeModal(false)
                  setEditingRecipe(null)
                }}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl relative">
                    <Input
                      value={editingRecipe.name}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                      className="text-2xl font-bold mb-2 bg-white/20 border-white/40 text-white placeholder:text-white/70"
                      placeholder="Recipe name..."
                    />
                    <span className="bg-green-300 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                      ✨ NEW RECIPE
                    </span>
                    <button
                      onClick={() => {
                        setShowNewRecipeModal(false)
                        setEditingRecipe(null)
                      }}
                      className="absolute top-4 right-4 bg-white text-green-600 w-10 h-10 rounded-full font-bold text-xl hover:bg-gray-100 transition-all"
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
                      <p className="text-green-900 dark:text-green-100 text-sm font-semibold">
                        ✨ Create Your Recipe: Edit the name, add/remove ingredients, and adjust percentages. Start from this template!
                      </p>
                    </div>

                    {/* Category Selection */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Scent Profile</Label>
                        <select
                          value={editingRecipe.profile || ''}
                          onChange={(e) => setEditingRecipe({ ...editingRecipe, profile: e.target.value })}
                          className="w-full p-2 border-2 border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">None</option>
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
                        <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Purpose</Label>
                        <select
                          value={editingRecipe.purpose || ''}
                          onChange={(e) => setEditingRecipe({ ...editingRecipe, purpose: e.target.value || undefined })}
                          className="w-full p-2 border-2 border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">None</option>
                          <option value="Sleep/Calming">Sleep/Calming</option>
                          <option value="Meditation">Meditation</option>
                          <option value="Focus">Focus</option>
                          <option value="Uplifting">Uplifting</option>
                          <option value="Self-Care">Self-Care</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block">Audience</Label>
                        <select
                          value={editingRecipe.audience || ''}
                          onChange={(e) => setEditingRecipe({ ...editingRecipe, audience: e.target.value })}
                          className="w-full p-2 border-2 border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">None</option>
                          <option value="Men's">Men's</option>
                          <option value="Women's">Women's</option>
                          <option value="Unisex">Unisex</option>
                          <option value="Pet-Friendly">Pet-Friendly</option>
                        </select>
                      </div>
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
                              className="w-20 text-sm font-bold text-green-600 dark:text-green-400"
                              min="0"
                              max="100"
                            />
                            <span className="text-green-600 dark:text-green-400 font-bold">%</span>
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
                        className="mt-4 w-full py-2 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg text-green-600 dark:text-green-400 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
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
                          setShowNewRecipeModal(false)
                          setEditingRecipe(null)
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-all"
                      >
                        📝 Load to Calculator
                      </button>
                      <button
                        onClick={saveNewRecipe}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all"
                      >
                        💾 Save Recipe
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Production Modal */}
            {showBatchModal && batchRecipe && batchMaterials && (
              <div
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => setShowBatchModal(false)}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-2xl relative">
                    <h2 className="text-3xl font-bold mb-2">📦 Batch Production Planner</h2>
                    <p className="text-white/90">{batchRecipe.name}</p>
                    <button
                      onClick={() => setShowBatchModal(false)}
                      className="absolute top-4 right-4 bg-white text-orange-600 w-10 h-10 rounded-full font-bold text-xl hover:bg-gray-100 transition-all"
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    {/* Batch Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-lg">
                          Batch Quantity
                        </Label>
                        <Input
                          type="number"
                          value={batchQuantity}
                          onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          className="text-2xl font-bold"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-900 dark:text-gray-100 font-semibold mb-2 block text-lg">
                          Vessel Type
                        </Label>
                        <select
                          value={batchVesselIndex}
                          onChange={(e) => setBatchVesselIndex(parseInt(e.target.value))}
                          className="w-full p-3 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg font-semibold"
                        >
                          {vessels.map((vessel, idx) => (
                            <option key={vessel.id} value={idx}>
                              {vessel.name} ({vesselCalculations[idx].calc.volumeOz.toFixed(1)} oz)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border-2 border-orange-300 dark:border-orange-700 mb-6">
                      <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4">💰 Cost Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Single Unit</div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${batchMaterials.singleUnitCost.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Batch Total</div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            ${batchMaterials.batchCost.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Units</div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {batchQuantity}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Volume Each</div>
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {batchMaterials.volumeOz.toFixed(1)} oz
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shopping List */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">🛒 Shopping List</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">🕯️ {materialPrices.waxType === 'soy' ? 'Soy' : 'Coconut'} Wax</span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {batchMaterials.waxGrams.toFixed(0)}g ({batchMaterials.waxLbs.toFixed(2)} lbs)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              ${(batchMaterials.waxLbs * materialPrices.waxPricePerLb).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">🌸 Fragrance Oil</span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {batchMaterials.fragranceGrams.toFixed(0)}g ({batchMaterials.fragranceLbs.toFixed(2)} lbs)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              ${(batchMaterials.fragranceLbs * materialPrices.fragrancePricePerLb).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">🏗️ Cement/Container Material</span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {batchMaterials.cementGrams.toFixed(0)}g ({batchMaterials.cementLbs.toFixed(2)} lbs)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              ${(batchMaterials.cementLbs * materialPrices.cementPricePerLb).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">🧵 Wicks</span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {batchMaterials.wicksNeeded} wicks needed
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              ${(batchMaterials.wicksNeeded * materialPrices.wickPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">🎨 Paint/Finishing</span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {batchQuantity} units
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-600 dark:text-orange-400">
                              ${(batchQuantity * materialPrices.paintPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recipe Ingredients */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6 mb-6">
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">🌸 Scent Blend</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(batchRecipe.ingredients).map(([ingredient, percent]) => (
                          <div key={ingredient} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{ingredient}</div>
                            <div className="text-lg text-purple-600 dark:text-purple-400 font-bold">{percent}%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {((batchMaterials.fragranceGrams * percent) / 100).toFixed(1)}g
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const text = `BATCH PRODUCTION - ${batchRecipe.name}\n\nQuantity: ${batchQuantity} units\nVessel: ${batchMaterials.vessel.name}\n\nSHOPPING LIST:\n🕯️ Wax: ${batchMaterials.waxLbs.toFixed(2)} lbs ($${(batchMaterials.waxLbs * materialPrices.waxPricePerLb).toFixed(2)})\n🌸 Fragrance: ${batchMaterials.fragranceLbs.toFixed(2)} lbs ($${(batchMaterials.fragranceLbs * materialPrices.fragrancePricePerLb).toFixed(2)})\n🏗️ Cement: ${batchMaterials.cementLbs.toFixed(2)} lbs ($${(batchMaterials.cementLbs * materialPrices.cementPricePerLb).toFixed(2)})\n🧵 Wicks: ${batchMaterials.wicksNeeded} ($${(batchMaterials.wicksNeeded * materialPrices.wickPrice).toFixed(2)})\n🎨 Paint: $${(batchQuantity * materialPrices.paintPrice).toFixed(2)}\n\nTOTAL COST: $${batchMaterials.batchCost.toFixed(2)}\nCost per unit: $${batchMaterials.singleUnitCost.toFixed(2)}`
                          navigator.clipboard.writeText(text)
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all text-lg"
                      >
                        📋 Copy Shopping List
                      </button>
                      <button
                        onClick={() => {
                          window.print()
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all text-lg"
                      >
                        🖨️ Print
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
