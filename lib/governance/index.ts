/**
 * Governance Module
 *
 * AI-powered governance review services for compensation plan analysis.
 */

// Database operations
export * from './db-service';

// PDF/Report generation
export {
  generateHtmlReport,
  generateReport,
  generatePdf,
  generateReportFromReviewId,
  generatePdfFromReviewId,
} from './pdf-generator';

export type { ReportData, GeneratedReport } from './pdf-generator';

// Re-export types from Prisma
export {
  GapFinding,
  GapSeverity,
  GapDisposition,
} from '@prisma/client';

export type {
  GovernanceReview,
  GovernanceGap,
  GovernanceConversation,
} from '@prisma/client';
