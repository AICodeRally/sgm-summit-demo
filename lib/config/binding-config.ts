/**
 * Binding Configuration
 *
 * Defines which provider implementation to use for each port.
 * Modes: synthetic (in-memory) | mapped (external API) | live (Prisma DB)
 */

export type BindingMode = 'synthetic' | 'mapped' | 'live';

export interface BindingConfig {
  /**
   * Provider mode selection per port
   */
  providers: {
    policy: BindingMode;
    territory: BindingMode;
    approval: BindingMode;
    audit: BindingMode;
    link: BindingMode;
    search: BindingMode;
    document?: BindingMode;
    committee?: BindingMode;
  };

  /**
   * Mapped mode configuration (when mode = 'mapped')
   */
  mapped?: {
    apiBaseUrl: string;
    apiKey?: string;
    timeout?: number;
  };

  /**
   * Live mode configuration (when mode = 'live')
   */
  live?: {
    databaseUrl: string;
    poolSize?: number;
  };
}

/**
 * Default configuration (synthetic mode for all providers)
 */
export const defaultBindingConfig: BindingConfig = {
  providers: {
    policy: 'synthetic',
    territory: 'synthetic',
    approval: 'synthetic',
    audit: 'synthetic',
    link: 'synthetic',
    search: 'synthetic',
    document: 'synthetic',
    committee: 'synthetic',
  },
};

/**
 * Load configuration from environment variables
 */
export function loadBindingConfig(): BindingConfig {
  const mode = (process.env.BINDING_MODE || 'synthetic') as BindingMode;

  return {
    providers: {
      policy: (process.env.BINDING_MODE_POLICY || mode) as BindingMode,
      territory: (process.env.BINDING_MODE_TERRITORY || mode) as BindingMode,
      approval: (process.env.BINDING_MODE_APPROVAL || mode) as BindingMode,
      audit: (process.env.BINDING_MODE_AUDIT || mode) as BindingMode,
      link: (process.env.BINDING_MODE_LINK || mode) as BindingMode,
      search: (process.env.BINDING_MODE_SEARCH || mode) as BindingMode,
      document: (process.env.BINDING_MODE_DOCUMENT || mode) as BindingMode,
      committee: (process.env.BINDING_MODE_COMMITTEE || mode) as BindingMode,
    },
    mapped: process.env.EXTERNAL_API_URL
      ? {
          apiBaseUrl: process.env.EXTERNAL_API_URL,
          apiKey: process.env.EXTERNAL_API_KEY,
          timeout: parseInt(process.env.API_TIMEOUT || '5000'),
        }
      : undefined,
    live: process.env.DATABASE_URL
      ? {
          databaseUrl: process.env.DATABASE_URL,
          poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
        }
      : undefined,
  };
}
