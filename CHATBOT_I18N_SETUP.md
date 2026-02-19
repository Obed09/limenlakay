# Chatbot Multilingual Configuration

## Overview

Your chatbot should automatically detect and switch languages based on the user's locale.

---

## Implementation Options

### Option 1: Auto-Detect from URL Locale (Recommended)

In your chat widget component:

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function ChatWidget() {
  const { locale } = useI18n();

  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.chatConfig = {
              agentId: "your_agent_id",
              language: "${locale}",
              supportedLanguages: ["en", "fr", "es", "ht"],
              theme: "light"
            };
          `,
        }}
      />
      {/* Your chat widget embed code */}
    </div>
  );
}
```

### Option 2: Manual Language Selector in Chat

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function ChatWidget() {
  const { locale, setLocale } = useI18n();

  const handleLanguageChange = (newLang: string) => {
    setLocale(newLang);
    // Notify chat widget to switch language
    window.postMessage({
      type: 'CHAT_LANGUAGE_CHANGE',
      language: newLang
    }, '*');
  };

  return (
    <div>
      <select 
        value={locale} 
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
        <option value="ht">Kreyòl Ayisyen</option>
      </select>
      
      {/* Chat widget */}
    </div>
  );
}
```

---

## AI Agent Configuration

### Supported Languages for Agent

Request these language configurations from your AI provider:

1. **English (en)** - Default
   - Instruction set: Standard US English
   - Tone: Professional, helpful

2. **French (fr)**
   - Instruction set: Standard French
   - Tone: Professional, helpful
   - Note: Handle Quebecois variations

3. **Spanish (es)**
   - Instruction set: Standard Spanish
   - Tone: Professional, helpful
   - Note: Support Latin American Spanish

4. **Haitian Creole (ht)**
   - Instruction set: Haitian Creole
   - Tone: Warm, welcoming
   - Note: Important for community connection

---

## Implementation in Floating Chat Button

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';
import { FloatingChatButton } from '@/components/floating-chat-button';

export function LocalizedChatButton() {
  const { locale } = useI18n();

  return (
    <FloatingChatButton
      agentId="your-agent-id"
      language={locale}
      supportInitialLanguage={locale}
      onLanguageChange={(newLang) => {
        // Handle language change if needed
        console.log(`Chat language changed to: ${newLang}`);
      }}
    />
  );
}
```

---

## Testing the Chatbot

1. **English**: Navigate to `/en/` → Start chat → Should respond in English
2. **French**: Navigate to `/fr/` → Start chat → Should respond in French
3. **Spanish**: Navigate to `/es/` → Start chat → Should respond in Spanish
4. **Haitian**: Navigate to `/ht/` → Start chat → Should respond in Haitian Creole

---

## Fallback Behavior

If the AI agent doesn't support a language:
- Fall back to English
- Log warning: `Chat language ${locale} not fully supported, using English`
- Notify user (optional toast notification)

```tsx
const getChatLanguage = (requestedLang: string) => {
  const supported = ['en', 'fr', 'es', 'ht'];
  if (!supported.includes(requestedLang)) {
    console.warn(`Language ${requestedLang} not supported for chat, falling back to English`);
    return 'en';
  }
  return requestedLang;
};
```

---

## Example: Complete Chat Component

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';
import { FloatingChatButton } from '@/components/floating-chat-button';

export function MultilingualChat() {
  const { locale, t } = useI18n();

  return (
    <>
      <FloatingChatButton
        agentId="your-agent-id"
        language={locale}
        title={t('common.selectLanguage')}
        placeholder={t('footer.contact')}
      />
    </>
  );
}
```

---

## Next Steps

1. Update your chat widget component to use `useI18n()`
2. Configure your AI agent for all 4 languages
3. Test chat responses in each language
4. Deploy and verify on production

---

Need help with your specific chat widget implementation? Let me know the platform/service you're using! 🤖
