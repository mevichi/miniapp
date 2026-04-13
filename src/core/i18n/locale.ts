'use client';

import { defaultLocale } from './config';
import type { Locale } from './types';

const COOKIE_NAME = 'NEXT_LOCALE';
const STORAGE_KEY = 'coinly_locale';

/**
 * Get the current locale from localStorage (client-side only).
 * Falls back to browser language or default.
 */
export const getLocale = (): Locale => {
  if (typeof window === 'undefined') return defaultLocale as Locale;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored as Locale;

    // Try to match browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'ru') return 'ru';
  } catch {
    // Ignore storage errors
  }

  return defaultLocale as Locale;
};

/**
 * Set the current locale in localStorage (client-side only).
 */
export const setLocale = (locale?: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const resolved = (locale || defaultLocale) as Locale;
    localStorage.setItem(STORAGE_KEY, resolved);
    // Also set cookie for any server middleware that might read it
    document.cookie = `${COOKIE_NAME}=${resolved};path=/;max-age=31536000`;
  } catch {
    // Ignore storage errors
  }
};
