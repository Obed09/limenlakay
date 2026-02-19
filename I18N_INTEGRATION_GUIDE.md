# Multilingual i18n Integration Guide

## 🌍 Architecture Overview

Your site now supports 4 languages with URL-based locale routing:
- `/en/*` - English (default)
- `/fr/*` - French
- `/es/*` - Spanish
- `/ht/*` - Haitian Creole

### Key Files

```
public/js/
  ├── translations.js      ← All translation strings (nested JSON)
  └── i18n.js             ← Client-side i18n runtime (for static pages)

hooks/
  └── useI18n.ts          ← React hook for Next.js components

middleware.ts            ← Locale routing middleware (redirects to /en, /fr, etc.)

app/
  └── [locale]/           ← Locale-aware routing folder
      ├── layout.tsx      ← Shared layout with language selector
      ├── page.tsx        ← Home page (localized)
      ├── custom-order/
      │   └── page.tsx    ← Custom order page (localized)
      └── checkout/
          └── page.tsx    ← Checkout page (localized)
```

---

## 📝 How to Use

### 1. **In React/Next.js Components**

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export default function HomePage() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <button onClick={() => setLocale('fr')}>
        {t('common.selectLanguage')}
      </button>
    </div>
  );
}
```

### 2. **With Parameter Interpolation**

```tsx
const message = t('checkout.affirmPrompt', { amount: '$56.01' });
// Output: "Add $56.01 more for payment plan options"
```

### 3. **In Static HTML** (for `/public/i18n-example.html`)

```html
<script type="module">
  import i18n from '/js/i18n.js';
  i18n.initI18n({ defaultLang: 'en' });
</script>

<h1 data-i18n="home.title"></h1>
<button data-i18n="button.buy" onclick="setLanguage('fr')"></button>
```

---

## 🔄 URL Routing Examples

| Page | English | French | Spanish | Haitian |
|------|---------|--------|---------|---------|
| Home | `/en/` | `/fr/` | `/es/` | `/ht/` |
| Custom Order | `/en/custom-order` | `/fr/custom-order` | `/es/custom-order` | `/ht/custom-order` |
| Checkout | `/en/checkout` | `/fr/checkout` | `/es/checkout` | `/ht/checkout` |

**Admin pages stay English-only:**
- `/admin/*` (no locale prefix)
- `/api/*`
- `/auth/*`
- `/inventory-dashboard`

---

## 🛠️ Integration Steps for Your Pages

### Step 1: Move Page to Locale Folder

**Current:**
```
app/
  └── page.tsx             (home page)
```

**New Structure:**
```
app/
  └── [locale]/
      └── page.tsx         (home page, now localized)
```

### Step 2: Add `useI18n()` Hook

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';
import { KringleHeader } from '@/components/kringle-header';
// ... other imports

export default function Home() {
  const { t } = useI18n();

  return (
    <main>
      <KringleHeader />
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      {/* Rest of your page */}
    </main>
  );
}
```

### Step 3: Replace Static Strings with `t()` Calls

**Before:**
```tsx
<h1>Create Your Custom Candle</h1>
<p>Choose your vessel, pick your scent...</p>
<button>Proceed to Checkout</button>
```

**After:**
```tsx
<h1>{t('home.title')}</h1>
<p>{t('home.subtitle')}</p>
<button>{t('button.proceed')}</button>
```

---

## 💬 Component Updates Needed

### For `site-header.tsx` (Add Language Dropdown)

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function SiteHeader() {
  const { locale, setLocale, supportedLanguages } = useI18n();

  return (
    <header>
      {/* ... existing header content ... */}
      
      {/* Language Selector */}
      <select 
        value={locale} 
        onChange={(e) => setLocale(e.target.value)}
        className="px-3 py-2 rounded border"
      >
        {supportedLanguages.map(lang => (
          <option key={lang} value={lang}>
            {getLanguageName(lang)}
          </option>
        ))}
      </select>
    </header>
  );
}

function getLanguageName(code: string) {
  const names: Record<string, string> = {
    en: '🇺🇸 English',
    fr: '🇫🇷 Français',
    es: '🇪🇸 Español',
    ht: '🇭🇹 Kreyòl',
  };
  return names[code] || code;
}
```

