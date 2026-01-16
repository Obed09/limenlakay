"use client";

import Link from "next/link";
import { Sparkles, Leaf, Flower, Wind, Apple, Coffee } from "lucide-react";

const fragranceCategories = [
  {
    id: 1,
    name: "Kringle Holiday",
    icon: Sparkles,
    bgGradient: "from-red-100 via-green-100 to-gold-100 dark:from-red-950 dark:via-green-950 dark:to-gold-950",
    link: "/catalog?fragrance=holiday",
  },
  {
    id: 2,
    name: "Kringle Autumn",
    icon: Leaf,
    bgGradient: "from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950",
    link: "/catalog?fragrance=autumn",
  },
  {
    id: 3,
    name: "Kringle Florals",
    icon: Flower,
    bgGradient: "from-pink-100 via-purple-100 to-rose-100 dark:from-pink-950 dark:via-purple-950 dark:to-rose-950",
    link: "/catalog?fragrance=florals",
  },
  {
    id: 4,
    name: "Kringle Fresh",
    icon: Wind,
    bgGradient: "from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950",
    link: "/catalog?fragrance=fresh",
  },
  {
    id: 5,
    name: "Kringle Fruits",
    icon: Apple,
    bgGradient: "from-lime-100 via-green-100 to-emerald-100 dark:from-lime-950 dark:via-green-950 dark:to-emerald-950",
    link: "/catalog?fragrance=fruits",
  },
  {
    id: 6,
    name: "Kringle Gourmet",
    icon: Coffee,
    bgGradient: "from-amber-100 via-orange-100 to-brown-100 dark:from-amber-950 dark:via-orange-950 dark:to-brown-950",
    link: "/catalog?fragrance=gourmet",
  },
];

export function ShopByFragrances() {
  return (
    <section className="w-full py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Shop By Fragrances
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our diverse range of scents and find your perfect fragrance
          </p>
        </div>

        {/* Fragrance Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {fragranceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group relative overflow-hidden rounded-xl aspect-square shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="bg-white/80 dark:bg-gray-900/80 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 md:w-12 md:h-12 text-gray-900 dark:text-gray-100" />
                  </div>
                  <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h3>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 underline">
                      View Collection
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
