/**
 * SPARCC Module Registry
 *
 * Central registry of all SPARCC modules with their configurations.
 * Each module defines its identity, colors, data contracts, and AI capabilities.
 *
 * This is the "input connector" system that enables dozens of SPARCC modules
 * to plug into the same platform infrastructure with custom branding.
 *
 * Usage:
 * ```typescript
 * const activeModule = getActiveModule();
 * const gradient = activeModule.gradient.tailwindClass;
 * const tagline = activeModule.module.tagline; // "for Sales"
 * ```
 */

import type { ModuleConfig, ModuleRegistry, ModuleRef } from '@/types/module-config';
import { distributeGradientToModes } from './color-distribution';

// Re-export types for convenience
export type { ModuleConfig, ModuleRegistry, ModuleRef } from '@/types/module-config';

// ===========================
// SPARCC for Sales - Sales Governance Module (SGM)
// ===========================

/**
 * SGM Module Configuration
 *
 * The current Sales Governance Management application.
 * First module in the SPARCC ecosystem.
 *
 * Colors: Blue→Purple gradient (Teal to Violet spectrum)
 * - Cyan-500 → Blue-500 → Indigo-500 → Violet-500
 *
 * Mode Distribution (REVERSED ORDER):
 * - DESIGN: Cyan (strategic framework)
 * - OPERATE: Blue (day-to-day operations)
 * - DISPUTE: Indigo (exception handling)
 * - OVERSEE: Violet (monitoring oversight)
 */
const sgmModule: ModuleConfig = {
  module: {
    id: 'sgm',
    name: 'Sales Governance',
    productLine: 'SPARCC for Sales',
    tagline: 'for Sales',
    version: '1.0.0',
  },
  gradient: {
    start: '#0ea5e9',   // cyan-500 (teal)
    mid1: '#3b82f6',    // blue-500
    mid2: '#6366f1',    // indigo-500
    end: '#8b5cf6',     // violet-500 (purple)
    tailwindClass: 'from-cyan-500 via-blue-500 via-indigo-500 to-violet-500',
  },
  modeColors: {
    DESIGN: '#0ea5e9',   // cyan-500 - start of gradient (strategic)
    OPERATE: '#3b82f6',  // blue-500 - 33% through gradient
    DISPUTE: '#6366f1',  // indigo-500 - 67% through gradient
    OVERSEE: '#8b5cf6',  // violet-500 - end of gradient (monitoring)
  },
  data: {
    entities: [
      'Plan',
      'PlanSection',
      'Policy',
      'Document',
      'Case',
      'Approval',
      'Committee',
      'GovernanceFramework',
      'Template',
    ],
    apiVersion: 'v1',
    databaseSchema: 'sgm',
    apiBasePath: '/api',
  },
  ai: {
    agents: ['POLICY_EXPERT', 'DESIGN', 'UIUX', 'KNOWLEDGE_BASE'],
    features: [
      'suggestions',
      'gap-analysis',
      'compliance-check',
      'risk-scoring',
      'policy-recommendations',
    ],
    modelConfig: {
      primary: 'gpt-4',
      fallback: 'gpt-3.5-turbo',
    },
  },
  lookAndFeel: {
    borderRadius: 'lg',
    spacingScale: 1.0,
  },
  features: {
    multiTenant: true,
    clientDashboards: true,
    committeesEnabled: true,
    documentVersioning: true,
    aiSuggestions: true,
  },
};

// ===========================
// SPARCC for Enterprise - Sales Domain (Yellow)
// ===========================

/**
 * SPARCC Enterprise Sales Module
 *
 * Part of the full ROYGBIV enterprise spectrum.
 * Focuses on sales operations at enterprise scale.
 *
 * Colors: Yellow spectrum (sunshine to gold)
 */
