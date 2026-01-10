/**
 * Mode Theme Configuration
 *
 * Defines color themes and styling for each operational mode
 */

import { OperationalMode } from '@/types/operational-mode';

export interface ModeTheme {
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  borderHover: string;
  icon: string;
}

export const MODE_THEMES: Record<OperationalMode, ModeTheme> = {
  [OperationalMode.DESIGN]: {
    gradient: 'from-teal-600 to-cyan-600',
    gradientFrom: 'teal-600',
    gradientTo: 'cyan-600',
    bg: 'bg-teal-50',
    bgLight: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-300',
    borderHover: 'border-teal-500',
    icon: 'text-teal-600',
  },
  [OperationalMode.OPERATE]: {
    gradient: 'from-blue-600 to-purple-600',
    gradientFrom: 'blue-600',
    gradientTo: 'purple-600',
    bg: 'bg-blue-50',
    bgLight: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-300',
    borderHover: 'border-blue-500',
    icon: 'text-blue-600',
  },
  [OperationalMode.DISPUTE]: {
    gradient: 'from-pink-600 to-rose-600',
    gradientFrom: 'pink-600',
    gradientTo: 'rose-600',
    bg: 'bg-pink-50',
    bgLight: 'bg-pink-50',
    text: 'text-pink-900',
    border: 'border-pink-300',
    borderHover: 'border-pink-500',
    icon: 'text-pink-600',
  },
  [OperationalMode.OVERSEE]: {
    gradient: 'from-indigo-600 to-violet-600',
    gradientFrom: 'indigo-600',
    gradientTo: 'violet-600',
    bg: 'bg-indigo-50',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
    borderHover: 'border-indigo-500',
    icon: 'text-indigo-600',
  },
};

/**
 * Get theme for a specific mode
 */
export function getModeTheme(mode: OperationalMode): ModeTheme {
  return MODE_THEMES[mode];
}
