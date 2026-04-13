'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import { defaultLocale, locales, timeZone } from './config';
import { getLocale, setLocale } from './locale';
import { getMessages } from './messages';
import type { Locale } from './types';

interface I18nContextValue {
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale as Locale,
  changeLocale: () => {},
  isLoading: true,
});

export const useI18n = () => useContext(I18nContext);

const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [locale, setLocalLocale] = useState<Locale>(defaultLocale as Locale);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load locale and messages on mount
    const savedLocale = getLocale();
    getMessages(savedLocale).then((msgs) => {
      setLocalLocale(savedLocale);
      setMessages(msgs);
      setIsLoading(false);
    });
  }, []);

  const changeLocale = useCallback(async (newLocale: Locale) => {
    const effectiveLocale = locales.includes(newLocale) ? newLocale : (defaultLocale as Locale);
    const msgs = await getMessages(effectiveLocale);
    setLocalLocale(effectiveLocale);
    setMessages(msgs);
    setLocale(effectiveLocale);
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={{ locale, changeLocale, isLoading }}>
      <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
};

export { I18nProvider };
