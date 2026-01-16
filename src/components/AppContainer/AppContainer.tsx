'use client';

import { useState, useEffect } from 'react';
import { useSignal, useRawInitData } from '@tma.js/sdk-react';
import { initData } from '@tma.js/sdk-react';
import { useApp } from '@/context/AppContext';
import { Navigation } from '@/components/Navigation/Navigation';
import { HomePage } from '@/components/HomePage/HomePage';
import { TasksPage } from '@/components/TasksPage/TasksPage';
import { WheelPage } from '@/components/WheelPage/WheelPage';
import { WalletPage } from '@/components/WalletPage/WalletPage';
import { ProfilePage } from '@/components/ProfilePage/ProfilePage';
import styles from './AppContainer.module.css';
import { PageType } from '@/utils/types';


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
        if (initDataRaw && !token) {
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

    if (initDataRaw) {
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
      case 'tasks':
        return <TasksPage />;
      case 'wheel':
        return <WheelPage />;
      case 'wallet':
        return <WalletPage />;
      case 'profile':
        return <ProfilePage />;
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
