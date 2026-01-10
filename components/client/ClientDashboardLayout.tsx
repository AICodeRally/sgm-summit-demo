'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  FileTextIcon,
  ExclamationTriangleIcon,
  TableIcon,
  ReaderIcon,
  ClockIcon,
} from '@radix-ui/react-icons';

interface ClientDashboardLayoutProps {
  children: ReactNode;
  tenantSlug: string;
  tenantName: string;
  brandingConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    companyName?: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Client Dashboard Layout
 * Reusable shell for all BETA/PRODUCTION tier client dashboards
 * Supports white-label branding configuration
 */
export function ClientDashboardLayout({
  children,
  tenantSlug,
  tenantName,
  brandingConfig,
}: ClientDashboardLayoutProps) {
  const pathname = usePathname();

  // Navigation items
  const navItems: NavItem[] = [
    { href: `/client/${tenantSlug}`, label: 'Dashboard', icon: DashboardIcon },
    { href: `/client/${tenantSlug}/plans`, label: 'Plans', icon: FileTextIcon },
    { href: `/client/${tenantSlug}/gaps`, label: 'Gaps', icon: ExclamationTriangleIcon },
    { href: `/client/${tenantSlug}/coverage`, label: 'Coverage', icon: TableIcon },
    { href: `/client/${tenantSlug}/policies`, label: 'Policies', icon: ReaderIcon },
    { href: `/client/${tenantSlug}/roadmap`, label: 'Roadmap', icon: ClockIcon },
  ];

  // Default colors if no branding provided
  const primaryColor = brandingConfig?.primaryColor || '#6366f1'; // indigo-500
  const secondaryColor = brandingConfig?.secondaryColor || '#8b5cf6'; // violet-500
  const companyName = brandingConfig?.companyName || tenantName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50">
      {/* Header with tenant branding */}
      <header className="bg-white shadow-sm border-b-4 border-transparent sticky top-0 z-50"
        style={{
          borderImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}) 1`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-4">
              {brandingConfig?.logo ? (
                <img
                  src={brandingConfig.logo}
                  alt={`${companyName} logo`}
                  className="h-12 w-auto"
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{
                    background: `linear-gradient(to br, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  {companyName}
                </h1>
                <p className="text-sm text-gray-600">Governance Dashboard</p>
              </div>
            </div>

            {/* Back to Platform Link */}
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Platform
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 mt-4 border-t border-gray-100 pt-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href as any}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            Powered by SPARCC Sales Governance Platform
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © 2025 All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
