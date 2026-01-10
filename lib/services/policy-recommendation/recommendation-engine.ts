/**
 * Policy Recommendation Engine
 *
 * Generates policy recommendations from gap analysis results.
 * Creates ready-to-insert ContentJSON for each recommendation.
 */

import type { PolicyJSON } from '@/lib/contracts/policy-json.contract';
import type { GapAnalysis } from '@/lib/contracts/gap-analysis.contract';
import type {
  PolicyRecommendation,
  RecommendationOptions,
  RecommendationDetails,
  InsertPosition,
  RecommendationAction,
} from '@/lib/contracts/policy-recommendation.contract';
import { JSONContentGenerator, generatePreview } from './json-generator';

/**
 * Policy Recommendation Engine
 */
export class RecommendationEngine {
  private contentGenerator: JSONContentGenerator;
  private options: Required<RecommendationOptions>;

  constructor(options: Partial<RecommendationOptions> = {}) {
    this.contentGenerator = new JSONContentGenerator();
    this.options = {
      includeFullContent: options.includeFullContent ?? true,
      includeProvisions: options.includeProvisions ?? true,
      includeCompliance: options.includeCompliance ?? true,
      includeDefinitions: options.includeDefinitions ?? true,
      formatStyle: options.formatStyle || 'detailed',
      preferredPosition: options.preferredPosition || 'END',
      autoApplyHighPriority: options.autoApplyHighPriority ?? false,
    };
  }