const sparccEnterpriseSales: ModuleConfig = {
  module: {
    id: 'sparcc-sales',
    name: 'Sales',
    productLine: 'SPARCC for Enterprise',
    tagline: 'for Enterprise: Sales',
    version: '2.0.0',
  },
  gradient: {
    start: '#eab308',   // yellow-500
    mid1: '#ca8a04',    // yellow-600
    mid2: '#a16207',    // yellow-700
    end: '#854d0e',     // yellow-800
    tailwindClass: 'from-yellow-500 via-yellow-600 via-yellow-700 to-yellow-800',
  },
  modeColors: distributeGradientToModes({
    start: '#eab308',
    mid1: '#ca8a04',
    mid2: '#a16207',
    end: '#854d0e',
    tailwindClass: '',
  }),
  data: {
    entities: ['Territory', 'Quota', 'Deal', 'Commission', 'Performance'],
    apiVersion: 'v2',
    databaseSchema: 'enterprise_sales',
    apiBasePath: '/api/v2',
  },
  ai: {
    agents: ['FORECASTING', 'PIPELINE_ANALYSIS', 'TERRITORY_OPTIMIZER'],
    features: ['predictive-analytics', 'territory-planning', 'quota-optimization'],
  },
  features: {
    multiTenant: true,
    advancedAnalytics: true,
  },
};

// ===========================
// SPARCC for Enterprise - Finance Domain (Orange)
// ===========================

/**
 * SPARCC Enterprise Finance Module
 *
 * Financial operations and budgeting at enterprise scale.
 *
 * Colors: Orange spectrum (bright to burnt)
 */
const sparccEnterpriseFinance: ModuleConfig = {
  module: {
    id: 'sparcc-finance',
    name: 'Finance',
    productLine: 'SPARCC for Enterprise',
    tagline: 'for Enterprise: Finance',
    version: '2.0.0',
  },
  gradient: {
    start: '#f97316',   // orange-500
    mid1: '#ea580c',    // orange-600
    mid2: '#c2410c',    // orange-700
    end: '#9a3412',     // orange-800
    tailwindClass: 'from-orange-500 via-orange-600 via-orange-700 to-orange-800',
  },
  modeColors: distributeGradientToModes({
    start: '#f97316',
    mid1: '#ea580c',
    mid2: '#c2410c',
    end: '#9a3412',
    tailwindClass: '',
  }),
  data: {
    entities: ['Budget', 'Forecast', 'Transaction', 'Account', 'Report'],
    apiVersion: 'v2',
    databaseSchema: 'enterprise_finance',
    apiBasePath: '/api/v2',
  },
  ai: {
    agents: ['FINANCIAL_ANALYST', 'BUDGET_OPTIMIZER', 'ANOMALY_DETECTOR'],
    features: ['budget-forecasting', 'variance-analysis', 'fraud-detection'],
  },
  features: {
    multiTenant: true,
    advancedAnalytics: true,
  },
};

// ===========================
// Module Registry
// ===========================

/**
 * Available modules map
 */
const availableModules = {
  sgm: sgmModule,
  'sparcc-sales': sparccEnterpriseSales,
  'sparcc-finance': sparccEnterpriseFinance,
  // Add more modules here as they're built...
  // 'sparcc-it': sparccEnterpriseIT,
  // 'sparcc-hr': sparccEnterpriseHR,
  // etc.
};

/**
 * Get initial active module from environment variable
 *
 * Reads NEXT_PUBLIC_SPARCC_MODULE environment variable.
 * Falls back to default module if not set or invalid.
 *
 * @returns Module ID to use as active module
 *
 * @example
 * // .env.local
 * NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance
 *
 * // Result: Finance module will be active
 */
