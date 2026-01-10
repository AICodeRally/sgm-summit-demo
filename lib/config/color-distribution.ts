/**
 * SPARCC Color Distribution Algorithm
 *
 * Automatically distributes 2-7 gradient colors to exactly 4 operational mode colors
 * using linear interpolation. This ensures consistent color schemes across all SPARCC modules.
 *
 * Algorithm:
 * 1. Flatten gradient to array of color stops: [start, mid1?, mid2?, mid3?, end]
 * 2. Calculate 4 positions along gradient: 0.0, 0.33, 0.67, 1.0
 * 3. Interpolate RGB values at each position
 * 4. Assign to modes: DESIGN (0.0), OPERATE (0.33), DISPUTE (0.67), OVERSEE (1.0)
 *
 * Rationale for position mapping (REVERSED ORDER):
 * - DESIGN (0.0): Strategic/highest level → start of gradient
 * - OPERATE (0.33): Day-to-day operations → lower-middle of gradient
 * - DISPUTE (0.67): Exception handling → upper-middle of gradient
 * - OVERSEE (1.0): Monitoring/oversight → end of gradient (most vibrant)
 */

import type { ModuleGradient, ModeModeColors } from '@/types/module-config';

/**
 * RGB color representation
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts hex color string to RGB object
 *
 * @param hex - Hex color string (e.g., "#0ea5e9" or "0ea5e9")
 * @returns RGB object with r, g, b values (0-255)
 *
 * @example
 * hexToRgb("#0ea5e9") // { r: 14, g: 165, b: 233 }
 */
