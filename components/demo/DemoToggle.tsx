'use client';

import { useState } from 'react';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';

export type DemoFilter = 'all' | 'demo-only' | 'real-only';

interface DemoToggleProps {
  /** Current filter value */
  value: DemoFilter;
  /** Callback when filter changes */
  onChange: (value: DemoFilter) => void;
  /** Show counts for each option */
  counts?: {
    total: number;
    demo: number;
    real: number;
  };
  /** Compact mode (icon + text) or full mode (buttons) */
  mode?: 'compact' | 'full';
}

/**
 * DemoToggle - Control for filtering demo vs real data
 *
 * Features:
 * - Toggle between "All", "Demo Only", "Real Only"
 * - Shows counts for each category
 * - Compact mode (dropdown) or full mode (button group)
 * - Visual indicators with icons
 *
 * Usage:
 * const [demoFilter, setDemoFilter] = useState<DemoFilter>('all');
 * <DemoToggle value={demoFilter} onChange={setDemoFilter} counts={{total: 48, demo: 35, real: 13}} />
 */
export function DemoToggle({ value, onChange, counts, mode = 'compact' }: DemoToggleProps) {
  if (mode === 'full') {
    return (
      <div className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
        <button
          onClick={() => onChange('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            value === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <EyeOpenIcon className="w-3.5 h-3.5" />
            All
            {counts && <span className="ml-1 text-[10px]">({counts.total})</span>}
          </span>
        </button>
        <button
          onClick={() => onChange('demo-only')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            value === 'demo-only'
              ? 'bg-orange-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Demo Only
            {counts && <span className="ml-1 text-[10px]">({counts.demo})</span>}
          </span>
        </button>
        <button
          onClick={() => onChange('real-only')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            value === 'real-only'
              ? 'bg-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Real Only
            {counts && <span className="ml-1 text-[10px]">({counts.real})</span>}
          </span>
        </button>
      </div>
    );
  }

  // Compact mode - dropdown
  return (
    <div className="inline-flex items-center gap-2">
      <label htmlFor="demo-filter" className="text-xs font-medium text-gray-700">
        Show:
      </label>
      <select
        id="demo-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as DemoFilter)}
        className="text-xs border border-gray-300 rounded-md px-2 py-1.5 pr-8 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">
          All Items {counts ? `(${counts.total})` : ''}
        </option>
        <option value="demo-only">
          Demo Only {counts ? `(${counts.demo})` : ''}
        </option>
        <option value="real-only">
          Real Data Only {counts ? `(${counts.real})` : ''}
        </option>
      </select>
    </div>
  );
}

/**
 * DemoWarningBanner - Banner to alert users about demo data
 *
 * Features:
 * - Prominent orange banner
 * - Links to demo library and cleanup tools
 * - Dismissible
 *
 * Usage:
 * <DemoWarningBanner demoCount={35} onViewDemoLibrary={() => router.push('/demo-library')} />
 */
export function DemoWarningBanner({
  demoCount,
  onViewDemoLibrary,
  onDismiss,
}: {
  demoCount: number;
  onViewDemoLibrary?: () => void;
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || demoCount === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 px-4 py-3 rounded-md shadow-sm"
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-900">Demo Data Active</h3>
            <p className="mt-1 text-sm text-orange-800">
              You have <strong>{demoCount} demo items</strong> in your system. These are sample items to help you learn.
              You can keep them or remove them when you're ready to add your own data.
            </p>
            {onViewDemoLibrary && (
              <div className="mt-2">
                <button
                  onClick={onViewDemoLibrary}
                  className="text-sm font-medium text-orange-700 hover:text-orange-900 underline"
                >
                  View Demo Library →
                </button>
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-orange-500 hover:text-orange-700"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
