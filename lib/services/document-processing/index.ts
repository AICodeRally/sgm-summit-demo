/**
 * Document Processing Service
 *
 * Orchestrates complete document ingestion workflow.
 */

export { processDocument, triggerBackgroundProcessing } from './background-processor';
export type { ProcessingResult } from './background-processor';
