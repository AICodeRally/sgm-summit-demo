/**
 * PDF Generator Service
 *
 * Generates professional PDF reports from governance review data.
 * Uses HTML templates with WeasyPrint for conversion.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { GovernanceReview, GovernanceGap } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

export interface ReportData {
  review: GovernanceReview;
  gaps: GovernanceGap[];
  organizationName?: string;
  organizationState?: string;
}

export interface GeneratedReport {
  html: string;
  filename: string;
}

// =============================================================================
// TEMPLATE RENDERING
// =============================================================================

/**
 * Load the HTML template
 */
function loadTemplate(): string {
  const templatePath = join(process.cwd(), 'lib/governance/templates/governance-review.html');
  return readFileSync(templatePath, 'utf-8');
}

/**
 * Simple template variable replacement (Mustache-like)
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;

  // Replace simple variables: {{variableName}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) return '';
    return String(value);
  });

  // Handle conditionals: {{#if condition}}...{{/if}}
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  // Handle loops: {{#each items}}...{{/each}}
  result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, itemTemplate) => {
    const array = data[arrayName] as unknown[];
    if (!Array.isArray(array)) return '';

    return array.map((item) => {
      let itemResult = itemTemplate;
      if (typeof item === 'object' && item !== null) {
        // Replace {{property}} in item template
        itemResult = itemResult.replace(/\{\{(\w+)\}\}/g, (m: string, key: string) => {
          const value = (item as Record<string, unknown>)[key];
          if (value === undefined || value === null) return '';
          return String(value);
        });
        // Handle {{this}} for simple arrays
        itemResult = itemResult.replace(/\{\{this\}\}/g, String(item));
      } else {
        itemResult = itemResult.replace(/\{\{this\}\}/g, String(item));
      }
      return itemResult;
    }).join('');
  });

  return result;
}

/**
 * Get CSS class for finding status
 */
function getFindingClass(finding: string): string {
  switch (finding) {
    case 'EVIDENCED': return 'evidenced';
    case 'PARTIAL': return 'partial';
    case 'NOT_EVIDENCED': return 'not-evidenced';
    default: return 'not-evidenced';
  }
}

/**
 * Get CSS class for severity
 */
function getSeverityClass(severity: string): string {
  return severity.toLowerCase();
}

/**
 * Format gap data for template
 */
function formatGapsForTemplate(gaps: GovernanceGap[]): unknown[] {
  return gaps.map((gap) => ({
    policyCode: gap.policyCode,
    policyName: gap.policyName,
    finding: gap.finding.replace('_', ' '),
    findingClass: getFindingClass(gap.finding),
    severity: gap.severity,
    severityClass: getSeverityClass(gap.severity),
    evidence: gap.evidence as string[] | null,
    missingElements: gap.missingElements as string[] | null,
    aiValidated: gap.aiValidated,
    aiStatus: gap.aiIsGap ? 'Confirmed' : 'False Positive',
    aiClass: gap.aiIsGap ? 'ai-confirmed' : 'ai-false-positive',
    aiConfidence: gap.aiConfidence,
    aiReasoning: gap.aiReasoning,
    remediationText: gap.remediationText,
    remediationInsertionPoint: gap.remediationInsertionPoint,
  }));
}

/**
 * Count gaps by severity
 */
function countBySeverity(gaps: GovernanceGap[]): Record<string, number> {
  return {
    criticalCount: gaps.filter((g) => g.severity === 'CRITICAL').length,
    highCount: gaps.filter((g) => g.severity === 'HIGH').length,
    mediumCount: gaps.filter((g) => g.severity === 'MEDIUM').length,
    lowCount: gaps.filter((g) => g.severity === 'LOW').length,
  };
}

// =============================================================================
// HTML GENERATION
// =============================================================================

/**
 * Generate HTML report from review data
 */
