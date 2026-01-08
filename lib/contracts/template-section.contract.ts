import { z } from 'zod';

/**
 * Template Section Contract
 * Defines schemas and types for template sections and field definitions
 */

// =============================================================================
// FIELD DEFINITION SCHEMAS
// =============================================================================

export const FieldTypeSchema = z.enum([
  'TEXT',
  'TEXT_AREA',
  'NUMBER',
  'DECIMAL',
  'DATE',
  'BOOLEAN',
  'DROPDOWN',
  'MULTI_SELECT',
  'EMAIL',
  'URL',
  'CURRENCY',
  'PERCENTAGE',
]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

export const ValidationRuleSchema = z.object({
  type: z.enum(['REQUIRED', 'MIN', 'MAX', 'PATTERN', 'CUSTOM']),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  message: z.string().optional(),
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

export const FieldDefinitionSchema = z.object({
  fieldKey: z.string().max(100),
  label: z.string().max(200),
  type: FieldTypeSchema,
  description: z.string().max(500).optional(),
  placeholder: z.string().max(200).optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(), // For DROPDOWN and MULTI_SELECT
  validationRules: z.array(ValidationRuleSchema).optional(),
  helpText: z.string().max(500).optional(),
  orderIndex: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

// =============================================================================
// AI AGENT ROLE ENUM
// =============================================================================

export const AIAgentRoleSchema = z.enum([
  'POLICY_EXPERT',
  'DESIGN',
  'UIUX',
  'KNOWLEDGE_BASE',
]);
export type AIAgentRole = z.infer<typeof AIAgentRoleSchema>;

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const TemplateSectionSchema = z.object({
  id: z.string().cuid(),
  templateId: z.string().cuid(),
  parentSectionId: z.string().cuid().optional(),
  sectionKey: z.string().max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().int().min(0),
  level: z.number().int().min(0).max(5).default(0),
  isRequired: z.boolean().default(false),
  isRepeatable: z.boolean().default(false),
  contentTemplate: z.string().optional(),
  fieldDefinitions: z.array(FieldDefinitionSchema).optional(),
  aiAgentRoles: z.array(AIAgentRoleSchema).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type TemplateSection = z.infer<typeof TemplateSectionSchema>;

// =============================================================================
// CRUD SCHEMAS
// =============================================================================

export const CreateTemplateSectionSchema = TemplateSectionSchema.omit({
  id: true,
}).extend({
  templateId: z.string().cuid(),
  sectionKey: z.string().max(100),
  title: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0),
  level: z.number().int().min(0).max(5).default(0),
  isRequired: z.boolean().default(false),
  isRepeatable: z.boolean().default(false),
});

export type CreateTemplateSection = z.infer<typeof CreateTemplateSectionSchema>;

export const UpdateTemplateSectionSchema = TemplateSectionSchema.partial().required({
  id: true,
});

export type UpdateTemplateSection = z.infer<typeof UpdateTemplateSectionSchema>;

// =============================================================================
// SECTION TREE SCHEMA
// =============================================================================

export type TemplateSectionTree = TemplateSection & {
  children?: TemplateSectionTree[];
};

export const TemplateSectionTreeSchema: z.ZodType<TemplateSectionTree> = TemplateSectionSchema.extend({
  children: z.lazy(() => TemplateSectionTreeSchema.array()).optional(),
});

// =============================================================================
// REORDER SCHEMA
// =============================================================================

export const ReorderSectionsSchema = z.object({
  templateId: z.string().cuid(),
  sectionOrders: z.array(z.object({
    sectionId: z.string().cuid(),
    orderIndex: z.number().int().min(0),
    parentSectionId: z.string().cuid().optional(),
  })),
});

export type ReorderSections = z.infer<typeof ReorderSectionsSchema>;
