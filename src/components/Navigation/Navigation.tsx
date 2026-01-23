'use client';

import { useState } from 'react';
import styles from './Navigation.module.css';

interface NavigationProps {
  currentPage: 'home' | 'tasks' | 'wheel' | 'treasury' | 'wallet' | 'profile';
  onNavigate: (page: 'home' | 'tasks' | 'wheel' | 'treasury' | 'wallet' | 'profile') => void;
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
        className={`${styles.navItem} ${currentPage === 'tasks' ? styles.active : ''}`}
        onClick={() => onNavigate('tasks')}
        title="Tasks"
      >
        <span className={styles.icon}>✓</span>
        <span className={styles.label}>Tasks</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'wheel' ? styles.active : ''}`}
        onClick={() => onNavigate('wheel')}
        title="Spin Wheel"
      >
        <span className={styles.icon}>🎡</span>
        <span className={styles.label}>Wheel</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'treasury' ? styles.active : ''}`}
        onClick={() => onNavigate('treasury')}
        title="Treasury"
      >
        <span className={styles.icon}>🏺</span>
        <span className={styles.label}>Treasury</span>
      </button>

      <button
        className={`${styles.navItem} ${currentPage === 'wallet' ? styles.active : ''}`}
        onClick={() => onNavigate('wallet')}
        title="Wallet"
      >
        <span className={styles.icon}>💳</span>
        <span className={styles.label}>Wallet</span>
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