export function generateHtmlReport(data: ReportData): string {
  const template = loadTemplate();
  const { review, gaps } = data;

  const severityCounts = countBySeverity(gaps);
  const aiValidatedGaps = gaps.filter((g) => g.aiValidated);
  const hasAiValidation = aiValidatedGaps.length > 0;

  const templateData: Record<string, unknown> = {
    // Review metadata
    planName: review.planName,
    organizationName: data.organizationName || review.organizationName || 'Organization',
    organizationState: data.organizationState || review.organizationState || 'N/A',
    jurisdiction: review.jurisdiction,
    reviewDate: new Date(review.analyzedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    generatedAt: new Date().toISOString(),

    // Metrics
    coverageScore: Math.round(review.coverageScore * 100),
    evidenced: review.evidenced,
    partial: review.partial,
    notEvidenced: review.notEvidenced,

    // Severity counts
    ...severityCounts,

    // AI validation
    aiValidated: hasAiValidation ? 'Yes' : 'No',
    aiValidationSummary: hasAiValidation,
    aiConfirmedGaps: review.aiConfirmedGaps,
    aiFalsePositives: review.aiFalsePositives,
    avgAiConfidence: review.avgAiConfidence ? Math.round(review.avgAiConfidence) : 0,

    // Gaps
    gaps: formatGapsForTemplate(gaps),
  };

  return renderTemplate(template, templateData);
}

/**
 * Generate a complete report object with HTML and filename
 */
export function generateReport(data: ReportData): GeneratedReport {
  const html = generateHtmlReport(data);

  // Create a safe filename
  const planSlug = data.review.planName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `governance-review-${planSlug}-${dateStr}.pdf`;

  return { html, filename };
}

// =============================================================================
// PDF GENERATION (via external service or API)
// =============================================================================

/**
 * Convert HTML to PDF using WeasyPrint (requires Python/WeasyPrint installed)
 * Falls back to returning HTML if WeasyPrint is not available
 */
export async function generatePdf(data: ReportData): Promise<{
  pdf?: Buffer;
  html: string;
  filename: string;
  method: 'weasyprint' | 'html-only';
}> {
  const { html, filename } = generateReport(data);

  // Check if WEASYPRINT_ENABLED is set
  const weasyPrintEnabled = process.env.WEASYPRINT_ENABLED === 'true';

  if (!weasyPrintEnabled) {
    return {
      html,
      filename: filename.replace('.pdf', '.html'),
      method: 'html-only',
    };
  }

  try {
    // Try to use WeasyPrint via child process
    const { execSync } = await import('child_process');
    const { writeFileSync, readFileSync, unlinkSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');

    const tmpHtml = join(tmpdir(), `governance-${Date.now()}.html`);
    const tmpPdf = join(tmpdir(), `governance-${Date.now()}.pdf`);

    // Write HTML to temp file
    writeFileSync(tmpHtml, html);

    // Run WeasyPrint
    execSync(`weasyprint "${tmpHtml}" "${tmpPdf}"`, {
      timeout: 30000,
      stdio: 'pipe',
    });

    // Read PDF
    const pdf = readFileSync(tmpPdf);

    // Cleanup
    unlinkSync(tmpHtml);
    unlinkSync(tmpPdf);

    return {
      pdf,
      html,
      filename,
      method: 'weasyprint',
    };
  } catch (error) {
    console.warn('WeasyPrint not available, returning HTML only:', error);
    return {
      html,
      filename: filename.replace('.pdf', '.html'),
      method: 'html-only',
    };
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Generate report from review ID (fetches data from database)
 */
export async function generateReportFromReviewId(
  reviewId: string,
  organizationName?: string,
  organizationState?: string
): Promise<GeneratedReport> {
  // Import dynamically to avoid circular dependencies
  const { getReview, getGapsByReview } = await import('./db-service');

  const review = await getReview(reviewId);
  if (!review) {
    throw new Error(`Review not found: ${reviewId}`);
  }

  const gaps = await getGapsByReview(reviewId);

  return generateReport({
    review,
    gaps,
    organizationName,
    organizationState,
  });
}

/**
 * Generate PDF from review ID
 */
export async function generatePdfFromReviewId(
  reviewId: string,
  organizationName?: string,
  organizationState?: string
): Promise<{
  pdf?: Buffer;
  html: string;
  filename: string;
  method: 'weasyprint' | 'html-only';
}> {
  const { getReview, getGapsByReview } = await import('./db-service');

  const review = await getReview(reviewId);
  if (!review) {
    throw new Error(`Review not found: ${reviewId}`);
  }

  const gaps = await getGapsByReview(reviewId);

  return generatePdf({
    review,
    gaps,
    organizationName,
    organizationState,
  });
}
