/**
 * Gap Analysis Module
 *
 * Complete gap analysis system for detecting missing policy coverage in plans.
 *
 * Features:
 * - JSON-based content queries
 * - Keyword-based gap detection
 * - Severity classification
 * - Impact analysis
 * - Automated recommendations
 *
 * Usage:
 * ```typescript
 * import { analyzeGaps, generateGapSummary } from '@/lib/services/gap-analysis';
 * import { getAllPoliciesAsJSON } from '@/lib/data/policy-library';
 *
 * const policies = getAllPoliciesAsJSON();
 * const gaps = await analyzeGaps(sections, policies, {
 *   minSeverity: 'MEDIUM',
 *   keywordMatchThreshold: 0.3
 * });
 *
 * const summary = generateGapSummary(gaps);
 * console.log(`Found ${summary.totalGaps} gaps`);
 * ```
 */

// Export gap analysis engine
export {
  GapAnalysisEngine,
  analyzeGaps,
  generateGapSummary,
} from './gap-engine';

// Export JSON query utilities
export {
  extractTextFromJSON,
  extractTextFromBlock,
  searchKeywordsInJSON,
  findBlocksByType,
  findHeadingsByText,
  calculateKeywordCoverage,
  findSectionsByKeyword,
  analyzeKeywordDistribution,
  extractDefinitions,
  countWords,
  getContentStats,
} from './json-query';

// Re-export contracts
export type {
  GapAnalysis,
  GapAnalysisSummary,
  GapAnalysisOptions,
  GapSeverity,
  GapStatus,
  MissingElement,
  MissingElementType,
  ImpactAnalysis,
  GapRecommendation,
  KeywordMatchResult,
  SectionCoverageAnalysis,
} from '@/lib/contracts/gap-analysis.contract';
