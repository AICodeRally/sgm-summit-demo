import type { IPolicyPort } from '@/lib/ports/policy.port';
import type {
  Policy,
  CreatePolicy,
  UpdatePolicy,
  PolicyFilters,
} from '@/lib/contracts/policy.contract';
import { nextVersion } from '@/lib/contracts/policy.contract';
import { syntheticPolicies } from '@/lib/data/synthetic';

/**
 * SyntheticPolicyProvider
 *
 * In-memory implementation of IPolicyPort for demo purposes.
 * Zero external dependencies - instant demo-ready.
 */
export class SyntheticPolicyProvider implements IPolicyPort {
  private policies: Map<string, Policy>;

  constructor() {
    // Load synthetic data into memory
    this.policies = new Map(syntheticPolicies.map((p) => [p.id, p]));
  }

  /**
   * Find all policies matching filters
   */
  async findAll(filters?: PolicyFilters): Promise<Policy[]> {
    let results = Array.from(this.policies.values());

    if (!filters) return results;

    // Apply filters
    if (filters.tenantId) {
      results = results.filter((p) => p.tenantId === filters.tenantId);
    }

    if (filters.status) {
      results = results.filter((p) => p.status === filters.status);
    }

    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.effectiveBefore) {
      results = results.filter((p) => p.effectiveDate <= filters.effectiveBefore!);
    }

    if (filters.effectiveAfter) {
      results = results.filter((p) => p.effectiveDate >= filters.effectiveAfter!);
    }

    if (filters.createdBy) {
      results = results.filter((p) => p.createdBy === filters.createdBy);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );
    }

    // Sort by effectiveDate descending (most recent first)
    return results.sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
  }

  /**
   * Find policy by ID
   */
  async findById(id: string): Promise<Policy | null> {
    return this.policies.get(id) || null;
  }

  /**
   * Find policies by status
   */
  async findByStatus(tenantId: string, status: Policy['status']): Promise<Policy[]> {
    return this.findAll({ tenantId, status });
  }

  /**
   * Find active policies (published, not expired)
   */
  async findActive(tenantId: string, asOfDate?: Date): Promise<Policy[]> {
    const now = asOfDate || new Date();

    return Array.from(this.policies.values()).filter(
      (p) =>
        p.tenantId === tenantId &&
        p.status === 'published' &&
        p.effectiveDate <= now &&
        (!p.expirationDate || p.expirationDate > now)
    );
  }

  /**
   * Find policy versions (all versions of a policy lineage)
   */
  async findVersions(policyId: string): Promise<Policy[]> {
    const policy = this.policies.get(policyId);
    if (!policy) return [];

    const versions: Policy[] = [policy];

    // Find superseded versions
    let currentId: string | undefined = policy.id;
    while (currentId) {
      const current = this.policies.get(currentId);
      if (!current?.supersededByPolicyId) break;

      const superseded = Array.from(this.policies.values()).find(
        (p) => p.supersededByPolicyId === currentId
      );

      if (superseded) {
        versions.push(superseded);
        currentId = superseded.id;
      } else {
        break;
      }
    }

    // Find newer versions
    let supersededBy = policy.supersededByPolicyId;
    while (supersededBy) {
      const newer = this.policies.get(supersededBy);
      if (!newer) break;

      versions.unshift(newer);
      supersededBy = newer.supersededByPolicyId;
    }

    return versions;
  }

  /**
   * Find latest version of a policy
   */
  async findLatestVersion(tenantId: string, name: string): Promise<Policy | null> {
    const policies = Array.from(this.policies.values()).filter(
      (p) => p.tenantId === tenantId && p.name === name
    );

    if (policies.length === 0) return null;

    // Sort by version descending
    policies.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.version.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.version.split('.').map(Number);

      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

    return policies[0];
  }

  /**
   * Create new policy
   */
  async create(data: CreatePolicy): Promise<Policy> {
    const policy: Policy = {
      ...data,
      id: `pol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      version: data.version || '0.1.0',
      createdAt: new Date(),
    };

    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Update existing policy
   */
  async update(data: UpdatePolicy): Promise<Policy> {
    const existing = this.policies.get(data.id);
    if (!existing) {
      throw new Error(`Policy ${data.id} not found`);
    }

    const updated: Policy = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.policies.set(updated.id, updated);
    return updated;
  }

  /**
   * Create new version of existing policy
   */
  async createVersion(
    policyId: string,
    changes: Partial<Policy>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Policy> {
    const existing = this.policies.get(policyId);
    if (!existing) {
      throw new Error(`Policy ${policyId} not found`);
    }

    // Create new version
    const newVersion = nextVersion(existing.version, bumpType);
    const newPolicy: Policy = {
      ...existing,
      ...changes,
      id: `pol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: newVersion,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      supersededByPolicyId: undefined,
    };

    // Mark old version as superseded
    const superseded: Policy = {
      ...existing,
      status: 'superseded',
      supersededByPolicyId: newPolicy.id,
      expirationDate: new Date(),
      updatedAt: new Date(),
    };

    this.policies.set(superseded.id, superseded);
    this.policies.set(newPolicy.id, newPolicy);

    return newPolicy;
  }

  /**
   * Publish policy (draft → published)
   */
  async publish(policyId: string, publishedBy: string): Promise<Policy> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    if (policy.status !== 'draft') {
      throw new Error(`Can only publish draft policies. Current status: ${policy.status}`);
    }

    const published: Policy = {
      ...policy,
      status: 'published',
      approvedBy: publishedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    };

    this.policies.set(published.id, published);
    return published;
  }

  /**
   * Retire policy (published → retired)
   */
  async retire(policyId: string, retiredBy: string): Promise<Policy> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    const retired: Policy = {
      ...policy,
      status: 'retired',
      expirationDate: new Date(),
      updatedBy: retiredBy,
      updatedAt: new Date(),
    };

    this.policies.set(retired.id, retired);
    return retired;
  }

  /**
   * Delete policy (soft delete)
   */
  async delete(id: string, deletedBy: string): Promise<void> {
    const policy = this.policies.get(id);
    if (!policy) {
      throw new Error(`Policy ${id} not found`);
    }

    // In synthetic mode, just remove from map
    // In live mode, this would be a soft delete with deletedAt timestamp
    this.policies.delete(id);
  }

  /**
   * Count policies by status
   */
  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const policies = Array.from(this.policies.values()).filter((p) => p.tenantId === tenantId);

    const counts: Record<string, number> = {
      draft: 0,
      published: 0,
      superseded: 0,
      retired: 0,
    };

    policies.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });

    return counts;
  }

  /**
   * Search policies (full-text)
   */
  async search(tenantId: string, query: string): Promise<Policy[]> {
    return this.findAll({ tenantId, search: query });
  }
}
