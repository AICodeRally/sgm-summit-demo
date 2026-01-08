import { z } from 'zod';
import { AIAgentRoleSchema } from './template-section.contract';

/**
 * Plan Section Contract
 * Defines schemas and types for plan section instances
 */

// =============================================================================
// ENUMS
// =============================================================================

export const SectionCompletionStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'UNDER_REVIEW',
  'APPROVED',
]);
export type SectionCompletionStatus = z.infer<typeof SectionCompletionStatusSchema>;

// =============================================================================
// FIELD VALUE SCHEMAS
// =============================================================================

export const FieldValueSchema = z.object({
  fieldKey: z.string().max(100),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
  lastUpdated: z.coerce.date().optional(),
  updatedBy: z.string().max(200).optional(),
});

export type FieldValue = z.infer<typeof FieldValueSchema>;

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const PlanSectionSchema = z.object({
  id: z.string().cuid(),
  planId: z.string().cuid(),
  parentSectionId: z.string().cuid().optional(),
  sectionKey: z.string().max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().int().min(0),
  level: z.number().int().min(0).max(5).default(0),
  isRequired: z.boolean().default(false),
  content: z.string().optional(),
  fieldValues: z.array(FieldValueSchema).optional(),
  aiAgentRoles: z.array(AIAgentRoleSchema).optional(),
  completionStatus: SectionCompletionStatusSchema.default('NOT_STARTED'),
  completionPercentage: z.number().min(0).max(100).default(0),
  reviewedBy: z.string().max(200).optional(),
  reviewedAt: z.coerce.date().optional(),
  reviewComments: z.string().max(2000).optional(),
  createdAt: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type PlanSection = z.infer<typeof PlanSectionSchema>;

// =============================================================================
// CRUD SCHEMAS
// =============================================================================

export const CreatePlanSectionSchema = PlanSectionSchema.omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  completionPercentage: true,
}).extend({
  planId: z.string().cuid(),
  sectionKey: z.string().max(100),
  title: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0),
  level: z.number().int().min(0).max(5).default(0),
  isRequired: z.boolean().default(false),
  completionStatus: SectionCompletionStatusSchema.default('NOT_STARTED'),
});

export type CreatePlanSection = z.infer<typeof CreatePlanSectionSchema>;

export const UpdatePlanSectionSchema = PlanSectionSchema.partial().required({
  id: true,
});

export type UpdatePlanSection = z.infer<typeof UpdatePlanSectionSchema>;

// =============================================================================
// CONTENT UPDATE SCHEMA
// =============================================================================

export const UpdateSectionContentSchema = z.object({
  sectionId: z.string().cuid(),
  content: z.string(),
  updatedBy: z.string().max(200),
  autoComplete: z.boolean().default(false), // Auto-mark as complete if content meets requirements
});

export type UpdateSectionContent = z.infer<typeof UpdateSectionContentSchema>;

// =============================================================================
// FIELD UPDATE SCHEMA
// =============================================================================

export const UpdateSectionFieldsSchema = z.object({
  sectionId: z.string().cuid(),
  fieldValues: z.array(FieldValueSchema),
  updatedBy: z.string().max(200),
  autoComplete: z.boolean().default(false), // Auto-mark as complete if all required fields filled
});

export type UpdateSectionFields = z.infer<typeof UpdateSectionFieldsSchema>;

// =============================================================================
// COMPLETION SCHEMA
// =============================================================================

export const MarkSectionCompleteSchema = z.object({
  sectionId: z.string().cuid(),
  completedBy: z.string().max(200),
  completionNotes: z.string().max(1000).optional(),
});

export type MarkSectionComplete = z.infer<typeof MarkSectionCompleteSchema>;

// =============================================================================
// REVIEW SCHEMA
// =============================================================================

export const ReviewSectionSchema = z.object({
  sectionId: z.string().cuid(),
  reviewedBy: z.string().max(200),
  reviewComments: z.string().max(2000).optional(),
  approved: z.boolean(),
});

export type ReviewSection = z.infer<typeof ReviewSectionSchema>;

// =============================================================================
// SECTION TREE SCHEMA
// =============================================================================

export type PlanSectionTree = PlanSection & {
  children?: PlanSectionTree[];
};

export const PlanSectionTreeSchema: z.ZodType<PlanSectionTree> = PlanSectionSchema.extend({
  children: z.lazy(() => PlanSectionTreeSchema.array()).optional(),
});

// =============================================================================
// REORDER SCHEMA
// =============================================================================

export const ReorderPlanSectionsSchema = z.object({
  planId: z.string().cuid(),
  sectionOrders: z.array(z.object({
    sectionId: z.string().cuid(),
    orderIndex: z.number().int().min(0),
    parentSectionId: z.string().cuid().optional(),
  })),
  updatedBy: z.string().max(200),
});

export type ReorderPlanSections = z.infer<typeof ReorderPlanSectionsSchema>;
