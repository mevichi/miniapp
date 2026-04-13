'use client';

import { Select } from '@telegram-apps/telegram-ui';
import { FC } from 'react';

import { localesMap } from '@/core/i18n/config';
import { useI18n } from '@/core/i18n/provider';
import { Locale } from '@/core/i18n/types';

export const LocaleSwitcher: FC = () => {
  const { locale, changeLocale } = useI18n();

  const onChange = (value: string) => {
    changeLocale(value as Locale);
  };

  return (
    <Select value={locale} onChange={({ target }) => onChange(target.value)}>
      {localesMap.map((l) => (
        <option key={l.key} value={l.key}>{l.title}</option>
      ))}
    </Select>
  );
};
