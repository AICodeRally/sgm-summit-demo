import type {
  Plan,
  CreatePlan,
  UpdatePlan,
  CreatePlanFromTemplate,
  CreatePlanVersion,
  PlanFilters,
  SubmitForReview,
  SubmitForApproval,
  ApprovePlan,
  PublishPlan,
  RejectPlan,
  ArchivePlan,
  PlanCompletionStats,
  GeneratePlanDocument,
} from '@/lib/contracts/plan.contract';
import type {
  PlanSection,
  CreatePlanSection,
  UpdatePlanSection,
  UpdateSectionContent,
  UpdateSectionFields,
  MarkSectionComplete,
  ReviewSection,
  PlanSectionTree,
  ReorderPlanSections,
  FieldValue,
} from '@/lib/contracts/plan-section.contract';

/**
 * Plan Port
 * Service interface for plan instance operations
 */
export interface IPlanPort {
  // =============================================================================
  // PLAN CRUD
  // =============================================================================

  /**
   * Find all plans matching filters
   */
  findAll(filters?: PlanFilters): Promise<Plan[]>;

  /**
   * Find plan by ID
   */
  findById(id: string): Promise<Plan | null>;

  /**
   * Find plan by code
   */
  findByCode(tenantId: string, code: string): Promise<Plan | null>;

  /**
   * Create new plan from scratch
   */
  create(data: CreatePlan): Promise<Plan>;

  /**
   * Create plan from template
   */
  createFromTemplate(data: CreatePlanFromTemplate): Promise<Plan>;

  /**
   * Update existing plan
   */
  update(data: UpdatePlan): Promise<Plan>;

  /**
   * Delete plan (soft delete - set status to ARCHIVED)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Hard delete plan (permanent removal)
   */
  hardDelete(id: string): Promise<void>;

  // =============================================================================
  // VERSIONING
  // =============================================================================

  /**
   * Create a new version of a plan
   */
  createVersion(data: CreatePlanVersion): Promise<Plan>;

  /**
   * Find all versions of a plan
   */
  findVersions(planId: string): Promise<Plan[]>;

  /**
   * Find latest version of a plan
   */
  findLatestVersion(tenantId: string, planCode: string): Promise<Plan | null>;

  // =============================================================================
  // SECTION MANAGEMENT
  // =============================================================================

  /**
   * Get all sections for a plan
   */
  getSections(planId: string): Promise<PlanSection[]>;

  /**
   * Get plan sections as a tree structure
   */
  getSectionTree(planId: string): Promise<PlanSectionTree[]>;

  /**
   * Get a single section by ID
   */
  getSection(sectionId: string): Promise<PlanSection | null>;

  /**
   * Add a new section to a plan
   */
  addSection(data: CreatePlanSection): Promise<PlanSection>;

  /**
   * Update an existing section
   */
  updateSection(data: UpdatePlanSection): Promise<PlanSection>;

  /**
   * Update section content (markdown)
   */
  updateSectionContent(data: UpdateSectionContent): Promise<PlanSection>;

  /**
   * Update section field values
   */
  updateSectionFields(data: UpdateSectionFields): Promise<PlanSection>;

  /**
   * Mark section as complete
   */
  markSectionComplete(data: MarkSectionComplete): Promise<PlanSection>;

  /**
   * Review a section
   */
  reviewSection(data: ReviewSection): Promise<PlanSection>;

  /**
   * Delete a section from a plan
   */
  deleteSection(sectionId: string): Promise<void>;

  /**
   * Reorder sections within a plan
   */
  reorderSections(data: ReorderPlanSections): Promise<PlanSection[]>;

  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================

  /**
   * Submit plan for review
   */
  submitForReview(data: SubmitForReview): Promise<Plan>;

  /**
   * Submit plan for approval
   */
  submitForApproval(data: SubmitForApproval): Promise<Plan>;

  /**
   * Approve plan
   */
  approve(data: ApprovePlan): Promise<Plan>;

  /**
   * Publish plan (makes it active/effective)
   */
  publish(data: PublishPlan): Promise<Plan>;

  /**
   * Reject plan
   */
  reject(data: RejectPlan): Promise<Plan>;

  /**
   * Archive plan
   */
  archive(data: ArchivePlan): Promise<Plan>;

  // =============================================================================
  // DOCUMENT GENERATION
  // =============================================================================

  /**
   * Generate document from plan
   * Returns documentId
   */
  generateDocument(data: GeneratePlanDocument): Promise<string>;

  // =============================================================================
  // COMPLETION TRACKING
  // =============================================================================

  /**
   * Calculate and update plan completion statistics
   */
  calculateCompletion(planId: string): Promise<PlanCompletionStats>;

  /**
   * Get completion statistics for a plan
   */
  getCompletionStats(planId: string): Promise<PlanCompletionStats>;

  // =============================================================================
  // STATISTICS & REPORTING
  // =============================================================================

  /**
   * Count plans by status
   */
  countByStatus(tenantId: string): Promise<Record<string, number>>;

  /**
   * Count plans by type
   */
  countByType(tenantId: string): Promise<Record<string, number>>;

  /**
   * Search plans by query string
   */
  search(tenantId: string, query: string): Promise<Plan[]>;

  /**
   * Find plans by owner
   */
  findByOwner(tenantId: string, owner: string): Promise<Plan[]>;

  /**
   * Find plans created from a specific template
   */
  findByTemplate(templateId: string): Promise<Plan[]>;

  /**
   * Find plans requiring approval
   */
  findPendingApproval(tenantId: string): Promise<Plan[]>;

  /**
   * Find overdue plans (based on expiration date or SLA)
   */
  findOverdue(tenantId: string): Promise<Plan[]>;
}
