'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function PriceCalculator() {
  const [formData, setFormData] = useState({
    // Material Costs
    waxCost: 0,
    wickCost: 0,
    fragranceCost: 0,
    vesselCost: 0,
    labelCost: 0,
    packagingCost: 0,
    otherSuppliesCost: 0,
    
    // Production Details
    numberOfItems: 1,
    hoursToCreate: 1,
    hourlyRate: 25,
    
    // Pricing
    markupPercentage: 100,
    
    // Fees
    listingFees: 0,
    shippingCost: 0,
    transactionFeePercentage: 3,
  })

  const [savedCalculations, setSavedCalculations] = useState<any[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  // Calculate totals
  const totalMaterialCost = 
    formData.waxCost +
    formData.wickCost +
    formData.fragranceCost +
    formData.vesselCost +
    formData.labelCost +
    formData.packagingCost +
    formData.otherSuppliesCost

  const laborCost = formData.hoursToCreate * formData.hourlyRate
  const totalCostOfSupplies = totalMaterialCost + laborCost
  const costPerItem = formData.numberOfItems > 0 ? totalCostOfSupplies / formData.numberOfItems : 0
  
  // Base price before markup
  const basePrice = costPerItem + (formData.listingFees / formData.numberOfItems)
  
  // Retail price with markup
  const markupAmount = basePrice * (formData.markupPercentage / 100)
  const priceBeforeFees = basePrice + markupAmount
  
  // Account for transaction fees in final price
  const transactionFeeMultiplier = 1 + (formData.transactionFeePercentage / 100)
  const retailPrice = priceBeforeFees * transactionFeeMultiplier
  
  // Profit calculation
  const actualTransactionFee = retailPrice * (formData.transactionFeePercentage / 100)
  const profitPerItem = retailPrice - costPerItem - (formData.listingFees / formData.numberOfItems) - actualTransactionFee
  const profitMarginPercentage = retailPrice > 0 ? (profitPerItem / retailPrice) * 100 : 0

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
    setSavedCalculations(prev => [calculation, ...prev].slice(0, 10)) // Keep last 10
  }

  const reset = () => {
    setFormData({
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
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
                Limen Lakay Candle Price Calculator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Admin Tool - Calculate costs, pricing, and profit margins
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/vessel-calculator"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🏺 Vessel Calculator
            </Link>
            <Link 
              href="/"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Material Costs */}
            <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  💰 Material Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="waxCost">Wax Cost ($)</Label>
                    <Input
                      id="waxCost"
                      type="number"
                      step="0.01"
                      value={formData.waxCost || ''}
                      onChange={(e) => handleInputChange('waxCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wickCost">Wick Cost ($)</Label>
                    <Input
                      id="wickCost"
                      type="number"
                      step="0.01"
                      value={formData.wickCost || ''}
                      onChange={(e) => handleInputChange('wickCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fragranceCost">Fragrance Oil Cost ($)</Label>
                    <Input
                      id="fragranceCost"
                      type="number"
                      step="0.01"
                      value={formData.fragranceCost || ''}
                      onChange={(e) => handleInputChange('fragranceCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vesselCost">Vessel/Container Cost ($)</Label>
                    <Input
                      id="vesselCost"
                      type="number"
                      step="0.01"
                      value={formData.vesselCost || ''}
                      onChange={(e) => handleInputChange('vesselCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="labelCost">Label Cost ($)</Label>
                    <Input
                      id="labelCost"
                      type="number"
                      step="0.01"
                      value={formData.labelCost || ''}
                      onChange={(e) => handleInputChange('labelCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packagingCost">Packaging Cost ($)</Label>
                    <Input
                      id="packagingCost"
                      type="number"
                      step="0.01"
                      value={formData.packagingCost || ''}
                      onChange={(e) => handleInputChange('packagingCost', e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="otherSuppliesCost">Other Supplies Cost ($)</Label>
                    <Input
                      id="otherSuppliesCost"
                      type="number"
                      step="0.01"
                      value={formData.otherSuppliesCost || ''}
                      onChange={(e) => handleInputChange('otherSuppliesCost', e.target.value)}
                      placeholder="Dye, additives, etc."
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    Total Material Cost: ${totalMaterialCost.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Production Details */}
            <Card>
              <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                  ⏱️ Production Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numberOfItems">Number of Candles Made</Label>
                    <Input
                      id="numberOfItems"
                      type="number"
                      min="1"
                      value={formData.numberOfItems || ''}
                      onChange={(e) => handleInputChange('numberOfItems', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hoursToCreate">Hours to Create (Total)</Label>
                    <Input
                      id="hoursToCreate"
                      type="number"
                      step="0.25"
                      value={formData.hoursToCreate || ''}
                      onChange={(e) => handleInputChange('hoursToCreate', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.50"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      placeholder="Your desired hourly wage"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Labor Cost: ${laborCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    ({formData.hoursToCreate} hours × ${formData.hourlyRate}/hr)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Fees */}
            <Card>
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
                <CardTitle className="text-2xl text-purple-900 dark:text-purple-100">
                  💵 Pricing & Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
                    <Input
                      id="markupPercentage"
                      type="number"
                      step="5"
                      value={formData.markupPercentage || ''}
                      onChange={(e) => handleInputChange('markupPercentage', e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Typical: 100-200%</p>
                  </div>
                  <div>
                    <Label htmlFor="listingFees">Listing Fees (Total) ($)</Label>
                    <Input
                      id="listingFees"
                      type="number"
                      step="0.01"
                      value={formData.listingFees || ''}
                      onChange={(e) => handleInputChange('listingFees', e.target.value)}
                      placeholder="Etsy, marketplace fees"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionFeePercentage">Transaction Fee (%)</Label>
                    <Input
                      id="transactionFeePercentage"
                      type="number"
                      step="0.1"
                      value={formData.transactionFeePercentage || ''}
                      onChange={(e) => handleInputChange('transactionFeePercentage', e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Payment processing (e.g., 3%)</p>
                  </div>
                  <div>
                    <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      step="0.01"
                      value={formData.shippingCost || ''}
                      onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                      placeholder="For reference"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Results */}
            <Card className="border-2 border-green-500 dark:border-green-600">
              <CardHeader className="bg-green-50 dark:bg-green-950/20">
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                  📊 Pricing Results
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cost Per Candle</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${costPerItem.toFixed(2)}
                  </p>
                </div>

                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">Recommended Retail Price</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">
                    ${retailPrice.toFixed(2)}
                  </p>
                </div>

                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">Profit Per Candle</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    ${profitPerItem.toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {profitMarginPercentage.toFixed(1)}% margin
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Batch Revenue:</span>
                    <span className="font-semibold">${(retailPrice * formData.numberOfItems).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Batch Profit:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${(profitPerItem * formData.numberOfItems).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button onClick={saveCalculation} className="w-full bg-green-600 hover:bg-green-700">
                    💾 Save Calculation
                  </Button>
                  <Button onClick={reset} variant="outline" className="w-full">
                    🔄 Reset Form
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                  📋 Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Materials:</span>
                    <span>${totalMaterialCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Labor:</span>
                    <span>${laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Listing Fees:</span>
                    <span>${formData.listingFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction Fee:</span>
                    <span>${actualTransactionFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Costs:</span>
                    <span>${(totalCostOfSupplies + formData.listingFees + actualTransactionFee).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
