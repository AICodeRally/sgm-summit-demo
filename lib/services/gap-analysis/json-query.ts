/**
 * JSON Query Utilities
 *
 * Utilities for searching and querying ContentJSON structures.
 */

import type { ContentJSON, Block, ParsedSection } from '@/lib/contracts/content-json.contract';

/**
 * Extract all text content from ContentJSON blocks
 */
export function extractTextFromJSON(contentJSON: ContentJSON | ParsedSection): string {
  const blocks = 'blocks' in contentJSON ? contentJSON.blocks : [];

  return blocks
    .map((block) => extractTextFromBlock(block))
    .filter((text) => text.length > 0)
    .join(' ');
}

/**
 * Extract text from a single block
 */
export function extractTextFromBlock(block: Block): string {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
    case 'callout':
      return block.content;

    case 'list':
      return block.items.map((item) => item.text).join(' ');

    case 'table':
      const headerText = block.headers.join(' ');
      const rowText = block.rows
        .map((row) => row.cells.join(' '))
        .join(' ');
      return `${headerText} ${rowText}`;

    case 'divider':
      return '';

    default:
      return '';
  }
}

/**
 * Search for keywords in ContentJSON
 *
 * @param contentJSON - Content to search
 * @param keywords - Keywords to search for
 * @param options - Search options
 * @returns Array of found keywords with contexts
 */
