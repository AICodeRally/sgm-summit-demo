/**
 * Policy Recommendation Module
 *
 * Complete policy recommendation system for generating insertable content
 * from gap analysis results.
 *
 * Features:
 * - Convert PolicyJSON to ContentJSON blocks
 * - Generate ready-to-insert content
 * - Multiple format styles (detailed, summary, minimal, compliance)
 * - Preview generation
 * - Batch recommendation processing
 *
 * Usage:
 * ```typescript
 * import { generateRecommendations } from '@/lib/services/policy-recommendation';
 * import { analyzeGaps } from '@/lib/services/gap-analysis';
 * import { getAllPoliciesAsJSON } from '@/lib/data/policy-library';
 *
 * // Analyze gaps
 * const policies = getAllPoliciesAsJSON();
 * const gaps = await analyzeGaps(sections, policies);
 *
 * // Generate recommendations with insertable content
 * const recommendations = generateRecommendations(gaps, {
 *   formatStyle: 'detailed',
 *   includeCompliance: true
 * });
 *
 * // Each recommendation has ready-to-insert ContentJSON
 * recommendations.forEach(rec => {
 *   console.log(`Apply ${rec.policyCode} to ${rec.recommendationDetails.targetSectionKey}`);
 *   console.log('Preview:', rec.recommendationDetails.previewText);
 *   console.log('Content:', rec.recommendationDetails.contentJson);
 * });
 * ```
 */

// Export recommendation engine
export {
  RecommendationEngine,
  generateRecommendations,
  generateRecommendationFromGap,
} from './recommendation-engine';

// Export JSON content generator
export {
  JSONContentGenerator,
  generateContentFromPolicy,
  generatePreview,
} from './json-generator';

// Re-export contracts
export type {
  PolicyRecommendation,
  RecommendationStatus,
  RecommendationAction,
  InsertPosition,
  RecommendationDetails,
  RecommendationOptions,
  ApplicationResult,
  BatchApplicationResult,
  ContentGenerationTemplate,
} from '@/lib/contracts/policy-recommendation.contract';
