'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface FeatureTileProps {
  href: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  count?: number | string;
  primary?: boolean;
}

/**
 * Feature tile for mode landing pages
 * Clickable card that links to a specific feature
 */
export function FeatureTile({
  href,
  label,
  description,
  icon,
  count,
  primary = false,
}: FeatureTileProps) {
  return (
    <Link href={href as any}>
      <div
        className={`bg-white rounded-xl border-2 transition-all cursor-pointer h-full group ${
          primary
            ? 'border-purple-300 hover:border-purple-500 hover:shadow-xl p-8'
            : 'border-gray-200 hover:border-purple-300 hover:shadow-lg p-6'
        }`}
      >
        {/* Icon */}
        {icon && (
          <div className={`mb-4 ${primary ? 'text-purple-600' : 'text-gray-700'}`}>
            {icon}
          </div>
        )}

        {/* Label and Count */}
        <div className="flex items-center justify-between mb-2">
          <h3
            className={`font-bold ${
              primary ? 'text-2xl text-gray-900' : 'text-lg text-gray-900'
            }`}
          >
            {label}
          </h3>
          {count !== undefined && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                primary
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {count}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={`text-gray-600 mb-4 ${primary ? 'text-base' : 'text-sm'}`}>
            {description}
          </p>
        )}

        {/* CTA */}
        <div
          className={`flex items-center gap-2 font-medium group-hover:gap-3 transition-all ${
            primary ? 'text-purple-600 text-base' : 'text-gray-700 text-sm'
          }`}
        >
          Open <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
