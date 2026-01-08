'use client';

interface DemoBadgeProps {
  /** Whether this item is demo data */
  isDemo?: boolean;
  /** Optional demo metadata (year, BU, division, category) */
  demoMetadata?: {
    year?: number;
    bu?: string;
    division?: string;
    category?: string;
  } | null;
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom className */
  className?: string;
}

/**
 * DemoBadge - Visual indicator for demo/sample data
 *
 * Features:
 * - Color-coded badge (orange gradient) to make demo data very apparent
 * - Shows "DEMO" label with optional metadata (year, BU, division)
 * - Multiple sizes (sm, md, lg)
 * - Only renders if isDemo is true
 * - For real data, use LiveBadge component instead
 *
 * Usage:
 * <DemoBadge isDemo={document.isDemo} demoMetadata={document.demoMetadata} />
 */
export function DemoBadge({ isDemo, demoMetadata, size = 'md', className = '' }: DemoBadgeProps) {
  // Don't render anything if not demo data
  if (isDemo === false || isDemo === undefined) return null;

  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  // Build badge text
  let badgeText = 'DEMO';
  if (demoMetadata) {
    const parts: string[] = [];
    if (demoMetadata.year) parts.push(demoMetadata.year.toString());
    if (demoMetadata.bu) parts.push(demoMetadata.bu);
    if (demoMetadata.division) parts.push(demoMetadata.division);
    if (demoMetadata.category) parts.push(demoMetadata.category);

    if (parts.length > 0) {
      badgeText = `DEMO: ${parts.join(' | ')}`;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDB813 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)',
      }}
      title="This is sample/demo data. You can remove it when you're ready to add your own data."
    >
      <svg
        className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      {badgeText}
    </span>
  );
}

/**
 * DemoHighlight - Wrapper component that adds demo-specific styling to children
 *
 * Features:
 * - Adds subtle orange border and background tint to demo items
 * - Makes demo items visually distinct in lists
 * - Can be used to wrap cards, rows, or any container
 *
 * Usage:
 * <DemoHighlight isDemo={item.isDemo}>
 *   <div>Your content here</div>
 * </DemoHighlight>
 */
export function DemoHighlight({
  isDemo,
  children,
  className = ''
}: {
  isDemo?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!isDemo) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderLeft: '3px solid #FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.04)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * LiveBadge - Visual indicator for real/production data
 *
 * Features:
 * - Color-coded badge (green gradient) to show real production data
 * - Shows "LIVE" or "PRODUCTION" label
 * - Multiple sizes (sm, md, lg)
 * - Only renders if isDemo is explicitly false
 *
 * Usage:
 * <LiveBadge isDemo={document.isDemo} size="sm" />
 */
export function LiveBadge({ isDemo, size = 'md', className = '', label = 'LIVE' }: {
  isDemo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: 'LIVE' | 'PRODUCTION' | 'REAL';
}) {
  // Only render for real data (isDemo === false)
  if (isDemo !== false) return null;

  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
        color: 'white',
        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
      }}
      title="This is real production data from your organization."
    >
      <svg
        className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      {label}
    </span>
  );
}

/**
 * LiveHighlight - Wrapper component that adds production-data styling to children
 *
 * Features:
 * - Adds subtle green border and background tint to real items
 * - Makes production items visually distinct from demo items
 * - Can be used to wrap cards, rows, or any container
 *
 * Usage:
 * <LiveHighlight isDemo={item.isDemo}>
 *   <div>Your content here</div>
 * </LiveHighlight>
 */
export function LiveHighlight({
  isDemo,
  children,
  className = ''
}: {
  isDemo?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  // Only apply for real data
  if (isDemo !== false) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderLeft: '3px solid #10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.04)',
      }}
    >
      {children}
    </div>
  );
}
