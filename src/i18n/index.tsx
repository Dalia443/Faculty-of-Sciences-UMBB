import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Localized } from '../types';
import fr, { type Dictionary } from './fr';
import en from './en';

const dictionaries: Record<Lang, Dictionary> = { fr, en };
const STORAGE_KEY = 'umbb.lang';

type Paths<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];

export type TranslationKey = Paths<Dictionary>;

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Picks the current language from a { fr, en } object. */
  l: (value: Localized) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return 'fr'; // French is the default language.
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((c) => (c === 'fr' ? 'en' : 'fr')), []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaries[lang];
    const t: I18nValue['t'] = (key, vars) => {
      const found = key
        .split('.')
        .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict);
      let text = typeof found === 'string' ? found : key;
      if (vars) {
        for (const [name, v] of Object.entries(vars)) text = text.split(`{${name}}`).join(String(v));
      }
      return text;
    };
    return { lang, setLang, toggleLang, t, l: (v) => v[lang] };
  }, [lang, setLang, toggleLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
