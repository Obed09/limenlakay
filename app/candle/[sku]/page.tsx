'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { KringleHeader } from '@/components/kringle-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, ArrowLeft, Package, Flame, Sparkles } from 'lucide-react';

interface Candle {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  vessel?: {
    name: string;
    color: string;
    size: string;
  };
  scent?: {
    name: string;
    name_english: string;
    notes: string;
    description: string;
  };
}

export default function CandlePage() {
  const params = useParams();
  const sku = params.sku as string;
  const [candle, setCandle] = useState<Candle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandle() {
      try {
        const supabase = createClient();
        
        // First, try to get the candle
        const { data: candleData, error: candleError } = await supabase
          .from('finished_candles')
          .select('*')
          .eq('sku', sku)
          .maybeSingle();

        console.log('Fetching candle with SKU:', sku);
        console.log('Candle data:', candleData);
        console.log('Candle error:', candleError);

        if (candleError) {
          console.error('Database error:', candleError);
          throw candleError;
        }

        if (!candleData) {
          throw new Error('Candle not found');
        }

        // Now get vessel and scent data if available
        let vesselData = null;
        let scentData = null;

        if (candleData.vessel_id) {
          const { data: vessel } = await supabase
            .from('vessels')
            .select('name, color, size')
            .eq('id', candleData.vessel_id)
            .single();
          vesselData = vessel;
        }

        if (candleData.scent_id) {
          const { data: scent } = await supabase
            .from('scents')
            .select('name, name_english, notes, description')
            .eq('id', candleData.scent_id)
            .single();
          scentData = scent;
        }

        setCandle({
          ...candleData,
          vessel: vesselData,
          scent: scentData,
        });
      } catch (err) {
        console.error('Error fetching candle:', err);
        setError(err instanceof Error ? err.message : 'Candle not found');
      } finally {
        setLoading(false);
      }
    }

    if (sku) {
      fetchCandle();
    }
  }, [sku]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <KringleHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading candle details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candle) {
    return (
      <div className="min-h-screen flex flex-col">
        <KringleHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Candle Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The candle you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <KringleHeader />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button asChild variant="outline" className="font-semibold text-base hover:bg-amber-50 dark:hover:bg-amber-950">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square relative bg-gray-200 dark:bg-gray-800">
                  {candle.image_url ? (
                    <Image
                      src={candle.image_url}
                      alt={candle.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Flame className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3 bg-amber-600 text-base font-semibold">SKU: {candle.sku}</Badge>
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                  {candle.name}
                </h1>
                {candle.scent && (
                  <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                    {candle.scent.name_english}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-extrabold text-amber-600 dark:text-amber-400">
                  ${candle.price.toFixed(2)}
                </span>
                {candle.stock_quantity > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Package className="w-3 h-3 mr-1" />
                    {candle.stock_quantity} in stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Description */}
              {candle.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {candle.description}
                  </p>
                </div>
              )}

              {/* Vessel Details */}
              {candle.vessel && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Vessel Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{candle.vessel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Color:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{candle.vessel.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Size:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{candle.vessel.size}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scent Details */}
              {candle.scent && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      Fragrance Notes
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{candle.scent.notes}</p>
                      </div>
                      {candle.scent.description && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{candle.scent.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button 
                  size="lg" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-lg"
                  disabled={candle.stock_quantity === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
