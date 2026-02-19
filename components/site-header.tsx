"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { Globe } from "lucide-react";

export function SiteHeader() {
  const { locale, setLocale, supportedLanguages } = useI18n();

  const languageLabels: Record<string, string> = {
    en: "English",
    fr: "Français",
    es: "Español",
    ht: "Kreyòl Ayisyen"
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/images/limen-lakay-logo.png"
              alt="Limen Lakay"
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="text-xl font-bold text-orange-600">
              Limen Lakay
            </span>
          </Link>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-orange-500 dark:hover:border-orange-500 transition-colors cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {languageLabels[lang] || lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
