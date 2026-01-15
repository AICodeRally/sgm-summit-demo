'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PulseCard } from './PulseCard';
import { getPulseFeed } from '@/lib/pulse/pulse-service';
import type { PulseCard as PulseCardType } from '@/lib/pulse/pulse-service';
import { ArrowRightIcon, ReloadIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { getToneStyles } from '@/lib/config/themes';

interface PulseWidgetProps {
  maxCards?: number;
  tone?: 'primary' | 'secondary' | 'accent' | 'infra';
}

export function PulseWidget({ maxCards = 3, tone = 'accent' }: PulseWidgetProps) {
  const [cards, setCards] = useState<PulseCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const toneStyles = getToneStyles(tone);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPulseFeed({ limit: maxCards });

      // totalCount of -1 indicates service unavailable
      if (response.totalCount === -1) {
        const newCount = failureCount + 1;
        setFailureCount(newCount);
        if (newCount >= 2) {
          setIsOffline(true);
        }
        setCards([]);
      } else {
        // Success - reset failure tracking
        setFailureCount(0);
        setIsOffline(false);
        setCards(response.cards.slice(0, maxCards));
      }
    } catch {
      const newCount = failureCount + 1;
      setFailureCount(newCount);
      if (newCount >= 2) {
        setIsOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [maxCards, failureCount]);

  useEffect(() => {
    loadFeed();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadFeed, 60000);
    return () => clearInterval(interval);
  }, [maxCards]);

  const handleCardAction = () => {
    loadFeed();
  };

  return (
    <div
      className="bg-[color:var(--color-surface)] rounded-lg border p-4 theme-card"
      style={{ border: toneStyles.border, boxShadow: toneStyles.shadow }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Pulse Insights
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-[color:var(--color-foreground)] border" style={{ borderColor: toneStyles.hover }}>
            Accent
          </span>
        </div>
        <Link
          href={"/pulse" as any}
          className="flex items-center gap-1 text-sm text-[color:var(--color-info)] hover:text-[color:var(--color-info)] font-medium"
        >
          View All
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {isOffline ? (
        <div className="text-center py-6">
          <CrossCircledIcon className="w-8 h-8 mx-auto mb-2 text-[color:var(--color-muted)] opacity-50" />
          <p className="text-sm text-[color:var(--color-muted)]">Service Offline</p>
          <button
            onClick={() => { setFailureCount(0); setIsOffline(false); loadFeed(); }}
            className="mt-2 text-xs text-[color:var(--color-info)] hover:underline"
          >
            Retry connection
          </button>
        </div>
      ) : isLoading && cards.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-[color:var(--color-muted)]">
            <ReloadIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[color:var(--color-muted)]">No insights at the moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <PulseCard key={card.id} card={card} onAction={handleCardAction} />
          ))}
        </div>
      )}
    </div>
  );
}
