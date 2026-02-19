import { translations, supportedLanguages } from './translations.js';

const STORAGE_KEY = 'site_lang';
let currentLang = 'en';

function getNested(obj, key) {
  if (!key) return undefined;
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
}

export function t(key, lang = currentLang) {
  // Try selected language
  const langObj = translations[lang] || translations['en'];
  const value = getNested(langObj, key);
  if (value !== undefined) return value;

  // Fallback to English
  const fallback = getNested(translations['en'], key);
  if (fallback !== undefined) {
    console.warn(`Missing translation for "${key}" in "${lang}", falling back to English.`);
    return fallback;
  }

  // If missing everywhere, return key
  console.warn(`Missing translation key: "${key}"`);
  return key;
}

export function setLanguage(lang) {
  if (!supportedLanguages.includes(lang)) {
    console.warn(`Language ${lang} is not supported, falling back to English.`);
    lang = 'en';
  }
  currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  applyTranslations();
}

export function getLanguage() {
  return currentLang;
}

export function initI18n({ defaultLang = 'en' } = {}) {
  // pick saved language from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && supportedLanguages.includes(saved)) {
      currentLang = saved;
    } else {
      // try navigator language
      const nav = (navigator.language || navigator.userLanguage || '').slice(0,2);
      if (nav && supportedLanguages.includes(nav)) currentLang = nav;
      else currentLang = defaultLang;
    }
  } catch (e) {
    currentLang = defaultLang;
  }

  // Apply translations once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTranslations());
  } else {
    applyTranslations();
  }
}

export function applyTranslations() {
  // Find all elements with data-i18n
  const nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;

    // If element requests HTML insertion
    const asHtml = el.hasAttribute('data-i18n-html');

    // Support setting attributes: data-i18n-attr="placeholder, title"
    const attrSpec = el.getAttribute('data-i18n-attr');
    if (attrSpec) {
      const attrs = attrSpec.split(',').map(s => s.trim()).filter(Boolean);
      attrs.forEach((attr) => {
        const val = t(key, currentLang);
        if (val !== undefined) el.setAttribute(attr, val);
      });
      return;
    }

    // If element wants to set different key for attribute, allow data-i18n-attr-key
    const attrKey = el.getAttribute('data-i18n-attr-key');
    if (attrKey) {
      const [attrName, attrTransKey] = attrKey.split(':').map(s=>s.trim());
      if (attrName && attrTransKey) {
        const val = t(attrTransKey, currentLang);
        if (val !== undefined) el.setAttribute(attrName, val);
      }
      return;
    }

    const value = t(key, currentLang);
    if (asHtml) el.innerHTML = value;
    else el.textContent = value;
  });
}

// Easy helper to create a language selector
export function createLangSelector(container, options = {}) {
  const el = document.createElement('select');
  supportedLanguages.forEach((lng) => {
    const opt = document.createElement('option');
    opt.value = lng;
    opt.textContent = lng.toUpperCase();
    el.appendChild(opt);
  });
  el.value = currentLang;
  el.addEventListener('change', (e) => setLanguage(e.target.value));
  container.appendChild(el);
  return el;
}

export { supportedLanguages };

// default export convenience
export default {
  initI18n,
  setLanguage,
  getLanguage,
  t,
  applyTranslations,
  createLangSelector,
  supportedLanguages
};
