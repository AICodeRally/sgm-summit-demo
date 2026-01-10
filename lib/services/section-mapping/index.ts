/**
 * Section Mapping Module
 *
 * Maps parsed document sections to plan template sections using 3-level algorithm:
 * - Level 1: Exact title match (Levenshtein distance)
 * - Level 2: Fuzzy match (fuse.js)
 * - Level 3: AI-enhanced mapping
 *
 * Usage:
 * ```typescript
 * import { mapSectionsToTemplate } from '@/lib/services/section-mapping';
 *
 * const mappings = await mapSectionsToTemplate(parsedSections, {
 *   fuzzyMatchThreshold: 0.7,
 *   autoAcceptThreshold: 0.9
 * });
 * ```
 */

// Export core functionality
export {
  MappingEngine,
  mapSectionsToTemplate,
  type MappingMethod,
  type MappingStatus,
  type SectionMapping,
  type MappingOptions,
} from './mapping-engine';

// Re-export types from contracts
export type {
  ParsedSection,
  Block,
} from '@/lib/contracts/content-json.contract';

export type { TemplateSection } from '@/lib/data/plan-template-library.data';
