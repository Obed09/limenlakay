'use client';

import { ContactSection } from "@/components/contact-section";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { FeaturedVessels } from "@/components/featured-vessels";
import { KringleHeader } from "@/components/kringle-header";
import { KringleHeroCarousel } from "@/components/kringle-hero-carousel";
import { KringleProductGrid } from "@/components/kringle-product-grid";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Flame, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Kringle-Style Navigation Header */}
      <KringleHeader />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Kringle-Style Hero Carousel */}
        <KringleHeroCarousel />

        {/* Featured Vessels - PRIMARY FOCUS */}
        <FeaturedVessels />

        {/* Featured Products - Available Candles */}
        <KringleProductGrid
          title="Featured Handcrafted Candles"
          viewAllLink="/catalog"
        />

        {/* FAQ Section - COMPACT VERSION */}
        <section id="faq" className="w-full py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Common questions about our candles, ordering, and care
              </p>
            </div>
            <details className="group mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                How can I order from Limen Lakay?
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                We offer two ways to order: (1) Purchase finished candles directly from our collection shown on the homepage, or (2) Create a custom candle by selecting your favorite vessel and scent through our Custom Order page. Simply choose your preferences and we'll handcraft your unique candle.
              </div>
            </details>
            <details className="group mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                What are the concrete vessels and can I buy them empty?
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                Our signature handcrafted concrete vessels come in various colors and sizes. Yes! You can purchase empty vessels to use as decorative pieces or fill with your own candles. Each vessel features unique patterns created by our artistic pouring technique—no two are exactly alike. Prices vary based on size, color, and design complexity.
              </div>
            </details>
            <details className="group mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                What scents do you offer?
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                We offer 8 signature Haitian-inspired scents: (1) Dousè Lakay (Sweet Home) - Black Amber, Sandalwood & Vanilla, (2) Chimen Lakay (Path Home) - White Oak, Patchouli & Sandalwood, (3) Jaden Kreyol (Creole Garden) - Gardenia, Jasmine & Vanilla, (4) Bèl Sezon (Beautiful Season) - Mango, Coconut & Sandalwood, (5) Lanmou Dous (Sweet Love) - Strawberry Cheesecake & Vanilla, (6) Bèl Flè (Beautiful Flower) - Cherry Blossom & Vanilla Orchid, (7) Lakay Douvanjou (Home Before Dawn) - Palo Santo, White Tea & Ginger, and (8) Chimen Kache (Hidden Path) - Beach Linen & Sandalwood. We're constantly creating new scents, so check our website regularly for exciting new additions to our collection!
              </div>
            </details>
            <details className="group mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                Do you offer bulk orders for events or gifts?
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                Absolutely! We love creating candles for weddings, corporate events, and special occasions. Fill out our Bulk Order Questionnaire through the CUSTOMIZE menu to tell us about your needs, or contact us directly at info@limenlakay.com for personalized pricing and availability.
              </div>
            </details>
            <details className="group mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <summary className="flex justify-between items-center cursor-pointer p-4 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                What makes your concrete vessels unique?
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                Our vessels celebrate the beauty of imperfection. Each piece is hand-poured, allowing the material to flow and settle naturally. This creates organic variations in texture, veining, and color blending. So while colors can be matched, the pattern on your vessel will be yours alone — a true testament to handmade artistry.
              </div>
            </details>
          </div>
        </section>

        {/* Why Choose Us - COMPACT VERSION AT BOTTOM */}
        <section className="w-full py-12 bg-white dark:bg-gray-800">
          <div className="max-w-5xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 mb-3">
                  <Star className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Premium Quality
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Handcrafted with premium natural ingredients
                </p>
              </div>
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 mb-3">
                  <Flame className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Clean Burning
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Natural soy wax for eco-friendly burn
                </p>
              </div>
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 mb-3">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Sustainable
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  One-of-a-kind handcrafted concrete designs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />
      </div>

      {/* Footer */}
      <SiteFooter />

      {/* Floating Chat Widget */}
      <FloatingChatButton />
    </main>
  );
}
