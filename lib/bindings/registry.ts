import type { IPolicyPort } from '@/lib/ports/policy.port';
import type { ITerritoryPort } from '@/lib/ports/territory.port';
import type { IApprovalPort } from '@/lib/ports/approval.port';
import type { IAuditPort } from '@/lib/ports/audit.port';
import type { ILinkPort } from '@/lib/ports/link.port';
import type { ISearchPort } from '@/lib/ports/search.port';
import type { IDocumentPort } from '@/lib/ports/document.port';
import type { IFileStoragePort } from '@/lib/ports/file-storage.port';
import type { ICommitteePort } from '@/lib/ports/committee.port';

import type { BindingConfig } from '@/lib/config/binding-config';
import { loadBindingConfig } from '@/lib/config/binding-config';

/**
 * Provider Registry
 *
 * Resolves port interfaces to concrete provider implementations based on
 * binding configuration. Acts as a service locator for dependency injection.
 */
export class ProviderRegistry {
  private config: BindingConfig;

  constructor(config?: BindingConfig) {
    this.config = config || loadBindingConfig();
  }

  /**
   * Get Policy provider
   */
  getPolicy(): IPolicyPort {
    const mode = this.config.providers.policy;

    switch (mode) {
      case 'synthetic':
        // Import and return synthetic provider (dynamic import for tree-shaking)
        const { SyntheticPolicyProvider } = require('@/lib/bindings/synthetic/policy.synthetic');
        return new SyntheticPolicyProvider();

      case 'mapped':
        throw new Error('Mapped policy provider not implemented yet');

      case 'live':
        const { LivePolicyProvider } = require('@/lib/bindings/live/policy.live');
        return new LivePolicyProvider();

      default:
        throw new Error(`Unknown binding mode for policy: ${mode}`);
    }
  }

  /**
   * Get Territory provider
   */
  getTerritory(): ITerritoryPort {
    const mode = this.config.providers.territory;

    switch (mode) {
      case 'synthetic':
        const { SyntheticTerritoryProvider } = require('@/lib/bindings/synthetic/territory.synthetic');
        return new SyntheticTerritoryProvider();

      case 'mapped':
        throw new Error('Mapped territory provider not implemented yet');

      case 'live':
        throw new Error('Live territory provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for territory: ${mode}`);
    }
  }

  /**
   * Get Approval provider
   */
  getApproval(): IApprovalPort {
    const mode = this.config.providers.approval;

    switch (mode) {
      case 'synthetic':
        const { SyntheticApprovalProvider } = require('@/lib/bindings/synthetic/approval.synthetic');
        return new SyntheticApprovalProvider();

      case 'mapped':
        throw new Error('Mapped approval provider not implemented yet');

      case 'live':
        throw new Error('Live approval provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for approval: ${mode}`);
    }
  }

  /**
   * Get Audit provider
   */
  getAudit(): IAuditPort {
    const mode = this.config.providers.audit;

    switch (mode) {
      case 'synthetic':
        const { SyntheticAuditProvider } = require('@/lib/bindings/synthetic/audit.synthetic');
        return new SyntheticAuditProvider();

      case 'mapped':
        throw new Error('Mapped audit provider not implemented yet');

      case 'live':
        throw new Error('Live audit provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for audit: ${mode}`);
    }
  }

  /**
   * Get Link provider
   */
  getLink(): ILinkPort {
    const mode = this.config.providers.link;

    switch (mode) {
      case 'synthetic':
        const { SyntheticLinkProvider } = require('@/lib/bindings/synthetic/link.synthetic');
        return new SyntheticLinkProvider();

      case 'mapped':
        throw new Error('Mapped link provider not implemented yet');

      case 'live':
        throw new Error('Live link provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for link: ${mode}`);
    }
  }

  /**
   * Get Search provider
   */
  getSearch(): ISearchPort {
    const mode = this.config.providers.search;

    switch (mode) {
      case 'synthetic':
        const { SyntheticSearchProvider } = require('@/lib/bindings/synthetic/search.synthetic');
        return new SyntheticSearchProvider();

      case 'mapped':
        throw new Error('Mapped search provider not implemented yet');

      case 'live':
        throw new Error('Live search provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for search: ${mode}`);
    }
  }

  /**
   * Get Document provider
   */
  getDocument(): IDocumentPort {
    const mode = this.config.providers.document || 'synthetic';

    switch (mode) {
      case 'synthetic':
        const { SyntheticDocumentProvider } = require('@/lib/bindings/synthetic/document.synthetic');
        return new SyntheticDocumentProvider();

      case 'mapped':
        throw new Error('Mapped document provider not implemented yet');

      case 'live':
        throw new Error('Live document provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for document: ${mode}`);
    }
  }

  /**
   * Get Committee provider
   */
  getCommittee(): ICommitteePort {
    const mode = this.config.providers.committee || 'synthetic';

    switch (mode) {
      case 'synthetic':
        const { SyntheticCommitteeProvider } = require('@/lib/bindings/synthetic/committee.synthetic');
        return new SyntheticCommitteeProvider();

      case 'mapped':
        throw new Error('Mapped committee provider not implemented yet');

      case 'live':
        throw new Error('Live committee provider not implemented yet');

      default:
        throw new Error(`Unknown binding mode for committee: ${mode}`);
    }
  }

  /**
   * Get File Storage provider
   */
  getFileStorage(): IFileStoragePort {
    // For now, always use synthetic (in-memory) file storage
    // In production, this would be configurable for S3/local storage
    const { SyntheticFileStorageProvider } = require('@/lib/bindings/synthetic/file-storage.synthetic');
    return new SyntheticFileStorageProvider();
  }

  /**
   * Get current binding configuration
   */
  getConfig(): BindingConfig {
    return this.config;
  }

  /**
   * Get diagnostic information about active bindings
   */
  getDiagnostics() {
    const databaseUrl = process.env.DATABASE_URL || '';
    const hasSchemaParam = databaseUrl.includes('schema=sgm_summit_demo');
    const hasLiveProvider = Object.values(this.config.providers).some(
      (mode) => mode === 'live'
    );

    return {
      providers: this.config.providers,
      modes: {
        policy: this.config.providers.policy,
        territory: this.config.providers.territory,
        approval: this.config.providers.approval,
        audit: this.config.providers.audit,
        link: this.config.providers.link,
        search: this.config.providers.search,
        document: this.config.providers.document || 'synthetic',
        committee: this.config.providers.committee || 'synthetic',
      },
      hasExternalDependencies: Object.values(this.config.providers).some(
        (mode) => mode !== 'synthetic'
      ),
      database: {
        hasUrl: !!databaseUrl,
        hasSchemaParam,
        schemaTarget: hasSchemaParam ? 'sgm_summit_demo' : 'MISSING/INVALID',
        isLiveMode: hasLiveProvider,
      },
    };
  }
}

/**
 * Singleton registry instance
 */
let _registry: ProviderRegistry | null = null;

export function getRegistry(): ProviderRegistry {
  if (!_registry) {
    _registry = new ProviderRegistry();
  }
  return _registry;
}

/**
 * Reset registry (useful for testing)
 */
export function resetRegistry(): void {
  _registry = null;
}
