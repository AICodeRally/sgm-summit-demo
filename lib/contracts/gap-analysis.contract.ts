/**
 * Gap Analysis Contracts
 *
 * Types for policy gap detection and analysis.
 */

import type { PolicyJSON } from './policy-json.contract';

/**
 * Gap Severity
 */
export type GapSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Gap Status
 */
export type GapStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ACCEPTED_RISK';

/**
 * Missing Element Type
 */
export type MissingElementType =
  | 'policy-reference'
  | 'legal-compliance'
  | 'provision'
  | 'definition'
  | 'calculation-rule'
  | 'approval-requirement'
  | 'timing-specification';

/**
 * Missing Element
 *
 * Describes a specific element missing from the plan.
 */
export interface MissingElement {
  /** Type of missing element */
  type: MissingElementType;

  /** Description of what's missing */
  description: string;

  /** What content should be present */
  expectedContent: string;

  /** Policy provision this relates to (optional) */
  provisionId?: string;
}

/**
 * Impact Analysis
 *
 * Assesses the impact of a gap.
 */
export interface ImpactAnalysis {
  /** Risk score (0-100) */
  riskScore: number;

  /** Factors contributing to risk */
  riskFactors: string[];

  /** Sections affected by this gap */
  affectedSections: string[];

  /** Estimated financial exposure (optional) */
  financialExposure?: {
    amount: number;
    currency: string;
    period: 'monthly' | 'quarterly' | 'annually';
  };

  /** Compliance risk level */
  complianceRisk?: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Gap Recommendation
 *
 * Recommendation for addressing a gap.
 */
export interface GapRecommendation {
  /** Policy code to apply */
  policyCode: string;

  /** Action to take */
  action: 'INSERT' | 'UPDATE' | 'REPLACE' | 'APPEND';

  /** Target section key */
  targetSectionKey: string;

  /** Priority level */
  priority: GapSeverity;

  /** Estimated effort to implement */
  estimatedEffort?: string;

  /** Rationale for this recommendation */
  rationale?: string;
}

/**
 * Gap Analysis Result
 *
 * Complete gap analysis for a specific policy area.
 */
export interface GapAnalysis {
  /** Unique gap ID */
  id: string;

  /** Plan code being analyzed */
  planCode?: string;

  /** Policy area with gap */
  policyArea: string;

  /** Related policy code */
  policyCode: string;

  /** Related policy details */
  policy: PolicyJSON;

  /** Gap severity */
  severity: GapSeverity;

  /** Current status */
  status: GapStatus;

  /** Missing elements */
  missingElements: MissingElement[];

  /** Impact analysis */
  impactAnalysis: ImpactAnalysis;

  /** Recommendations for addressing gap */
  recommendations: GapRecommendation[];

  /** When gap was detected */
  detectedAt: Date;

  /** Keywords that were searched for */
  searchedKeywords: string[];

  /** Sections that were analyzed */
  analyzedSections: string[];
}

/**
 * Gap Analysis Summary
 *
 * High-level summary of all gaps.
 */
export interface GapAnalysisSummary {
  /** Total gaps detected */
  totalGaps: number;

  /** Gaps by severity */
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  /** Gaps by status */
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    acceptedRisk: number;
  };

  /** Overall risk score (0-100) */
  overallRiskScore: number;

  /** Total estimated financial exposure */
  totalFinancialExposure?: number;

  /** Coverage percentage */
  coveragePercentage: number;

  /** Top risk areas */
  topRiskAreas: Array<{
    policyArea: string;
    riskScore: number;
    gapCount: number;
  }>;
}

/**
 * Gap Analysis Options
 */
export interface GapAnalysisOptions {
  /** Minimum severity to report (default: all) */
  minSeverity?: GapSeverity;

  /** Only analyze specific policy codes */
  policyCodesFilter?: string[];

  /** Only analyze specific framework areas */
  frameworkAreasFilter?: string[];

  /** Include accepted risks in results */
  includeAcceptedRisks?: boolean;

  /** Keyword match threshold (0-1) */
  keywordMatchThreshold?: number;

  /** Enable AI-enhanced gap detection */
  enableAIDetection?: boolean;
}

/**
 * Keyword Match Result
 */
export interface KeywordMatchResult {
  /** Keyword that was searched */
  keyword: string;

  /** Whether keyword was found */
  found: boolean;

  /** Sections where keyword was found */
  foundInSections: string[];

  /** Match score (0-1) */
  matchScore: number;

  /** Context around matches */
  contexts?: string[];
}

/**
 * Section Coverage Analysis
 */
export interface SectionCoverageAnalysis {
  /** Section key */
  sectionKey: string;

  /** Section title */
  sectionTitle: string;

  /** Policies covered in this section */
  coveredPolicies: string[];

  /** Coverage score (0-1) */
  coverageScore: number;

  /** Missing policies */
  missingPolicies: string[];
}
