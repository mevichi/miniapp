import type { PropsWithChildren } from 'react';
import type { Metadata, Viewport } from 'next';

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';

export const metadata: Metadata = {
  title: 'Coinly - Earn Coins & Win Rewards',
  description: 'Coinly: Complete tasks, spin to win, and withdraw to your TON wallet. Earn coins and diamonds daily!',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* AdsGram SDK for Telegram Mini App ad integration */}
        <script src="https://sad.adsgram.ai/js/sad.min.js" async />
      </head>
      <body>
        <I18nProvider>
          <Root>{children}</Root>
        </I18nProvider>
      </body>
    </html>
  );
}
