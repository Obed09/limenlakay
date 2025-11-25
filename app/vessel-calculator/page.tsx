'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Vessel {
  id: number
  width: number
  height: number
  volume: number
}

interface CustomCandle {
  id: number
  name: string
  scentCount: number
  scentNames: string[]
  cost: number
  dateCreated: string
}

export default function VesselCalculator() {
  // Material prices (editable)
  const [materialPrices, setMaterialPrices] = useState({
    cement: 0.12,
    paint: 0.75,
    scentBottlePrice: 40.00,
    scentPercentage: 10,
  })

  // Vessels data
  const vessels: Vessel[] = [
    { id: 100, width: 8.2, height: 2.6, volume: 138 },
    { id: 101, width: 5.43, height: 2.13, volume: 49 },
    { id: 102, width: 2.7, height: 1.4, volume: 8 },
    { id: 103, width: 3.7, height: 3.14, volume: 34 },
  ]

  // Custom candle calculator
  const [candleName, setCandleName] = useState('')
  const [scentCount, setScentCount] = useState(1)
  const [scentNames, setScentNames] = useState<string[]>([''])
  const [savedCandles, setSavedCandles] = useState<CustomCandle[]>([])

  // Profit calculator
  const [profitCalc, setProfitCalc] = useState({
    sellingPrice: 25.00,
    quantity: 100,
  })

  const handleMaterialChange = (field: string, value: string) => {
    setMaterialPrices(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleProfitChange = (field: string, value: string) => {
    setProfitCalc(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  // Calculate scent cost per vessel
  const scentCostPerVessel = (materialPrices.scentBottlePrice * materialPrices.scentPercentage) / 100

  // Total cost per vessel (standard 1 scent)
  const totalCostPerVessel = materialPrices.cement + materialPrices.paint + scentCostPerVessel

  // Custom candle cost calculation
  const customCandleCost = materialPrices.cement + materialPrices.paint + (scentCostPerVessel * scentCount)

  // Handle scent count change
  const handleScentCountChange = (count: number) => {
    const validCount = Math.max(1, count)
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
      cost: customCandleCost,
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

  // Profit calculations
  const profitPerUnit = profitCalc.sellingPrice - totalCostPerVessel
  const profitMargin = totalCostPerVessel > 0 ? ((profitPerUnit / totalCostPerVessel) * 100) : 0
  const totalProfit = profitPerUnit * profitCalc.quantity
  const totalRevenue = profitCalc.sellingPrice * profitCalc.quantity
  const totalCost = totalCostPerVessel * profitCalc.quantity

  // Profit color coding
  const getProfitColor = (profit: number) => {
    if (profit < 5) return 'text-red-600'
    if (profit < 15) return 'text-orange-600'
    return 'text-green-600'
  }

  // Get largest and smallest vessels
  const largestVessel = vessels.reduce((max, v) => v.volume > max.volume ? v : max, vessels[0])
  const smallestVessel = vessels.reduce((min, v) => v.volume < min.volume ? v : min, vessels[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
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
                Vessel Cost Calculator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Calculate production costs for each vessel style
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin-price-calculator"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Candle Calculator
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>

        {/* Material Prices Section */}
        <Card className="mb-6 border-4 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
              📦 Material Prices (Per Vessel)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="cement" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Cement ($)
                </Label>
                <Input
                  id="cement"
                  type="number"
                  step="0.01"
                  value={materialPrices.cement}
                  onChange={(e) => handleMaterialChange('cement', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="paint" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Paint ($)
                </Label>
                <Input
                  id="paint"
                  type="number"
                  step="0.01"
                  value={materialPrices.paint}
                  onChange={(e) => handleMaterialChange('paint', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="scentBottle" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Scent Bottle (16 Fl Oz) ($)
                </Label>
                <Input
                  id="scentBottle"
                  type="number"
                  step="0.01"
                  value={materialPrices.scentBottlePrice}
                  onChange={(e) => handleMaterialChange('scentBottlePrice', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {materialPrices.scentPercentage}% per vessel = ${scentCostPerVessel.toFixed(2)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <Label htmlFor="scentPercent" className="text-blue-900 dark:text-blue-100 font-semibold">
                  Scent % per Vessel
                </Label>
                <Input
                  id="scentPercent"
                  type="number"
                  step="1"
                  value={materialPrices.scentPercentage}
                  onChange={(e) => handleMaterialChange('scentPercentage', e.target.value)}
                  className="mt-2 text-lg font-bold"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  = {((16 * materialPrices.scentPercentage) / 100).toFixed(1)} Fl Oz
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg border-2 border-amber-400 dark:border-amber-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-amber-900 dark:text-amber-100">📊 Calculation Method:</strong><br />
                Each vessel uses fixed amounts of cement (${materialPrices.cement}) and paint (${materialPrices.paint}), 
                plus {materialPrices.scentPercentage}% of a 16 Fl Oz scent bottle (${scentCostPerVessel.toFixed(2)}), 
                totaling <strong>${totalCostPerVessel.toFixed(2)}</strong> per vessel regardless of size.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Candle Calculator */}
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

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl border-2 border-pink-300 dark:border-pink-700 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">🏗️ Cement:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">${materialPrices.cement.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">🎨 Paint:</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">${materialPrices.paint.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">🌸 Scent (${scentCostPerVessel.toFixed(2)} × {scentCount}):</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">${(scentCostPerVessel * scentCount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-pink-400 dark:border-pink-600 w-full">
                    <div className="text-sm text-pink-700 dark:text-pink-300 font-semibold mb-2">
                      TOTAL COST
                    </div>
                    <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                      ${customCandleCost.toFixed(2)}
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

        {/* Vessels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {vessels.map((vessel) => (
            <Card 
              key={vessel.id}
              className="border-3 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-t-lg" />
              
              <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="flex justify-between items-center">
                  <div className="bg-amber-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                    Vessel #{vessel.id}
                  </div>
                  <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    ~{vessel.volume} cu in
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Dimensions */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border-2 border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Dimensions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Width:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{vessel.width} inches</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Height:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{vessel.height} inches</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Volume:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{vessel.volume} cu in</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                    Cost Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        🏗️ Cement
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        ${materialPrices.cement.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        🎨 Paint
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        ${materialPrices.paint.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        🌸 Scent ({materialPrices.scentPercentage}%)
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        ${scentCostPerVessel.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 rounded-lg shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">TOTAL COST</span>
                    <span className="font-bold text-2xl">${totalCostPerVessel.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Section */}
        <Card className="mb-8 border-4 border-amber-300 dark:border-amber-700">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900">
            <CardTitle className="text-2xl text-center text-amber-900 dark:text-amber-100">
              📈 Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  All Vessels
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  ${totalCostPerVessel.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  per unit cost
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Largest ({largestVessel.id})
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {largestVessel.volume} in³
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  volume
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Smallest ({smallestVessel.id})
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {smallestVessel.volume} in³
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  volume
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Scent Cost
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {totalCostPerVessel > 0 ? ((scentCostPerVessel / totalCostPerVessel) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  of total cost
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Calculator */}
        <Card className="border-4 border-green-300 dark:border-green-700">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
            <CardTitle className="text-2xl text-center text-green-900 dark:text-green-100">
              💵 Profit Margin Calculator
            </CardTitle>
            <p className="text-center text-green-700 dark:text-green-300 mt-2">
              Calculate your profit based on selling price
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-green-200 dark:border-green-800">
                <Label htmlFor="costPrice" className="text-green-900 dark:text-green-100 font-bold">
                  Cost Per Vessel
                </Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={totalCostPerVessel.toFixed(2)}
                  readOnly
                  className="mt-2 text-lg font-bold bg-gray-100 dark:bg-gray-700"
                />
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
              <div className="text-center mb-6">
                <div className="text-green-700 dark:text-green-300 font-bold text-lg mb-3">
                  PROFIT PER VESSEL
                </div>
                <div className={`text-5xl font-bold mb-2 ${getProfitColor(profitPerUnit)}`}>
                  ${profitPerUnit.toFixed(2)}
                </div>
                <div className="text-2xl text-green-600 dark:text-green-400 font-semibold">
                  Margin: {profitMargin.toFixed(0)}%
                </div>
              </div>

              <div className="border-t-2 border-dashed border-green-300 dark:border-green-700 pt-6 mt-6">
                <div className="text-center mb-4">
                  <div className="text-green-700 dark:text-green-300 font-bold text-lg mb-3">
                    TOTAL PROFIT FOR {profitCalc.quantity} VESSELS
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
                    ${totalProfit.toFixed(2)}
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Total Revenue: <span className="font-bold text-gray-900 dark:text-gray-100">${totalRevenue.toFixed(2)}</span> | 
                  Total Cost: <span className="font-bold text-gray-900 dark:text-gray-100">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-yellow-500 p-6 rounded-lg">
          <div className="font-bold text-yellow-900 dark:text-yellow-100 text-lg mb-3">
            💡 Pricing Recommendations:
          </div>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>• <strong>Wholesale (Bulk Orders):</strong> Consider ${(totalCostPerVessel * 2.5).toFixed(2)}-${(totalCostPerVessel * 3.7).toFixed(2)} per vessel (2.5x-3.7x markup)</p>
            <p>• <strong>Retail (Individual):</strong> Consider ${(totalCostPerVessel * 5).toFixed(2)}-${(totalCostPerVessel * 7).toFixed(2)} per vessel (5x-7x markup)</p>
            <p>• <strong>Premium/Custom:</strong> Consider ${(totalCostPerVessel * 8).toFixed(2)}-${(totalCostPerVessel * 12).toFixed(2)} per vessel (8x-12x markup)</p>
            <p className="text-sm italic">• <strong>Don&apos;t forget:</strong> Add labor costs, overhead, packaging, and marketing to your pricing!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