export function searchKeywordsInJSON(
  contentJSON: ContentJSON | ParsedSection,
  keywords: string[],
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    contextWindow?: number;
  } = {}
): Array<{
  keyword: string;
  found: boolean;
  matches: Array<{
    blockIndex: number;
    blockType: string;
    context: string;
  }>;
}> {
  const { caseSensitive = false, wholeWord = false, contextWindow = 50 } = options;

  const blocks = 'blocks' in contentJSON ? contentJSON.blocks : [];

  return keywords.map((keyword) => {
    const matches: Array<{
      blockIndex: number;
      blockType: string;
      context: string;
    }> = [];

    blocks.forEach((block, index) => {
      const text = extractTextFromBlock(block);

      // Prepare search
      const searchText = caseSensitive ? text : text.toLowerCase();
      const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();

      // Create regex for matching
      const pattern = wholeWord
        ? new RegExp(`\\b${escapeRegex(searchKeyword)}\\b`, caseSensitive ? 'g' : 'gi')
        : new RegExp(escapeRegex(searchKeyword), caseSensitive ? 'g' : 'gi');

      // Search for matches
      const matchResult = text.match(pattern);

      if (matchResult) {
        // Extract context
        const keywordIndex = searchText.indexOf(searchKeyword);
        const start = Math.max(0, keywordIndex - contextWindow);
        const end = Math.min(text.length, keywordIndex + searchKeyword.length + contextWindow);

        let context = text.substring(start, end);
        if (start > 0) context = '...' + context;
        if (end < text.length) context = context + '...';

        matches.push({
          blockIndex: index,
          blockType: block.type,
          context,
        });
      }
    });

    return {
      keyword,
      found: matches.length > 0,
      matches,
    };
  });
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find blocks by type
 */
export function findBlocksByType(
  contentJSON: ContentJSON | ParsedSection,
  blockType: Block['type']
): Block[] {
  const blocks = 'blocks' in contentJSON ? contentJSON.blocks : [];
  return blocks.filter((block) => block.type === blockType);
}

/**
 * Find headings with specific text
 */
export function findHeadingsByText(
  contentJSON: ContentJSON | ParsedSection,
  searchText: string,
  options: { caseSensitive?: boolean; exactMatch?: boolean } = {}
): Array<{ blockIndex: number; heading: string; level: number }> {
  const { caseSensitive = false, exactMatch = false } = options;

  const blocks = 'blocks' in contentJSON ? contentJSON.blocks : [];

  const results: Array<{ blockIndex: number; heading: string; level: number }> = [];

  blocks.forEach((block, index) => {
    if (block.type === 'heading') {
      const headingText = caseSensitive ? block.content : block.content.toLowerCase();
      const search = caseSensitive ? searchText : searchText.toLowerCase();

      const matches = exactMatch
        ? headingText === search
        : headingText.includes(search);

      if (matches) {
        results.push({
          blockIndex: index,
          heading: block.content,
          level: block.level,
        });
      }
    }
  });

  return results;
}

/**
 * Calculate keyword coverage
 *
 * @param contentJSON - Content to analyze
 * @param keywords - Keywords to check for
 * @returns Coverage score (0-1)
 */
export function calculateKeywordCoverage(
  contentJSON: ContentJSON | ParsedSection,
  keywords: string[]
): number {
  if (keywords.length === 0) return 1;

  const searchResults = searchKeywordsInJSON(contentJSON, keywords, {
    caseSensitive: false,
    wholeWord: false,
  });

  const foundKeywords = searchResults.filter((r) => r.found).length;

  return foundKeywords / keywords.length;
}

/**
 * Find sections by keyword
 *
 * @param sections - Array of parsed sections
 * @param keywords - Keywords to search for
 * @returns Sections containing at least one keyword
 */
export function findSectionsByKeyword(
  sections: ParsedSection[],
  keywords: string[]
): ParsedSection[] {
  return sections.filter((section) => {
    const coverage = calculateKeywordCoverage(section, keywords);
    return coverage > 0;
  });
}

/**
 * Analyze keyword distribution across sections
 *
 * @param sections - Array of parsed sections
 * @param keywords - Keywords to analyze
 * @returns Distribution map
 */
export function analyzeKeywordDistribution(
  sections: ParsedSection[],
  keywords: string[]
): Map<
  string,
  {
    sectionTitle: string;
    keywordsFound: string[];
    coverageScore: number;
  }
> {
  const distribution = new Map<
    string,
    {
      sectionTitle: string;
      keywordsFound: string[];
      coverageScore: number;
    }
  >();

  sections.forEach((section) => {
    const searchResults = searchKeywordsInJSON(section, keywords, {
      caseSensitive: false,
      wholeWord: false,
    });

    const keywordsFound = searchResults.filter((r) => r.found).map((r) => r.keyword);

    const coverageScore = keywordsFound.length / keywords.length;

    distribution.set(section.detectedTitle, {
      sectionTitle: section.detectedTitle,
      keywordsFound,
      coverageScore,
    });
  });

  return distribution;
}

/**
 * Extract definitions from ContentJSON
 *
 * Looks for common definition patterns like:
 * - "Term: Definition"
 * - "Term - Definition"
 * - Bulleted lists in "Definitions" section
 */
export function extractDefinitions(
  contentJSON: ContentJSON | ParsedSection
): Array<{ term: string; definition: string }> {
  const definitions: Array<{ term: string; definition: string }> = [];

  const blocks = 'blocks' in contentJSON ? contentJSON.blocks : [];

  blocks.forEach((block) => {
    if (block.type === 'list') {
      // Check list items for definition patterns
      block.items.forEach((item) => {
        const colonMatch = item.text.match(/^(.+?):\s*(.+)$/);
        if (colonMatch) {
          definitions.push({
            term: colonMatch[1].trim(),
            definition: colonMatch[2].trim(),
          });
          return;
        }

        const dashMatch = item.text.match(/^(.+?)\s*-\s*(.+)$/);
        if (dashMatch) {
          definitions.push({
            term: dashMatch[1].trim(),
            definition: dashMatch[2].trim(),
          });
        }
      });
    } else if (block.type === 'paragraph') {
      // Check paragraphs for inline definitions
      const colonMatch = block.content.match(/^(.+?):\s*(.+)$/);
      if (colonMatch) {
        definitions.push({
          term: colonMatch[1].trim(),
          definition: colonMatch[2].trim(),
        });
      }
    }
  });

  return definitions;
}

/**
 * Count words in ContentJSON
 */
export function countWords(contentJSON: ContentJSON | ParsedSection): number {
  const text = extractTextFromJSON(contentJSON);
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Get content summary statistics
 */
export function getContentStats(contentJSON: ContentJSON | ParsedSection): {
  totalBlocks: number;
  blockTypes: Record<string, number>;
  totalWords: number;
  headingCount: number;
  listCount: number;
  tableCount: number;
} {
  const blocks = 'blocks' in contentJSON ? contentJSON.blocks : [];

  const blockTypes: Record<string, number> = {};

  blocks.forEach((block) => {
    blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
  });

  return {
    totalBlocks: blocks.length,
    blockTypes,
    totalWords: countWords(contentJSON),
    headingCount: blockTypes.heading || 0,
    listCount: blockTypes.list || 0,
    tableCount: blockTypes.table || 0,
  };
}
