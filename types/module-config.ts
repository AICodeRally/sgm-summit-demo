/**
 * SPARCC Module Configuration System
 *
 * Defines the contract for plugging in new SPARCC modules with custom colors,
 * data contracts, AI capabilities, and look & feel settings.
 *
 * This enables the platform to power dozens of SPARCC products:
 * - SPARCC for Sales (Blue→Purple gradient)
 * - SPARCC for Enterprise (ROYGBIV spectrum - 10 domains)
 * - Custom modules with unique gradients
 */

/**
 * Module gradient definition
 * Supports 2-7 color stops that automatically distribute to 4 operational modes
 */
export interface ModuleGradient {
  /** Starting color of gradient (hex) */
  start: string;
  /** Optional mid-point colors for multi-stop gradients */
  mid1?: string;
  mid2?: string;
  mid3?: string;
  /** Ending color of gradient (hex) */
  end: string;
  /** Tailwind gradient class for direct use (e.g., "from-cyan-500 via-blue-500 to-violet-500") */
  tailwindClass: string;
}

/**
 * Module identity and branding
 */
export interface ModuleIdentity {
  /** Unique module identifier (slug) */
  id: string;
  /** Display name */
  name: string;
  /** Parent product line (e.g., "SPARCC for Sales", "SPARCC for Enterprise") */
  productLine: string;
  /** Short tagline shown in navbar (e.g., "for Sales", "for Enterprise: Finance") */
  tagline: string;
  /** Optional logo URL or component name */
  logo?: string;
  /** Module version (semver) */
  version: string;
}

/**
 * Colors for the 4 operational modes, auto-distributed from module gradient
 */
export interface ModeModeColors {
  /** Color for Design mode (hex) - typically end of gradient (strategic) */
  DESIGN: string;
  /** Color for Operate mode (hex) - typically 67% through gradient */
  OPERATE: string;
  /** Color for Dispute mode (hex) - typically 33% through gradient */
  DISPUTE: string;
  /** Color for Oversee mode (hex) - typically start of gradient (monitoring) */
  OVERSEE: string;
}

/**
 * Data contract defining module's entity model and API structure
 */
export interface DataContract {
  /** Core entity types for this module (e.g., ['Plan', 'Policy', 'Document']) */
  entities: string[];
  /** API version identifier (e.g., 'v1', 'v2') */
  apiVersion: string;
  /** Database schema/namespace for this module */
  databaseSchema: string;
  /** Optional: Custom API base path (defaults to /api) */
  apiBasePath?: string;
}

/**
 * AI capabilities configuration for module-specific agents and features
 */
export interface AICapabilities {
  /** Available AI agent types for this module */
  agents: string[];
  /** AI-powered features enabled (e.g., ['suggestions', 'gap-analysis']) */
  features: string[];
  /** Optional LLM model preferences */
  modelConfig?: {
    primary: string;
    fallback: string;
  };
}

/**
 * Look and feel customizations for visual consistency
 */
export interface LookAndFeel {
  /** Font family override (defaults to system font) */
  fontFamily?: string;
  /** Border radius style preference */
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  /** Spacing scale multiplier for consistent spacing */
  spacingScale?: number;
  /** Component-specific style overrides */
  componentOverrides?: Record<string, any>;
}

/**
 * Complete module configuration
 *
 * This is the "input connector" for plugging in new SPARCC modules.
 *
 * Example usage:
 * ```typescript
 * const sgmModule: ModuleConfig = {
 *   module: { id: 'sgm', tagline: 'for Sales', ... },
 *   gradient: { start: '#0ea5e9', end: '#8b5cf6', ... },
 *   modeColors: { DESIGN: '#8b5cf6', OPERATE: '#6366f1', ... },
 *   data: { entities: ['Plan', 'Policy'], ... },
 *   ai: { agents: ['POLICY_EXPERT'], ... }
 * };
 * ```
 */
export interface ModuleConfig {
  /** Module identity and branding */
  module: ModuleIdentity;
  /** Color gradient for the module */
  gradient: ModuleGradient;
  /** Auto-distributed mode colors (generated from gradient) */
  modeColors: ModeModeColors;
  /** Data contracts and schemas */
  data: DataContract;
  /** AI capabilities configuration */
  ai: AICapabilities;
  /** Optional look and feel customizations */
  lookAndFeel?: LookAndFeel;
  /** Optional feature flags specific to this module */
  features?: Record<string, boolean>;
}

/**
 * Module registry containing all available SPARCC modules
 */
export interface ModuleRegistry {
  /** Map of module ID to configuration */
  modules: Record<string, ModuleConfig>;
  /** Currently active module ID */
  activeModule: string;
  /** Default module if none specified */
  defaultModule: string;
}

/**
 * Parsed pack reference for routing and resolution
 */
export interface ModuleRef {
  /** Module ID */
  id: string;
  /** Module version (optional) */
  version?: string;
}
