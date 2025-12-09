'use client'
// Material & Cost Calculator - 6 Vessels

import { useState } from 'react'
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
  const [savedCandles, setSavedCandles] = useState<CustomCandle[]>([])

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
      dateCreated: new Date().toLocaleDateString()
    }
    
    setSavedCandles(prev => [newCandle, ...prev])
    setCandleName('')
    setScentCount(1)
    setScentNames([''])
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
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
