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

  // Custom Vessel Management
  const [customVessels, setCustomVessels] = useState<Vessel[]>([])
  const [showAddVesselModal, setShowAddVesselModal] = useState(false)
  const [newVessel, setNewVessel] = useState({
    name: '',
    diameter: 0,
    height: 0,
    unit: 'cm' as 'cm' | 'inches',
    imageName: ''
  })

  // Combine default vessels with custom vessels
  const allVessels = [...vessels, ...customVessels]

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

  // Marketing & Sales Tools
  const [showMarketingTools, setShowMarketingTools] = useState(false)
  const [marketingRecipe, setMarketingRecipe] = useState<Recipe | null>(null)
  const [marketingProductName, setMarketingProductName] = useState('')
  const [marketingPrice, setMarketingPrice] = useState(25.00)
  const [marketingPlatform, setMarketingPlatform] = useState<'instagram' | 'facebook' | 'email'>('instagram')
  const [marketingTone, setMarketingTone] = useState<'casual' | 'luxury' | 'professional' | 'playful'>('casual')
  const [showMarketingModal, setShowMarketingModal] = useState(false)

  // Supplier & Vendor Management
  interface Supplier {
    id: string
    name: string
    contact: string
    email: string
    phone: string
    website: string
    materials: string[]
    waxPrice: number
    fragrancePrice: number
    wickPrice: number
    rating: number
    notes: string
    lastOrderDate: string
  }

  const [showSupplierManager, setShowSupplierManager] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'CandleScience',
      contact: 'Sales Team',
      email: 'orders@candlescience.com',
      phone: '(866) 652-2635',
      website: 'www.candlescience.com',
      materials: ['Soy Wax', 'Coconut Wax', 'Fragrance Oils', 'Wicks', 'Containers'],
      waxPrice: 3.50,
      fragrancePrice: 18.00,
      wickPrice: 0.40,
      rating: 5,
      notes: 'Fast shipping, excellent quality. Free shipping over $100.',
      lastOrderDate: '2025-11-15'
    },
    {
      id: '2',
      name: 'Lone Star Candle Supply',
      contact: 'Customer Service',
      email: 'info@lonestarcandlesupply.com',
      phone: '(214) 800-2655',
      website: 'www.lonestarcandlesupply.com',
      materials: ['Soy Wax', 'Fragrance Oils', 'Wicks', 'Dyes'],
      waxPrice: 3.25,
      fragrancePrice: 16.50,
      wickPrice: 0.35,
      rating: 4,
      notes: 'Best prices, bulk discounts. Slower shipping.',
      lastOrderDate: '2025-10-20'
    },
    {
      id: '3',
      name: 'Bramble Berry',
      contact: 'Orders Department',
      email: 'support@brambleberry.com',
      phone: '(877) 627-7883',
      website: 'www.brambleberry.com',
      materials: ['Coconut Wax', 'Essential Oils', 'Containers', 'Labels'],
      waxPrice: 4.00,
      fragrancePrice: 20.00,
      wickPrice: 0.50,
      rating: 5,
      notes: 'Premium quality, great for luxury candles. Higher prices.',
      lastOrderDate: '2025-12-01'
    }
  ])
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false)
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contact: '',
    email: '',
    phone: '',
    website: '',
    materials: [],
    waxPrice: 0,
    fragrancePrice: 0,
    wickPrice: 0,
    rating: 3,
    notes: '',
    lastOrderDate: new Date().toISOString().split('T')[0]
  })

  // Customer Relationship Manager (CRM)
  interface Customer {
    id: string
    name: string
    email: string
    phone: string
    address: string
    birthday: string
    favoriteScents: string[]
    totalOrders: number
    totalSpent: number
    lastOrderDate: string
    loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
    notes: string
    orderHistory: {
      date: string
      product: string
      quantity: number
      amount: number
    }[]
    communications: {
      date: string
      type: 'Email' | 'Phone' | 'Text' | 'In-Person'
      notes: string
    }[]
  }

  const [showCRMManager, setShowCRMManager] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(561) 555-0123',
      address: '123 Ocean Ave, Palm Beach, FL 33480',
      birthday: '1985-06-15',
      favoriteScents: ['Lavender', 'Ocean Breeze', 'Vanilla'],
      totalOrders: 8,
      totalSpent: 640.00,
      lastOrderDate: '2025-12-05',
      loyaltyTier: 'Gold',
      notes: 'VIP customer. Loves floral scents. Always orders 2-3 candles per month.',
      orderHistory: [
        { date: '2025-12-05', product: 'Lavender Dreams', quantity: 2, amount: 80.00 },
        { date: '2025-11-20', product: 'Ocean Breeze', quantity: 3, amount: 120.00 },
        { date: '2025-10-10', product: 'Vanilla Bean', quantity: 2, amount: 80.00 }
      ],
      communications: [
        { date: '2025-12-01', type: 'Email', notes: 'Sent holiday promotion' },
        { date: '2025-11-15', type: 'Phone', notes: 'Called to confirm custom order' }
      ]
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'mchen@business.com',
      phone: '(561) 555-0456',
      address: '456 Worth Ave, Palm Beach, FL 33480',
      birthday: '1990-03-22',
      favoriteScents: ['Sandalwood', 'Cedar', 'Coffee'],
      totalOrders: 15,
      totalSpent: 1875.00,
      lastOrderDate: '2025-12-08',
      loyaltyTier: 'Platinum',
      notes: 'Bulk buyer for office. Orders monthly for conference rooms.',
      orderHistory: [
        { date: '2025-12-08', product: 'Cedar & Sage', quantity: 10, amount: 400.00 },
        { date: '2025-11-10', product: 'Coffee House', quantity: 8, amount: 320.00 }
      ],
      communications: [
        { date: '2025-12-05', type: 'Email', notes: 'Requested bulk discount quote' },
        { date: '2025-11-08', type: 'In-Person', notes: 'Met at market, discussed corporate orders' }
      ]
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@gmail.com',
      phone: '(561) 555-0789',
      address: '789 Royal Palm Way, Palm Beach, FL 33480',
      birthday: '1988-09-30',
      favoriteScents: ['Citrus', 'Eucalyptus', 'Mint'],
      totalOrders: 4,
      totalSpent: 160.00,
      lastOrderDate: '2025-11-28',
      loyaltyTier: 'Silver',
      notes: 'Gift buyer. Usually purchases around holidays and birthdays.',
      orderHistory: [
        { date: '2025-11-28', product: 'Citrus Splash', quantity: 2, amount: 80.00 },
        { date: '2025-09-15', product: 'Eucalyptus Mint', quantity: 2, amount: 80.00 }
      ],
      communications: [
        { date: '2025-11-20', type: 'Text', notes: 'Confirmed delivery address' }
      ]
    }
  ])
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    favoriteScents: [],
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: new Date().toISOString().split('T')[0],
    loyaltyTier: 'Bronze',
    notes: '',
    orderHistory: [],
    communications: []
  })

  // Business Analytics & Reports Dashboard
  interface SalesData {
    month: string
    revenue: number
    orders: number
    newCustomers: number
  }

  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [salesData] = useState<SalesData[]>([
    { month: 'Jan 2025', revenue: 2450, orders: 35, newCustomers: 8 },
    { month: 'Feb 2025', revenue: 2890, orders: 41, newCustomers: 12 },
    { month: 'Mar 2025', revenue: 3120, orders: 44, newCustomers: 10 },
    { month: 'Apr 2025', revenue: 3580, orders: 51, newCustomers: 15 },
    { month: 'May 2025', revenue: 4200, orders: 60, newCustomers: 18 },
    { month: 'Jun 2025', revenue: 4850, orders: 69, newCustomers: 22 },
    { month: 'Jul 2025', revenue: 5320, orders: 76, newCustomers: 20 },
    { month: 'Aug 2025', revenue: 5100, orders: 73, newCustomers: 16 },
    { month: 'Sep 2025', revenue: 4680, orders: 67, newCustomers: 14 },
    { month: 'Oct 2025', revenue: 5890, orders: 84, newCustomers: 25 },
    { month: 'Nov 2025', revenue: 6420, orders: 92, newCustomers: 28 },
    { month: 'Dec 2025', revenue: 7200, orders: 103, newCustomers: 32 }
  ])

  // Auto-Reorder Alerts & Inventory Tracking
  const [showReorderAlert, setShowReorderAlert] = useState(false)
  const [reorderThresholds, setReorderThresholds] = useState({
    waxLbs: 20,
    fragranceOilLbs: 5,
    cementLbs: 10,
    wicks: 100,
    paint: 30
  })

  // Testing & Development Log
  interface TestLog {
    id: string
    recipeName: string
    testDate: string
    cureDay: number
    coldThrow: number
    hotThrow: number
    burnHours: number
    tunneling: boolean
    sooting: boolean
    mushrooming: boolean
    drowning: boolean
    frosting: boolean
    wetSpots: boolean
    sinkHoles: boolean
    status: 'PASS' | 'FAIL' | 'NEEDS ADJUSTMENT'
    notes: string
    photos: string[]
  }

  const [showTestingLog, setShowTestingLog] = useState(false)
  const [testLogs, setTestLogs] = useState<TestLog[]>([
    {
      id: '1',
      recipeName: 'Lavender Dreams',
      testDate: '2025-12-01',
      cureDay: 14,
      coldThrow: 8,
      hotThrow: 9,
      burnHours: 45,
      tunneling: false,
      sooting: false,
      mushrooming: false,
      drowning: false,
      frosting: true,
      wetSpots: false,
      sinkHoles: false,
      status: 'PASS',
      notes: 'Perfect scent throw. Minor frosting acceptable for soy. CD-12 wick works great.',
      photos: []
    }
  ])
  const [showAddTestModal, setShowAddTestModal] = useState(false)
  const [newTestLog, setNewTestLog] = useState<Partial<TestLog>>({
    recipeName: '',
    testDate: new Date().toISOString().split('T')[0],
    cureDay: 1,
    coldThrow: 5,
    hotThrow: 5,
    burnHours: 0,
    tunneling: false,
    sooting: false,
    mushrooming: false,
    drowning: false,
    frosting: false,
    wetSpots: false,
    sinkHoles: false,
    status: 'NEEDS ADJUSTMENT',
    notes: '',
    photos: []
  })

  // Scent Blending Simulator
  interface ScentBlend {
    name: string
    percentage: number
  }

  const [showScentBlender, setShowScentBlender] = useState(false)
  const [scentBlends, setScentBlends] = useState<ScentBlend[]>([
    { name: 'Lavender', percentage: 40 },
    { name: 'Vanilla', percentage: 30 },
    { name: 'Chamomile', percentage: 30 }
  ])
  const [blendPrediction, setBlendPrediction] = useState({
    profile: '',
    strength: '',
    similar: '',
    bestFor: '',
    popularity: 0,
    warning: ''
  })

  // Advanced Cost Tracking
  const [advancedCosts, setAdvancedCosts] = useState({
    rent: 800,
    utilities: 150,
    equipmentDepreciation: 100,
    packagingBoxes: 0.50,
    packagingTissue: 0.15,
    packagingStickers: 0.10,
    packagingThankYouCards: 0.25,
    shippingBubbleWrap: 0.30,
    shippingBoxes: 1.50,
    shippingLabels: 0.10,
    marketingAds: 200,
    marketingSamples: 50,
    marketingPhotography: 100,
    stripeFeePercent: 2.9,
    stripeFeeFixed: 0.30,
    etsyFeePercent: 6.5,
    shopifyMonthly: 39,
    insurance: 50,
    licenses: 25,
    businessFees: 30
  })

  // Custom Cost Entries
  interface CustomCost {
    id: string
    name: string
    amount: number
    type: 'monthly' | 'per-unit'
  }
  const [customCosts, setCustomCosts] = useState<CustomCost[]>([])
  const [showAddCustomCost, setShowAddCustomCost] = useState(false)
  const [newCustomCost, setNewCustomCost] = useState({
    name: '',
    amount: 0,
    type: 'monthly' as 'monthly' | 'per-unit'
  })

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

  // Calculate all vessels (including custom vessels)
  const vesselCalculations = allVessels.map(vessel => ({
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

  // Check for low inventory and trigger reorder alerts
  useEffect(() => {
    const checkInventory = () => {
      const lowStock = 
        inventory.waxLbs <= reorderThresholds.waxLbs ||
        inventory.fragranceOilLbs <= reorderThresholds.fragranceOilLbs ||
        inventory.cementLbs <= reorderThresholds.cementLbs ||
        inventory.wicks <= reorderThresholds.wicks ||
        inventory.paint <= reorderThresholds.paint

      if (lowStock) {
        setShowReorderAlert(true)
      }
    }

    checkInventory()
  }, [inventory, reorderThresholds])

  // Scent Blending AI Predictor
  const predictScentBlend = () => {
    const totalPercent = scentBlends.reduce((sum, blend) => sum + blend.percentage, 0)
    
    if (Math.abs(totalPercent - 100) > 0.1) {
      setBlendPrediction({
        profile: '',
        strength: '',
        similar: '',
        bestFor: '',
        popularity: 0,
        warning: `⚠️ Percentages must equal 100% (currently ${totalPercent.toFixed(1)}%)`
      })
      return
    }

    // AI-powered prediction logic
    const scents = scentBlends.map(b => b.name.toLowerCase())
    const hasLavender = scents.some(s => s.includes('lavender'))
    const hasVanilla = scents.some(s => s.includes('vanilla'))
    const hasCitrus = scents.some(s => s.includes('citrus') || s.includes('lemon') || s.includes('orange'))
    const hasChamomile = scents.some(s => s.includes('chamomile'))
    const hasCoffee = scents.some(s => s.includes('coffee'))
    const hasSandalwood = scents.some(s => s.includes('sandalwood') || s.includes('cedar'))
    const hasRose = scents.some(s => s.includes('rose'))
    const hasMint = scents.some(s => s.includes('mint') || s.includes('eucalyptus'))

    let profile = ''
    let strength = 'MEDIUM'
    let similar = ''
    let bestFor = ''
    let popularity = 7.5
    let warning = ''

    // Determine blend profile
    if (hasLavender && hasVanilla && hasChamomile) {
      profile = 'CALMING, SWEET, HERBAL'
      similar = 'Bath & Body Works "Stress Relief"'
      bestFor = 'Bedroom, Spa, Relaxation'
      popularity = 8.7
    } else if (hasCitrus && hasVanilla) {
      profile = 'FRESH, SWEET, UPLIFTING'
      similar = 'Yankee Candle "Vanilla Lime"'
      bestFor = 'Kitchen, Living Room, Morning'
      popularity = 8.2
      warning = '⚠️ Warning: Citrus + Vanilla may separate - test thoroughly'
    } else if (hasCoffee && hasVanilla) {
      profile = 'GOURMAND, COZY, ENERGIZING'
      similar = 'Starbucks Cafe Scent'
      bestFor = 'Kitchen, Office, Morning'
      popularity = 9.1
    } else if (hasSandalwood && hasVanilla) {
      profile = 'WARM, WOODSY, LUXURIOUS'
      similar = 'Tom Ford "Santal Blush"'
      bestFor = 'Bedroom, Office, Evening'
      popularity = 8.9
    } else if (hasLavender && hasMint) {
      profile = 'FRESH, HERBAL, INVIGORATING'
      similar = 'Spa Collection Aromatherapy'
      bestFor = 'Bathroom, Spa, Wellness'
      popularity = 7.8
    } else if (hasRose && hasVanilla) {
      profile = 'FLORAL, ROMANTIC, ELEGANT'
      similar = 'Designer Perfume Inspired'
      bestFor = 'Bedroom, Bathroom, Special Occasions'
      popularity = 8.5
    } else if (hasCitrus) {
      profile = 'BRIGHT, ENERGIZING, CLEAN'
      similar = 'Summer Refresh Collection'
      bestFor = 'Kitchen, Bathroom, Daytime'
      popularity = 8.0
    } else if (hasVanilla) {
      profile = 'WARM, COMFORTING, SWEET'
      similar = 'Classic Bakery Vanilla'
      bestFor = 'Living Room, Bedroom, All Seasons'
      popularity = 9.0
    } else {
      profile = 'UNIQUE CUSTOM BLEND'
      similar = 'Custom Artisan Creation'
      bestFor = 'Experimental, Niche Market'
      popularity = 7.0
    }

    // Determine strength based on percentages
    const dominantScent = scentBlends.reduce((max, blend) => 
      blend.percentage > max.percentage ? blend : max, scentBlends[0]
    )
    
    if (dominantScent.percentage >= 60) {
      strength = 'STRONG'
    } else if (dominantScent.percentage <= 25) {
      strength = 'LIGHT'
    }

    setBlendPrediction({
      profile,
      strength,
      similar,
      bestFor,
      popularity,
      warning
    })
  }

  // Reorder Material from Supplier
  const reorderMaterial = (supplierId: string, material: string) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    if (!supplier) return

    const subject = `Reorder: ${material}`
    const body = `Hello ${supplier.contact},%0D%0A%0D%0AI would like to place a reorder for ${material}.%0D%0A%0D%0APlease send quote and availability.%0D%0A%0D%0AThank you!`
    const mailtoLink = `mailto:${supplier.email}?subject=${subject}&body=${body}`
    
    window.location.href = mailtoLink
  }

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

  // Add Custom Vessel Function
  const addCustomVessel = () => {
    if (!newVessel.name || newVessel.diameter <= 0 || newVessel.height <= 0) {
      alert('Please enter vessel name, diameter, and height')
      return
    }

    const vessel: Vessel = {
      id: 200 + customVessels.length, // Start custom IDs at 200
      name: newVessel.name,
      diameter: newVessel.diameter,
      height: newVessel.height,
      unit: newVessel.unit,
      imageName: newVessel.imageName || 'vessel-100.png' // Default image if none provided
    }

    setCustomVessels([...customVessels, vessel])
    setShowAddVesselModal(false)
    setNewVessel({
      name: '',
      diameter: 0,
      height: 0,
      unit: 'cm',
      imageName: ''
    })
  }

  const deleteCustomVessel = (id: number) => {
    if (confirm('Are you sure you want to delete this custom vessel?')) {
      setCustomVessels(customVessels.filter(v => v.id !== id))
    }
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

  // Marketing Content Generators
  const openMarketingTools = (recipe: Recipe) => {
    setMarketingRecipe(recipe)
    setMarketingProductName(recipe.name)
    setShowMarketingModal(true)
  }

  const generateSocialMediaPost = () => {
    if (!marketingRecipe) return ''

    const ingredients = Object.keys(marketingRecipe.ingredients).slice(0, 3).join(', ')
    
    const templates = {
      instagram: {
        casual: `✨ Meet ${marketingProductName}! ✨\n\n🌸 Handcrafted with love using ${ingredients}\n🕯️ ${marketingRecipe.profile || 'Custom blend'} vibes\n💰 $${marketingPrice}\n\n${marketingRecipe.purpose ? `Perfect for ${marketingRecipe.purpose.toLowerCase()} ` : ''}${marketingRecipe.audience ? `• ${marketingRecipe.audience}` : ''}\n\n🛒 Shop now! Link in bio\n\n#LimenLakay #HandmadeCandles #SoyCandles #CandleLover #HomeFragrance #SelfCare #CandleAddict #SmallBusiness #SupportLocal #PalmBeachFL`,
        
        luxury: `Introducing ${marketingProductName} 🕊️\n\nAn exquisite blend of ${ingredients}, meticulously crafted for the discerning connoisseur.\n\n${marketingRecipe.profile || 'Masterfully blended'} | Premium ${materialPrices.waxType} wax | $${marketingPrice}\n\n${marketingRecipe.purpose ? `Designed for ${marketingRecipe.purpose.toLowerCase()}.\n\n` : ''}Limited availability.\n\nExperience luxury. Experience Limen Lakay.\n\n#LuxuryCandles #PremiumHomeFragrance #ArtisanCandles #LimenLakay #ElevatedLiving #LuxuryHome`,
        
        professional: `NEW: ${marketingProductName}\n\nCrafted with precision using ${ingredients}.\n\n• ${marketingRecipe.profile || 'Custom formulated'}\n• Premium ${materialPrices.waxType} wax\n• ${marketingRecipe.audience || 'Universal appeal'}\n• $${marketingPrice}\n\n${marketingRecipe.purpose ? `Ideal for ${marketingRecipe.purpose.toLowerCase()}.\n\n` : ''}Quality guaranteed. Made in Palm Beach, FL.\n\nOrder yours today: www.limenlakay.com\n\n#LimenLakay #CandleBusiness #QualityCandles #HomeDecor`,
        
        playful: `🎉 OMG! ${marketingProductName} just dropped! 🎉\n\n💕 Packed with ${ingredients}\n🌈 ${marketingRecipe.profile || 'Amazing'} feels!\n✨ Only $${marketingPrice}\n\n${marketingRecipe.purpose ? `Your new fave for ${marketingRecipe.purpose.toLowerCase()}! ` : ''}Grab yours before they're gone! 🏃‍♀️💨\n\n👉 Link in bio!\n\n#LimenLakay #CandleObsessed #TreatYourself #CandleCommunity #CandleGoals #Mood #Vibes`
      },
      facebook: {
        casual: `Excited to introduce ${marketingProductName}! 🕯️\n\nWe've been working hard on this one, and we think you're going to love it! Featuring ${ingredients}, this candle brings ${marketingRecipe.profile || 'an amazing scent'} right to your home.\n\n${marketingRecipe.purpose ? `Perfect for ${marketingRecipe.purpose.toLowerCase()}` : 'Perfect for any occasion'}${marketingRecipe.audience ? ` - especially loved by ${marketingRecipe.audience.toLowerCase()} customers` : ''}!\n\nNow available for $${marketingPrice}.\n\n🛒 Shop: www.limenlakay.com\n📧 Questions? info@limenlakay.com\n📱 (561) 593-0238\n\nHandcrafted with love in Palm Beach, FL 🌴`,
        
        luxury: `Unveiling ${marketingProductName} - Where Artistry Meets Aromatherapy\n\nOur master candlemakers have curated an extraordinary experience featuring ${ingredients}, creating a ${marketingRecipe.profile || 'sophisticated'} ambiance that transforms your space.\n\n${marketingRecipe.purpose ? `Expertly designed for ${marketingRecipe.purpose.toLowerCase()}, ` : ''}this premium creation represents the pinnacle of artisan candle making.\n\nInvestment: $${marketingPrice}\n\nDiscover the difference that true craftsmanship makes.\n\nwww.limenlakay.com | Handcrafted in Palm Beach, FL`,
        
        professional: `Product Launch: ${marketingProductName}\n\nLimen Lakay is proud to announce our latest creation, featuring:\n\n✓ ${ingredients}\n✓ ${marketingRecipe.profile || 'Custom formulated scent profile'}\n✓ Premium ${materialPrices.waxType} wax base\n✓ ${marketingRecipe.audience || 'Broad market appeal'}\n\nPrice Point: $${marketingPrice}\n${marketingRecipe.purpose ? `Application: ${marketingRecipe.purpose}\n` : ''}\nAvailability: In Stock\n\nContact Information:\n🌐 www.limenlakay.com\n📧 info@limenlakay.com\n📱 (561) 593-0238\n\nManufactured in Palm Beach, Florida`,
        
        playful: `🚨 ALERT! ALERT! 🚨\n\nThe ${marketingProductName} is HERE and it's EVERYTHING! 😍\n\nLoaded with ${ingredients} and radiating ${marketingRecipe.profile || 'amazing'} energy! ${marketingRecipe.purpose ? `Your ${marketingRecipe.purpose.toLowerCase()} routine just got a MAJOR upgrade! ` : ''}\n\nOnly $${marketingPrice}! (Seriously, that's a steal! 🤑)\n\nTrust us, your home is about to smell INCREDIBLE! ✨\n\nGrab yours NOW: www.limenlakay.com\n\nTag a friend who NEEDS this! 👇`
      },
      email: {
        casual: `Subject: You're Going to Love Our New ${marketingProductName}! 🕯️\n\nHey there!\n\nWe're so excited to share our latest creation with you - ${marketingProductName}!\n\nThis candle features ${ingredients} and creates a ${marketingRecipe.profile || 'wonderful'} atmosphere in any room. ${marketingRecipe.purpose ? `It's perfect for ${marketingRecipe.purpose.toLowerCase()}` : 'It works beautifully anywhere in your home'}.\n\nSpecial Launch Price: $${marketingPrice}\n\n[Shop Now Button]\n\nAs always, handcrafted with love in Palm Beach, FL.\n\nThanks for supporting our small business!\n\nWarm regards,\nLimen Lakay Team\n\nwww.limenlakay.com | @limenlakay`,
        
        luxury: `Subject: Introducing ${marketingProductName} - An Olfactory Masterpiece\n\nDear Valued Client,\n\nWe are delighted to present ${marketingProductName}, our newest addition to the Limen Lakay collection.\n\nThis exceptional piece features ${ingredients}, expertly balanced to create a ${marketingRecipe.profile || 'refined and sophisticated'} sensory experience.\n\n${marketingRecipe.purpose ? `Designed specifically for ${marketingRecipe.purpose.toLowerCase()}, this candle ` : 'This candle '}represents the zenith of artisan craftsmanship.\n\nAvailable now at $${marketingPrice}.\n\n[Discover More]\n\nWith appreciation,\nThe Limen Lakay Atelier\nPalm Beach, Florida`,
        
        professional: `Subject: Product Launch - ${marketingProductName}\n\nDear Customer,\n\nLimen Lakay is pleased to announce the release of ${marketingProductName}.\n\nProduct Specifications:\n• Scent Profile: ${ingredients}\n• Category: ${marketingRecipe.profile || 'Custom blend'}\n• Target Audience: ${marketingRecipe.audience || 'General market'}\n• Price: $${marketingPrice}\n• Wax Type: Premium ${materialPrices.waxType}\n\n${marketingRecipe.purpose ? `Recommended Use: ${marketingRecipe.purpose}\n\n` : ''}[Order Now]\n\nFor questions or bulk orders, contact:\ninfo@limenlakay.com | (561) 593-0238\n\nBest regards,\nLimen Lakay\nwww.limenlakay.com`,
        
        playful: `Subject: 🎉 OMG! ${marketingProductName} Is Here! 🎉\n\nHEY YOU! 👋\n\nGuess what just landed?! Our AMAZING new ${marketingProductName}! 😍\n\nIt's got ${ingredients} and smells like ${marketingRecipe.profile || 'absolute HEAVEN'}! ${marketingRecipe.purpose ? `Perfect for your ${marketingRecipe.purpose.toLowerCase()} vibes! ` : ''}\n\nAnd the price? Just $${marketingPrice}! 🤑\n\n[SHOP NOW - You Know You Want To!]\n\nP.S. Your home is about to smell SO GOOD! 🏠✨\n\nXOXO,\nThe Limen Lakay Crew\n\nwww.limenlakay.com | Follow us @limenlakay`
      }
    }

    return templates[marketingPlatform][marketingTone]
  }

  const generateHashtags = () => {
    if (!marketingRecipe) return []

    const baseHashtags = ['#LimenLakay', '#HandmadeCandles', '#CandleLover', '#HomeFragrance']
    
    const scentHashtags: { [key: string]: string[] } = {
      'Floral': ['#FloralCandle', '#FloralScent', '#BotanicalCandle'],
      'Citrus': ['#CitrusCandle', '#FreshScent', '#Energizing'],
      'Fruity': ['#FruityCandle', '#SweetScent', '#SummerVibes'],
      'Gourmand': ['#GourmandCandle', '#FoodieCandle', '#CozyVibes'],
      'Herbal': ['#HerbalCandle', '#Aromatherapy', '#NaturalScent'],
      'Spicy': ['#SpicyCandle', '#WarmScent', '#CozyHome'],
      'Clean/Spa': ['#SpaCandle', '#CleanScent', '#Relaxing'],
      'Earthy': ['#EarthyCandle', '#WoodlandScent', '#Nature']
    }

    const audienceHashtags: { [key: string]: string[] } = {
      "Men's": ['#MensCandle', '#ForHim', '#MasculineScent'],
      "Women's": ['#WomensCandle', '#ForHer', '#FeminineScent'],
      'Unisex': ['#UnisexCandle', '#ForEveryone', '#GenderNeutral'],
      'Pet-Friendly': ['#PetSafe', '#PetFriendly', '#SafeForPets']
    }

    const purposeHashtags: { [key: string]: string[] } = {
      'Sleep/Calming': ['#SleepAid', '#Relaxation', '#BedtimeRoutine'],
      'Meditation': ['#Meditation', '#Mindfulness', '#Zen'],
      'Focus': ['#Productivity', '#Focus', '#WorkFromHome'],
      'Uplifting': ['#Uplifting', '#MoodBooster', '#PositiveVibes'],
      'Self-Care': ['#SelfCare', '#Wellness', '#MeTime']
    }

    let allHashtags = [...baseHashtags]

    if (marketingRecipe.profile && scentHashtags[marketingRecipe.profile]) {
      allHashtags = [...allHashtags, ...scentHashtags[marketingRecipe.profile]]
    }

    if (marketingRecipe.audience && audienceHashtags[marketingRecipe.audience]) {
      allHashtags = [...allHashtags, ...audienceHashtags[marketingRecipe.audience]]
    }

    if (marketingRecipe.purpose && purposeHashtags[marketingRecipe.purpose]) {
      allHashtags = [...allHashtags, ...purposeHashtags[marketingRecipe.purpose]]
    }

    // Add wax type
    if (materialPrices.waxType === 'soy') {
      allHashtags.push('#SoyCandles', '#EcoFriendly', '#Natural')
    } else {
      allHashtags.push('#CoconutWax', '#CleanBurning', '#Sustainable')
    }

    // Add general popular hashtags
    allHashtags.push('#SmallBusiness', '#SupportLocal', '#PalmBeachFL', '#CandleAddict', '#HomeDecor', '#CandleCommunity')

    return allHashtags.slice(0, 30) // Instagram allows up to 30 hashtags
  }

  // Supplier Management Functions
  const addSupplier = () => {
    if (!newSupplier.name || !newSupplier.email) {
      alert('Please enter supplier name and email')
      return
    }

    const supplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name || '',
      contact: newSupplier.contact || '',
      email: newSupplier.email || '',
      phone: newSupplier.phone || '',
      website: newSupplier.website || '',
      materials: newSupplier.materials || [],
      waxPrice: newSupplier.waxPrice || 0,
      fragrancePrice: newSupplier.fragrancePrice || 0,
      wickPrice: newSupplier.wickPrice || 0,
      rating: newSupplier.rating || 3,
      notes: newSupplier.notes || '',
      lastOrderDate: newSupplier.lastOrderDate || new Date().toISOString().split('T')[0]
    }

    setSuppliers([...suppliers, supplier])
    setShowAddSupplierModal(false)
    setNewSupplier({
      name: '',
      contact: '',
      email: '',
      phone: '',
      website: '',
      materials: [],
      waxPrice: 0,
      fragrancePrice: 0,
      wickPrice: 0,
      rating: 3,
      notes: '',
      lastOrderDate: new Date().toISOString().split('T')[0]
    })
  }

  const deleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id))
    }
  }

  const updateSupplierRating = (id: string, rating: number) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, rating } : s))
  }

  const getCheapestSupplier = (material: 'wax' | 'fragrance' | 'wick') => {
    const priceKey = material === 'wax' ? 'waxPrice' : material === 'fragrance' ? 'fragrancePrice' : 'wickPrice'
    const validSuppliers = suppliers.filter(s => s[priceKey] > 0)
    if (validSuppliers.length === 0) return null
    return validSuppliers.reduce((min, s) => s[priceKey] < min[priceKey] ? s : min)
  }

  const calculatePotentialSavings = () => {
    const cheapestWax = getCheapestSupplier('wax')
    const cheapestFragrance = getCheapestSupplier('fragrance')
    const cheapestWick = getCheapestSupplier('wick')

    const currentWaxPrice = materialPrices.waxPricePerLb
    const currentFragrancePrice = materialPrices.fragrancePricePerLb
    const currentWickPrice = materialPrices.wickPrice

    let savings = 0
    if (cheapestWax && cheapestWax.waxPrice < currentWaxPrice) {
      savings += (currentWaxPrice - cheapestWax.waxPrice) * inventory.waxLbs
    }
    if (cheapestFragrance && cheapestFragrance.fragrancePrice < currentFragrancePrice) {
      savings += (currentFragrancePrice - cheapestFragrance.fragrancePrice) * inventory.fragranceOilLbs
    }
    if (cheapestWick && cheapestWick.wickPrice < currentWickPrice) {
      savings += (currentWickPrice - cheapestWick.wickPrice) * inventory.wicks
    }

    return savings
  }

  const getReorderRecommendations = () => {
    const recommendations = []
    
    if (inventory.waxLbs < 20) {
      const supplier = getCheapestSupplier('wax')
      recommendations.push({
        material: 'Wax',
        currentStock: inventory.waxLbs,
        reorderAmount: 50,
        supplier: supplier?.name || 'Best available',
        estimatedCost: (supplier?.waxPrice || materialPrices.waxPricePerLb) * 50
      })
    }

    if (inventory.fragranceOilLbs < 5) {
      const supplier = getCheapestSupplier('fragrance')
      recommendations.push({
        material: 'Fragrance Oil',
        currentStock: inventory.fragranceOilLbs,
        reorderAmount: 10,
        supplier: supplier?.name || 'Best available',
        estimatedCost: (supplier?.fragrancePrice || materialPrices.fragrancePricePerLb) * 10
      })
    }

    if (inventory.wicks < 50) {
      const supplier = getCheapestSupplier('wick')
      recommendations.push({
        material: 'Wicks',
        currentStock: inventory.wicks,
        reorderAmount: 100,
        supplier: supplier?.name || 'Best available',
        estimatedCost: (supplier?.wickPrice || materialPrices.wickPrice) * 100
      })
    }

    return recommendations
  }

  // CRM Functions
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Please enter customer name and email')
      return
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      birthday: newCustomer.birthday || '',
      favoriteScents: newCustomer.favoriteScents || [],
      totalOrders: newCustomer.totalOrders || 0,
      totalSpent: newCustomer.totalSpent || 0,
      lastOrderDate: newCustomer.lastOrderDate || new Date().toISOString().split('T')[0],
      loyaltyTier: newCustomer.loyaltyTier || 'Bronze',
      notes: newCustomer.notes || '',
      orderHistory: newCustomer.orderHistory || [],
      communications: newCustomer.communications || []
    }

    setCustomers([...customers, customer])
    setShowAddCustomerModal(false)
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      birthday: '',
      favoriteScents: [],
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      loyaltyTier: 'Bronze',
      notes: '',
      orderHistory: [],
      communications: []
    })
  }

  const deleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id))
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null)
      }
    }
  }

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-purple-100 to-pink-100 border-purple-400 dark:from-purple-900/30 dark:to-pink-900/30'
      case 'Gold': return 'from-yellow-100 to-amber-100 border-yellow-400 dark:from-yellow-900/30 dark:to-amber-900/30'
      case 'Silver': return 'from-gray-100 to-slate-100 border-gray-400 dark:from-gray-900/30 dark:to-slate-900/30'
      default: return 'from-orange-100 to-amber-100 border-orange-400 dark:from-orange-900/30 dark:to-amber-900/30'
    }
  }

  const getLoyaltyBenefits = (tier: string) => {
    switch (tier) {
      case 'Platinum': return '25% off + Free shipping + Priority support + Birthday gift'
      case 'Gold': return '15% off + Free shipping + Birthday gift'
      case 'Silver': return '10% off + Birthday gift'
      default: return '5% off on orders over $50'
    }
  }

  const getUpcomingBirthdays = () => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return customers.filter(customer => {
      if (!customer.birthday) return false
      const birthday = new Date(customer.birthday)
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
      return thisYearBirthday >= today && thisYearBirthday <= thirtyDaysFromNow
    }).sort((a, b) => {
      const dateA = new Date(a.birthday)
      const dateB = new Date(b.birthday)
      return dateA.getMonth() * 31 + dateA.getDate() - (dateB.getMonth() * 31 + dateB.getDate())
    })
  }

  // Export Functions
  const exportToCSV = (data: string[][], filename: string) => {
    const csvContent = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
  }

  const exportToPDF = (title: string, content: string) => {
    // Create a simple HTML document for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #0891b2; border-bottom: 3px solid #0891b2; padding-bottom: 10px; }
          h2 { color: #059669; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #0891b2; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .metric { background: #e0f2fe; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .metric strong { color: #0891b2; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url)
    if (newWindow) {
      setTimeout(() => {
        newWindow.print()
      }, 500)
    }
  }

  // Analytics Functions
  const getTopSellingProducts = () => {
    const productSales: { [key: string]: number } = {}
    
    customers.forEach(customer => {
      customer.orderHistory.forEach(order => {
        productSales[order.product] = (productSales[order.product] || 0) + order.quantity
      })
    })

    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([product, quantity]) => ({ product, quantity }))
  }

  const getRevenueGrowth = () => {
    if (salesData.length < 2) return 0
    const lastMonth = salesData[salesData.length - 1].revenue
    const previousMonth = salesData[salesData.length - 2].revenue
    return ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1)
  }

  const getAverageOrderValue = () => {
    const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0)
    const totalOrders = salesData.reduce((sum, data) => sum + data.orders, 0)
    return totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'
  }

  const getCustomerRetentionRate = () => {
    const repeatCustomers = customers.filter(c => c.totalOrders > 1).length
    return customers.length > 0 ? ((repeatCustomers / customers.length) * 100).toFixed(0) : '0'
  }

  const getTotalYearRevenue = () => {
    return salesData.reduce((sum, data) => sum + data.revenue, 0).toFixed(2)
  }

  const getBestMonth = () => {
    if (salesData.length === 0) return { month: 'N/A', revenue: 0 }
    const best = salesData.reduce((max, data) => data.revenue > max.revenue ? data : max)
    return best
  }

  const getRevenueByQuarter = () => {
    const quarters = [
      { name: 'Q1 2025', months: ['Jan 2025', 'Feb 2025', 'Mar 2025'] },
      { name: 'Q2 2025', months: ['Apr 2025', 'May 2025', 'Jun 2025'] },
      { name: 'Q3 2025', months: ['Jul 2025', 'Aug 2025', 'Sep 2025'] },
      { name: 'Q4 2025', months: ['Oct 2025', 'Nov 2025', 'Dec 2025'] }
    ]

    return quarters.map(quarter => ({
      quarter: quarter.name,
      revenue: salesData
        .filter(data => quarter.months.includes(data.month))
        .reduce((sum, data) => sum + data.revenue, 0)
    }))
  }

  // Tooltip Component
  const Tooltip = ({ text }: { text: string }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    
    return (
      <div className="relative inline-block ml-2">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all"
        >
          ?
        </button>
        {showTooltip && (
          <div className="absolute left-0 top-7 z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl border-2 border-blue-500">
            <div className="absolute -top-2 left-2 w-4 h-4 bg-gray-900 border-l-2 border-t-2 border-blue-500 transform rotate-45"></div>
            {text}
          </div>
        )}
      </div>
    )
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
                Calculate production costs for {allVessels.length} vessel styles ({vessels.length} default + {customVessels.length} custom) • Updated v2.0
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddVesselModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              ➕ Add Custom Vessel
            </button>
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

        {/* Material Prices & Custom Candle Calculator → moved to Price Calculator */}
        <Card className="mb-6 border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">⚗️ Material Prices &amp; Custom Candle Calculator</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">These tools have moved to the dedicated Price Calculator for a better experience.</p>
            </div>
            <Link
              href="/admin-price-calculator"
              className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              → Open Price Calculator
            </Link>
          </CardContent>
        </Card>

        {/* Inventory Management -> moved to Inventory Dashboard */}
        <Card className="mb-6 border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Inventory Manager</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">Track stock levels, low-stock alerts, and reorder management in the dedicated Inventory Dashboard.</p>
            </div>
            <Link href="/inventory-dashboard" className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm">Open Inventory Dashboard</Link>
          </CardContent>
        </Card>

        {/* Pricing Wizard -> moved to Price Calculator */}
        <Card className="mb-6 border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-orange-900 dark:text-orange-100">Pricing Wizard</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-0.5">Set pricing tiers, bulk discounts, and market comparisons in the dedicated Price Calculator.</p>
            </div>
            <Link href="/admin-price-calculator" className="shrink-0 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm">Open Price Calculator</Link>
          </CardContent>
        </Card>

        {/* Label Generator -> moved to Products Manager */}
        <Card className="mb-6 border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">Label Generator</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">Design and print candle labels with brand info, ingredients, and safety warnings in the Products Manager.</p>
            </div>
            <Link href="/admin-products" className="shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-sm">Open Products Manager</Link>
          </CardContent>
        </Card>

        {/* Marketing Sales Tools -> moved to Social Media Manager */}
        <Card className="mb-6 border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-100">Marketing &amp; Sales Tools</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-0.5">Generate product descriptions, social captions, and marketing content in the Social Media Manager.</p>
            </div>
            <Link href="/social-media-manager" className="shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm">Open Social Media Manager</Link>
          </CardContent>
        </Card>

        {/* Supplier Vendor Management -> moved to Admin Hub */}
        <Card className="mb-6 border-2 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sky-900 dark:text-sky-100">Supplier &amp; Vendor Management</p>
              <p className="text-sm text-sky-700 dark:text-sky-300 mt-0.5">Manage supplier contacts, purchase orders, and vendor comparisons via the Admin Hub.</p>
            </div>
            <Link href="/admin-hub" className="shrink-0 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold text-sm">Open Admin Hub</Link>
          </CardContent>
        </Card>

        {/* Production Scheduler -> moved to Orders */}
        <Card className="mb-6 border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-violet-900 dark:text-violet-100">Production Scheduler</p>
              <p className="text-sm text-violet-700 dark:text-violet-300 mt-0.5">Plan production batches, track completion, and coordinate fulfillment timelines in Orders.</p>
            </div>
            <Link href="/admin-orders" className="shrink-0 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold text-sm">Open Orders</Link>
          </CardContent>
        </Card>

        {/* Cost Analysis Profitability -> moved to Price Calculator */}
        <Card className="mb-6 border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-orange-900 dark:text-orange-100">Cost Analysis &amp; Profitability</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-0.5">Deep financial analysis, per-unit costs, profit margins, ROI, and break-even points in the Price Calculator.</p>
            </div>
            <Link href="/admin-price-calculator" className="shrink-0 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm">Open Price Calculator</Link>
          </CardContent>
        </Card>

        {/* Customer Relationship Manager -> moved to Feedback */}
        <Card className="mb-6 border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-100">Customer Relationship Manager</p>
              <p className="text-sm text-rose-700 dark:text-rose-300 mt-0.5">Track customer history, preferences, loyalty tiers, and communications in the Feedback section.</p>
            </div>
            <Link href="/feedback-admin" className="shrink-0 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold text-sm">Open Customer Feedback</Link>
          </CardContent>
        </Card>

        {/* Testing Development Log -> moved to Scents Library */}
        <Card className="mb-6 border-2 border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-teal-900 dark:text-teal-100">Testing &amp; Development Log</p>
              <p className="text-sm text-teal-700 dark:text-teal-300 mt-0.5">Log candle tests, cure times, wick performance, and R&amp;D notes in the Scents Library.</p>
            </div>
            <Link href="/admin-scents" className="shrink-0 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold text-sm">Open Scents Library</Link>
          </CardContent>
        </Card>

        {/* Scent Blending Simulator -> moved to Scents Library */}
        <Card className="mb-6 border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-purple-900 dark:text-purple-100">Scent Blending Simulator</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-0.5">Blend scent combinations, predict throw strength, and save fragrance recipes in the Scents Library.</p>
            </div>
            <Link href="/admin-scents" className="shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm">Open Scents Library</Link>
          </CardContent>
        </Card>

        {/* Business Analytics Reports -> moved to Analytics Dashboard */}
        <Card className="mb-6 border-2 border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-950/20">
          <CardContent className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-cyan-900 dark:text-cyan-100">Business Analytics &amp; Reports</p>
              <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-0.5">Sales trends, revenue analytics, top products, growth metrics, and exportable reports in the Analytics Dashboard.</p>
            </div>
            <Link href="/admin?tab=analytics" className="shrink-0 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold text-sm">Open Analytics Dashboard</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
