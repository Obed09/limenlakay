'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { translations, supportedLanguages } from '@/public/js/translations';

type TFunction = (key: string, params?: Record<string, any>) => string;
type Locale = 'en' | 'fr' | 'es' | 'ht';

export function useI18n() {
  const params = useParams();
  const router = useRouter();

  // Extract locale from URL params or default to 'en'
  const locale = useMemo(() => {
    const localeParam = params?.locale as string;
    return (supportedLanguages.includes(localeParam) ? localeParam : 'en') as Locale;
  }, [params?.locale]);

  // Translation function with fallback and interpolation
  const t: TFunction = useCallback(
    (key: string, interpParams?: Record<string, any>) => {
      let value = getNested(translations[locale] || translations['en'], key);

      // Fallback to English if not found
      if (value === undefined) {
        value = getNested(translations['en'], key);
        if (value === undefined) {
          console.warn(`Missing translation key: "${key}"`);
          return key;
        }
      }

      // Simple interpolation: {{key}} -> value
      if (interpParams && typeof value === 'string') {
        Object.entries(interpParams).forEach(([k, v]) => {
          value = (value as string).replace(`{{${k}}}`, String(v));
        });
      }

      return value || key;
    },
    [locale]
  );

  // Change language and navigate to new locale URL
  const setLocale = useCallback(
    (newLocale: string) => {
      if (!supportedLanguages.includes(newLocale)) return;
      const currentPath = window.location.pathname;
      const pathWithoutLocale = currentPath.replace(/^\/(en|fr|es|ht)/, '') || '/';
      router.push(`/${newLocale}${pathWithoutLocale}`);
    },
    [router]
  );

  return {
    t,
    locale,
    setLocale,
    supportedLanguages: supportedLanguages as Locale[],
  };
}

// Helper: Get nested object value by dot notation
function getNested(obj: any, key: string): string | undefined {
  if (!key) return undefined;
  return key.split('.').reduce((acc, part) => 
    (acc && acc[part] !== undefined) ? acc[part] : undefined, obj
  );
}
