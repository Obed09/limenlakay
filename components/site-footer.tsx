'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/hooks/useI18n';

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-2">
              <span className="text-base font-bold text-amber-600 dark:text-amber-500">Limen Lakay</span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              Handcrafted candles that bring light, warmth, and beautiful fragrances to your home.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">{t('footer.shop')}</h4>
            <div className="space-y-1.5 text-xs">
              <Link href="/#catalog" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.allCandles')}
              </Link>
              <Link href="/custom-order" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.customCandle')}
              </Link>
              <Link href="/bulk-order" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.bulkOrders')}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">{t('footer.support')}</h4>
            <div className="space-y-1.5 text-xs">
              <Link href="/#contact" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.contactUs')}
              </Link>
              <Link href="/track" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.trackOrder')}
              </Link>
              <Link href="/about" className="block text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.aboutUs')}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">{t('footer.contact')}</h4>
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

          {/* Connect With Us */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider">{t('footer.connectWithUs')}</h4>
            <div className="space-y-2">
              <a 
                href="https://www.instagram.com/limenlakay" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Image 
                  src="/images/instagram icon.png" 
                  alt="Instagram" 
                  width={16} 
                  height={16}
                  className="object-contain"
                />
                <span>Instagram</span>
              </a>
              <a 
                href="https://www.tiktok.com/@limenlakay" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Image 
                  src="/images/TikTok icon .png" 
                  alt="TikTok" 
                  width={16} 
                  height={16}
                  className="object-contain"
                />
                <span>TikTok</span>
              </a>
              <a 
                href="https://www.facebook.com/limenlakay" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <Image 
                  src="/images/facebook icon .png" 
                  alt="Facebook" 
                  width={16} 
                  height={16}
                  className="object-contain"
                />
                <span>Facebook</span>
              </a>
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
              <Link href="/privacy-policy" className="hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-400">
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
