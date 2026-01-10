/**
 * Operational Mode System Type Definitions
 *
 * Defines the 4-mode operational structure for the platform:
 * - DESIGN: Governance framework design (consultants, CoE)
 * - OPERATE: Day-to-day compensation operations (comp team, RevOps)
 * - DISPUTE: Exception and dispute resolution (field, managers, case workers)
 * - OVERSEE: Executive oversight and compliance (executives, committees)
 */

export enum OperationalMode {
  DESIGN = 'DESIGN',
  OPERATE = 'OPERATE',
  DISPUTE = 'DISPUTE',
  OVERSEE = 'OVERSEE',
}

export interface ModeConfig {
  mode: OperationalMode;
  label: string;
  description: string;
  tagline: string;
  icon: string;
  color: {
    primary: string;
    secondary: string;
    gradient: string;
    bg: string;
    text: string;
    border: string;
    hex: string; // Hex color code for direct usage
  };
  requiredRoles: string[];
  allowedRoles: string[];
  features: string[];
  defaultRoute: string;
  routes: string[];
}

export interface ModeContext {
  currentMode: OperationalMode | null;
  availableModes: OperationalMode[];
  canSwitchMode: boolean;
  switchMode: (mode: OperationalMode) => Promise<void>;
}

export interface ModePermission {
  canAccess: boolean;
  canSwitch: boolean;
  accessLevel: 'full' | 'limited' | 'read-only' | 'none';
}

export interface ModeMetrics {
  mode: OperationalMode;
  primaryCount: number;
  primaryLabel: string;
  secondaryCount: number;
  secondaryLabel: string;
  status: 'healthy' | 'warning' | 'critical';
}
