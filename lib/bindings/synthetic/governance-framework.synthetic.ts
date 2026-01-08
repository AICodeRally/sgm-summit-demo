import type { IGovernanceFrameworkPort } from '@/lib/ports/governance-framework.port';
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
import { syntheticGovernanceFrameworks } from '@/lib/data/synthetic/governance-frameworks.data';
import { isDemoDataEnabled } from '@/lib/config/binding-config';

/**
 * SyntheticGovernanceFrameworkProvider
 *
 * In-memory implementation of IGovernanceFrameworkPort for demo purposes.
 * Zero external dependencies - instant demo-ready.
 *
 * Demo data is loaded only if ENABLE_DEMO_DATA=true in environment.
 */
export class SyntheticGovernanceFrameworkProvider implements IGovernanceFrameworkPort {
  private frameworks: Map<string, GovernanceFramework>;

  constructor() {
    // Load synthetic data into memory only if demo data is enabled
    const demoEnabled = isDemoDataEnabled();
    this.frameworks = new Map(demoEnabled ? syntheticGovernanceFrameworks.map((f) => [f.id, f]) : []);
  }

  // =============================================================================
  // FRAMEWORK CRUD
  // =============================================================================

  async findAll(filters?: GovernanceFrameworkFilters): Promise<GovernanceFramework[]> {
    let results = Array.from(this.frameworks.values());

    if (!filters) return results;

    // Apply filters
    if (filters.tenantId) {
      results = results.filter((f) => f.tenantId === filters.tenantId || f.isGlobal);
    }

    if (filters.category) {
      results = results.filter((f) => f.category === filters.category);
    }

    if (filters.status) {
      results = results.filter((f) => f.status === filters.status);
    }

    if (filters.isGlobal !== undefined) {
      results = results.filter((f) => f.isGlobal === filters.isGlobal);
    }

    if (filters.isMandatory !== undefined) {
      results = results.filter((f) => f.isMandatory === filters.isMandatory);
    }

    if (filters.applicableTo) {
      results = results.filter((f) =>
        f.applicableTo && f.applicableTo.includes(filters.applicableTo!)
      );
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.content.toLowerCase().includes(query) ||
          f.code.toLowerCase().includes(query)
      );
    }