function getInitialActiveModule(): string {
  const defaultModule = 'sgm';

  // Read from environment variable (must be NEXT_PUBLIC_ for client access)
  const envModule = process.env.NEXT_PUBLIC_SPARCC_MODULE;

  // If not set, use default
  if (!envModule) {
    console.log('[MODULE_REGISTRY] No NEXT_PUBLIC_SPARCC_MODULE set, using default: sgm');
    return defaultModule;
  }

  // Check if module exists in available modules
  const moduleExists = envModule in availableModules;

  if (!moduleExists) {
    console.warn(
      `[MODULE_REGISTRY] Invalid module '${envModule}' in NEXT_PUBLIC_SPARCC_MODULE. ` +
      `Valid options: ${Object.keys(availableModules).join(', ')}. ` +
      `Falling back to default: ${defaultModule}`
    );
    return defaultModule;
  }

  console.log(`[MODULE_REGISTRY] Active module set from environment: ${envModule}`);
  return envModule;
}

/**
 * Global module registry
 *
 * Contains all available SPARCC modules.
 * New modules can be added here to make them available platform-wide.
 *
 * Active module is determined by NEXT_PUBLIC_SPARCC_MODULE environment variable.
 */
export const moduleRegistry: ModuleRegistry = {
  modules: availableModules,
  activeModule: getInitialActiveModule(),
  defaultModule: 'sgm',
};

// ===========================
// Module Registry Functions
// ===========================

/**
 * Get the currently active module configuration
 *
 * @returns Active module config
 *
 * @example
 * const module = getActiveModule();
 * console.log(module.module.tagline); // "for Sales"
 * console.log(module.modeColors.DESIGN); // "#8b5cf6"
 */
export function getActiveModule(): ModuleConfig {
  const moduleId = moduleRegistry.activeModule;
  const module = moduleRegistry.modules[moduleId];

  if (!module) {
    console.error(`Active module '${moduleId}' not found in registry, falling back to default`);
    return moduleRegistry.modules[moduleRegistry.defaultModule];
  }

  return module;
}

/**
 * Get module configuration by ID
 *
 * @param moduleId - Module identifier
 * @returns Module config or undefined if not found
 *
 * @example
 * const salesModule = getModuleById('sparcc-sales');
 * if (salesModule) {
 *   console.log(salesModule.module.name); // "Sales"
 * }
 */
export function getModuleById(moduleId: string): ModuleConfig | undefined {
  return moduleRegistry.modules[moduleId];
}

/**
 * Set the active module (FOR DEVELOPMENT/TESTING ONLY)
 *
 * @deprecated This function is for development and testing only.
 * In production, use NEXT_PUBLIC_SPARCC_MODULE environment variable.
 *
 * IMPORTANT: This only changes the in-memory registry. To persist the change,
 * you must reload the page or restart the server with the environment variable set.
 *
 * @param moduleId - Module ID to activate
 * @returns True if successful, false if module not found
 *
 * @example
 * // Development/testing only:
 * if (setActiveModule('sparcc-finance')) {
 *   window.location.reload(); // Must reload to apply
 * }
 *
 * // Production: Set environment variable instead
 * // .env.local
 * // NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance
 */
export function setActiveModule(moduleId: string): boolean {
  console.warn(
    '[MODULE_REGISTRY] setActiveModule() is for development only. ' +
    'In production, set NEXT_PUBLIC_SPARCC_MODULE environment variable.'
  );

  if (!moduleRegistry.modules[moduleId]) {
    console.error(`Cannot set active module: '${moduleId}' not found in registry`);
    return false;
  }

  moduleRegistry.activeModule = moduleId;
  console.log(`Active module changed to: ${moduleId} (in-memory only, reload required)`);
  return true;
}

/**
 * Get all available modules
 *
 * @returns Array of all module configurations
 *
 * @example
 * const modules = getAllModules();
 * modules.forEach(m => console.log(m.module.name));
 */
export function getAllModules(): ModuleConfig[] {
  return Object.values(moduleRegistry.modules);
}

/**
 * Get modules by product line
 *
 * @param productLine - Product line filter (e.g., "SPARCC for Enterprise")
 * @returns Array of modules in that product line
 *
 * @example
 * const enterpriseModules = getModulesByProductLine('SPARCC for Enterprise');
 * // Returns: Sales, Finance, Operations, etc.
 */
