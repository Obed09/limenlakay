"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Check } from "lucide-react";

interface VesselImage {
  id: string;
  image_url: string;
  color_variant: string;
  is_primary: boolean;
  is_available: boolean;
  display_order: number;
}

interface Vessel {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  description?: string;
  vessel_images?: VesselImage[];
}

export function FeaturedVessels() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VesselImage | null>>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/vessels?available=true')
      .then(res => res.json())
      .then(data => {
        if (data.vessels) {
          const list: Vessel[] = data.vessels.slice(0, 8);
          // Pre-select the primary (or first) image for each vessel
          const defaults: Record<string, VesselImage | null> = {};
          list.forEach(v => {
            const imgs = v.vessel_images?.filter(i => i.is_available) ?? [];
            defaults[v.id] = imgs.find(i => i.is_primary) ?? imgs[0] ?? null;
          });
          setSelectedVariants(defaults);
          setVessels(list);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getDisplayImage = (vessel: Vessel) =>
    selectedVariants[vessel.id]?.image_url ?? vessel.image_url;

  const getVariants = (vessel: Vessel) =>
    (vessel.vessel_images ?? []).filter(i => i.is_available);

  const handleOrder = (vessel: Vessel) => {
    const variant = selectedVariants[vessel.id];
    const params = new URLSearchParams({ vessel: vessel.id });
    if (variant?.id) params.set('variant', variant.id);
    router.push(`/custom-order?${params.toString()}`);
  };

  if (loading) {
    return (
      <section className="w-full py-20 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-amber-950/20 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading vessels...</p>
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
            {vessels.map((vessel) => {
              const variants = getVariants(vessel);
              const hasVariants = variants.length > 1;
              const selected = selectedVariants[vessel.id];
              const displayImage = getDisplayImage(vessel);

              return (
                <div
                  key={vessel.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={selected?.color_variant || vessel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}

                    {/* Copyright watermark */}
                    {displayImage && (
                      <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none select-none z-10">
                        &copy; Limen Lakay
                      </div>
                    )}

                    {/* Wishlist */}
                    <button
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group/heart z-10"
                      aria-label="Add to wishlist"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-colors" />
                    </button>

                    {/* Stock badge */}
                    {vessel.stock_quantity <= 3 && vessel.stock_quantity > 0 && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        Only {vessel.stock_quantity} left!
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                      {vessel.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="capitalize">{vessel.color}</span>
                      <span>•</span>
                      <span>{vessel.size}</span>
                    </div>

                    {vessel.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {vessel.description}
                      </p>
                    )}

                    {/* Variant selector */}
                    {hasVariants && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          Color / Pattern
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((img) => {
                            const isSelected = selected?.id === img.id ||
                              (!selected && img.is_primary);
                            return (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants(prev => ({ ...prev, [vessel.id]: img }))
                                }
                                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                                }`}
                                title={img.color_variant}
                              >
                                {/* Mini swatch */}
                                <span className="w-4 h-4 rounded overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-500 block">
                                  <img
                                    src={img.image_url}
                                    alt={img.color_variant}
                                    className="w-full h-full object-cover"
                                  />
                                </span>
                                <span className="max-w-[80px] truncate">{img.color_variant || `Option ${variants.indexOf(img) + 1}`}</span>
                                {isSelected && <Check className="w-3 h-3 text-amber-600 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        {selected?.color_variant && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                            Selected: <span className="font-medium text-gray-700 dark:text-gray-300">{selected.color_variant}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 mt-auto">
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        ${vessel.price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {vessel.stock_quantity} in stock
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => handleOrder(vessel)}
                      className="w-full text-center py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Make Custom Candle
                    </button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                      {hasVariants && selected?.color_variant
                        ? `${selected.color_variant} — click to change color above`
                        : 'Choose your preferred scent next'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All */}
        {vessels.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/custom-order"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg"
            >
              View All Vessels &amp; Create Custom Candle
              <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}