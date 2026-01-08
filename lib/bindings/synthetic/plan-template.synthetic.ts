import type { IPlanTemplatePort } from '@/lib/ports/plan-template.port';
import type {
  PlanTemplate,
  CreatePlanTemplate,
  UpdatePlanTemplate,
  ClonePlanTemplate,
  PlanTemplateFilters,
  TemplateUsageStats,
} from '@/lib/contracts/plan-template.contract';
import type {
  TemplateSection,
  CreateTemplateSection,
  UpdateTemplateSection,
  TemplateSectionTree,
  ReorderSections,
} from '@/lib/contracts/template-section.contract';
import { syntheticPlanTemplates, syntheticTemplateSections } from '@/lib/data/synthetic/plan-templates.data';
import { isDemoDataEnabled } from '@/lib/config/binding-config';

/**
 * SyntheticPlanTemplateProvider
 *
 * In-memory implementation of IPlanTemplatePort for demo purposes.
 * Zero external dependencies - instant demo-ready.
 *
 * Demo data is loaded only if ENABLE_DEMO_DATA=true in environment.
 */
export class SyntheticPlanTemplateProvider implements IPlanTemplatePort {
  private templates: Map<string, PlanTemplate>;
  private sections: Map<string, TemplateSection>;

  constructor() {
    // Load synthetic data into memory only if demo data is enabled
    const demoEnabled = isDemoDataEnabled();
    this.templates = new Map(demoEnabled ? syntheticPlanTemplates.map((t) => [t.id, t]) : []);
    this.sections = new Map(demoEnabled ? syntheticTemplateSections.map((s) => [s.id, s]) : []);
  }

  // =============================================================================
  // TEMPLATE CRUD
  // =============================================================================

  async findAll(filters?: PlanTemplateFilters): Promise<PlanTemplate[]> {
    let results = Array.from(this.templates.values());

    if (!filters) return results;

    // Apply filters
    if (filters.tenantId) {
      results = results.filter((t) => t.tenantId === filters.tenantId);
    }

    if (filters.planType) {
      results = results.filter((t) => t.planType === filters.planType);
    }

    if (filters.status) {
      results = results.filter((t) => t.status === filters.status);
    }

    if (filters.isSystemTemplate !== undefined) {
      results = results.filter((t) => t.isSystemTemplate === filters.isSystemTemplate);
    }

    if (filters.owner) {
      results = results.filter((t) => t.owner === filters.owner);
    }

    if (filters.category) {
      results = results.filter((t) => t.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((t) =>
        filters.tags!.some((tag) => t.tags?.includes(tag))
      );
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query)
      );
    }

    // Sort by lastUpdated descending
    return results.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  async findById(id: string): Promise<PlanTemplate | null> {
    return this.templates.get(id) || null;
  }

  async findByCode(tenantId: string, code: string): Promise<PlanTemplate | null> {
    return (
      Array.from(this.templates.values()).find(
        (t) => t.tenantId === tenantId && t.code === code
      ) || null
    );
  }

  async create(data: CreatePlanTemplate): Promise<PlanTemplate> {
    const template: PlanTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
      lastUpdated: new Date(),
      usageCount: 0,
    };

