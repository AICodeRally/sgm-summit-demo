'use client';

import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ThemeProvider';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public layout for landing page and marketing pages
 * Minimal chrome - just logo header, no navbar/footer
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-[color:var(--color-background)]">
          {/* Simple header with logo */}
          <header className="fixed top-0 w-full z-50 bg-transparent">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  <span className="text-white font-bold text-sm">SGM</span>
                </div>
                <span
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  SPARCC
                </span>
              </Link>
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all hover:opacity-90"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                }}
              >
                Sign In
              </Link>
            </div>
          </header>

          {/* Page content */}
          {children}

          {/* Simple footer */}
          <footer className="py-8 text-center text-sm text-[color:var(--color-muted)]">
            <span>Powered by </span>
            <span
              className="font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
              }}
            >
              AICR
            </span>
            <span className="mx-2">•</span>
            <span>Part of the SPARCC suite of SPM tools</span>
          </footer>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
