'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import viData from '@/locales/vi.json';
import enData from '@/locales/en.json';
import { ROUTE_TITLES } from '@/hooks/usePageTitle';

export type Locale = 'vi' | 'en';

const LOCALES: Record<Locale, Record<string, any>> = {
  vi: viData,
  en: enData,
};

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'vi',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tingroster_locale') as Locale;
      if (saved === 'vi' || saved === 'en') {
        setLocaleState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('tingroster_locale', newLocale);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale;

        // Instantly sync title for current route
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          if (ROUTE_TITLES[path]) {
            document.title = `${ROUTE_TITLES[path][newLocale]} • TingRoster`;
          } else {
            const match = Object.keys(ROUTE_TITLES).find(
              (key) => key !== '/' && path.startsWith(key)
            );
            if (match) {
              document.title = `${ROUTE_TITLES[match][newLocale]} • TingRoster`;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'vi' ? 'en' : 'vi');
  };

  const t = (key: string, fallback?: string): string => {
    const dict = LOCALES[locale];
    const val = getNestedValue(dict, key);
    if (val !== undefined) {
      return val;
    }

    // Fallback to opposite language
    const altDict = LOCALES[locale === 'vi' ? 'en' : 'vi'];
    const altVal = getNestedValue(altDict, key);
    if (altVal !== undefined) {
      return altVal;
    }

    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