export function getModulesByProductLine(productLine: string): ModuleConfig[] {
  return Object.values(moduleRegistry.modules).filter(
    (m) => m.module.productLine === productLine
  );
}

/**
 * Get modules by feature flag
 *
 * @param feature - Feature name to filter by
 * @returns Array of modules with that feature enabled
 *
 * @example
 * const modulesWithAI = getModulesByFeature('aiSuggestions');
 */
export function getModulesByFeature(feature: string): ModuleConfig[] {
  return Object.values(moduleRegistry.modules).filter(
    (m) => m.features && m.features[feature] === true
  );
}

/**
 * Parse a module reference string
 *
 * @param ref - Module reference (e.g., "sgm" or "sgm@1.0.0")
 * @returns Parsed module reference
 *
 * @example
 * parseModuleRef("sgm@1.0.0") // { id: "sgm", version: "1.0.0" }
 * parseModuleRef("sgm") // { id: "sgm" }
 */
export function parseModuleRef(ref: string): ModuleRef {
  const parts = ref.split('@');
  return {
    id: parts[0],
    version: parts[1],
  };
}

/**
 * Build a module reference string
 *
 * @param id - Module ID
 * @param version - Optional version
 * @returns Module reference string
 *
 * @example
 * buildModuleRef("sgm", "1.0.0") // "sgm@1.0.0"
 * buildModuleRef("sgm") // "sgm"
 */
export function buildModuleRef(id: string, version?: string): string {
  return version ? `${id}@${version}` : id;
}

/**
 * Check if a module exists in the registry
 *
 * @param moduleId - Module ID to check
 * @returns True if module exists
 *
 * @example
 * if (moduleExists('sparcc-sales')) {
 *   console.log('Sales module is available');
 * }
 */
export function moduleExists(moduleId: string): boolean {
  return moduleId in moduleRegistry.modules;
}

/**
 * Get module count
 *
 * @returns Total number of registered modules
 *
 * @example
 * console.log(`${getModuleCount()} modules available`);
 */
export function getModuleCount(): number {
  return Object.keys(moduleRegistry.modules).length;
}

/**
 * Register a new module dynamically
 *
 * This allows modules to be added at runtime (e.g., from a plugin system)
 *
 * @param config - Module configuration to register
 * @returns True if successful, false if module ID already exists
 *
 * @example
 * const newModule: ModuleConfig = { ... };
 * if (registerModule(newModule)) {
 *   console.log('Module registered successfully');
 * }
 */
export function registerModule(config: ModuleConfig): boolean {
  if (moduleExists(config.module.id)) {
    console.error(`Module '${config.module.id}' already exists in registry`);
    return false;
  }

  moduleRegistry.modules[config.module.id] = config;
  console.log(`Module '${config.module.id}' registered successfully`);
  return true;
}

/**
 * Unregister a module
 *
 * IMPORTANT: Cannot unregister the default module
 *
 * @param moduleId - Module ID to unregister
 * @returns True if successful, false if module is default or not found
 *
 * @example
 * if (unregisterModule('old-module')) {
 *   console.log('Module removed');
 * }
 */
export function unregisterModule(moduleId: string): boolean {
  if (moduleId === moduleRegistry.defaultModule) {
    console.error('Cannot unregister the default module');
    return false;
  }

  if (!moduleExists(moduleId)) {
    console.error(`Module '${moduleId}' not found in registry`);
    return false;
  }

  delete moduleRegistry.modules[moduleId];
  console.log(`Module '${moduleId}' unregistered`);

  // If we just unregistered the active module, reset to default
  if (moduleRegistry.activeModule === moduleId) {
    moduleRegistry.activeModule = moduleRegistry.defaultModule;
    console.log(`Active module reset to default: ${moduleRegistry.defaultModule}`);
  }

  return true;
}