  /**
   * Generate recommendations from gap analysis
   *
   * @param gaps - Gap analysis results
   * @param planId - Optional plan ID
   * @returns Array of policy recommendations
   */
  generateRecommendations(
    gaps: GapAnalysis[],
    planId?: string
  ): PolicyRecommendation[] {
    const recommendations: PolicyRecommendation[] = [];

    for (const gap of gaps) {
      const recommendation = this.generateRecommendationFromGap(gap, planId);
      recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * Generate recommendation from a single gap
   */
  private generateRecommendationFromGap(
    gap: GapAnalysis,
    planId?: string
  ): PolicyRecommendation {
    const policy = gap.policy;

    // Generate content based on severity/priority
    const contentJson =
      gap.severity === 'CRITICAL'
        ? this.contentGenerator.generateComplianceContent(policy)
        : this.contentGenerator.generateContentFromPolicy(policy, {
            formatStyle: this.options.formatStyle,
            includeProvisions: this.options.includeProvisions,
            includeCompliance: this.options.includeCompliance,
            includeDefinitions: this.options.includeDefinitions,
          });

    // Generate preview
    const previewText = generatePreview(contentJson, 200);

    // Determine action based on gap recommendations
    const action = this.determineAction(gap);

    // Determine insert position
    const insertPosition = this.determineInsertPosition(gap, action);

    // Get target section from gap recommendations
    const targetSectionKey =
      gap.recommendations.length > 0
        ? gap.recommendations[0].targetSectionKey
        : 'unknown';

    // Build recommendation details
    const recommendationDetails: RecommendationDetails = {
      targetSectionKey,
      targetSectionTitle: targetSectionKey,
      action,
      insertPosition,
      contentJson,
      previewText,
      rationale: this.generateRationale(gap),
      priority: gap.severity,
      estimatedEffort:
        gap.recommendations.length > 0
          ? gap.recommendations[0].estimatedEffort || '15 minutes'
          : '15 minutes',
      hasConflicts: false,
      conflictDetails: [],
    };

    // Create recommendation
    const recommendation: PolicyRecommendation = {
      id: this.generateRecommendationId(),
      planId,
      gapId: gap.id,
      policyCode: policy.code,
      policyData: policy,
      recommendationDetails,
      status: 'PENDING',
      createdAt: new Date(),
    };

    return recommendation;
  }

  /**
   * Determine recommended action
   */
  private determineAction(gap: GapAnalysis): RecommendationAction {
    // If gap has specific recommendations, use first one
    if (gap.recommendations.length > 0) {
      return gap.recommendations[0].action;
    }

    // Default to INSERT for new content
    return 'INSERT';
  }

  /**
   * Determine insert position
   */
  private determineInsertPosition(
    gap: GapAnalysis,
    action: RecommendationAction
  ): InsertPosition {
    if (action === 'REPLACE' || action === 'UPDATE') {
      return 'START'; // Doesn't matter for REPLACE/UPDATE
    }

    // Use preferred position from options
    return this.options.preferredPosition;
  }

  /**
   * Generate rationale for recommendation
   */
  private generateRationale(gap: GapAnalysis): string {
    const policy = gap.policy;

    let rationale = `Address ${gap.severity.toLowerCase()} gap in ${gap.policyArea} by adding ${
      policy.name
    }.`;

    // Add specific reasons based on missing elements
    if (gap.missingElements.length > 0) {
      const reasons = gap.missingElements.map((elem) => elem.description);
      rationale += ` Missing: ${reasons.slice(0, 2).join(', ')}`;
      if (reasons.length > 2) {
        rationale += `, and ${reasons.length - 2} more`;
      }
      rationale += '.';
    }

    // Add compliance note if applicable
    if (
      policy.compliance.federalLaws.length > 0 ||
      policy.compliance.stateLaws.length > 0
    ) {
      const laws = [
        ...policy.compliance.federalLaws.slice(0, 2),
        ...policy.compliance.stateLaws.slice(0, 1),
      ];
      rationale += ` Required for compliance with ${laws.join(', ')}.`;
    }

    // Add risk note if high risk
    if (gap.impactAnalysis.riskScore >= 70) {
      rationale += ` High risk (${gap.impactAnalysis.riskScore}/100).`;
    }

    return rationale;
  }

  /**
   * Generate unique recommendation ID
   */
  private generateRecommendationId(): string {
    return `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Filter recommendations by priority
   */
  filterByPriority(
    recommendations: PolicyRecommendation[],
    minPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
  ): PolicyRecommendation[] {
    const priorityOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const minIndex = priorityOrder.indexOf(minPriority);

    return recommendations.filter((rec) => {
      const recIndex = priorityOrder.indexOf(rec.recommendationDetails.priority);
      return recIndex >= minIndex;
    });
  }

  /**
   * Group recommendations by target section
   */
  groupBySection(
    recommendations: PolicyRecommendation[]
  ): Map<string, PolicyRecommendation[]> {
    const grouped = new Map<string, PolicyRecommendation[]>();

    recommendations.forEach((rec) => {
      const sectionKey = rec.recommendationDetails.targetSectionKey;
      if (!grouped.has(sectionKey)) {
        grouped.set(sectionKey, []);
      }
      grouped.get(sectionKey)!.push(rec);
    });

    return grouped;
  }

  /**
   * Get statistics for recommendations
   */
  getStatistics(recommendations: PolicyRecommendation[]): {
    total: number;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    byAction: Record<string, number>;
    estimatedTotalEffort: string;
  } {
    const byPriority: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    const byStatus: Record<string, number> = {
      PENDING: 0,
      APPLIED: 0,
      REJECTED: 0,
      PARTIALLY_APPLIED: 0,
    };

    const byAction: Record<string, number> = {
      INSERT: 0,
      UPDATE: 0,
      REPLACE: 0,
      APPEND: 0,
    };

    let totalMinutes = 0;

    recommendations.forEach((rec) => {
      byPriority[rec.recommendationDetails.priority]++;
      byStatus[rec.status]++;
      byAction[rec.recommendationDetails.action]++;

      // Parse effort (assumes format like "15 minutes" or "1 hour")
      const effort = rec.recommendationDetails.estimatedEffort;
      if (effort.includes('minute')) {
        const minutes = parseInt(effort);
        if (!isNaN(minutes)) totalMinutes += minutes;
      } else if (effort.includes('hour')) {
        const hours = parseInt(effort);
        if (!isNaN(hours)) totalMinutes += hours * 60;
      }
    });

    // Format total effort
    let estimatedTotalEffort = '';
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      estimatedTotalEffort = `${hours} hour${hours > 1 ? 's' : ''}`;
      if (minutes > 0) {
        estimatedTotalEffort += ` ${minutes} minutes`;
      }
    } else {
      estimatedTotalEffort = `${totalMinutes} minutes`;
    }

    return {
      total: recommendations.length,
      byPriority,
      byStatus,
      byAction,
      estimatedTotalEffort,
    };
  }
}

/**
 * Convenience function to generate recommendations
 */
export function generateRecommendations(
  gaps: GapAnalysis[],
  options?: Partial<RecommendationOptions>
): PolicyRecommendation[] {
  const engine = new RecommendationEngine(options);
  return engine.generateRecommendations(gaps);
}

/**
 * Convenience function to generate single recommendation
 */
export function generateRecommendationFromGap(
  gap: GapAnalysis,
  options?: Partial<RecommendationOptions>
): PolicyRecommendation {
  const engine = new RecommendationEngine(options);
  return engine.generateRecommendations([gap])[0];
}
