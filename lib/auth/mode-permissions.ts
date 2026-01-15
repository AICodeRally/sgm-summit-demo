/**
 * Mode Permission System
 *
 * Manages operational mode access control, permissions, and routing
 *
 * NOTE: Colors are now dynamically sourced from the active module configuration.
 * This enables the platform to support dozens of SPARCC modules with custom color schemes.
 */

import { OperationalMode, ModeConfig, ModePermission } from '@/types/operational-mode';
import { getActiveModule } from '@/lib/config/module-registry';
import { generateTailwindClasses } from '@/lib/config/color-distribution';

/**
 * Generate MODE_CONFIGS dynamically from the active module
 *
 * This function creates mode configurations using colors from the active module's gradient.
 * All other settings (roles, features, routes) remain consistent across modules.
 *
 * @returns Complete mode configurations with module-specific colors
 */
function getModeConfigs(): Record<OperationalMode, ModeConfig> {
  const activeModule = getActiveModule();

  // Generate Tailwind classes for each mode color
  const designClasses = generateTailwindClasses(activeModule.modeColors.DESIGN);
  const operateClasses = generateTailwindClasses(activeModule.modeColors.OPERATE);
  const disputeClasses = generateTailwindClasses(activeModule.modeColors.DISPUTE);
  const overseeClasses = generateTailwindClasses(activeModule.modeColors.OVERSEE);

  return {
  [OperationalMode.DESIGN]: {
    mode: OperationalMode.DESIGN,
    label: 'Design',
    description: 'Build compensation frameworks, policies, and templates',
    tagline: 'Design governance frameworks and policies',
    icon: 'Pencil2Icon',
    color: {
      primary: designClasses.primary,
      secondary: designClasses.secondary,
      gradient: designClasses.gradient,
      bg: designClasses.bg,
      text: designClasses.text,
      border: designClasses.border,
      hex: activeModule.modeColors.DESIGN,
    },
    requiredRoles: [],
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    features: [
      'Policy Library',
      'Plan Templates',
      'Governance Framework',
      'Governance Matrix',
      'Gap Analysis',
      'Framework Primer',
      'Document Links',
      'Control Library',
    ],
    defaultRoute: '/design',
    routes: [
      '/design',
      '/templates',
      '/policies',
      '/governance-framework',
      '/governance-matrix',
      '/framework',
      '/links',
    ],
  },
  [OperationalMode.OPERATE]: {
    mode: OperationalMode.OPERATE,
    label: 'Operate',
    description: 'Execute day-to-day compensation operations',
    tagline: 'Execute compensation plans and workflows',
    icon: 'GearIcon',
    color: {
      primary: operateClasses.primary,
      secondary: operateClasses.secondary,
      gradient: operateClasses.gradient,
      bg: operateClasses.bg,
      text: operateClasses.text,
      border: operateClasses.border,
      hex: activeModule.modeColors.OPERATE,
    },
    requiredRoles: [],
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    features: [
      'Document Library',
      'Plans Management',
      'Approvals Queue',
      'Calendar',
      'Reports & Analytics',
      'Search & Compare',
      'Notifications',
      'Document Upload',
    ],
    defaultRoute: '/operate',
    routes: [
      '/operate',
      '/documents',
      '/plans',
      '/approvals',
      '/calendar',
      '/notifications',
      '/reports',
      '/compare',
    ],
  },
  [OperationalMode.DISPUTE]: {
    mode: OperationalMode.DISPUTE,
    label: 'Dispute',
    description: 'Resolve exceptions, disputes, and escalations',
    tagline: 'Resolve disputes and manage exceptions',
    icon: 'ExclamationTriangleIcon',
    color: {
      primary: disputeClasses.primary,
      secondary: disputeClasses.secondary,
      gradient: disputeClasses.gradient,
      bg: disputeClasses.bg,
      text: disputeClasses.text,
      border: disputeClasses.border,
      hex: activeModule.modeColors.DISPUTE,
    },
    requiredRoles: [],
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'],
    features: [
      'Cases Management',
      'Case SLA',
      'Case Analytics',
      'Field Submissions',
      'Escalation Workflows',
      'Dispute Resolution',
    ],
    defaultRoute: '/dispute',
    routes: ['/dispute', '/cases', '/cases/sla', '/cases/analytics'],
  },
  [OperationalMode.OVERSEE]: {
    mode: OperationalMode.OVERSEE,
    label: 'Oversee',
    description: 'Executive oversight, governance, and compliance',
    tagline: 'Monitor governance and compliance',
    icon: 'EyeOpenIcon',
    color: {
      primary: overseeClasses.primary,
      secondary: overseeClasses.secondary,
      gradient: overseeClasses.gradient,
      bg: overseeClasses.bg,
      text: overseeClasses.text,
      border: overseeClasses.border,
      hex: activeModule.modeColors.OVERSEE,
    },
    requiredRoles: [],
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
    features: [
      'Committee Management',
      'Audit Timeline',
      'Executive Dashboards',
      'Compliance Monitoring',
      'Committee Decisions',
      'Governance Analytics',
      'Risk Assessment',
      'Client Dashboards',
    ],
    defaultRoute: '/oversee',
    routes: ['/oversee', '/committees', '/audit', '/analytics', '/compliance', '/decisions'],
  },
  };
}

