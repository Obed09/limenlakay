'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { notifyNewInquiry } from "@/lib/email-notifications";
import { BulkOrderModal } from "@/components/bulk-order-modal";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderType: '',
    vesselPreference: '',
    scentPreference: '',
    quantity: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would integrate with Supabase to save the inquiry
      console.log('Form submission:', formData);
      
      // Send email notification to business
      await notifyNewInquiry(formData);
      
      setSubmitMessage('Thank you for your inquiry! We will get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        orderType: '',
        vesselPreference: '',
        scentPreference: '',
        quantity: '',
        message: ''
      });
    } catch {
      setSubmitMessage('Sorry, there was an error submitting your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ready to bring the warmth of handmade candles to your space? Let&apos;s create something beautiful together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email</h4>
                  <p className="text-gray-600 dark:text-gray-400">info@limenlakay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Phone</h4>
                  <p className="text-gray-600 dark:text-gray-400">+1 561 593 0238</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Response Time</h4>
                  <p className="text-gray-600 dark:text-gray-400">Within 24 hours</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Follow Us</h4>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.instagram.com/limenlakay" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a 
                      href="https://www.tiktok.com/@limenlaky" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      aria-label="TikTok"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">• Custom orders: 5-7 business days</p>
                <p className="text-gray-600 dark:text-gray-400">• Standard collections: 2-3 business days</p>
                <p className="text-gray-600 dark:text-gray-400">• Local delivery available</p>
                <p className="text-gray-600 dark:text-gray-400">• Shipping nationwide</p>
                <p className="text-gray-600 dark:text-gray-400">• Bulk orders welcome</p>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Order Questionnaire - Prominent CTA */}
          <div className="lg:col-span-1">
            <Card className="h-full border-4 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-amber-900 dark:text-amber-100 px-2">
                  📋 Bulk Order<br />Questionnaire
                </CardTitle>
                <CardDescription className="text-sm text-amber-800 dark:text-amber-200 mt-2 px-3">
                  For wholesale, corporate, or large quantity orders
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4 px-4">
                <div className="space-y-3 text-left bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-lg">✓</span> 50+ candles
                  </p>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-lg">✓</span> Custom branding
                  </p>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-lg">✓</span> Private labeling
                  </p>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-lg">✓</span> Wholesale pricing
                  </p>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-lg">✓</span> Special packaging
                  </p>
                </div>

                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg text-center">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Response Time:</strong> 24-48 hours
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Lead Time:</strong> 2 months standard
                  </p>
                </div>

                <Button
                  onClick={() => setShowBulkModal(true)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  Bulk Order Questionnaire
                </Button>

                <p className="text-xs text-gray-600 dark:text-gray-400 italic px-2">
                  Complete our detailed questionnaire to receive a custom quote
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form - Now takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Custom Order Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your vision and we&apos;ll help bring it to life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderType">Order Type</Label>
                      <select
                        id="orderType"
                        name="orderType"
                        value={formData.orderType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="">Select order type</option>
                        <option value="single">Single Candle</option>
                        <option value="set">Candle Set</option>
                        <option value="custom">Custom Design</option>
                        <option value="bulk">Bulk Order</option>
                        <option value="gift">Gift Order</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vesselPreference">Vessel Preference</Label>
                      <select
                        id="vesselPreference"
                        name="vesselPreference"
                        value={formData.vesselPreference}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="">Select vessel type</option>
                        <option value="concrete">Concrete</option>
                        <option value="wood">Wood</option>
                        <option value="ceramic">Ceramic</option>
                        <option value="glass">Glass</option>
                        <option value="custom">Custom Material</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Approximate Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g., 1, 3, 10+"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scentPreference">Scent Preferences</Label>
                    <Input
                      id="scentPreference"
                      name="scentPreference"
                      value={formData.scentPreference}
                      onChange={handleChange}
                      placeholder="e.g., vanilla, citrus, woodsy, unscented..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tell us about your vision</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 resize-none"
                      placeholder="Describe your ideal candle... colors, style, occasion, special requests..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </Button>

                  {submitMessage && (
                    <p className={`text-center p-3 rounded-md ${
                      submitMessage.includes('Thank you') 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      {submitMessage}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bulk Order Modal */}
        <BulkOrderModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          clientName={formData.name}
          clientEmail={formData.email}
        />
      </div>
    </section>
  );
}