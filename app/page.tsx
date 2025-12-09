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
            <Link href="/bulk-order" className="bg-amber-600 text-white px-3 py-1.5 rounded-md hover:bg-amber-700 transition-colors font-medium">
              Bulk Orders
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
                <Link href="#products" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Our Collections
                </Link>
                <Link href="#about" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Our Story
                </Link>
                <Link href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Custom Orders
                </Link>
                <Link href="/bulk-order" className="block text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
                  Bulk Order Form
                </Link>
                <Link href="/payment" className="block text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                  💳 Payment Methods
                </Link>
                <Link href="/privacy-policy" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Connect</h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>info@limenlakay.com</p>
                <p>+1 561 593 0238</p>
                <div className="flex gap-4 mt-4">
                  <a 
                    href="https://www.instagram.com/limenlakay" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    aria-label="Follow us on Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@limenlaky" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    aria-label="Follow us on TikTok"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 Limen Lakay. All rights reserved. Made with ❤️ and artisan care.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatButton />
    </main>
  );
}
