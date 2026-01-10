/**
 * Policy Recommendation Contracts
 *
 * Types for policy recommendations and application.
 */

import type { PolicyJSON } from './policy-json.contract';
import type { ContentJSON } from './content-json.contract';
import type { GapSeverity } from './gap-analysis.contract';

/**
 * Recommendation Status
 */
export type RecommendationStatus = 'PENDING' | 'APPLIED' | 'REJECTED' | 'PARTIALLY_APPLIED';

/**
 * Recommendation Action Type
 */
export type RecommendationAction = 'INSERT' | 'UPDATE' | 'REPLACE' | 'APPEND';

/**
 * Insert Position
 */
export type InsertPosition = 'START' | 'END' | 'BEFORE' | 'AFTER';

/**
 * Policy Recommendation
 *
 * Recommendation to apply a policy to address a gap.
 */
export interface PolicyRecommendation {
  /** Unique recommendation ID */
  id: string;

  /** Plan ID this recommendation is for */
  planId?: string;

  /** Gap ID this addresses */
  gapId?: string;

  /** Policy code being recommended */
  policyCode: string;

  /** Full policy data */
  policyData: PolicyJSON;

  /** Recommendation details */
  recommendationDetails: RecommendationDetails;

  /** Current status */
  status: RecommendationStatus;

  /** When recommendation was generated */
  createdAt: Date;

  /** When recommendation was applied */
  appliedAt?: Date;

  /** Who applied the recommendation */
  appliedBy?: string;

  /** Application notes */
  applicationNotes?: string;
}

/**
 * Recommendation Details
 */
export interface RecommendationDetails {
  /** Target section key to modify */
  targetSectionKey: string;

  /** Target section title */
  targetSectionTitle: string;

  /** Action to perform */
  action: RecommendationAction;

  /** Insert position (for INSERT/APPEND actions) */
  insertPosition: InsertPosition;

  /** Generated ContentJSON to insert/append */
  contentJson: ContentJSON;

  /** Preview text (first 200 chars) */
  previewText: string;

  /** Rationale for this recommendation */
  rationale: string;

  /** Priority level */
  priority: GapSeverity;

  /** Estimated effort to apply */
  estimatedEffort: string;

  /** Will this create conflicts? */
  hasConflicts?: boolean;

  /** Conflict details if any */
  conflictDetails?: string[];
}

/**
 * Application Result
 *
 * Result of applying a recommendation.
 */
export interface ApplicationResult {
  /** Whether application succeeded */
  success: boolean;

  /** Recommendation ID */
  recommendationId: string;

  /** Updated section ID */
  sectionId?: string;

  /** New content */
  newContent?: ContentJSON;

  /** Error message if failed */
  error?: string;

  /** Warnings during application */
  warnings?: string[];
}

/**
 * Batch Application Result
 */
export interface BatchApplicationResult {
  /** Total recommendations processed */
  total: number;

  /** Successfully applied */
  successful: number;

  /** Failed applications */
  failed: number;

  /** Individual results */
  results: ApplicationResult[];

  /** Overall success rate */
  successRate: number;
}

/**
 * Recommendation Options
 */
export interface RecommendationOptions {
  /** Include full policy content */
  includeFullContent?: boolean;

  /** Include provision details */
  includeProvisions?: boolean;

  /** Include compliance information */
  includeCompliance?: boolean;

  /** Include definitions */
  includeDefinitions?: boolean;

  /** Format style */
  formatStyle?: 'detailed' | 'summary' | 'minimal';

  /** Preferred insert position */
  preferredPosition?: InsertPosition;

  /** Auto-apply high-priority recommendations */
  autoApplyHighPriority?: boolean;
}

/**
 * Content Generation Template
 */
export interface ContentGenerationTemplate {
  /** Include heading */
  includeHeading: boolean;

  /** Heading level */
  headingLevel: number;

  /** Include purpose section */
  includePurpose: boolean;

  /** Include provisions as list */
  includeProvisionsList: boolean;

  /** Include compliance callout */
  includeComplianceCallout: boolean;

  /** Include definitions */
  includeDefinitions: boolean;

  /** Custom sections to include */
  customSections?: string[];
}
