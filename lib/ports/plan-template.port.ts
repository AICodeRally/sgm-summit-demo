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

/**
 * Plan Template Port
 * Service interface for plan template operations
 */
export interface IPlanTemplatePort {
  // =============================================================================
  // TEMPLATE CRUD
  // =============================================================================

  /**
   * Find all templates matching filters
   */
  findAll(filters?: PlanTemplateFilters): Promise<PlanTemplate[]>;

  /**
   * Find template by ID
   */
  findById(id: string): Promise<PlanTemplate | null>;

  /**
   * Find template by code
   */
  findByCode(tenantId: string, code: string): Promise<PlanTemplate | null>;

  /**
   * Create new template
   */
  create(data: CreatePlanTemplate): Promise<PlanTemplate>;

  /**
   * Update existing template
   */
  update(data: UpdatePlanTemplate): Promise<PlanTemplate>;

  /**
   * Delete template (soft delete - set status to ARCHIVED)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Hard delete template (permanent removal)
   */
  hardDelete(id: string): Promise<void>;

  // =============================================================================
  // VERSIONING
  // =============================================================================

  /**
   * Create a new version of a template
   */
  createVersion(
    templateId: string,
    changes: Partial<PlanTemplate>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<PlanTemplate>;

  /**
   * Find all versions of a template
   */
  findVersions(templateId: string): Promise<PlanTemplate[]>;

  /**
   * Find latest version of a template
   */
  findLatestVersion(tenantId: string, code: string): Promise<PlanTemplate | null>;

  // =============================================================================
  // CLONING
  // =============================================================================

  /**
   * Clone an existing template
   */
  clone(data: ClonePlanTemplate): Promise<PlanTemplate>;

  // =============================================================================
  // SECTION MANAGEMENT
  // =============================================================================

  /**
   * Get all sections for a template
   */
  getSections(templateId: string): Promise<TemplateSection[]>;

  /**
   * Get template sections as a tree structure
   */
  getSectionTree(templateId: string): Promise<TemplateSectionTree[]>;

  /**
   * Get a single section by ID
   */
  getSection(sectionId: string): Promise<TemplateSection | null>;

  /**
   * Add a new section to a template
   */
  addSection(data: CreateTemplateSection): Promise<TemplateSection>;

  /**
   * Update an existing section
   */
  updateSection(data: UpdateTemplateSection): Promise<TemplateSection>;

  /**
   * Delete a section from a template
   */
  deleteSection(sectionId: string): Promise<void>;

  /**
   * Reorder sections within a template
   */
  reorderSections(data: ReorderSections): Promise<TemplateSection[]>;

  // =============================================================================
  // USAGE STATISTICS
  // =============================================================================

  /**
   * Get usage statistics for a template
   */
  getUsageStats(templateId: string): Promise<TemplateUsageStats>;

  /**
   * Get usage statistics for all templates
   */
  getAllUsageStats(tenantId: string): Promise<TemplateUsageStats[]>;

  /**
   * Increment usage count when template is used
   */
  incrementUsageCount(templateId: string): Promise<void>;

  // =============================================================================
  // SEARCH & DISCOVERY
  // =============================================================================

  /**
   * Search templates by query string
   */
  search(tenantId: string, query: string): Promise<PlanTemplate[]>;

  /**
   * Find templates by tags
   */
  findByTags(tenantId: string, tags: string[]): Promise<PlanTemplate[]>;

  /**
   * Find system templates
   */
  findSystemTemplates(): Promise<PlanTemplate[]>;

  /**
   * Count templates by status
   */
  countByStatus(tenantId: string): Promise<Record<string, number>>;

  /**
   * Count templates by plan type
   */
  countByType(tenantId: string): Promise<Record<string, number>>;
}
