'use client';

import { useState } from 'react';
import styles from './Navigation.module.css';
import { PageType } from '@/utils/types';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <nav className={styles.navbar}>
      <button
        className={`${styles.navItem} ${currentPage === 'home' ? styles.active : ''}`}
        onClick={() => onNavigate('home')}
        title="Home"
      >
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>Home</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'ads' ? styles.active : ''}`}
        onClick={() => onNavigate('ads')}
        title="Watch Ads"
      >
        <span className={styles.icon}>📺</span>
        <span className={styles.label}>Ads</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'tasks' ? styles.active : ''}`}
        onClick={() => onNavigate('tasks')}
        title="Tasks & Missions"
      >
        <span className={styles.icon}>🎮</span>
        <span className={styles.label}>Tasks</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'wallet' ? styles.active : ''}`}
        onClick={() => onNavigate('wallet')}
        title="Wallet"
      >
        <span className={styles.icon}>💰</span>
        <span className={styles.label}>Wallet</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'referral' ? styles.active : ''}`}
        onClick={() => onNavigate('referral')}
        title="Referral"
      >
        <span className={styles.icon}>🎁</span>
        <span className={styles.label}>Refer</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'profile' ? styles.active : ''}`}
        onClick={() => onNavigate('profile')}
        title="Profile"
      >
        <span className={styles.icon}>👤</span>
        <span className={styles.label}>Profile</span>
      </button>
    </nav>
  );
}
