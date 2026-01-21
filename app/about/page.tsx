import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About Us | Limen Lakay - Handcrafted Concrete Candles",
  description: "Discover the art and story behind Limen Lakay. Handcrafted candles that bring light, warmth, and beauty to your living space.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-900 dark:via-amber-950/20 dark:to-gray-900">
      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Button asChild variant="outline" className="font-semibold text-base hover:bg-amber-50 dark:hover:bg-amber-950">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            The Art of <span className="text-amber-600 dark:text-amber-500">Limen Lakay</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Limen Lakay means <span className="font-semibold text-amber-700 dark:text-amber-400">Light The home</span> in Haitian Creole, 
            and that is exactly what we create - candles that bring warmth, comfort, and beauty to your living space.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Our Story</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Limen Lakay was born from my own journey through darkness — mentally, emotionally, and physically. 
                When life felt heavy, I turned to prayer, faith, and the smallest source of hope… light.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Growing up in Haiti, candles were part of everyday survival. When the power went out, 
                that humble flame helped me study, dream, and believe there was more waiting for me. 
                It lit the path toward the future I couldn&apos;t yet see.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Today, Limen Lakay carries that same spirit of resilience. Each candle is crafted as a reminder that 
                your light matters — even when shadows fall. It represents identity, love, endurance, 
                and the strength to rise again and again.
              </p>
              <p className="text-lg font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                Every flame tells a story: Of home. Of culture. Of finding yourself after being lost.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                Welcome to Limen Lakay — where light becomes legacy, and every burn guides you back home.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-8 rounded-2xl shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-600 dark:bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Handcrafted</h3>
                      <p className="text-gray-700 dark:text-gray-300">Every detail matters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Natural</h3>
                      <p className="text-gray-700 dark:text-gray-300">Premium ingredients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Unique</h3>
                      <p className="text-gray-700 dark:text-gray-300">One-of-a-kind vessels</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Special */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">What Makes Us Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Handcrafted Quality */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-amber-600 dark:bg-amber-700 rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Handcrafted Quality</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Each candle is individually hand-poured and finished with attention to every detail. 
                No two candles are exactly alike, making each one truly special.
              </p>
            </div>

            {/* Natural Materials */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Natural Materials</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use only premium soy wax with cotton and hemp wicks for clean burning. 
                Natural, sustainable, and better for your home.
              </p>
            </div>

            {/* Unique Vessels */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-purple-600 dark:bg-purple-700 rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Unique Vessels</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                From concrete to reclaimed wood to studio ceramics, every vessel is chosen or crafted for character. 
                Each container has its own story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Process</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">From concept to creation, every step is done with care</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-6 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select or craft the perfect vessel</h3>
                <p className="text-gray-600 dark:text-gray-400">We carefully choose or handcraft each container, ensuring it has the character and quality to become part of your home.</p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Blend premium wax with signature scents</h3>
                <p className="text-gray-600 dark:text-gray-400">Our proprietary soy wax formula is blended with carefully selected fragrances inspired by Haitian culture and nature.</p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Hand-pour and center the wick</h3>
                <p className="text-gray-600 dark:text-gray-400">Each candle is poured by hand at the perfect temperature and the wick is carefully centered for optimal burning.</p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold shadow-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cure and finish each candle by hand</h3>
                <p className="text-gray-600 dark:text-gray-400">After proper curing, each candle is trimmed, cleaned, and inspected to ensure it meets our high standards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-900 dark:to-orange-900">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="w-16 h-16 text-white/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-2xl lg:text-3xl font-medium text-white mb-4">
            Every candle we create carries the intention of bringing light and warmth to your home.
          </p>
          <p className="text-lg text-white/90">— Limen Lakay Team</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Ready to bring Limen Lakay into your home?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/#products" 
              className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Shop Our Collection
            </a>
            <a 
              href="/workshop-subscription" 
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-amber-600 dark:text-amber-400 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-amber-600 dark:border-amber-400"
            >
              Join a Workshop
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
