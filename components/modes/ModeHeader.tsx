'use client';

import React from 'react';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import { OperationalMode } from '@/types/operational-mode';
import { getModeConfig } from '@/lib/auth/mode-permissions';

interface ModeHeaderProps {
  mode: OperationalMode;
  description?: string;
}

/**
 * Header section for mode landing pages
 * Displays mode icon, title, and description with gradient background
 */
export function ModeHeader({ mode, description }: ModeHeaderProps) {
  const config = getModeConfig(mode);
  const displayDescription = description || config.description;

  // Map icon names to actual icon components
  const iconMap = {
    Pencil2Icon: Pencil2Icon,
    GearIcon: GearIcon,
    ExclamationTriangleIcon: ExclamationTriangleIcon,
    EyeOpenIcon: EyeOpenIcon,
  };

  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || GearIcon;

  // Get gradient colors based on mode
  const getGradientClasses = () => {
    switch (mode) {
      case OperationalMode.DESIGN:
        return 'from-teal-600 to-cyan-600';
      case OperationalMode.OPERATE:
        return 'from-blue-600 to-purple-600';
      case OperationalMode.DISPUTE:
        return 'from-pink-600 to-rose-600';
      case OperationalMode.OVERSEE:
        return 'from-indigo-600 to-violet-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getGradientClasses()} rounded-xl p-8 mb-8 shadow-xl`}>
      <div className="flex items-center gap-6">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <IconComponent className="w-12 h-12 text-gray-900" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{config.label} Mode</h1>
          <p className="text-xl text-white/90">{displayDescription}</p>
        </div>
      </div>
    </div>
  );
}
