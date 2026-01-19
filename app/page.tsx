import { ContactSection } from "@/components/contact-section";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { FeaturedVessels } from "@/components/featured-vessels";
import { KringleHeader } from "@/components/kringle-header";
import { KringleHeroCarousel } from "@/components/kringle-hero-carousel";
import { KringleProductGrid } from "@/components/kringle-product-grid";
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
                  Unique Vessels
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

      {/* Enhanced Footer */}
      <footer className="w-full border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-100/50 dark:bg-gray-900/50 py-8">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {/* Brand Section */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Image 
                  src="/images/limen-lakay-logo.png" 
                  alt="Limen Lakay Logo" 
                  width={40} 
                  height={40}
                  className="object-contain opacity-80"
                />
                <h3 className="text-base font-semibold text-amber-600 dark:text-amber-400">Limen Lakay</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                Handcrafted candles that bring light, warmth, and beautiful fragrances to your home since 2024.
              </p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/limenlakay" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-600 hover:text-amber-500 dark:hover:text-amber-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@limenlakay" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-600 hover:text-amber-500 dark:hover:text-amber-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">Shop</h4>
              <div className="space-y-1.5 text-xs">
                <Link href="#catalog" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                  All Candles
                </Link>
                <Link href="/custom-order" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                  Custom Candle
                </Link>
                <Link href="/bulk-order" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                  Bulk Orders
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">Support</h4>
              <div className="space-y-1.5 text-xs">
                <Link href="#contact" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                  Contact Us
                </Link>
                <Link href="/track" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                  Track Order
                </Link>
                <Link href="#about" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                  About Us
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">Contact</h4>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-500">
                <a href="mailto:info@limenlakay.com" className="block hover:text-amber-600 dark:hover:text-amber-400">
                  info@limenlakay.com
                </a>
                <a href="tel:+15615930238" className="block hover:text-amber-600 dark:hover:text-amber-400">
                  +1 561 593 0238
                </a>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">24hr response time</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-gray-400 dark:text-gray-600">
              <p>
                &copy; 2025 Limen Lakay. All rights reserved. Made with ❤️ and artisan care.
              </p>
              <div className="flex gap-4">
                <Link href="/privacy-policy" className="hover:text-amber-500 dark:hover:text-amber-500">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-amber-500 dark:hover:text-amber-500">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatButton />
    </main>
  );
}