### For `site-footer.tsx`

```tsx
import { useI18n } from '@/hooks/useI18n';

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer>
      <div>
        <h4>{t('footer.contact')}</h4>
        <Link href="/">{t('footer.allCandles')}</Link>
        <Link href="/custom-order">{t('footer.customCandle')}</Link>
      </div>
    </footer>
  );
}
```

---

## 📋 Pages to Move to `[locale]` Folder

1. ✅ `app/page.tsx` → `app/[locale]/page.tsx` (Home)
2. ✅ `app/custom-order/page.tsx` → `app/[locale]/custom-order/page.tsx`
3. ✅ `app/checkout/page.tsx` → `app/[locale]/checkout/page.tsx`
4. ⭕ `app/about/page.tsx` → `app/[locale]/about/page.tsx` (Optional)
5. ⭕ `app/privacy-policy/page.tsx` → `app/[locale]/privacy-policy/page.tsx` (Optional)

**Leave these in original location (no locale prefix):**
- All `/admin*` pages
- All `/api` routes
- Auth pages `/auth/*`

---

## 🤖 Chatbot Language Support

Update your chat widget to detect language from locale:

```tsx
// In components/chat-widget.tsx or floating-chat-button.tsx

const getChatbotConfig = (locale: string) => {
  return {
    language: locale,
    supportedLanguages: ['en', 'fr', 'es', 'ht'],
    autoDetectLanguage: false, // Use param instead
    defaultLanguage: locale,
  };
};

// Usage in component:
const { locale } = useI18n();
const chatConfig = getChatbotConfig(locale);
```

---

## 📝 Adding New Translations

1. Open `public/js/translations.js`
2. Add key to all 4 language objects:

```javascript
{
  en: { mySection: { myKey: "English text" } },
  fr: { mySection: { myKey: "Texte français" } },
  es: { mySection: { myKey: "Texto español" } },
  ht: { mySection: { myKey: "Tèks kreyòl" } },
}
```

3. Use in component: `t('mySection.myKey')`

---

## 🧪 Testing Locally

1. Start your dev server: `npm run dev`
2. Navigate to:
   - `http://localhost:3000/en/` (English)
   - `http://localhost:3000/fr/` (French)
   - `http://localhost:3000/es/` (Spanish)
   - `http://localhost:3000/ht/` (Haitian)
3. Admin pages: `http://localhost:3000/admin` (no locale prefix)

---

## 🚀 Deployment Notes

- **Middleware runs on Vercel** - auto-redirects non-prefixed routes
- **Locale stored in URL** - SEO-friendly, no cookies needed
- **Fallback to English** - if translation missing
- **Admin routes protected** - no locale prefix applied

---

## ⚠️ Important Gotchas

1. **`useI18n()` only in client components** - mark with `'use client'`
2. **Move files to `[locale]` folder** - old paths won't have locale option
3. **Links need locale-aware paths** - use `/${locale}/custom-order` or relative paths
4. **Navigation components also need `useI18n()`** - update `site-header` and `site-footer`

---

## 💡 Quick Checklist

- [ ] Moved `/page.tsx` to `/[locale]/page.tsx`
- [ ] Moved `/custom-order/page.tsx` to `/[locale]/custom-order/page.tsx`
- [ ] Moved `/checkout/page.tsx` to `/[locale]/checkout/page.tsx`
- [ ] Updated `site-header.tsx` with language selector
- [ ] Updated `site-footer.tsx` with `useI18n()`
- [ ] Added `'use client'` to all localized components
- [ ] Tested all 4 languages locally
- [ ] Chatbot configured for language switching
- [ ] Deployed to Vercel and tested URLs

---

Let me know if you need help with any specific integration! 🌍
