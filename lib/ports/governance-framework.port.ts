import type {
  GovernanceFramework,
  CreateGovernanceFramework,
  UpdateGovernanceFramework,
  GovernanceFrameworkFilters,
  GetApplicableFrameworks,
  ApplicableFramework,
  ImportGovernanceFramework,
  CreateFrameworkVersion,
} from '@/lib/contracts/governance-framework.contract';
import type { PlanType } from '@/lib/contracts/plan-template.contract';

/**
 * Governance Framework Port
 * Service interface for SPM governance framework operations
 */
export interface IGovernanceFrameworkPort {
  // =============================================================================
  // FRAMEWORK CRUD
  // =============================================================================

  /**
   * Find all frameworks matching filters
   */
  findAll(filters?: GovernanceFrameworkFilters): Promise<GovernanceFramework[]>;

  /**
   * Find framework by ID
   */
  findById(id: string): Promise<GovernanceFramework | null>;

  /**
   * Find framework by code
   */
  findByCode(code: string): Promise<GovernanceFramework | null>;

  /**
   * Create new framework
   */
  create(data: CreateGovernanceFramework): Promise<GovernanceFramework>;

  /**
   * Update existing framework
   */
  update(data: UpdateGovernanceFramework): Promise<GovernanceFramework>;

  /**
   * Delete framework (soft delete - set status to ARCHIVED)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Hard delete framework (permanent removal)
   */
  hardDelete(id: string): Promise<void>;

  // =============================================================================
  // VERSIONING
  // =============================================================================

  /**
   * Create a new version of a framework
   */
  createVersion(data: CreateFrameworkVersion): Promise<GovernanceFramework>;

  /**
   * Find all versions of a framework
   */
  findVersions(frameworkId: string): Promise<GovernanceFramework[]>;

  /**
   * Find latest version of a framework
   */
  findLatestVersion(code: string): Promise<GovernanceFramework | null>;

  // =============================================================================
  // APPLICABILITY
  // =============================================================================

  /**
   * Get frameworks applicable to a specific plan type
   */
  getApplicableFrameworks(data: GetApplicableFrameworks): Promise<ApplicableFramework[]>;

  /**
   * Find frameworks by plan type
   */
  findByPlanType(planType: PlanType, tenantId: string): Promise<GovernanceFramework[]>;

  /**
   * Find mandatory frameworks
   */
  findMandatory(tenantId: string): Promise<GovernanceFramework[]>;

  /**
   * Find global frameworks (available to all tenants)
   */
  findGlobal(): Promise<GovernanceFramework[]>;

  // =============================================================================
  // IMPORT & EXPORT
  // =============================================================================

  /**
   * Import frameworks from file system
   */
  importFromFiles(data: ImportGovernanceFramework): Promise<GovernanceFramework[]>;

  /**
   * Export framework as markdown
   */
  exportAsMarkdown(frameworkId: string): Promise<string>;

  /**
   * Bulk import frameworks
   */
  bulkImport(frameworks: CreateGovernanceFramework[]): Promise<GovernanceFramework[]>;

  // =============================================================================
  // SEARCH & DISCOVERY
  // =============================================================================

  /**
   * Search frameworks by query string
   */
  search(query: string, tenantId: string): Promise<GovernanceFramework[]>;

  /**
   * Find frameworks by category
   */
  findByCategory(category: string, tenantId: string): Promise<GovernanceFramework[]>;

  /**
   * Count frameworks by category
   */
  countByCategory(tenantId: string): Promise<Record<string, number>>;

  /**
   * Count frameworks by status
   */
  countByStatus(tenantId: string): Promise<Record<string, number>>;

  // =============================================================================
  // VALIDATION
  // =============================================================================

  /**
   * Validate plan against applicable frameworks
   * Returns compliance issues or warnings
   */
  validatePlanCompliance(planId: string): Promise<{
    frameworkCode: string;
    frameworkTitle: string;
    isMandatory: boolean;
    issues: Array<{
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      message: string;
      sectionKey?: string;
    }>;
  }[]>;
}
