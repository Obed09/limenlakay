'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Home, Star } from 'lucide-react'

const TAG_CATEGORIES = [
  { id: 'season', label: 'Season', tags: ['Spring', 'Summer', 'Fall', 'Winter', 'Holiday', 'Year-Round'] },
  { id: 'scentProfile', label: 'Scent Profile', tags: ['Floral', 'Woody', 'Citrus', 'Spicy', 'Fresh', 'Sweet', 'Earthy', 'Herbal', 'Aquatic', 'Gourmand'] },
  { id: 'purpose', label: 'Purpose', tags: ['Relaxation', 'Romance', 'Energy', 'Focus', 'Meditation', 'Sleep', 'Decor', 'Gift'] },
  { id: 'occasion', label: 'Occasion', tags: ['Everyday', 'Birthday', 'Wedding', 'Christmas', 'Valentine', 'Easter', 'Halloween', 'Thanksgiving'] },
]

export default function PriceCalculator() {
  const [formData, setFormData] = useState({
    waxCost: 0,
    wickCost: 0,
    fragranceCost: 0,
    vesselCost: 0,
    labelCost: 0,
    packagingCost: 0,
    otherSuppliesCost: 0,
    numberOfItems: 1,
    hoursToCreate: 1,
    hourlyRate: 25,
    markupPercentage: 100,
    listingFees: 0,
    shippingCost: 0,
    transactionFeePercentage: 3,
  })

  // Material Prices & Settings state
  const [materialPrices, setMaterialPrices] = useState({
    waxType: 'soy' as 'soy' | 'coconut',
    waxPricePerLb: 8.50,
    fragrancePricePer16oz: 40.00,
    cementPricePerLb: 0.50,
    wickPrice: 0.25,
    paintPrice: 0.75,
    fillPercent: 80,
    fragranceLoad: 10,
    vesselVolumeOz: 8,
  })

  // Custom Candle Cost Calculator state
  const [candleName, setCandleName] = useState('')
  const [scentCount, setScentCount] = useState(1)
  const [scentNames, setScentNames] = useState<string[]>([''])
  const [candleRating, setCandleRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [candleNotes, setCandleNotes] = useState('')
  const [candleTags, setCandleTags] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['season'])
  const [savedCandles, setSavedCandles] = useState<{ id: number; name: string; scents: string[]; rating: number; notes: string; tags: string[] }[]>([])
  const [savedCalculations, setSavedCalculations] = useState<{ id: number; date: string; numberOfItems: number; costPerItem: string; retailPrice: string; profitPerItem: string; profitMargin: string; totalMaterialCost: string; laborCost: string }[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const handleMaterialChange = (field: string, value: string) => {
    setMaterialPrices(prev => ({ ...prev, [field]: field === 'waxType' ? value : (parseFloat(value) || 0) }))
  }

  const handleScentCountChange = (count: number) => {
    const safeCount = Math.max(1, Math.min(10, count))
    setScentCount(safeCount)
    setScentNames(prev => {
      const updated = [...prev]
      while (updated.length < safeCount) updated.push('')
      return updated.slice(0, safeCount)
    })
  }

  const handleScentNameChange = (index: number, value: string) => {
    setScentNames(prev => { const u = [...prev]; u[index] = value; return u })
  }

  const toggleTag = (tag: string) => {
    setCandleTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])
  }

  // Material price auto-calculations
  const waxDensity = materialPrices.waxType === 'coconut' ? 0.925 : 0.9
  const fillVolCm3 = materialPrices.vesselVolumeOz * 29.5735 * (materialPrices.fillPercent / 100)
  const totalWaxMassG = fillVolCm3 * waxDensity
  const waxWeightG = totalWaxMassG * (1 - materialPrices.fragranceLoad / 100)
  const fragranceWeightG = totalWaxMassG * (materialPrices.fragranceLoad / 100)
  const cementWeightG = totalWaxMassG * 0.02
  const calcWaxCost = (waxWeightG / 453.592) * materialPrices.waxPricePerLb
  const calcFragCost = (fragranceWeightG / 28.3495) * (materialPrices.fragrancePricePer16oz / 16)
  const calcCementCost = (cementWeightG / 453.592) * materialPrices.cementPricePerLb
  const calcTotalMaterialCost = calcWaxCost + calcFragCost + calcCementCost + materialPrices.wickPrice + materialPrices.paintPrice

  const applyMaterialToForm = () => {
    setFormData(prev => ({
      ...prev,
      waxCost: parseFloat(calcWaxCost.toFixed(2)),
      fragranceCost: parseFloat(calcFragCost.toFixed(2)),
      wickCost: materialPrices.wickPrice,
      otherSuppliesCost: parseFloat((calcCementCost + materialPrices.paintPrice).toFixed(2)),
    }))
  }

  // Main cost calculations
  const totalMaterialCost =
    formData.waxCost + formData.wickCost + formData.fragranceCost +
    formData.vesselCost + formData.labelCost + formData.packagingCost +
    formData.otherSuppliesCost

  const laborCost = formData.hoursToCreate * formData.hourlyRate
  const totalCostOfSupplies = totalMaterialCost + laborCost
  const costPerItem = formData.numberOfItems > 0 ? totalCostOfSupplies / formData.numberOfItems : 0
  const basePrice = costPerItem + (formData.listingFees / formData.numberOfItems)
  const markupAmount = basePrice * (formData.markupPercentage / 100)
  const priceBeforeFees = basePrice + markupAmount
  const transactionFeeMultiplier = 1 + (formData.transactionFeePercentage / 100)
  const retailPrice = priceBeforeFees * transactionFeeMultiplier
  const actualTransactionFee = retailPrice * (formData.transactionFeePercentage / 100)
  const profitPerItem = retailPrice - costPerItem - (formData.listingFees / formData.numberOfItems) - actualTransactionFee
  const profitMarginPercentage = retailPrice > 0 ? (profitPerItem / retailPrice) * 100 : 0

  const wholesalePrice = costPerItem * 2
  const retailRecommended = costPerItem * 3
  const premiumPrice = costPerItem * 4

  const saveCalculation = () => {
    const calculation = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      numberOfItems: formData.numberOfItems,
      costPerItem: costPerItem.toFixed(2),
      retailPrice: retailPrice.toFixed(2),
      profitPerItem: profitPerItem.toFixed(2),
      profitMargin: profitMarginPercentage.toFixed(1),
      totalMaterialCost: totalMaterialCost.toFixed(2),
      laborCost: laborCost.toFixed(2),
    }
    setSavedCalculations(prev => [calculation, ...prev].slice(0, 10))
  }

  const saveCandle = () => {
    if (!candleName.trim()) return
    setSavedCandles(prev => [{
      id: Date.now(),
      name: candleName,
      scents: scentNames.filter(Boolean),
      rating: candleRating,
      notes: candleNotes,
      tags: candleTags,
    }, ...prev].slice(0, 20))
  }

  const reset = () => {
    setFormData({
      waxCost: 0, wickCost: 0, fragranceCost: 0, vesselCost: 0,
      labelCost: 0, packagingCost: 0, otherSuppliesCost: 0,
      numberOfItems: 1, hoursToCreate: 1, hourlyRate: 25,
      markupPercentage: 100, listingFees: 0, shippingCost: 0,
      transactionFeePercentage: 3,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Image src="/images/limen-lakay-logo.png" alt="Limen Lakay Logo" width={60} height={60} className="object-contain" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Limen Lakay Candle Price Calculator</h1>
              <p className="text-gray-600 dark:text-gray-400">Admin Tool - Calculate costs, pricing, and profit margins</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/admin-hub">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Admin Hub
              </Button>
            </Link>
            <Link href="/" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold">← Home</Link>
          </div>
        </div>

        {/* ── Material Prices & Settings ── */}
        <Card className="mb-6 border-2 border-blue-400 dark:border-blue-600">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">⚗️ Material Prices &amp; Settings (Editable)</CardTitle>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Set your ingredient prices and vessel specs — click &ldquo;Apply to Calculator&rdquo; to auto-fill costs below.</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Wax Type</Label>
                <select
                  value={materialPrices.waxType}
                  onChange={e => handleMaterialChange('waxType', e.target.value)}
                  className="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="soy">Soy Wax (0.9 g/cm³)</option>
                  <option value="coconut">Coconut Wax (0.925 g/cm³)</option>
                </select>
              </div>
              <div>
                <Label>Vessel Volume (oz)</Label>
                <Input type="number" step="0.1" value={materialPrices.vesselVolumeOz || ''} onChange={e => handleMaterialChange('vesselVolumeOz', e.target.value)} className="mt-2" placeholder="8" />
              </div>
              <div>
                <Label>Wax Price ($/lb)</Label>
                <Input type="number" step="0.01" value={materialPrices.waxPricePerLb || ''} onChange={e => handleMaterialChange('waxPricePerLb', e.target.value)} className="mt-2" placeholder="8.50" />
              </div>
              <div>
                <Label>Fragrance Price ($/16oz)</Label>
                <Input type="number" step="0.01" value={materialPrices.fragrancePricePer16oz || ''} onChange={e => handleMaterialChange('fragrancePricePer16oz', e.target.value)} className="mt-2" placeholder="40.00" />
              </div>
              <div>
                <Label>Cement Price ($/lb)</Label>
                <Input type="number" step="0.01" value={materialPrices.cementPricePerLb || ''} onChange={e => handleMaterialChange('cementPricePerLb', e.target.value)} className="mt-2" placeholder="0.50" />
              </div>
              <div>
                <Label>Wick Price ($ each)</Label>
                <Input type="number" step="0.01" value={materialPrices.wickPrice || ''} onChange={e => handleMaterialChange('wickPrice', e.target.value)} className="mt-2" placeholder="0.25" />
              </div>
              <div>
                <Label>Paint / Dye per Vessel ($)</Label>
                <Input type="number" step="0.01" value={materialPrices.paintPrice || ''} onChange={e => handleMaterialChange('paintPrice', e.target.value)} className="mt-2" placeholder="0.75" />
              </div>
              <div>
                <Label>Fill Percentage (%)</Label>
                <Input type="number" step="1" min="50" max="100" value={materialPrices.fillPercent || ''} onChange={e => handleMaterialChange('fillPercent', e.target.value)} className="mt-2" placeholder="80" />
              </div>
              <div>
                <Label>Fragrance Load (%)</Label>
                <Input type="number" step="1" min="1" max="15" value={materialPrices.fragranceLoad || ''} onChange={e => handleMaterialChange('fragranceLoad', e.target.value)} className="mt-2" placeholder="10" />
              </div>
            </div>

            {/* Formulas box */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-amber-900 dark:text-amber-200 font-mono mb-4">
              <p className="font-bold text-sm mb-2 not-italic">📐 Calculation Formulas Used</p>
              <p>Fill Volume  = Vessel Volume × Fill% / 100 × 29.5735 mL/oz</p>
              <p>Wax Weight   = Fill Volume × density × (1 − FO%) → {waxWeightG.toFixed(1)}g</p>
              <p>Frag Weight  = Fill Volume × density × FO%        → {fragranceWeightG.toFixed(1)}g</p>
              <p>Cement Wt    = (Wax + Frag) × 2%                  → {cementWeightG.toFixed(1)}g</p>
              <p>Wax Cost     = (Wax g / 453.592) × $/lb           → ${calcWaxCost.toFixed(2)}</p>
              <p>Frag Cost    = (Frag g / 28.3495) × ($/16oz / 16) → ${calcFragCost.toFixed(2)}</p>
              <p>Cement Cost  = (Cement g / 453.592) × $/lb        → ${calcCementCost.toFixed(2)}</p>
            </div>

            {/* Results + Apply button */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200"><span className="font-semibold">Wax:</span> {waxWeightG.toFixed(1)}g → <span className="font-bold">${calcWaxCost.toFixed(2)}</span></div>
              <div className="text-sm text-blue-800 dark:text-blue-200"><span className="font-semibold">Fragrance:</span> {fragranceWeightG.toFixed(1)}g → <span className="font-bold">${calcFragCost.toFixed(2)}</span></div>
              <div className="text-sm text-blue-800 dark:text-blue-200"><span className="font-semibold">Cement:</span> {cementWeightG.toFixed(1)}g → <span className="font-bold">${calcCementCost.toFixed(2)}</span></div>
              <div className="text-sm font-bold text-blue-900 dark:text-blue-100">Total Material: ${calcTotalMaterialCost.toFixed(2)}</div>
              <Button onClick={applyMaterialToForm} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white">↓ Apply to Calculator</Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Main 3-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Material Costs */}
            <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">💰 Material Costs</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waxCost">Wax Cost ($)</Label>
                    <Input id="waxCost" type="number" step="0.01" value={formData.waxCost || ''} onChange={e => handleInputChange('waxCost', e.target.value)} placeholder="0.00" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="wickCost">Wick Cost ($)</Label>
                    <Input id="wickCost" type="number" step="0.01" value={formData.wickCost || ''} onChange={e => handleInputChange('wickCost', e.target.value)} placeholder="0.00" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="fragranceCost">Fragrance Oil Cost ($)</Label>
                    <Input id="fragranceCost" type="number" step="0.01" value={formData.fragranceCost || ''} onChange={e => handleInputChange('fragranceCost', e.target.value)} placeholder="0.00" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="vesselCost">Vessel/Container Cost ($)</Label>
                    <Input id="vesselCost" type="number" step="0.01" value={formData.vesselCost || ''} onChange={e => handleInputChange('vesselCost', e.target.value)} placeholder="0.00" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="labelCost">Label Cost ($)</Label>
                    <Input id="labelCost" type="number" step="0.01" value={formData.labelCost || ''} onChange={e => handleInputChange('labelCost', e.target.value)} placeholder="0.00" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="packagingCost">Packaging Cost ($)</Label>
                    <Input id="packagingCost" type="number" step="0.01" value={formData.packagingCost || ''} onChange={e => handleInputChange('packagingCost', e.target.value)} placeholder="0.00" className="mt-2" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="otherSuppliesCost">Other Supplies Cost ($)</Label>
                    <Input id="otherSuppliesCost" type="number" step="0.01" value={formData.otherSuppliesCost || ''} onChange={e => handleInputChange('otherSuppliesCost', e.target.value)} placeholder="Dye, additives, cement, etc." className="mt-2" />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">Total Material Cost: ${totalMaterialCost.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Production Details */}
            <Card>
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">⏱️ Production Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numberOfItems">Number of Candles Made</Label>
                    <Input id="numberOfItems" type="number" min="1" value={formData.numberOfItems || ''} onChange={e => handleInputChange('numberOfItems', e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="hoursToCreate">Hours to Create (Total)</Label>
                    <Input id="hoursToCreate" type="number" step="0.25" value={formData.hoursToCreate || ''} onChange={e => handleInputChange('hoursToCreate', e.target.value)} className="mt-2" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input id="hourlyRate" type="number" step="0.50" value={formData.hourlyRate || ''} onChange={e => handleInputChange('hourlyRate', e.target.value)} placeholder="Your desired hourly wage" className="mt-2" />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">Labor Cost: ${laborCost.toFixed(2)}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">({formData.hoursToCreate} hours × ${formData.hourlyRate}/hr)</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Fees */}
            <Card>
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
                <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">💵 Pricing &amp; Fees</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
                    <Input id="markupPercentage" type="number" step="5" value={formData.markupPercentage || ''} onChange={e => handleInputChange('markupPercentage', e.target.value)} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Typical: 100-200%</p>
                  </div>
                  <div>
                    <Label htmlFor="listingFees">Listing Fees (Total) ($)</Label>
                    <Input id="listingFees" type="number" step="0.01" value={formData.listingFees || ''} onChange={e => handleInputChange('listingFees', e.target.value)} placeholder="Etsy, marketplace fees" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="transactionFeePercentage">Transaction Fee (%)</Label>
                    <Input id="transactionFeePercentage" type="number" step="0.1" value={formData.transactionFeePercentage || ''} onChange={e => handleInputChange('transactionFeePercentage', e.target.value)} className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Payment processing (e.g., 3%)</p>
                  </div>
                  <div>
                    <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                    <Input id="shippingCost" type="number" step="0.01" value={formData.shippingCost || ''} onChange={e => handleInputChange('shippingCost', e.target.value)} placeholder="For reference" className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Column */}
          <div className="space-y-6">
            <Card className="border-2 border-green-500 dark:border-green-600">
              <CardHeader className="bg-green-50 dark:bg-green-950/20">
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">📊 Pricing Results</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cost Per Candle</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${costPerItem.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">Recommended Retail Price</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">${retailPrice.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">Profit Per Candle</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">${profitPerItem.toFixed(2)}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{profitMarginPercentage.toFixed(1)}% margin</p>
                </div>
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Batch Revenue:</span>
                    <span className="font-semibold">${(retailPrice * formData.numberOfItems).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Batch Profit:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">${(profitPerItem * formData.numberOfItems).toFixed(2)}</span>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <Button onClick={saveCalculation} className="w-full bg-green-600 hover:bg-green-700">💾 Save Calculation</Button>
                  <Button onClick={reset} variant="outline" className="w-full">🔄 Reset Form</Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Recommendations */}
            <Card className="border-2 border-orange-400 dark:border-orange-600">
              <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
                <CardTitle className="text-xl text-orange-900 dark:text-orange-100">💡 Pricing Recommendations</CardTitle>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Based on your cost per candle</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">🏷️ Wholesale</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Markup: 2x · Min. 50 units</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${wholesalePrice.toFixed(2)}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">${(wholesalePrice - costPerItem).toFixed(2)} profit/unit</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">🛍️ Retail</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Markup: 3x · Standard pricing</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">${retailRecommended.toFixed(2)}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">${(retailRecommended - costPerItem).toFixed(2)} profit/unit</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">👑 Premium</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Markup: 4x · Boutique / luxury</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${premiumPrice.toFixed(2)}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">${(premiumPrice - costPerItem).toFixed(2)} profit/unit</p>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">📋 Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Materials:</span><span>${totalMaterialCost.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Labor:</span><span>${laborCost.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Listing Fees:</span><span>${formData.listingFees.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Transaction Fee:</span><span>${actualTransactionFee.toFixed(2)}</span></div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Costs:</span>
                    <span>${(totalCostOfSupplies + formData.listingFees + actualTransactionFee).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Custom Candle Cost Calculator ── */}
        <Card className="mt-6 border-2 border-pink-400 dark:border-pink-600">
          <CardHeader className="bg-pink-50 dark:bg-pink-950/20">
            <CardTitle className="text-2xl text-pink-900 dark:text-pink-100">🕯️ Custom Candle Cost Calculator</CardTitle>
            <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">Build and save custom candle recipes with scent blends, ratings, notes, and category tags.</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">

            {/* Candle Name + Scent Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Candle Name</Label>
                <Input type="text" value={candleName} onChange={e => setCandleName(e.target.value)} placeholder="e.g. Midnight Amber Glow" className="mt-2" />
              </div>
              <div>
                <Label>Number of Scents (1–10)</Label>
                <Input type="number" min={1} max={10} value={scentCount} onChange={e => handleScentCountChange(parseInt(e.target.value) || 1)} className="mt-2" />
              </div>
            </div>

            {/* Scent Names */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-700 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">🌸 Scent Names &amp; Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scentNames.map((name, idx) => (
                  <div key={idx}>
                    <Label className="text-xs text-purple-700 dark:text-purple-300">Scent #{idx + 1}</Label>
                    <Input
                      type="text"
                      value={name}
                      onChange={e => handleScentNameChange(idx, e.target.value)}
                      placeholder={`Scent #${idx + 1} name or fragrance oil`}
                      className="mt-1 border-purple-300 dark:border-purple-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Recipe Rating */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">⭐ Recipe Rating</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCandleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || candleRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                {candleRating > 0 && (
                  <span className="ml-2 text-sm text-amber-700 dark:text-amber-300">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Perfect'][candleRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Recipe Notes */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">📝 Recipe Notes</h3>
              <textarea
                value={candleNotes}
                onChange={e => setCandleNotes(e.target.value)}
                placeholder="Add notes about pour temp, cure time, throw strength, wick size, lessons learned..."
                rows={4}
                className="w-full border border-blue-300 dark:border-blue-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Category Tags */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-3">🏷️ Category Tags</h3>
              <div className="space-y-3">
                {TAG_CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="flex items-center gap-2 text-sm font-medium text-teal-800 dark:text-teal-200 hover:text-teal-600 mb-2"
                    >
                      <span>{expandedCategories.includes(cat.id) ? '▼' : '▶'}</span>
                      {cat.label}
                    </button>
                    {expandedCategories.includes(cat.id) && (
                      <div className="flex flex-wrap gap-2 pl-4">
                        {cat.tags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              candleTags.includes(tag)
                                ? 'bg-teal-500 text-white border-teal-500'
                                : 'bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-600 hover:bg-teal-50'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {candleTags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-700">
                  <p className="text-xs text-teal-600 dark:text-teal-400 mb-2">Selected: </p>
                  <div className="flex flex-wrap gap-1">
                    {candleTags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={saveCandle}
              disabled={!candleName.trim()}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
            >
              💾 Save Candle Recipe
            </Button>

            {/* Saved Candles */}
            {savedCandles.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📚 Saved Recipes ({savedCandles.length})</h3>
                <div className="space-y-3">
                  {savedCandles.map(candle => (
                    <div key={candle.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{candle.name}</p>
                          {candle.scents.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">🌸 {candle.scents.join(', ')}</p>
                          )}
                          {candle.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {candle.tags.map(t => (
                                <span key={t} className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs rounded">{t}</span>
                              ))}
                            </div>
                          )}
                          {candle.notes && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">{candle.notes.slice(0, 80)}{candle.notes.length > 80 ? '…' : ''}</p>}
                        </div>
                        <div className="flex shrink-0">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= candle.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Calculations */}
        {savedCalculations.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">📜 Recent Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Cost/Item</th>
                      <th className="pb-2">Retail Price</th>
                      <th className="pb-2">Profit/Item</th>
                      <th className="pb-2">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCalculations.map((calc) => (
                      <tr key={calc.id} className="border-b">
                        <td className="py-2">{calc.date}</td>
                        <td className="py-2">{calc.numberOfItems}</td>
                        <td className="py-2">${calc.costPerItem}</td>
                        <td className="py-2">${calc.retailPrice}</td>
                        <td className="py-2 text-green-600">${calc.profitPerItem}</td>
                        <td className="py-2">{calc.profitMargin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
