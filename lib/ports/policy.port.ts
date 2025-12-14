import type {
  Policy,
  CreatePolicy,
  UpdatePolicy,
  PolicyFilters,
} from '@/lib/contracts/policy.contract';

/**
 * IPolicyPort - Service interface for Policy operations
 *
 * Defines the contract for policy data access without specifying implementation.
 * Implementations: SyntheticPolicyProvider, MappedPolicyProvider, LivePolicyProvider
 */
export interface IPolicyPort {
  /**
   * Find all policies matching filters
   */
  findAll(filters?: PolicyFilters): Promise<Policy[]>;

  /**
   * Find policy by ID
   */
  findById(id: string): Promise<Policy | null>;

  /**
   * Find policies by status
   */
  findByStatus(tenantId: string, status: Policy['status']): Promise<Policy[]>;

  /**
   * Find active policies (published, not expired)
   */
  findActive(tenantId: string, asOfDate?: Date): Promise<Policy[]>;

  /**
   * Find policy versions (all versions of a policy lineage)
   */
  findVersions(policyId: string): Promise<Policy[]>;

  /**
   * Find latest version of a policy
   */
  findLatestVersion(tenantId: string, name: string): Promise<Policy | null>;

  /**
   * Create new policy
   */
  create(data: CreatePolicy): Promise<Policy>;

  /**
   * Update existing policy
   */
  update(data: UpdatePolicy): Promise<Policy>;

  /**
   * Create new version of existing policy
   * - Creates new policy with incremented version
   * - Marks previous version as superseded
   * - Links versions via supersededByPolicyId
   */
  createVersion(
    policyId: string,
    changes: Partial<Policy>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Policy>;

  /**
   * Publish policy (draft → published)
   */
  publish(policyId: string, publishedBy: string): Promise<Policy>;

  /**
   * Retire policy (published → retired)
   */
  retire(policyId: string, retiredBy: string): Promise<Policy>;

  /**
   * Delete policy (soft delete for audit)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Count policies by status
   */
  countByStatus(tenantId: string): Promise<Record<string, number>>;

  /**
   * Search policies (full-text)
   */
  search(tenantId: string, query: string): Promise<Policy[]>;
}
