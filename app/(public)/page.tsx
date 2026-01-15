'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  ArrowRightIcon,
} from '@radix-ui/react-icons';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
};

const modeDescriptions: Record<OperationalMode, string> = {
  [OperationalMode.DESIGN]: 'Build governance frameworks and compensation templates',
  [OperationalMode.OPERATE]: 'Execute day-to-day compensation operations',
  [OperationalMode.DISPUTE]: 'Resolve exceptions, disputes, and escalations',
  [OperationalMode.OVERSEE]: 'Governance, risk, and compliance monitoring',
};

/**
 * Public Landing Page
 * Shows before authentication - introduces SGM and its 4 operational modes
 */
export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[color:var(--color-muted)]">Loading...</div>
      </div>
    );
  }

  const modes = [
    OperationalMode.DESIGN,
    OperationalMode.OPERATE,
    OperationalMode.DISPUTE,
    OperationalMode.OVERSEE,
  ];

  return (
    <div className="min-h-screen sparcc-hero-bg">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[color:var(--color-foreground)] mb-6">
            Sales Governance{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
              }}
            >
              Management
            </span>
          </h1>
          <p className="text-xl text-[color:var(--color-muted)] mb-10 max-w-2xl mx-auto">
            Design, operate, and oversee compensation programs with confidence.
            Four operational modes for complete governance control.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
            style={{
              backgroundImage:
                'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
            }}
          >
            Get Started
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Mode Feature Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[color:var(--color-foreground)] mb-10">
            Four Operational Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modes.map((mode) => {
              const config = MODE_CONFIGS[mode];
              const IconComponent = iconMap[config.icon] || GearIcon;

              return (
                <div
                  key={mode}
                  className="bg-[color:var(--color-surface)] rounded-xl p-6 shadow-lg border-2 transition-all hover:shadow-xl hover:-translate-y-1"
                  style={{
                    borderColor: `${config.color.hex}40`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: `${config.color.hex}20`,
                      color: config.color.hex,
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: config.color.hex }}>
                    {config.label}
                  </h3>
                  <p className="text-sm text-[color:var(--color-muted)]">
                    {modeDescriptions[mode]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[color:var(--color-muted)] mb-8">
            Sign in to access your compensation governance platform.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-lg shadow-md transition-all hover:opacity-90"
            style={{
              backgroundImage:
                'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
            }}
          >
            Sign In
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
