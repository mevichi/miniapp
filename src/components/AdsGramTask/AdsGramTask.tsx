'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * AdsGram block ID - replace with real blockId from https://partner.adsgram.ai
 * Format must be 'task-XXX' where XXX is a number.
 * In production, set NEXT_PUBLIC_ADSGRAM_BLOCK_ID in your .env
 */
const ADSGRAM_BLOCK_ID = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID || '';

interface AdsGramTaskProps {
  blockId?: string;
  reward: string;
  onReward: (blockId: string) => void;
  onError?: (error: string) => void;
  onBannerNotFound?: () => void;
  debug?: boolean;
  className?: string;
}

/**
 * AdsGramTask - Integrates AdsGram's <adsgram-task> web component
 * for showing rewarded ads in Telegram Mini Apps.
 *
 * Uses createElement to avoid JSX type issues with custom elements.
 */
export function AdsGramTask({
  blockId,
  reward,
  onReward,
  onError,
  onBannerNotFound,
  debug = false,
  className,
}: AdsGramTaskProps) {
  const taskRef = useRef<HTMLElement>(null);
  const effectiveBlockId = blockId || ADSGRAM_BLOCK_ID;

  const handleReward = useCallback(
    (event: Event) => {
      const detail = (event as CustomEvent).detail;
      onReward(detail);
    },
    [onReward]
  );

  const handleError = useCallback(
    (event: Event) => {
      const detail = (event as CustomEvent).detail;
      onError?.(detail);
    },
    [onError]
  );

  const handleBannerNotFound = useCallback(() => {
    onBannerNotFound?.();
  }, [onBannerNotFound]);

  useEffect(() => {
    const task = taskRef.current;
    if (!task) return;

    task.addEventListener('reward', handleReward);
    task.addEventListener('onError', handleError);
    task.addEventListener('onBannerNotFound', handleBannerNotFound);

    return () => {
      task.removeEventListener('reward', handleReward);
      task.removeEventListener('onError', handleError);
      task.removeEventListener('onBannerNotFound', handleBannerNotFound);
    };
  }, [handleReward, handleError, handleBannerNotFound]);

  // Don't render if no blockId configured
  if (!effectiveBlockId) {
    return null;
  }

  // Don't render if web component not loaded yet
  if (typeof window !== 'undefined' && !customElements.get('adsgram-task')) {
    return null;
  }

  // Use createElement to bypass JSX type checking for custom web component
  return (
    <div
      ref={(el) => {
        if (el) {
          // Find or create the adsgram-task element
          let adEl = el.querySelector('adsgram-task') as HTMLElement | null;
          if (!adEl) {
            adEl = document.createElement('adsgram-task');
            adEl.setAttribute('data-block-id', effectiveBlockId);
            if (debug) adEl.setAttribute('data-debug', 'true');
            if (className) adEl.className = className;

            // Add slot children
            const rewardSpan = document.createElement('span');
            rewardSpan.slot = 'reward';
            rewardSpan.textContent = reward;
            adEl.appendChild(rewardSpan);

            const buttonDiv = document.createElement('div');
            buttonDiv.slot = 'button';
            buttonDiv.textContent = 'Watch';
            adEl.appendChild(buttonDiv);

            const claimDiv = document.createElement('div');
            claimDiv.slot = 'claim';
            claimDiv.textContent = 'Claim';
            adEl.appendChild(claimDiv);

            const doneDiv = document.createElement('div');
            doneDiv.slot = 'done';
            doneDiv.textContent = '✓';
            adEl.appendChild(doneDiv);

            el.appendChild(adEl);
            taskRef.current = adEl;
          }
        }
      }}
    />
  );
}

/**
 * Check if AdsGram is available (SDK loaded + blockId configured)
 */
export function isAdsGramAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!ADSGRAM_BLOCK_ID && !!customElements.get('adsgram-task');
}
