'use client';

import { AppProvider } from '@/context/AppContext';
import { AppContainer } from '@/components/AppContainer/AppContainer';

export default function Home() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}
