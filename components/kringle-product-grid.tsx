"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Eye, ShoppingCart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist } from "@/lib/wishlist-context";

interface FinishedCandle {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  onSale: boolean;
  isNew?: boolean;
}

// Sample products removed - using real database products only

interface KringleProductGridProps {
  title?: string;
  viewAllLink?: string;
}

export function KringleProductGrid({
  title = "Fragrances to calm and restore this New Year",
  viewAllLink = "/catalog"
}: KringleProductGridProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [candles, setCandles] = useState<FinishedCandle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch finished candles that are available for sale
    fetch('/api/finished-candles')
      .then(res => res.json())
      .then(data => {
        if (data.candles) {
          // Get first 4 candles for the featured section
          setCandles(data.candles.slice(0, 4));
        }
      })
      .catch(err => console.error('Error fetching candles:', err))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : index < rating
            ? "fill-amber-400/50 text-amber-400"
            : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="w-full py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading candles...</p>
          </div>
        </div>
      </section>
    );
  }

  if (candles.length === 0) {
    return null; // Don't show section if no candles available
  }

  return (
    <section className="w-full py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <Button asChild variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950">
            <Link href={viewAllLink}>View All</Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {candles.map((candle) => (
            <Card
              key={candle.id}
              className="group relative overflow-hidden border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {candle.stock_quantity > 0 && (
                  <Badge className="bg-green-600 text-white hover:bg-green-700 font-semibold">
                    IN STOCK
                  </Badge>
                )}
              </div>

              {/* Wishlist Heart */}
              <button
                onClick={() => toggleWishlist(candle.id)}
                className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-900/90 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 hover:scale-110"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(candle.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </button>

              {/* Product Image */}
              <Link href={`/candle/${candle.sku}`} className="block relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {candle.image_url ? (
                  <Image
                    src={candle.image_url}
                    alt={candle.name}
                    width={400}
                    height={400}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Flame className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                
                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Quick View
                  </Button>
                </div>
              </Link>

              <CardContent className="p-4 space-y-3">
                {/* SKU Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {candle.sku}
                  </Badge>
                </div>

                {/* Product Name */}
                <Link href={`/candle/${candle.sku}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2">
                    {candle.name}
                  </h3>
                </Link>

                {/* Description */}
                {candle.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {candle.description}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    ${candle.price.toFixed(2)}
                  </span>
                  {candle.stock_quantity > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {candle.stock_quantity} available
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add To Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
