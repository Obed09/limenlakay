'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Download } from 'lucide-react';

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  clientEmail?: string;
}

export function BulkOrderModal({ isOpen, onClose, clientName = '', clientEmail = '' }: BulkOrderModalProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 12;

  const [formData, setFormData] = useState({
    // Header Info
    clientName: clientName,
    businessName: '',
    date: new Date().toISOString().split('T')[0],

    // Section 1: Order Details
    orderQuantity: [] as string[],
    exactQuantity: '',
    orderType: '',
    recurringFrequency: '',
    deliveryDate: '',
    dateFlexible: '',
    rushOrder: '',

    // Section 2: Product Specifications
    candleSizes: [] as string[],
    multipleSizesSpec: '',
    vesselPreference: [] as string[],
    scentChoice: [] as string[],
    scentDetails: '',
    colorPreference: [] as string[],
    colorDetails: '',
    finishStyle: [] as string[],
    finishDetails: '',

    // Section 3: Customization & Branding
    customLabels: '',
    labelInfo: [] as string[],
    labelOther: '',
    customPackaging: [] as string[],
    packagingOther: '',
    privateLabeling: '',

    // Section 4: Purpose & Use Case
    primaryPurpose: [] as string[],
    purposeOther: '',
    physicalLocation: '',
    onlinePlatforms: '',
    geographicArea: '',
    targetMarket: '',

    // Section 5: Budget & Pricing
    budgetMin: '',
    budgetMax: '',
    budgetFlexibility: '',
    priceQualityFocus: '',
    previousPurchase: '',
    previousVendor: '',
    retailPrice: '',

    // Section 6: Timeline & Logistics
    orderTimeline: '',
    depositReady: '',
    shippingAddress: '',
    shippingCity: '',
    shippingCountry: '',
    shippingType: '',
    shippingPreference: '',

    // Section 7: Samples & Approval
    sampleNeeded: '',
    sampleAspects: [] as string[],

    // Section 8: Special Requirements
    specialRequirements: [] as string[],
    requirementsOther: '',
    certifications: [] as string[],
    certificationsOther: '',
    additionalNotes: '',

    // Section 9: Contract & Terms
    reviewedContract: '',
    comfortableTerms: [] as string[],
    termsModification: '',
    termsModificationDetails: '',

    // Section 10: Production Capacity
    productionInfo: [] as string[],
    phasedDelivery: '',

    // Section 11: Communication Preferences
    preferredEmail: clientEmail,
    preferredPhone: '',
    contactMethod: '',
    updateFrequency: '',
    timezone: '',

    // Section 12: Decision Making
    priorityPrice: '',
    priorityQuality: '',
    priorityCustomization: '',
    priorityTimeline: '',
    priorityService: '',
    preventingFactors: '',
    quoteDeadline: '',
    competingQuotes: ''
  });

  const handleCheckboxChange = (section: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[section as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [section]: newValues };
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextSection = () => {
    if (currentSection < totalSections) {
      setCurrentSection(prev => prev + 1);
      // Scroll to top of modal
      document.querySelector('.modal-content')?.scrollTo(0, 0);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
      document.querySelector('.modal-content')?.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    console.log('Bulk Order Questionnaire Data:', formData);
    // Here you would send the data to your backend
    alert('Thank you! Your bulk order questionnaire has been submitted. We will review and contact you within 24-48 hours.');
    onClose();
  };

  const downloadPDF = () => {
    // Implement PDF generation
    alert('PDF download functionality coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">📋 Bulk Order Questionnaire</h2>
              <p className="text-amber-100">Limen Lakay LLC - Custom Order Information</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center text-sm mb-2">
              <span>Section {currentSection} of {totalSections}</span>
              <span>{Math.round((currentSection / totalSections) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-amber-800/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentSection / totalSections) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content flex-1 overflow-y-auto p-6">
          {/* Section 1: Order Details & Quantities */}
          {currentSection === 1 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 1: Order Details & Quantities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">1.1 What is your desired order quantity?</Label>
                  <div className="space-y-2">
                    {['50-100 candles', '101-200 candles', '201-500 candles', '500+ candles', 'vessels only'].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.orderQuantity.includes(option)}
                          onChange={() => handleCheckboxChange('orderQuantity', option)}
                          className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="exactQuantity">Exact quantity (if known):</Label>
                    <Input
                      id="exactQuantity"
                      value={formData.exactQuantity}
                      onChange={(e) => handleInputChange('exactQuantity', e.target.value)}
                      placeholder="Enter exact number"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">1.2 Is this a one-time order, or do you anticipate recurring orders?</Label>
                  <div className="space-y-2">
                    {['One-time order', 'Recurring orders (monthly, quarterly, etc.)'].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="radio"
                          name="orderType"
                          checked={formData.orderType === option}
                          onChange={() => handleInputChange('orderType', option)}
                          className="w-5 h-5 border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="recurringFrequency">If recurring, estimated frequency:</Label>
                    <Input
                      id="recurringFrequency"
                      value={formData.recurringFrequency}
                      onChange={(e) => handleInputChange('recurringFrequency', e.target.value)}
                      placeholder="e.g., Monthly, Quarterly, Bi-annual"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">1.3 When do you need this order delivered by?</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Note: Standard lead time is 2 months</p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="deliveryDate">Target delivery date:</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Is this date flexible?</Label>
                        <div className="flex gap-4 mt-2">
                          {['Yes', 'No'].map(option => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="dateFlexible"
                                checked={formData.dateFlexible === option}
                                onChange={() => handleInputChange('dateFlexible', option)}
                                className="w-4 h-4"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Is this a rush order?</Label>
                        <div className="flex gap-4 mt-2">
                          {['Yes', 'No'].map(option => (
                            <label key={option} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="rushOrder"
                                checked={formData.rushOrder === option}
                                onChange={() => handleInputChange('rushOrder', option)}
                                className="w-4 h-4"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 2: Product Specifications */}
          {currentSection === 2 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 2: Product Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">2.1 What candle size(s) are you interested in?</Label>
                  <div className="space-y-2">
                    {['Small (4-6 oz)', 'Medium (8-10 oz)', 'Large (12-16 oz)'].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.candleSizes.includes(option)}
                          onChange={() => handleCheckboxChange('candleSizes', option)}
                          className="w-5 h-5 rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="multipleSizesSpec">Multiple sizes (please specify):</Label>
                    <Input
                      id="multipleSizesSpec"
                      value={formData.multipleSizesSpec}
                      onChange={(e) => handleInputChange('multipleSizesSpec', e.target.value)}
                      placeholder="Describe your size requirements"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">2.2 Container/Vessel preference</Label>
                  <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vesselPreference.includes('Cement vessels')}
                      onChange={() => handleCheckboxChange('vesselPreference', 'Cement vessels')}
                      className="w-5 h-5 rounded"
                    />
                    <span>Cement vessels</span>
                  </label>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">2.3 What scent(s) would you like?</Label>
                  <div className="space-y-2">
                    {['Choose from existing collection', 'Custom scent blend', 'Unscented', 'Multiple scents'].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.scentChoice.includes(option)}
                          onChange={() => handleCheckboxChange('scentChoice', option)}
                          className="w-5 h-5 rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="scentDetails">Scent details:</Label>
                    <textarea
                      id="scentDetails"
                      value={formData.scentDetails}
                      onChange={(e) => handleInputChange('scentDetails', e.target.value)}
                      placeholder="Describe specific scents, blends, or preferences"
                      rows={3}
                      className="w-full mt-2 p-3 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">2.4 Color preferences?</Label>
                  <div className="space-y-2">
                    {['Natural/cream (no added color)', 'Specific colors', 'Match my brand colors'].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.colorPreference.includes(option)}
                          onChange={() => handleCheckboxChange('colorPreference', option)}
                          className="w-5 h-5 rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="colorDetails">Color details (list colors or provide color codes):</Label>
                    <Input
                      id="colorDetails"
                      value={formData.colorDetails}
                      onChange={(e) => handleInputChange('colorDetails', e.target.value)}
                      placeholder="e.g., Navy blue, #FFD700, Pantone 123"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">2.5 Finish/Style preferences?</Label>
                  <div className="space-y-2">
                    {['Plain/smooth', 'Marble effect', 'Gold flakes', 'Dried flowers/botanicals', 'Layered colors'].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.finishStyle.includes(option)}
                          onChange={() => handleCheckboxChange('finishStyle', option)}
                          className="w-5 h-5 rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="finishDetails">Other special effects:</Label>
                    <Input
                      id="finishDetails"
                      value={formData.finishDetails}
                      onChange={(e) => handleInputChange('finishDetails', e.target.value)}
                      placeholder="Describe any other special effects or finishes"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 3: Customization & Branding */}
          {currentSection === 3 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 3: Customization & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">3.1 Do you need custom labels/branding?</Label>
                  <div className="space-y-2">
                    {[
                      'Yes, I have my own design/artwork ready',
                      'Yes, but I need design assistance',
                      'No, use Limen Lakay branding',
                      'No label/blank candles'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="radio"
                          name="customLabels"
                          checked={formData.customLabels === option}
                          onChange={() => handleInputChange('customLabels', option)}
                          className="w-5 h-5"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">3.2 If custom labels, what information do you need?</Label>
                  <div className="space-y-2">
                    {[
                      'Your business name/logo',
                      'Scent name',
                      'Ingredients list',
                      'Safety warnings',
                      'Barcode/SKU'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.labelInfo.includes(option)}
                          onChange={() => handleCheckboxChange('labelInfo', option)}
                          className="w-5 h-5 rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="labelOther">Other:</Label>
                    <Input
                      id="labelOther"
                      value={formData.labelOther}
                      onChange={(e) => handleInputChange('labelOther', e.target.value)}
                      placeholder="Any other label requirements"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">3.3 Do you need custom packaging?</Label>
                  <div className="space-y-2">
                    {[
                      'No, standard packaging is fine',
                      'Yes, individual gift boxes',
                      'Yes, custom branded boxes',
                      'Yes, special wrapping/ribbon',
                      'Yes, bulk packaging for resale'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.customPackaging.includes(option)}
                          onChange={() => handleCheckboxChange('customPackaging', option)}
                          className="w-5 h-5 rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="packagingOther">Other requirements:</Label>
                    <Input
                      id="packagingOther"
                      value={formData.packagingOther}
                      onChange={(e) => handleInputChange('packagingOther', e.target.value)}
                      placeholder="Describe any other packaging needs"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">3.4 Is this for private labeling?</Label>
                  <div className="space-y-2">
                    {[
                      'Yes - will be sold under my brand name',
                      'No - for personal/event use',
                      'No - reselling under Limen Lakay brand'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="radio"
                          name="privateLabeling"
                          checked={formData.privateLabeling === option}
                          onChange={() => handleInputChange('privateLabeling', option)}
                          className="w-5 h-5"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 4-12: All remaining sections */}
          {currentSection === 4 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 4: Customization & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">4.1 Do you want custom labels or branding?</Label>
                  <div className="space-y-2">
                    {[
                      'Yes, custom labels with our branding',
                      'Yes, but use Limen Lakay branding',
                      'No labels needed',
                      'Private labeling (completely custom)'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section4_customBranding" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">4.2 If custom branding, please provide:</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="businessName">Business/brand name:</Label>
                      <Input id="businessName" placeholder="Enter your business name" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo (attach file or describe):</Label>
                      <Input id="logo" type="file" className="mt-2" />
                      <Input placeholder="Or describe your logo" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="colorScheme">Color scheme/brand colors:</Label>
                      <Input id="colorScheme" placeholder="e.g., Navy blue and gold" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="specificText">Any specific text/messaging:</Label>
                      <Input id="specificText" placeholder="Enter any specific text or messaging" className="mt-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">4.3 Packaging preferences?</Label>
                  <div className="space-y-2">
                    {[
                      'Individual boxes',
                      'Bulk packaging',
                      'Gift packaging',
                      'Custom packaging design',
                      'Eco-friendly packaging only'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Budget & Pricing */}
          {currentSection === 5 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 5: Budget & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">5.1 What&apos;s your budget range for this order?</Label>
                  <div className="space-y-2">
                    {[
                      'Under $500',
                      '$500 - $1,000',
                      '$1,000 - $2,500',
                      '$2,500 - $5,000',
                      '$5,000+',
                      'Price per unit is more important than total budget'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section5_budget" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">5.2 Have you researched bulk candle pricing elsewhere?</Label>
                  <div className="space-y-2">
                    {[
                      'Yes, I have quotes from other suppliers',
                      'No, Limen Lakay is my first inquiry',
                      'I\'ve done some basic research'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section5_research" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="priceRange">If yes, what price range have you found?</Label>
                    <Input id="priceRange" placeholder="This helps us provide competitive pricing" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">5.3 Payment preferences?</Label>
                  <div className="space-y-2">
                    {[
                      '50% deposit, 50% on completion',
                      'Payment plan options',
                      'Full payment upfront (if discount available)',
                      'Net 30 terms (established businesses)'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section5_payment" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 6: Timeline & Project Details */}
          {currentSection === 6 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 6: Timeline & Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">6.1 What&apos;s the intended use for these candles?</Label>
                  <div className="space-y-2">
                    {[
                      'Retail resale',
                      'Corporate gifts/events',
                      'Wedding favors',
                      'Party/event favors',
                      'Personal use/gifts',
                      'Hotel/hospitality amenities',
                      'Spa/wellness center'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section6_use" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="otherUse">Other:</Label>
                    <Input id="otherUse" placeholder="Please describe the intended use" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">6.2 Are you flexible with the timeline?</Label>
                  <div className="space-y-2">
                    {[
                      'Yes, very flexible - quality is most important',
                      'Somewhat flexible - have some wiggle room',
                      'Firm deadline - cannot be late'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section6_flexibility" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">6.3 Do you need a rush order? (Additional fees apply)</Label>
                  <div className="space-y-2">
                    {[
                      'Yes, willing to pay rush fees',
                      'No, standard timeline is fine',
                      'Depends on cost - please provide rush pricing'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section6_rush" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 7: Samples & Quality Assurance */}
          {currentSection === 7 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 7: Samples & Quality Assurance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">7.1 Would you like samples before placing the full order?</Label>
                  <div className="space-y-2">
                    {[
                      'Yes, definitely need samples first',
                      'No, ready to proceed based on description',
                      'Maybe - depends on pricing and lead time'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section7_samples" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">7.2 If samples are needed, how many styles/scents?</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vesselSamples">Number of vessel styles:</Label>
                      <Input id="vesselSamples" type="number" placeholder="e.g., 3" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="scentSamples">Number of scent samples:</Label>
                      <Input id="scentSamples" type="number" placeholder="e.g., 5" className="mt-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">7.3 Quality priorities (rank in order of importance):</Label>
                  <div className="space-y-2">
                    {[
                      'Scent throw/strength',
                      'Burn time/longevity',
                      'Visual appearance/aesthetics',
                      'Eco-friendly/sustainable materials',
                      'Price point',
                      'Consistency across batch'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 8: Special Requirements & Certifications */}
          {currentSection === 8 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 8: Special Requirements & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">8.1 Do you have any specific requirements?</Label>
                  <div className="space-y-2">
                    {[
                      'Vegan products only',
                      'Soy wax only (no paraffin)',
                      'Lead-free wicks required',
                      'Phthalate-free fragrances',
                      'Cruelty-free certification',
                      'Organic ingredients preferred',
                      'Allergen-free options'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">8.2 Any ingredients or materials to avoid?</Label>
                  <Input placeholder="Please list any specific ingredients, materials, or allergens to avoid" className="mt-2" />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">8.3 Do you need any certifications or documentation?</Label>
                  <div className="space-y-2">
                    {[
                      'Certificate of Analysis (COA)',
                      'Material Safety Data Sheet (MSDS)',
                      'Ingredient list documentation',
                      'Insurance/liability documentation',
                      'Business license verification'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 9: Terms & Conditions Understanding */}
          {currentSection === 9 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 9: Terms & Conditions Understanding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">9.1 Order terms acknowledgment:</Label>
                  <div className="space-y-2">
                    {[
                      'I understand that bulk orders require a 50% non-refundable deposit to begin production',
                      'I understand the standard lead time is 2 months from deposit receipt',
                      'I understand that changes to the order after production begins may incur additional fees',
                      'I understand that custom orders are final sale (no returns/exchanges)'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">9.2 Quality assurance:</Label>
                  <div className="space-y-2">
                    {[
                      'I understand that handmade products may have slight variations',
                      'I understand that color variations may occur between batches',
                      'I agree to inspect products within 48 hours of delivery and report any issues'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">9.3 Shipping and delivery:</Label>
                  <div className="space-y-2">
                    {[
                      'I understand that shipping costs are additional and calculated based on weight/distance',
                      'I understand that delivery timing may be affected by shipping carrier delays',
                      'I will provide accurate delivery address and be available to receive shipment'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 10: Production Capacity & Scheduling */}
          {currentSection === 10 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 10: Production Capacity & Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">10.1 How did you hear about Limen Lakay?</Label>
                  <div className="space-y-2">
                    {[
                      'Social media (Instagram, Facebook, etc.)',
                      'Google search',
                      'Word of mouth/referral',
                      'Previous customer',
                      'Local market/craft fair',
                      'Online marketplace (Etsy, etc.)'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section10_source" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="otherSource">Other:</Label>
                    <Input id="otherSource" placeholder="Please specify" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">10.2 Have you ordered bulk candles before?</Label>
                  <div className="space-y-2">
                    {[
                      'First-time bulk order',
                      'Experienced with bulk orders',
                      'Some experience with bulk orders'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section10_experience" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">10.3 What&apos;s most important for this partnership?</Label>
                  <div className="space-y-2">
                    {[
                      'Competitive pricing',
                      'Consistent quality',
                      'Reliable delivery times',
                      'Good communication',
                      'Flexibility with changes',
                      'Supporting small business',
                      'Eco-friendly practices'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 11: Communication & Project Management */}
          {currentSection === 11 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 11: Communication & Project Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">11.1 Preferred communication method:</Label>
                  <div className="space-y-2">
                    {[
                      'Email',
                      'Phone calls',
                      'Text messaging',
                      'Video calls (for complex orders)',
                      'Project management platform'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">11.2 Update frequency preference:</Label>
                  <div className="space-y-2">
                    {[
                      'Weekly progress updates',
                      'Bi-weekly check-ins',
                      'Only at major milestones',
                      'Minimal communication - just start and finish'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section11_frequency" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">11.3 Best times to contact you:</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timezone">Time zone:</Label>
                      <Input id="timezone" placeholder="EST, PST, etc." className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="bestHours">Best hours:</Label>
                      <Input id="bestHours" placeholder="9am-5pm, evenings, etc." className="mt-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">11.4 Decision maker information:</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="decisionMaker">Who makes final decisions on this project?</Label>
                      <Input id="decisionMaker" placeholder="Name and role" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="dmContact">Their contact information (if different):</Label>
                      <Input id="dmContact" placeholder="Email or phone" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="approvalTime">How long does your approval process typically take?</Label>
                      <Input id="approvalTime" placeholder="e.g., 24-48 hours, 1 week" className="mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 12: Additional Information & Final Details */}
          {currentSection === 12 && (
            <Card className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
                <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
                  Section 12: Additional Information & Final Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className="text-lg font-semibold mb-3 block">12.1 Anything else we should know about your project?</Label>
                  <textarea
                    className="w-full min-h-[120px] p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Special considerations, unique requirements, inspiration, or any other details that would help us create the perfect candles for you..."
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">12.2 Questions for Limen Lakay?</Label>
                  <textarea
                    className="w-full min-h-[120px] p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Any questions about our process, capabilities, pricing, timeline, etc.?"
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">12.3 How did you envision working together?</Label>
                  <div className="space-y-2">
                    {[
                      'One-time project',
                      'Ongoing partnership',
                      'Seasonal orders',
                      'Test order first, then larger orders',
                      'White-label/private label partnership'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="section12_partnership" className="w-5 h-5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">12.4 Final checklist:</Label>
                  <div className="space-y-2">
                    {[
                      'I have completed all relevant sections of this questionnaire',
                      'I have uploaded any reference images to Section 3',
                      'I understand this is an inquiry and not a binding order',
                      'I am ready to move forward with samples and/or quotes'
                    ].map(option => (
                      <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-b-2xl flex-shrink-0 border-t">
          <div className="flex justify-between items-center">
            <Button
              onClick={prevSection}
              disabled={currentSection === 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Download PDF
              </Button>

              {currentSection < totalSections ? (
                <Button
                  onClick={nextSection}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  Submit Questionnaire
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
