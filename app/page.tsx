import { Hero } from "@/components/hero";
import { ProductShowcase } from "@/components/product-showcase";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              Limen Lakay
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#products" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Products
            </Link>
            <Link href="#about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              About
            </Link>
            <Link href="#contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Contact
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
        <AboutSection />
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-4">Limen Lakay</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Handcrafted candles that bring light and warmth to your home.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="#products" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Our Collections
                </Link>
                <Link href="#about" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Our Story
                </Link>
                <Link href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Custom Orders
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Connect</h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>hello@limenlakay.com</p>
                <p>(555) 123-GLOW</p>
                <p>Follow us for behind-the-scenes</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 Limen Lakay. All rights reserved. Made with ❤️ and artisan care.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
