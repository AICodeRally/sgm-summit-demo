/**
 * The Toddfather API Client
 *
 * SPM-focused RAG and AI services for governance review.
 */

export {
  ToddFatherAPIClient,
  getToddFatherClient,
  askSPM,
  validateGap,
  generateRemediation,
  checkAPIHealth,
} from './api-client';

export type {
  Citation,
  AskResponse,
  ValidationResult,
  RemediationResult,
  ConversationMessage,
  ToddFatherPersona,
} from './api-client';
