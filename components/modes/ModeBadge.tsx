/**
 * Mode Badge Component
 *
 * Displays a small badge indicating the current operational mode
 * with color-coded styling based on mode type
 */

import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';

interface ModeBadgeProps {
  mode: OperationalMode;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function ModeBadge({ mode, size = 'md', showIcon = true }: ModeBadgeProps) {
  const config = MODE_CONFIGS[mode];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${config.color.hex}20`,
        color: config.color.hex,
        border: `2px solid ${config.color.hex}40`,
      }}
    >
      {showIcon && (
        <span className={iconSizeClasses[size]} dangerouslySetInnerHTML={{ __html: config.icon }} />
      )}
      <span>{config.label}</span>
    </div>
  );
}

/**
 * Mode Context Badge
 *
 * Automatically displays the current mode from context
 * Only renders if a mode is active
 */

import { useMode } from '@/lib/auth/mode-context';

interface ModeContextBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function ModeContextBadge({ size = 'md', showIcon = true }: ModeContextBadgeProps) {
  const { currentMode } = useMode();

  if (!currentMode) {
    return null;
  }

  return <ModeBadge mode={currentMode} size={size} showIcon={showIcon} />;
}