    this.templates.set(template.id, template);
    return template;
  }

  async update(data: UpdatePlanTemplate): Promise<PlanTemplate> {
    const existing = this.templates.get(data.id);
    if (!existing) {
      throw new Error(`Template not found: ${data.id}`);
    }

    const updated: PlanTemplate = {
      ...existing,
      ...data,
      lastUpdated: new Date(),
    };

    this.templates.set(updated.id, updated);
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    // Soft delete - set status to ARCHIVED
    await this.update({
      id,
      status: 'ARCHIVED',
    });
  }

  async hardDelete(id: string): Promise<void> {
    // Delete all sections first
    const sections = await this.getSections(id);
    for (const section of sections) {
      this.sections.delete(section.id);
    }

    // Delete template
    this.templates.delete(id);
  }

  // =============================================================================
  // VERSIONING
  // =============================================================================

  async createVersion(
    templateId: string,
    changes: Partial<PlanTemplate>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<PlanTemplate> {
    const existing = await this.findById(templateId);
    if (!existing) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Parse version and bump
    const [major, minor, patch] = existing.version.split('.').map(Number);
    let newVersion: string;

    switch (bumpType) {
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
    const newTemplate: PlanTemplate = {
      ...existing,
      ...changes,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: newVersion,
      createdAt: new Date(),
      lastUpdated: new Date(),
      usageCount: 0,
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async findVersions(templateId: string): Promise<PlanTemplate[]> {
    const template = await this.findById(templateId);
    if (!template) return [];

    // Find all templates with same code (different versions)
    return Array.from(this.templates.values())
      .filter((t) => t.code === template.code)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findLatestVersion(tenantId: string, code: string): Promise<PlanTemplate | null> {
    const versions = Array.from(this.templates.values())
      .filter((t) => t.tenantId === tenantId && t.code === code)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return versions[0] || null;
  }

  // =============================================================================
  // CLONING
  // =============================================================================

  async clone(data: ClonePlanTemplate): Promise<PlanTemplate> {
    const source = await this.findById(data.sourceTemplateId);
    if (!source) {
      throw new Error(`Source template not found: ${data.sourceTemplateId}`);
    }

    // Clone template
    const cloned: PlanTemplate = {
      ...source,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: data.newCode,
      name: data.newName,
      owner: data.newOwner,
      createdBy: data.clonedBy,
      source: 'CLONED',
      isSystemTemplate: false,
      clonedFromId: source.id,
      createdAt: new Date(),
      lastUpdated: new Date(),
      usageCount: 0,
    };

    this.templates.set(cloned.id, cloned);

    // Clone sections if requested
    if (data.customizeSections) {
      const sourceSections = await this.getSections(source.id);
      for (const section of sourceSections) {
        const clonedSection: TemplateSection = {
          ...section,
          id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: cloned.id,
        };
        this.sections.set(clonedSection.id, clonedSection);
      }
    }

    return cloned;
  }

  // =============================================================================
  // SECTION MANAGEMENT
  // =============================================================================

  async getSections(templateId: string): Promise<TemplateSection[]> {
    return Array.from(this.sections.values())
      .filter((s) => s.templateId === templateId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getSectionTree(templateId: string): Promise<TemplateSectionTree[]> {
    const sections = await this.getSections(templateId);

    // Build tree structure
    const buildTree = (parentId: string | undefined): TemplateSectionTree[] => {
      return sections
        .filter((s) => s.parentSectionId === parentId)
        .map((s) => ({
          ...s,
          children: buildTree(s.id),
        }));
    };

    return buildTree(undefined);
  }

  async getSection(sectionId: string): Promise<TemplateSection | null> {
    return this.sections.get(sectionId) || null;
  }

  async addSection(data: CreateTemplateSection): Promise<TemplateSection> {
    const section: TemplateSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
    };

    this.sections.set(section.id, section);
    return section;
  }

  async updateSection(data: UpdateTemplateSection): Promise<TemplateSection> {
    const existing = this.sections.get(data.id);
    if (!existing) {
      throw new Error(`Section not found: ${data.id}`);
    }

    const updated: TemplateSection = {
      ...existing,
      ...data,
    };

    this.sections.set(updated.id, updated);
    return updated;
  }

  async deleteSection(sectionId: string): Promise<void> {
    this.sections.delete(sectionId);
  }

  async reorderSections(data: ReorderSections): Promise<TemplateSection[]> {
    // Update order indices
    for (const order of data.sectionOrders) {
      const section = this.sections.get(order.sectionId);
      if (section) {
        section.orderIndex = order.orderIndex;
        if (order.parentSectionId !== undefined) {
          section.parentSectionId = order.parentSectionId;
        }
        this.sections.set(section.id, section);
      }
    }

    return this.getSections(data.templateId);
  }

  // =============================================================================
  // USAGE STATISTICS
  // =============================================================================

  async getUsageStats(templateId: string): Promise<TemplateUsageStats> {
    const template = await this.findById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return {
      templateId: template.id,
      templateCode: template.code,
      templateName: template.name,
      totalUsageCount: template.usageCount,
      activePlans: 0, // Would query plans in real implementation
      completedPlans: 0,
      lastUsed: undefined,
      averageCompletionTime: undefined,
    };
  }

  async getAllUsageStats(tenantId: string): Promise<TemplateUsageStats[]> {
    const templates = await this.findAll({ tenantId });
    return Promise.all(templates.map((t) => this.getUsageStats(t.id)));
  }

  async incrementUsageCount(templateId: string): Promise<void> {
    const template = await this.findById(templateId);
    if (template) {
      template.usageCount += 1;
      this.templates.set(template.id, template);
    }
  }

  // =============================================================================
  // SEARCH & DISCOVERY
  // =============================================================================

  async search(tenantId: string, query: string): Promise<PlanTemplate[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findByTags(tenantId: string, tags: string[]): Promise<PlanTemplate[]> {
    return this.findAll({ tenantId, tags });
  }

  async findSystemTemplates(): Promise<PlanTemplate[]> {
    return this.findAll({ isSystemTemplate: true });
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const templates = await this.findAll({ tenantId });
    const counts: Record<string, number> = {};

    for (const template of templates) {
      counts[template.status] = (counts[template.status] || 0) + 1;
    }

    return counts;
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const templates = await this.findAll({ tenantId });
    const counts: Record<string, number> = {};

    for (const template of templates) {
      counts[template.planType] = (counts[template.planType] || 0) + 1;
    }

    return counts;
  }
}