/**
 * Configuration for all 4 operational modes
 *
 * Generated dynamically from the active module's color configuration.
 * All non-color settings (roles, features, routes) remain consistent.
 */
export const MODE_CONFIGS = getModeConfigs();

/**
 * Check if a role can access a specific mode
 */
export function canAccessMode(
  role: string | undefined,
  mode: OperationalMode
): boolean {
  if (!role) return false;
  const config = MODE_CONFIGS[mode];
  return config.allowedRoles.includes(role);
}

/**
 * Get all modes available to a role
 */
export function getAvailableModesForRole(
  role: string | undefined
): OperationalMode[] {
  if (!role) return [];

  return Object.values(OperationalMode).filter((mode) =>
    canAccessMode(role, mode)
  );
}

/**
 * Get default mode for a role
 */
export function getDefaultModeForRole(
  role: string | undefined
): OperationalMode | null {
  if (!role) return null;

  // Special case: Consultants default to DESIGN
  // (In production, check user profile for consultant flag)

  // ADMIN and SUPER_ADMIN default to OPERATE (most common workflow)
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return OperationalMode.OPERATE;
  }

  // MANAGER defaults to OPERATE
  if (role === 'MANAGER') {
    return OperationalMode.OPERATE;
  }

  // USER defaults to OPERATE
  if (role === 'USER') {
    return OperationalMode.OPERATE;
  }

  // VIEWER defaults to OPERATE (read-only)
  if (role === 'VIEWER') {
    return OperationalMode.OPERATE;
  }

  // Fallback to OPERATE
  return OperationalMode.OPERATE;
}

/**
 * Determine which mode a route belongs to
 */
export function getModeForRoute(pathname: string): OperationalMode | null {
  // Check mode landing pages first
  if (pathname === '/design' || pathname.startsWith('/design/')) {
    return OperationalMode.DESIGN;
  }
  if (pathname === '/operate' || pathname.startsWith('/operate/')) {
    return OperationalMode.OPERATE;
  }
  if (pathname === '/dispute' || pathname.startsWith('/dispute/')) {
    return OperationalMode.DISPUTE;
  }
  if (pathname === '/oversee' || pathname.startsWith('/oversee/')) {
    return OperationalMode.OVERSEE;
  }

  // Check specific routes
  for (const mode of Object.values(OperationalMode)) {
    const config = MODE_CONFIGS[mode];
    for (const route of config.routes) {
      if (pathname === route || pathname.startsWith(`${route}/`)) {
        return mode;
      }
    }
  }

  return null;
}

/**
 * Get detailed permissions for a role/mode combination
 */
export function getModePermission(
  role: string | undefined,
  mode: OperationalMode
): ModePermission {
  if (!role) {
    return {
      canAccess: false,
      canSwitch: false,
      accessLevel: 'none',
    };
  }

  const canAccess = canAccessMode(role, mode);

  if (!canAccess) {
    return {
      canAccess: false,
      canSwitch: false,
      accessLevel: 'none',
    };
  }

  // Determine access level based on role and mode
  let accessLevel: 'full' | 'limited' | 'read-only' | 'none' = 'full';

  if (mode === OperationalMode.DESIGN && role === 'MANAGER') {
    accessLevel = 'read-only'; // Managers can read but not author
  } else if (mode === OperationalMode.OPERATE && role === 'USER') {
    accessLevel = 'limited'; // Users have limited operations access
  } else if (mode === OperationalMode.OPERATE && role === 'VIEWER') {
    accessLevel = 'read-only'; // Viewers can only read
  } else if (mode === OperationalMode.DISPUTE && role === 'USER') {
    accessLevel = 'limited'; // Users can submit but not resolve
  }

  return {
    canAccess: true,
    canSwitch: true,
    accessLevel,
  };
}

/**
 * Get all mode configurations
 */
export function getAllModeConfigs(): ModeConfig[] {
  return Object.values(MODE_CONFIGS);
}

/**
 * Get configuration for a specific mode
 */
export function getModeConfig(mode: OperationalMode): ModeConfig {
  return MODE_CONFIGS[mode];
}
