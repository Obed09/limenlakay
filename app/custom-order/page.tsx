'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ShoppingCart, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vessel {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  description: string | null;
}

interface Scent {
  id: string;
  name: string;
  name_english: string;
  notes: string;
  description: string;
  display_order: number;
}

interface CartItem {
  vessel: Vessel;
  scent: Scent;
}

export default function CustomOrderPage() {
  const [step, setStep] = useState(1);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedScent, setSelectedScent] = useState<Scent | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vesselsResult, scentsResult] = await Promise.all([
          supabase
            .from('candle_vessels')
            .select('*')
            .eq('is_available', true)
            .order('name'),
          supabase
            .from('candle_scents')
            .select('*')
            .eq('is_available', true)
            .order('display_order')
        ]);

        if (vesselsResult.error) throw vesselsResult.error;
        if (scentsResult.error) throw scentsResult.error;

        console.log('Loaded vessels:', vesselsResult.data);
        console.log('Loaded scents:', scentsResult.data);

        setVessels(vesselsResult.data || []);
        setScents(scentsResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: `Failed to load available options: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, toast]);

  const addToCart = () => {
    if (!selectedVessel || !selectedScent) return;

    setCart([...cart, { vessel: selectedVessel, scent: selectedScent }]);
    setSelectedVessel(null);
    setSelectedScent(null);
    setStep(1);

    toast({
      title: 'Added to Cart',
      description: 'Candle added successfully!'
    });
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
    toast({
      title: 'Removed',
      description: 'Item removed from cart'
    });
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.vessel.price, 0);
    const shipping = 10; // Fixed shipping for now
    return { subtotal, shipping, total: subtotal + shipping };
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add at least one item to your cart',
        variant: 'destructive'
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name and email',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { subtotal, shipping, total } = calculateTotal();
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('custom_orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            shipping_address: customerInfo.address,
            shipping_city: customerInfo.city,
            shipping_state: customerInfo.state,
            shipping_zip: customerInfo.zip,
            subtotal,
            shipping_cost: shipping,
            total,
            status: 'pending',
            payment_status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        vessel_id: item.vessel.id,
        scent_id: item.scent.id,
        quantity: 1,
        unit_price: item.vessel.price,
        subtotal: item.vessel.price
      }));

      const { error: itemsError } = await supabase
        .from('custom_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Order Placed!',
        description: `Your order ${orderNumber} has been received. Check your email for details.`
      });

      // Reset
      setCart([]);
      setStep(1);
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit order. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const { subtotal, shipping, total } = calculateTotal();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Custom Candle</h1>
        <p className="text-muted-foreground text-lg">
          Choose your vessel, pick your scent, and we'll create your perfect candle
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-muted'}`}>
              {step > 1 ? <Check className="h-5 w-5" /> : '1'}
            </div>
            <span className="font-medium">Choose Vessel</span>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-muted'}`}>
              {step > 2 ? <Check className="h-5 w-5" /> : '2'}
            </div>
            <span className="font-medium">Select Scent</span>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-muted'}`}>
              3
            </div>
            <span className="font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Choose Vessel */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Your Vessel</CardTitle>
                <CardDescription>
                  Select the empty vessel you'd like to fill with your custom scent. Each vessel is $39.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedVessel?.id}
                  onValueChange={(value) => {
                    const vessel = vessels.find((v) => v.id === value);
                    setSelectedVessel(vessel || null);
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vessels.map((vessel) => (
                      <div
                        key={vessel.id}
                        className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                          selectedVessel?.id === vessel.id
                            ? 'ring-2 ring-orange-500 shadow-lg'
                            : 'hover:border-orange-300'
                        }`}
                        onClick={() => setSelectedVessel(vessel)}
                      >
                        <RadioGroupItem
                          value={vessel.id}
                          id={vessel.id}
                          className="absolute top-3 right-3 z-10"
                        />
                        
                        {/* Image */}
                        <div className="aspect-square bg-gray-50 overflow-hidden">
                          <img
                            src={vessel.image_url}
                            alt={vessel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://via.placeholder.com/400?text=No+Image';
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-1">
                            {vessel.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {vessel.color} • {vessel.size}
                          </p>
                          {vessel.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {vessel.description}
                            </p>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-xl font-bold text-orange-500">
                              ${vessel.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {vessel.stock_quantity > 0 ? `${vessel.stock_quantity} in stock` : 'In stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {vessels.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Vessels Available
                    </h3>
                    <p className="text-muted-foreground">
                      Please check back later for available vessels
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedVessel}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Next: Choose Scent
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Choose Scent */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select Your Scent</CardTitle>
                <CardDescription>
                  Choose from our handcrafted Haitian-inspired fragrances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedScent?.id}
                  onValueChange={(value) => {
                    const scent = scents.find((s) => s.id === value);
                    setSelectedScent(scent || null);
                  }}
                >
                  <div className="space-y-3">
                    {scents.map((scent) => (
                      <div
                        key={scent.id}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedScent?.id === scent.id
                            ? 'ring-2 ring-orange-500 shadow-md border-orange-500 bg-orange-50'
                            : 'hover:border-orange-300'
                        }`}
                        onClick={() => setSelectedScent(scent)}
                      >
                        <RadioGroupItem
                          value={scent.id}
                          id={scent.id}
                          className="absolute top-4 right-4"
                        />
                        <div className="pr-8">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">
                              {scent.name}
                            </h3>
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                              {scent.name_english}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-orange-600 mb-2">
                            {scent.notes}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scent.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={addToCart}
                    disabled={!selectedScent}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Checkout */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Shipping Information</CardTitle>
                <CardDescription>
                  Enter your details to complete your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={customerInfo.state}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, state: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={customerInfo.zip}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, zip: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      Continue Shopping
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmitOrder}
                      className="flex items-center gap-2"
                    >
                      Place Order
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.vessel.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.scent.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(index)}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="text-right font-semibold">
                          ${item.vessel.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {step < 3 && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => setStep(3)}
                    >
                      Proceed to Checkout
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
