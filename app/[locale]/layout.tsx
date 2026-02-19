'use client';

import { ReactNode } from 'react';
import { useI18n } from '@/hooks/useI18n';

interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // Validate and set locale context
  const { locale } = useI18n();

  // Ensure HTML lang attribute is set
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
