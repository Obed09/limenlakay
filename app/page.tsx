import { Hero } from "@/components/hero";
import { ProductShowcase } from "@/components/product-showcase";
import ProductCatalog from "@/components/product-catalog";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FloatingChatButton } from "@/components/floating-chat-button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="flex items-center gap-2">
              <Image 
                src="/images/limen-lakay-logo.png" 
                alt="Limen Lakay Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">Limen Lakay</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#products" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Products
            </Link>
            <Link href="#catalog" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Catalog
            </Link>
            <Link href="#about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              About
            </Link>
            <Link href="#contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Contact
            </Link>
            <Link href="/custom-order" className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors font-medium">
              Create Your Candle
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto w-full py-20 px-5">
          <Hero />
        </div>
        
        <ProductShowcase />
        
        {/* Full Product Catalog */}
        <section id="catalog" className="w-full bg-gray-50 dark:bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-5">
            <ProductCatalog />
          </div>
        </section>
        
        <AboutSection />
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image 
                  src="/images/limen-lakay-logo.png" 
                  alt="Limen Lakay Logo" 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">Limen Lakay</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Handcrafted candles that bring light and warmth to your home.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/custom-order" className="block text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
                  Create Your Candle
                </Link>
                <Link href="#products" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Our Collections
                </Link>
                <Link href="#about" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Our Story
                </Link>
                <Link href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Contact Us
                </Link>
                <Link href="/bulk-order" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Bulk Orders
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact</h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>info@limenlakay.com</p>
                <p>+1 561 593 0238</p>
                <p className="text-sm">Within 24 hours response time</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Limen Lakay. All rights reserved. Made with ❤️ and artisan care.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatButton />
    </main>
  );
}
