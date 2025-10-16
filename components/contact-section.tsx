'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would integrate with Supabase to save the inquiry
      console.log('Form submission:', formData);
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
            Ready to bring the warmth of handmade candles to your space? Let's create something beautiful together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email</h4>
                  <p className="text-gray-600 dark:text-gray-400">hello@limenlakay.com</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Phone</h4>
                  <p className="text-gray-600 dark:text-gray-400">(555) 123-GLOW</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Response Time</h4>
                  <p className="text-gray-600 dark:text-gray-400">Within 24 hours</p>
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

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Custom Order Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your vision and we'll help bring it to life
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
      </div>
    </section>
  );
}