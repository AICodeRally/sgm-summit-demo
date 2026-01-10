/**
 * Document Parser Module
 *
 * Complete document ingestion pipeline:
 * 1. Parse PDF/DOCX/TXT/Excel → Extract text and structure
 * 2. Convert to JSON blocks → Eliminate markdown artifacts
 * 3. Detect sections → Split into logical sections
 *
 * Usage:
 * ```typescript
 * import { parseAndConvert } from '@/lib/services/document-parser';
 *
 * const result = await parseAndConvert('/path/to/document.pdf');
 * // result.sections contains structured JSON sections ready for mapping
 * ```
 */

// Export core functionality
export {
  DocumentParser,
  parseDocument,
  type FileType,
  type ExtractedElement,
  type ParsedDocumentResult,
  type ParserOptions,
} from './parser-engine';

export {
  JSONConverter,
  convertToContentJSON,
  convertToSections,
  type ConversionOptions,
} from './json-converter';

export {
  SectionDetector,
  detectSections,
  type DetectionStrategy,
  type SectionDetectionOptions,
} from './section-detector';

// Export convenience types from contracts
export type {
  ContentJSON,
  ParsedSection,
  Block,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  TableBlock,
  CalloutBlock,
} from '@/lib/contracts/content-json.contract';

/**
 * Complete Pipeline Result
 */
export interface ParsedAndConvertedDocument {
  /** Original parsed document */
  parsed: import('./parser-engine').ParsedDocumentResult;

  /** Converted to ContentJSON */
  contentJSON: import('@/lib/contracts/content-json.contract').ContentJSON;

  /** Detected sections */
  sections: import('@/lib/contracts/content-json.contract').ParsedSection[];

  /** Overall statistics */
  stats: {
    totalPages: number;
    totalWords: number;
    totalSections: number;
    averageSectionSize: number;
    processingTime: number;
  };
}

/**
 * All-in-one convenience function
 *
 * Parse document → Convert to JSON → Detect sections
 *
 * @param filePath - Path to document file
 * @param options - Optional parsing/conversion options
 * @returns Complete parsed and converted document
 *
 * @example
 * const result = await parseAndConvert('./compensation-plan.pdf');
 * console.log(`Found ${result.sections.length} sections`);
 * result.sections.forEach(section => {
 *   console.log(`- ${section.detectedTitle}`);
 * });
 */
export async function parseAndConvert(
  filePath: string,
  options?: {
    parser?: import('./parser-engine').ParserOptions;
    converter?: import('./json-converter').ConversionOptions;
    detector?: import('./section-detector').SectionDetectionOptions;
  }
): Promise<ParsedAndConvertedDocument> {
  const startTime = Date.now();

  // Step 1: Parse document
  const { parseDocument } = await import('./parser-engine');
  const parsed = await parseDocument(filePath, options?.parser);

  // Step 2: Convert to ContentJSON
  const { convertToContentJSON } = await import('./json-converter');
  const contentJSON = convertToContentJSON(parsed, options?.converter);

  // Step 3: Detect sections
  const { detectSections } = await import('./section-detector');
  const sections = await detectSections(parsed, options?.detector);

  // Calculate stats
  const totalWords = sections.reduce((sum, s) => {
    return (
      sum +
      s.blocks.reduce((blockSum, b) => {
        if (b.type === 'paragraph' || b.type === 'heading') {
          return blockSum + b.content.split(/\s+/).length;
        }
        return blockSum;
      }, 0)
    );
  }, 0);

  const processingTime = Date.now() - startTime;

  return {
    parsed,
    contentJSON,
    sections,
    stats: {
      totalPages: parsed.pageCount || 1,
      totalWords,
      totalSections: sections.length,
      averageSectionSize: sections.length > 0 ? Math.round(totalWords / sections.length) : 0,
      processingTime,
    },
  };
}

/**
 * Quick parse - just extract sections
 *
 * Simplified interface for common use case.
 *
 * @param filePath - Path to document file
 * @returns Array of detected sections
 */
export async function quickParse(
  filePath: string
): Promise<import('@/lib/contracts/content-json.contract').ParsedSection[]> {
  const result = await parseAndConvert(filePath);
  return result.sections;
}
