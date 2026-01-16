"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

interface Vessel {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  description?: string;
}

export function FeaturedVessels() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vessels?available=true')
      .then(res => res.json())
      .then(data => {
        if (data.vessels) {
          // Show first 8 vessels
          setVessels(data.vessels.slice(0, 8));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching vessels:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="w-full py-20 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-amber-950/20 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading vessels...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-20 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-amber-950/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-5">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Handcrafted Concrete Vessels</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Unique Concrete Vessels
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Each vessel is hand-poured with premium concrete — no two are exactly alike. 
            Available empty or as a custom candle.
          </p>
        </div>

        {/* Vessels Grid */}
        {vessels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No vessels available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {vessels.map((vessel) => (
              <Link 
                key={vessel.id}
                href={`/custom-order?vessel=${vessel.id}`}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 block"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {vessel.image_url ? (
                    <Image
                      src={vessel.image_url}
                      alt={vessel.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  
                  {/* Wishlist Button */}
                  <button 
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group/heart"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-colors" />
                  </button>

                  {/* Stock Badge */}
                  {vessel.stock_quantity <= 3 && vessel.stock_quantity > 0 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Only {vessel.stock_quantity} left!
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                    {vessel.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="capitalize">{vessel.color}</span>
                    <span>•</span>
                    <span>{vessel.size}</span>
                  </div>
                  
                  {vessel.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {vessel.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${vessel.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {vessel.stock_quantity} in stock
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="w-full text-center py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Make Custom Candle
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                      Click to customize with your favorite scent
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Link */}
        {vessels.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/custom-order"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
            >
              View All Vessels & Create Custom Candle
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
