'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
import { OperationalMode } from '@/types/operational-mode';
import { getModeConfig } from '@/lib/auth/mode-permissions';
import { useModePermission } from '@/lib/auth/mode-context';

interface ModeCardProps {
  mode: OperationalMode;
  className?: string;
}

/**
 * Hero card for an operational mode
 * Displays mode info with gradient background and feature list
 */
export function ModeCard({ mode, className = '' }: ModeCardProps) {
  const config = getModeConfig(mode);
  const permission = useModePermission(mode);

  // Map icon names to actual icon components
  const iconMap = {
    Pencil2Icon: Pencil2Icon,
    GearIcon: GearIcon,
    ExclamationTriangleIcon: ExclamationTriangleIcon,
    EyeOpenIcon: EyeOpenIcon,
  };

  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || GearIcon;

  // Use dynamic colors from config
  const baseColor = config.color.hex;

  // Take top 5 features
  const topFeatures = config.features.slice(0, 5);

  const content = (
    <div
      className={`bg-gradient-to-br rounded-xl border-2 p-8 transition-all duration-300 ${
        permission.canAccess
          ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      } ${className}`}
      style={{
        background: `linear-gradient(to bottom right, ${baseColor}15, ${baseColor}30)`,
        borderColor: `${baseColor}50`
      }}
    >
      {/* Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg p-3 shadow-md" style={{ color: baseColor }}>
            <IconComponent className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {config.label}
            </h2>
            <p className="text-sm text-gray-700 opacity-75 mt-1">
              {config.tagline}
            </p>
          </div>
        </div>
        {!permission.canAccess && (
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <LockClosedIcon className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-800 opacity-90 mb-6 text-base">
        {config.description}
      </p>

      {/* Feature List */}
      <div className="mb-6">
        <p className="text-gray-800 font-semibold mb-3 text-sm uppercase tracking-wide">
          Key Features
        </p>
        <ul className="space-y-2">
          {topFeatures.map((feature, index) => (
            <li
              key={index}
              className="text-gray-700 opacity-80 text-sm flex items-center gap-2"
            >
              <span className="font-bold" style={{ color: baseColor }}>•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button or Locked Message */}
      {permission.canAccess ? (
        <div
          className="text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:opacity-90"
          style={{ background: `linear-gradient(to right, ${baseColor}, ${baseColor}dd)` }}
        >
          Enter {config.label}
          <ArrowRightIcon className="w-5 h-5" />
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-lg text-center">
          <LockClosedIcon className="w-4 h-4 inline-block mr-2" />
          Access Restricted
        </div>
      )}
    </div>
  );

  // If user has access, wrap in Link
  if (permission.canAccess) {
    return <Link href={config.defaultRoute as any}>{content}</Link>;
  }

  // Otherwise, just render the card without link
  return content;
}
