'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useMode } from '@/lib/auth/mode-context';
import { OperationalMode } from '@/types/operational-mode';
import { getModeConfig } from '@/lib/auth/mode-permissions';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Navigation Component
 * Shows hierarchy: Mode > Feature > Detail
 * Color-coded based on current mode
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const { currentMode } = useMode();

  // Get color classes based on current mode
  const getColorClasses = () => {
    switch (currentMode) {
      case OperationalMode.DESIGN:
        return {
          text: 'text-teal-700',
          textLight: 'text-teal-600',
          hover: 'hover:text-teal-800',
        };
      case OperationalMode.OPERATE:
        return {
          text: 'text-blue-700',
          textLight: 'text-blue-600',
          hover: 'hover:text-blue-800',
        };
      case OperationalMode.DISPUTE:
        return {
          text: 'text-pink-700',
          textLight: 'text-pink-600',
          hover: 'hover:text-pink-800',
        };
      case OperationalMode.OVERSEE:
        return {
          text: 'text-indigo-700',
          textLight: 'text-indigo-600',
          hover: 'hover:text-indigo-800',
        };
      default:
        return {
          text: 'text-gray-700',
          textLight: 'text-gray-600',
          hover: 'hover:text-gray-800',
        };
    }
  };

  const colors = getColorClasses();

  // Add mode as first item if we have a current mode and items don't already include it
  const breadcrumbItems = [...items];
  if (currentMode && items.length > 0 && items[0].label !== getModeConfig(currentMode).label) {
    const modeConfig = getModeConfig(currentMode);
    breadcrumbItems.unshift({
      label: `${modeConfig.label} Mode`,
      href: modeConfig.defaultRoute,
    });
  }

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRightIcon className={`w-4 h-4 ${colors.textLight}`} />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href as any}
                className={`font-medium ${colors.textLight} ${colors.hover} transition-colors`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-semibold ${isLast ? colors.text : colors.textLight}`}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/**
 * Hook to easily create breadcrumbs for a page
 */
export function useBreadcrumbs(items: BreadcrumbItem[]) {
  return items;
}
