'use client';

import { defaultLocale, locales } from './config';
import type { Locale } from './types';

// Cache loaded messages
const messagesCache: Record<string, Record<string, string>> = {};

/**
 * Load messages for the given locale (client-side only).
 */
export const getMessages = async (locale?: Locale): Promise<Record<string, string>> => {
  const resolvedLocale = (locale || defaultLocale) as Locale;
  const effectiveLocale = locales.includes(resolvedLocale) ? resolvedLocale : defaultLocale;

  if (messagesCache[effectiveLocale]) {
    return messagesCache[effectiveLocale];
  }

  try {
    const response = await fetch(`/locales/${effectiveLocale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale ${effectiveLocale}`);
    }
    const messages = await response.json();
    messagesCache[effectiveLocale] = messages;
    return messages;
  } catch (error) {
    console.error('Failed to load messages:', error);
    // Fallback to English
    if (effectiveLocale !== defaultLocale && messagesCache[defaultLocale]) {
      return messagesCache[defaultLocale];
    }
    try {
      const response = await fetch(`/locales/${defaultLocale}.json`);
      const messages = await response.json();
      messagesCache[defaultLocale] = messages;
      return messages;
    } catch {
      return {};
    }
  }
};
