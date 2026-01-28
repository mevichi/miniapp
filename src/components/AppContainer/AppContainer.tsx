'use client';

import { useState, useEffect } from 'react';
import { useSignal, useRawInitData } from '@tma.js/sdk-react';
import { initData } from '@tma.js/sdk-react';
import { useApp } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation/Navigation';
import { HomePage } from '@/components/HomePage/HomePage';
import { AdsPage } from '@/components/AdsPage/AdsPage';
import { TasksPage } from '@/components/TasksPage/TasksPage';
import { WalletPage } from '@/components/WalletPage/WalletPage';
import { ProfilePage } from '@/components/ProfilePage/ProfilePage';
import { WheelPage } from '@/components/WheelPage/WheelPage';
import { TreasuryBoxPage } from '@/components/TreasuryPage/TreasuryBoxPage';
import styles from './AppContainer.module.css';
import { PageType } from '@/utils/types';
import { isDev, createMockInitData, MOCK_DEV_USER, logDevMode } from '@/utils/devMode';

export function AppContainer() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoading, setIsLoading] = useState(true);
  const initDataRaw = useRawInitData();
  const initDataState = useSignal(initData.state);
  const { user, token, login } = useApp();

  // Initialize user on app load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Dev mode: auto-login with mock data
        if (isDev() && !token) {
          logDevMode();
          const mockInitData = createMockInitData();
          await login(mockInitData, MOCK_DEV_USER.id, MOCK_DEV_USER.username);
        } 
        // Production mode: use Telegram init data
        else if (initDataRaw && !token) {
          const user = initDataState?.user;
          if (user) {
            await login(initDataRaw, user.id, user.username);
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize in dev mode or when initDataRaw is available
    if (isDev() || initDataRaw) {
      initializeUser();
    }
  }, [initDataRaw, initDataState, token, login]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'ads':
        return <AdsPage onNavigate={handleNavigate} />;
      case 'tasks':
        return <TasksPage onNavigate={handleNavigate} />;
      case 'wallet':
        return <WalletPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'wheel':
        return <WheelPage onNavigate={handleNavigate} />;
      case 'treasury':
        return <TreasuryBoxPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={styles.appContainer}>
      <main className={styles.pageContainer}>
        {renderPage()}
      </main>
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

