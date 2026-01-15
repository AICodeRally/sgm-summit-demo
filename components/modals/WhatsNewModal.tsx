'use client';

/**
 * What's New Modal
 *
 * Introduces users to the 4-mode operational system
 * Shows on first visit, dismissable with "Don't show again"
 */

import { useState, useEffect } from 'react';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import {
  CheckCircledIcon,
  Cross2Icon,
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';

// Map icon names to actual icon components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
};

const WHATS_NEW_KEY = 'sgm-whats-new-modal-seen';
const MODAL_VERSION = '1.0'; // Increment to show modal again for updates

interface WhatsNewModalProps {
  onClose?: () => void;
}

export function WhatsNewModal({ onClose }: WhatsNewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has seen this version of the modal
    const seenVersion = localStorage.getItem(WHATS_NEW_KEY);
    if (seenVersion !== MODAL_VERSION) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(WHATS_NEW_KEY, MODAL_VERSION);
    }
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return null;
  }

  const modes = [
    {
      mode: OperationalMode.DESIGN,
      description: 'Build governance frameworks and compensation templates',
      features: ['Policy Library', 'Plan Templates', 'Governance Matrix', 'Gap Analysis'],
    },
    {
      mode: OperationalMode.OPERATE,
      description: 'Execute day-to-day compensation operations',
      features: ['Document Library', 'Plans Management', 'Approvals Queue', 'Reports'],
    },
    {
      mode: OperationalMode.DISPUTE,
      description: 'Resolve exceptions, disputes, and escalations',
      features: ['Cases Management', 'SLA Tracking', 'Field Submissions', 'Resolution Workflows'],
    },
    {
      mode: OperationalMode.OVERSEE,
      description: 'Governance, risk, and compliance monitoring',
      features: ['Committee Management', 'Audit Timeline', 'Compliance', 'Dashboards'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-[color:var(--color-surface)] rounded-2xl w-[1030px] max-w-[95vw] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] px-6 py-4 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[color:var(--color-surface)]/20 transition-colors"
            aria-label="Close modal"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">🎉 Welcome to the New SGM Platform!</h2>
          <p className="text-white/80 text-sm mt-1">
            Reorganized into 4 operational modes for better workflow
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-[color:var(--color-foreground)]">Choose Your Workflow Mode</h3>
              <p className="text-xs text-[color:var(--color-muted)]">
                All features accessible, organized by role
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {modes.map(({ mode, description, features }) => {
                const config = MODE_CONFIGS[mode];
                return (
                  <div
                    key={mode}
                    className="border-2 rounded-lg p-3 hover:shadow-md transition-all"
                    style={{
                      borderColor: `${config.color.hex}40`,
                      backgroundColor: `${config.color.hex}08`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${config.color.hex}20`, color: config.color.hex }}
                      >
                        {(() => {
                          const IconComponent = iconMap[config.icon] || GearIcon;
                          return <IconComponent className="w-4 h-4" />;
                        })()}
                      </div>
                      <h4 className="font-bold text-sm" style={{ color: config.color.hex }}>
                        {config.label}
                      </h4>
                    </div>
                    <p className="text-xs text-[color:var(--color-foreground)] mb-2 leading-tight">{description}</p>
                    <div className="flex flex-wrap gap-1">
                      {features.map((feature) => (
                        <span
                          key={feature}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${config.color.hex}15`, color: config.color.hex }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom row: How to Switch + Nothing Changed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-info-border)] rounded-lg p-4">
              <h3 className="text-sm font-bold text-[color:var(--color-info)] mb-2">🔄 How to Switch Modes</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-[color:var(--color-info)]">
                <p><strong>1.</strong> Click mode tabs in nav bar</p>
                <p><strong>2.</strong> Mode switcher dropdown</p>
                <p><strong>3.</strong> <kbd className="px-1 py-0.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded text-[10px]">Cmd+1-4</kbd> shortcuts</p>
                <p><strong>4.</strong> Direct URLs: /design, etc.</p>
              </div>
            </div>

            <div className="bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] rounded-lg p-4">
              <h3 className="text-sm font-bold text-[color:var(--color-accent)] mb-1 inline-flex items-center gap-1.5">
                <CheckCircledIcon className="w-4 h-4" />
                Nothing Has Changed
              </h3>
              <p className="text-xs text-[color:var(--color-accent)]">
                All features, documents, and workflows remain where they were. The mode system is purely a navigation enhancement.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[color:var(--color-border)] px-6 py-4 bg-[color:var(--color-surface-alt)]">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-[color:var(--color-primary)] border-[color:var(--color-border)] rounded focus:ring-[color:var(--color-accent-border)]"
              />
              <span className="text-sm text-[color:var(--color-foreground)]">Don't show this again</span>
            </label>
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Got it, Let's Go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