function hexToRgb(hex: string): RGB {
  // Remove # prefix if present
  const cleanHex = hex.replace(/^#/, '');

  // Parse hex string to RGB components
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);

  if (!result) {
    console.warn(`Invalid hex color: ${hex}, defaulting to black`);
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB object to hex color string
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string with # prefix
 *
 * @example
 * rgbToHex(14, 165, 233) // "#0ea5e9"
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Linear interpolation between two colors
 *
 * @param color1 - Start color (hex)
 * @param color2 - End color (hex)
 * @param factor - Interpolation factor (0.0 = color1, 1.0 = color2)
 * @returns Interpolated color (hex)
 *
 * @example
 * interpolateColor("#0ea5e9", "#8b5cf6", 0.5) // Middle color between cyan and violet
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  // Clamp factor between 0 and 1
  const f = Math.max(0, Math.min(1, factor));

  // Linear interpolation for each RGB component
  const r = c1.r + f * (c2.r - c1.r);
  const g = c1.g + f * (c2.g - c1.g);
  const b = c1.b + f * (c2.b - c1.b);

  return rgbToHex(r, g, b);
}

/**
 * Interpolate color at a specific position along gradient stops
 *
 * @param stops - Array of color stops (hex strings)
 * @param position - Position along gradient (0.0 to 1.0)
 * @returns Interpolated color at that position
 *
 * @example
 * const stops = ["#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"];
 * interpolateAtPosition(stops, 0.5) // Color halfway through gradient
 */
function interpolateAtPosition(stops: string[], position: number): string {
  if (stops.length === 0) {
    console.warn('Empty stops array, defaulting to black');
    return '#000000';
  }

  if (stops.length === 1) {
    return stops[0];
  }

  // Clamp position between 0 and 1
  const pos = Math.max(0, Math.min(1, position));

  // Map position to gradient stops
  // e.g., 4 stops: [0, 0.33, 0.67, 1.0]
  // position 0.5 would be between stop 1 and 2
  const scaledPosition = pos * (stops.length - 1);
  const lowerIndex = Math.floor(scaledPosition);
  const upperIndex = Math.ceil(scaledPosition);
  const factor = scaledPosition - lowerIndex;

  // If position lands exactly on a stop, return that stop
  if (lowerIndex === upperIndex) {
    return stops[lowerIndex];
  }

  // Otherwise, interpolate between adjacent stops
  return interpolateColor(stops[lowerIndex], stops[upperIndex], factor);
}

/**
 * Distributes module gradient to exactly 4 operational mode colors
 *
 * This is the core function of the modular color system. It takes any gradient
 * with 2-7 colors and automatically calculates the perfect color for each mode.
 *
 * Position mapping (REVERSED ORDER):
 * - DESIGN: 0.0 (start of gradient - strategic/highest level)
 * - OPERATE: 0.33 (lower-middle - day-to-day operations)
 * - DISPUTE: 0.67 (upper-middle - exception handling)
 * - OVERSEE: 1.0 (end of gradient - monitoring/oversight)
 *
 * @param gradient - Module gradient configuration
 * @returns Mode colors object with hex values for each mode
 *
 * @example
 * // SGM (SPARCC for Sales) - Blue to Purple gradient
 * distributeGradientToModes({
 *   start: '#0ea5e9',   // cyan-500
 *   mid1: '#3b82f6',    // blue-500
 *   mid2: '#6366f1',    // indigo-500
 *   end: '#8b5cf6',     // violet-500
 *   tailwindClass: '...'
 * });
 * // Returns:
 * // {
 * //   DESIGN: '#0ea5e9',   // cyan-500
 * //   OPERATE: '#3b82f6',  // blue-500
 * //   DISPUTE: '#6366f1',  // indigo-500
 * //   OVERSEE: '#8b5cf6'   // violet-500
 * // }
 */
export function distributeGradientToModes(gradient: ModuleGradient): ModeModeColors {
  // Flatten gradient to array of color stops
  const stops: string[] = [gradient.start];
  if (gradient.mid1) stops.push(gradient.mid1);
  if (gradient.mid2) stops.push(gradient.mid2);
  if (gradient.mid3) stops.push(gradient.mid3);
  stops.push(gradient.end);

  // Calculate colors at 4 positions: 0.0, 0.33, 0.67, 1.0 (REVERSED)
  const designColor = interpolateAtPosition(stops, 0.0);
  const operateColor = interpolateAtPosition(stops, 0.33);
  const disputeColor = interpolateAtPosition(stops, 0.67);
  const overseeColor = interpolateAtPosition(stops, 1.0);

  return {
    DESIGN: designColor,
    OPERATE: operateColor,
    DISPUTE: disputeColor,
    OVERSEE: overseeColor,
  };
}

/**
 * Generates Tailwind CSS classes from hex color
 *
 * @param hex - Hex color string
 * @returns Object with Tailwind class strings for various use cases
 *
 * @example
 * generateTailwindClasses("#0ea5e9")
 * // Returns:
 * // {
 * //   primary: '[#0ea5e9]',
 * //   secondary: '[#0ea5e9]',
 * //   gradient: 'from-[#0ea5e9] to-[#0ea5e9]',
 * //   bg: 'bg-[#0ea5e9]/10',
 * //   text: 'text-[#0ea5e9]',
 * //   border: 'border-[#0ea5e9]/30'
 * // }
 */
export function generateTailwindClasses(hex: string): {
  primary: string;
  secondary: string;
  gradient: string;
  bg: string;
  text: string;
  border: string;
} {
  // Use Tailwind's arbitrary value syntax for custom colors
  // This works with JIT mode for any hex color
  return {
    primary: `[${hex}]`,
    secondary: `[${hex}]`,
    gradient: `from-[${hex}] to-[${hex}]`,
    bg: `bg-[${hex}]/10`,
    text: `text-[${hex}]`,
    border: `border-[${hex}]/30`,
  };
}

/**
 * Generates full ModeConfig color objects from mode colors
 *
 * Converts hex colors to complete color configuration objects
 * compatible with the existing MODE_CONFIGS structure.
 *
 * @param modeColors - Mode colors with hex values
 * @returns Record of mode to color config objects
 *
 * @example
 * const modeColors = {
 *   DESIGN: '#8b5cf6',
 *   OPERATE: '#6366f1',
 *   DISPUTE: '#3b82f6',
 *   OVERSEE: '#0ea5e9'
 * };
 * generateModeColorConfigs(modeColors);
 * // Returns color configs for all 4 modes
 */
export function generateModeColorConfigs(modeColors: ModeModeColors): Record<string, any> {
  return Object.entries(modeColors).reduce((acc, [mode, hex]) => {
    acc[mode] = {
      hex,
      ...generateTailwindClasses(hex),
    };
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Validates a hex color string
 *
 * @param hex - Color string to validate
 * @returns True if valid hex color
 *
 * @example
 * isValidHexColor("#0ea5e9") // true
 * isValidHexColor("0ea5e9") // true
 * isValidHexColor("not a color") // false
 */
export function isValidHexColor(hex: string): boolean {
  const cleanHex = hex.replace(/^#/, '');
  return /^[a-f0-9]{6}$/i.test(cleanHex);
}

/**
 * Validates a module gradient configuration
 *
 * @param gradient - Gradient to validate
 * @returns Array of validation errors (empty if valid)
 *
 * @example
 * validateGradient({ start: '#0ea5e9', end: '#8b5cf6', tailwindClass: '...' });
 * // Returns: [] (no errors)
 */
export function validateGradient(gradient: ModuleGradient): string[] {
  const errors: string[] = [];

  if (!isValidHexColor(gradient.start)) {
    errors.push(`Invalid start color: ${gradient.start}`);
  }

  if (!isValidHexColor(gradient.end)) {
    errors.push(`Invalid end color: ${gradient.end}`);
  }

  if (gradient.mid1 && !isValidHexColor(gradient.mid1)) {
    errors.push(`Invalid mid1 color: ${gradient.mid1}`);
  }

  if (gradient.mid2 && !isValidHexColor(gradient.mid2)) {
    errors.push(`Invalid mid2 color: ${gradient.mid2}`);
  }

  if (gradient.mid3 && !isValidHexColor(gradient.mid3)) {
    errors.push(`Invalid mid3 color: ${gradient.mid3}`);
  }

  if (!gradient.tailwindClass || gradient.tailwindClass.trim() === '') {
    errors.push('Tailwind class is required');
  }

  return errors;
}
