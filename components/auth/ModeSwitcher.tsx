'use client';

import React, { useState } from 'react';
import {
  Pencil2Icon,
  GearIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@radix-ui/react-icons';
import { OperationalMode } from '@/types/operational-mode';
import { useMode } from '@/lib/auth/mode-context';
import { getModeConfig } from '@/lib/auth/mode-permissions';

/**
 * Mode Switcher Dropdown
 * Allows users to switch between operational modes
 */
export function ModeSwitcher() {
  const { currentMode, availableModes, switchMode } = useMode();
  const [isOpen, setIsOpen] = useState(false);

  // Map icon names to actual icon components
  const iconMap = {
    Pencil2Icon: Pencil2Icon,
    GearIcon: GearIcon,
    ExclamationTriangleIcon: ExclamationTriangleIcon,
    EyeOpenIcon: EyeOpenIcon,
  };

  const handleModeSwitch = async (mode: OperationalMode) => {
    try {
      await switchMode(mode);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  if (!currentMode || availableModes.length <= 1) {
    return null; // Don't show if no mode or only one mode available
  }

  const currentConfig = getModeConfig(currentMode);
  const CurrentIcon = iconMap[currentConfig.icon as keyof typeof iconMap] || GearIcon;

  // Get color classes based on current mode
  const getColorClasses = () => {
    switch (currentMode) {
      case OperationalMode.DESIGN:
        return {
          bg: 'bg-teal-50',
          text: 'text-teal-700',
          border: 'border-teal-300',
          dot: 'bg-teal-500',
        };
      case OperationalMode.OPERATE:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          dot: 'bg-blue-500',
        };
      case OperationalMode.DISPUTE:
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          border: 'border-pink-300',
          dot: 'bg-pink-500',
        };
      case OperationalMode.OVERSEE:
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-300',
          dot: 'bg-indigo-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-300',
          dot: 'bg-gray-500',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="relative">
      {/* Current Mode Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.text} hover:shadow-md transition-all`}
      >
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <CurrentIcon className="w-4 h-4" />
        <span className="font-semibold text-sm">{currentConfig.label}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Switch Mode
              </div>

              {availableModes.map((mode) => {
                const config = getModeConfig(mode);
                const Icon = iconMap[config.icon as keyof typeof iconMap] || GearIcon;
                const isActive = mode === currentMode;

                // Get color for this mode
                const modeColor = mode === OperationalMode.DESIGN ? 'text-teal-600' :
                                 mode === OperationalMode.OPERATE ? 'text-blue-600' :
                                 mode === OperationalMode.DISPUTE ? 'text-pink-600' :
                                 mode === OperationalMode.OVERSEE ? 'text-indigo-600' :
                                 'text-gray-600';

                return (
                  <button
                    key={mode}
                    onClick={() => handleModeSwitch(mode)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-50 border-2 border-purple-300'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${modeColor}`} />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm text-gray-900">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-1">
                        {config.tagline}
                      </div>
                    </div>
                    {isActive && (
                      <CheckIcon className="w-5 h-5 text-purple-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