    // Sort by code ascending
    return results.sort((a, b) => a.code.localeCompare(b.code));
  }

  async findById(id: string): Promise<GovernanceFramework | null> {
    return this.frameworks.get(id) || null;
  }

  async findByCode(code: string): Promise<GovernanceFramework | null> {
    return (
      Array.from(this.frameworks.values()).find((f) => f.code === code) || null
    );
  }

  async create(data: CreateGovernanceFramework): Promise<GovernanceFramework> {
    const framework: GovernanceFramework = {
      id: `fw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.frameworks.set(framework.id, framework);
    return framework;
  }

  async update(data: UpdateGovernanceFramework): Promise<GovernanceFramework> {
    const existing = this.frameworks.get(data.id);
    if (!existing) {
      throw new Error(`Framework not found: ${data.id}`);
    }

    const updated: GovernanceFramework = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.frameworks.set(updated.id, updated);
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const framework = this.frameworks.get(id);
    if (!framework) {
      throw new Error(`Framework not found: ${id}`);
    }

    // Soft delete - set status to ARCHIVED
    await this.update({
      id,
      status: 'ARCHIVED',
    });
  }

  async hardDelete(id: string): Promise<void> {
    this.frameworks.delete(id);
  }

  // =============================================================================
  // VERSIONING
  // =============================================================================

  async createVersion(data: CreateFrameworkVersion): Promise<GovernanceFramework> {
    const existing = await this.findById(data.frameworkId);
    if (!existing) {
      throw new Error(`Framework not found: ${data.frameworkId}`);
    }

    // Parse version and bump
    const [major, minor, patch] = existing.version.split('.').map(Number);
    let newVersion: string;

    switch (data.bumpType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    // Create new version
    const newFramework: GovernanceFramework = {
      ...existing,
      ...data.changes,
      id: `fw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: newVersion,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy,
    };

    this.frameworks.set(newFramework.id, newFramework);

    // Mark old version as superseded
    existing.status = 'SUPERSEDED';
    this.frameworks.set(existing.id, existing);

    return newFramework;
  }

  async findVersions(frameworkId: string): Promise<GovernanceFramework[]> {
    const framework = await this.findById(frameworkId);
    if (!framework) return [];

    // Find all frameworks with same code (different versions)
    return Array.from(this.frameworks.values())
      .filter((f) => f.code === framework.code)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findLatestVersion(code: string): Promise<GovernanceFramework | null> {
    const versions = Array.from(this.frameworks.values())
      .filter((f) => f.code === code && f.status !== 'SUPERSEDED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return versions[0] || null;
  }

  // =============================================================================
  // APPLICABILITY
  // =============================================================================

  async getApplicableFrameworks(
    data: GetApplicableFrameworks
  ): Promise<ApplicableFramework[]> {
    const frameworks = await this.findAll({
      tenantId: data.tenantId,
      applicableTo: data.planType,
      status: 'ACTIVE',
    });

    // Filter by mandatory if needed
    const filtered = data.includeOptional
      ? frameworks
      : frameworks.filter((f) => f.isMandatory);

    return filtered.map((f) => ({
      frameworkCode: f.code,
      title: f.title,
      category: f.category,
      mandatoryCompliance: f.isMandatory,
      relevantSections: [], // Would parse content in real implementation
      content: f.content,
      version: f.version,
    }));
  }

  async findByPlanType(
    planType: PlanType,
    tenantId: string
  ): Promise<GovernanceFramework[]> {
    return this.findAll({
      tenantId,
      applicableTo: planType,
      status: 'ACTIVE',
    });
  }

  async findMandatory(tenantId: string): Promise<GovernanceFramework[]> {
    return this.findAll({
      tenantId,
      isMandatory: true,
      status: 'ACTIVE',
    });
  }

  async findGlobal(): Promise<GovernanceFramework[]> {
    return this.findAll({
      isGlobal: true,
      status: 'ACTIVE',
    });
  }

  // =============================================================================
  // IMPORT & EXPORT
  // =============================================================================

  async importFromFiles(
    data: ImportGovernanceFramework
  ): Promise<GovernanceFramework[]> {
    // In real implementation, would read files from sourcePath
    // For synthetic mode, return empty array
    return [];
  }

  async exportAsMarkdown(frameworkId: string): Promise<string> {
    const framework = await this.findById(frameworkId);
    if (!framework) {
      throw new Error(`Framework not found: ${frameworkId}`);
    }

    return framework.content;
  }

  async bulkImport(
    frameworks: CreateGovernanceFramework[]
  ): Promise<GovernanceFramework[]> {
    const created: GovernanceFramework[] = [];

    for (const data of frameworks) {
      const framework = await this.create(data);
      created.push(framework);
    }

    return created;
  }

  // =============================================================================
  // SEARCH & DISCOVERY
  // =============================================================================

  async search(query: string, tenantId: string): Promise<GovernanceFramework[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findByCategory(
    category: string,
    tenantId: string
  ): Promise<GovernanceFramework[]> {
    return this.findAll({ tenantId, category: category as any });
  }

  async countByCategory(tenantId: string): Promise<Record<string, number>> {
    const frameworks = await this.findAll({ tenantId });
    const counts: Record<string, number> = {};

    for (const framework of frameworks) {
      counts[framework.category] = (counts[framework.category] || 0) + 1;
    }

    return counts;
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const frameworks = await this.findAll({ tenantId });
    const counts: Record<string, number> = {};

    for (const framework of frameworks) {
      counts[framework.status] = (counts[framework.status] || 0) + 1;
    }

    return counts;
  }

  // =============================================================================
  // VALIDATION
  // =============================================================================

  async validatePlanCompliance(planId: string): Promise<
    {
      frameworkCode: string;
      frameworkTitle: string;
      isMandatory: boolean;
      issues: Array<{
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        message: string;
        sectionKey?: string;
      }>;
    }[]
  > {
    // In real implementation, would analyze plan against frameworks
    // For synthetic mode, return empty validation results
    return [];
  }
}
