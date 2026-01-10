/**
 * AICR Platform Integration
 *
 * Provides AI services via the AICR platform expert hierarchy:
 * - SGM (Sales Governance) → SPARCC/SPM → Summit → Platform
 */

export {
  AICRClient,
  getAICRClient,
  isAICRConfigured,
  askGovernance,
  type AskSGMRequest,
  type AskSGMResponse,
  type AICRClientConfig,
} from './client';
