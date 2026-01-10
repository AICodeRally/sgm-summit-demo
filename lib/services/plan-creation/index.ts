/**
 * Plan Creation Module
 *
 * Complete plan creation system that orchestrates the entire workflow:
 * Document → Parse → Map → Analyze Gaps → Recommend → Create Plan
 *
 * Usage:
 * ```typescript
 * import { createPlanFromDocument } from '@/lib/services/plan-creation';
 * import { getAllPoliciesAsJSON } from '@/lib/data/policy-library';
 *
 * const policies = getAllPoliciesAsJSON();
 *
 * const result = await createPlanFromDocument(
 *   '/path/to/document.pdf',
 *   policies,
 *   {
 *     autoApplyMappings: true,
 *     autoApplyRecommendations: false,
 *     minAutoApplyConfidence: 0.8
 *   }
 * );
 *
 * if (result.success) {
 *   console.log(`Created plan: ${result.plan.title}`);
 *   console.log(`Completion: ${result.plan.completionPercentage}%`);
 *   console.log(`Sections: ${result.plan.sections.length}`);
 * }
 * ```
 */

// Export plan creator
export {
  PlanCreator,
  createPlanFromDocument,
  type PlanCreationResult,
  type CreatedPlan,
  type PlanSection,
  type PlanMetadata,
  type PlanCreationStats,
  type PlanCreationOptions,
} from './plan-creator';

// Export JSON merger
export {
  JSONContentMerger,
  mergeMultipleContents,
  mergeContentIntoSection,
  appendContent,
  prependContent,
  type MergeStrategy,
  type MergeOptions,
} from './json-merger';
