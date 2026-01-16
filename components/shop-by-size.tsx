"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, Sparkles, Sun, Droplet } from "lucide-react";

const candleSizes = [
  {
    id: 1,
    name: "XL 4-wick",
    description: "Our largest candles for maximum fragrance impact",
    icon: Flame,
    link: "/catalog?size=xl-4-wick",
    bgColor: "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950 dark:to-red-950",
  },
  {
    id: 2,
    name: "Large 2-wick",
    description: "Perfect for living rooms and large spaces",
    icon: Sparkles,
    link: "/catalog?size=large-2-wick",
    bgColor: "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950",
  },
  {
    id: 3,
    name: "DayLights",
    description: "Travel-friendly candles in tins",
    icon: Sun,
    link: "/catalog?size=daylights",
    bgColor: "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-950 dark:to-amber-950",
  },
  {
    id: 4,
    name: "Wax Melts",
    description: "Flameless fragrance for wax warmers",
    icon: Droplet,
    link: "/catalog?size=wax-melts",
    bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950",
  },
];

export function ShopBySize() {
  return (
    <section className="w-full py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Shop By Size
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find the perfect candle size for your space and needs. From travel-friendly options to statement luxury pieces, we have the right size for every room and occasion.
          </p>
        </div>

        {/* Size Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {candleSizes.map((size) => {
            const Icon = size.icon;
            return (
              <Link
                key={size.id}
                href={size.link}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image Container with Gradient Background */}
                <div className={`aspect-square ${size.bgColor} flex items-center justify-center p-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <Icon className="w-32 h-32 text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {size.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {size.description}
                  </p>
                  <span className="text-amber-600 dark:text-amber-400 font-medium text-sm underline">
                    Shop Now →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Not sure which size is right for you? Check out our{" "}
            <Link href="/vessel-calculator" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
              Vessel Calculator
            </Link>
            {" "}to find the perfect match for your space.
          </p>
        </div>
      </div>
    </section>
  );
}
