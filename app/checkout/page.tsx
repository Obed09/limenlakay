'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { ArrowLeft, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingCost, setShippingCost] = useState(8.99); // Default fallback
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingService, setShippingService] = useState('Standard Shipping');
  
  const productName = searchParams.get('product') || '';
  const sku = searchParams.get('sku') || '';
  const price = parseFloat(searchParams.get('price') || '0');
  const total = price + shippingCost;
  const [paymentOption, setPaymentOption] = useState<'card' | 'affirm'>('card');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Calculate shipping when zip code changes
    if (e.target.name === 'zip' && e.target.value.length === 5) {
      calculateShipping(e.target.value, formData.state);
    }
  };

  const calculateShipping = async (zip: string, state: string) => {
    if (!zip || !state) return;
    
    setLoadingShipping(true);
    try {
      const response = await fetch('/api/ups/shipping-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toZip: zip,
          toState: state,
          toCity: formData.city,
          weight: 2, // Assume 2 lbs for candles
          service: "03" // UPS Ground
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShippingCost(data.cost);
        setShippingService(data.service);
      } else {
        // Use fallback rate
        setShippingCost(data.cost || 8.99);
        setShippingService(data.service || 'Standard Shipping');
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      setShippingCost(8.99); // Fallback
      setShippingService('Standard Shipping');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          sku,
          price,
          shipping: shippingCost,
          quantity: 1,
          customerInfo: formData,
          paymentOption: paymentOption
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (!productName || !price) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No product selected</p>
            <Button asChild>
              <Link href="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Button asChild variant="outline" className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">{productName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {sku}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-medium">${price.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    <div className="text-right">
                      {loadingShipping ? (
                        <span className="text-sm text-gray-500">Calculating...</span>
                      ) : (
                        <>
                          <span>${shippingCost.toFixed(2)}</span>
                          <p className="text-xs text-gray-500">{shippingService}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-amber-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Affirm Availability Message */}
                {total < 110 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
                      💳 Add ${(110 - total).toFixed(2)} more for payment plan options
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Reach $110 minimum to unlock Affirm (4 interest-free payments)
                    </p>
                  </div>
                )}

                {/* Payment Method Selection */}
                {total >= 110 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Payment Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentOption('card')}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          paymentOption === 'card'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">Pay in Full</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          ${total.toFixed(2)} today
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentOption('affirm')}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          paymentOption === 'affirm'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm flex items-center gap-1">
                          <span>Affirm</span>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">4x</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          ${(total / 4).toFixed(2)}/month
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                  <div className="flex items-start gap-2">
                    <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Secure Payment</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        You'll be redirected to Stripe's secure checkout. Your payment information is encrypted and never stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Address Autocomplete Component */}
                  <AddressAutocomplete
                    value={{
                      address: formData.address,
                      city: formData.city,
                      state: formData.state,
                      zip: formData.zip,
                    }}
                    onChange={(addressData) =>
                      setFormData({ ...formData, ...addressData })
                    }
                    onZipComplete={(zip, state) => calculateShipping(zip, state)}
                    required={true}
                  />

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    By clicking "Proceed to Payment", you agree to our terms of service and privacy policy
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
