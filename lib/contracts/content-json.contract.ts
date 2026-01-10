/**
 * Content JSON Schema - Block-Based Content Structure
 *
 * Structured JSON format for document content (plan sections, policy content, etc.).
 * Replaces markdown to eliminate artifacts and enable clean HTML rendering.
 */

/**
 * Block Types
 */
export type BlockType = 'heading' | 'paragraph' | 'list' | 'table' | 'callout' | 'divider';

/**
 * List Types
 */
export type ListType = 'ordered' | 'unordered';

/**
 * Callout Variants
 */
export type CalloutVariant = 'info' | 'warning' | 'error' | 'success';

/**
 * Text Formatting
 */
export interface TextFormatting {
  /** Character ranges for bold text: [start, end] */
  bold?: [number, number][];

  /** Character ranges for italic text: [start, end] */
  italic?: [number, number][];

  /** Character ranges for underlined text: [start, end] */
  underline?: [number, number][];

  /** Character ranges for strikethrough text: [start, end] */
  strikethrough?: [number, number][];

  /** Character ranges for inline code: [start, end] */
  code?: [number, number][];

  /** Links: { text: string, url: string, start: number, end: number }[] */
  links?: Array<{
    text: string;
    url: string;
    start: number;
    end: number;
  }>;
}

/**
 * Base Content Block
 */
export interface ContentBlock {
  /** Unique identifier for this block */
  id: string;

  /** Block type */
  type: BlockType;
}

/**
 * Heading Block
 */
export interface HeadingBlock extends ContentBlock {
  type: 'heading';

  /** Heading level (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;

  /** Heading text */
  content: string;

  /** Optional anchor ID for linking */
  anchor?: string;

  /** Optional text formatting */
  formatting?: TextFormatting;
}

/**
 * Paragraph Block
 */
export interface ParagraphBlock extends ContentBlock {
  type: 'paragraph';

  /** Paragraph text */
  content: string;

  /** Text formatting */
  formatting?: TextFormatting;

  /** Alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * List Block
 */
export interface ListBlock extends ContentBlock {
  type: 'list';

  /** List type */
  listType: ListType;

  /** List items */
  items: ListItem[];

  /** Starting number (for ordered lists) */
  start?: number;
}

/**
 * List Item
 */
export interface ListItem {
  /** Item text */
  text: string;

  /** Text formatting */
  formatting?: TextFormatting;

  /** Nested items */
  items?: ListItem[];

  /** Indentation level (0 = top level) */
  indent?: number;
}

/**
 * Table Block
 */
export interface TableBlock extends ContentBlock {
  type: 'table';

  /** Optional caption */
  caption?: string;

  /** Column headers */
  headers: string[];

  /** Data rows */
  rows: TableRow[];

  /** Column alignments */
  align?: Array<'left' | 'center' | 'right'>;
}

/**
 * Table Row
 */
export interface TableRow {
  /** Cell values */
  cells: string[];

  /** Cell formatting (optional, indexed by column) */
  formatting?: Record<number, TextFormatting>;
}

/**
 * Callout Block
 */
export interface CalloutBlock extends ContentBlock {
  type: 'callout';

  /** Callout variant */
  variant: CalloutVariant;

  /** Callout content */
  content: string;

  /** Optional title */
  title?: string;

  /** Text formatting */
  formatting?: TextFormatting;
}

/**
 * Divider Block
 */
export interface DividerBlock extends ContentBlock {
  type: 'divider';

  /** Divider style */
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Union type for all block types
 */
export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | CalloutBlock
  | DividerBlock;

/**
 * Content JSON Document
 *
 * Complete structured document with metadata.
 */
export interface ContentJSON {
  /** Document/section identifier */
  id?: string;

  /** Version of content schema */
  version: string;

  /** Document title */
  title?: string;

  /** Content blocks */
  blocks: Block[];

  /** Metadata */
  metadata?: ContentMetadata;
}

/**
 * Content Metadata
 */
export interface ContentMetadata {
  /** Completion status */
  completionStatus?: 'EMPTY' | 'PARTIAL' | 'COMPLETE';

  /** Last edited by */
  lastEditedBy?: string;

  /** Last edited timestamp */
  lastEditedAt?: string;

  /** Word count */
  wordCount?: number;

  /** AI suggestions count */
  aiSuggestions?: number;

  /** AI suggestions applied */
  aiSuggestionsApplied?: number;

  /** Source information */
  source?: {
    type: 'upload' | 'manual' | 'ai_generated' | 'policy';
    fileName?: string;
    pageRange?: { start: number; end: number };
  };
}

/**
 * Parsed Document Section
 *
 * A section detected from an uploaded document.
 */
export interface ParsedSection {
  /** Detected section title */
  detectedTitle: string;

  /** Content blocks */
  blocks: Block[];

  /** Page range in source document */
  pageRange?: { start: number; end: number };

  /** Confidence score (0-1) for section detection */
  confidence?: number;

  /** Detection method used */
  detectionMethod?: 'heading' | 'page_break' | 'whitespace' | 'ai';
}

/**
 * Parsed Document
 *
 * Complete result of parsing an uploaded document.
 */
export interface ParsedDocument {
  /** Document ID */
  documentId: string;

  /** Original filename */
  fileName: string;

  /** File type */
  fileType: 'pdf' | 'docx' | 'txt' | 'xlsx';

  /** Total pages/sheets */
  pageCount?: number;

  /** Detected sections */
  sections: ParsedSection[];

  /** Overall word count */
  wordCount: number;

  /** Parsing metadata */
  metadata: {
    parsedAt: string;
    parserVersion: string;
    processingTime: number; // milliseconds
    warnings?: string[];
    errors?: string[];
  };
}

/**
 * Generate a unique block ID
 */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a heading block
 */
export function createHeadingBlock(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  content: string,
  anchor?: string
): HeadingBlock {
  return {
    id: generateBlockId(),
    type: 'heading',
    level,
    content,
    anchor,
  };
}

/**
 * Create a paragraph block
 */
export function createParagraphBlock(
  content: string,
  formatting?: TextFormatting,
  align?: 'left' | 'center' | 'right' | 'justify'
): ParagraphBlock {
  return {
    id: generateBlockId(),
    type: 'paragraph',
    content,
    formatting,
    align,
  };
}

/**
 * Create a list block
 */
export function createListBlock(listType: ListType, items: ListItem[], start?: number): ListBlock {
  return {
    id: generateBlockId(),
    type: 'list',
    listType,
    items,
    start,
  };
}

/**
 * Create a table block
 */
export function createTableBlock(
  headers: string[],
  rows: TableRow[],
  caption?: string,
  align?: Array<'left' | 'center' | 'right'>
): TableBlock {
  return {
    id: generateBlockId(),
    type: 'table',
    caption,
    headers,
    rows,
    align,
  };
}

/**
 * Create a callout block
 */
export function createCalloutBlock(
  variant: CalloutVariant,
  content: string,
  title?: string,
  formatting?: TextFormatting
): CalloutBlock {
  return {
    id: generateBlockId(),
    type: 'callout',
    variant,
    content,
    title,
    formatting,
  };
}

/**
 * Create a divider block
 */
export function createDividerBlock(style?: 'solid' | 'dashed' | 'dotted'): DividerBlock {
  return {
    id: generateBlockId(),
    type: 'divider',
    style,
  };
}

/**
 * Extract plain text from blocks
 */
export function extractTextFromBlocks(blocks: Block[]): string {
  const textParts: string[] = [];

  blocks.forEach((block) => {
    switch (block.type) {
      case 'heading':
        textParts.push(block.content);
        break;

      case 'paragraph':
        textParts.push(block.content);
        break;

      case 'list':
        block.items.forEach((item) => {
          textParts.push(item.text);
          if (item.items) {
            item.items.forEach((subItem) => textParts.push(subItem.text));
          }
        });
        break;

      case 'table':
        if (block.caption) {
          textParts.push(block.caption);
        }
        textParts.push(block.headers.join(' '));
        block.rows.forEach((row) => {
          textParts.push(row.cells.join(' '));
        });
        break;

      case 'callout':
        if (block.title) {
          textParts.push(block.title);
        }
        textParts.push(block.content);
        break;

      case 'divider':
        // No text content
        break;
    }
  });

  return textParts.join('\n');
}

/**
 * Count words in blocks
 */
export function countWordsInBlocks(blocks: Block[]): number {
  const text = extractTextFromBlocks(blocks);
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Validate ContentJSON structure
 */
export function validateContentJSON(content: any): string[] {
  const errors: string[] = [];

  if (!content.version) {
    errors.push('version is required');
  }

  if (!Array.isArray(content.blocks)) {
    errors.push('blocks must be an array');
  } else {
    content.blocks.forEach((block: any, index: number) => {
      if (!block.id) {
        errors.push(`Block ${index}: id is required`);
      }

      if (!block.type) {
        errors.push(`Block ${index}: type is required`);
      }

      // Type-specific validation
      if (block.type === 'heading' && !block.content) {
        errors.push(`Block ${index} (heading): content is required`);
      }

      if (block.type === 'paragraph' && !block.content) {
        errors.push(`Block ${index} (paragraph): content is required`);
      }

      if (block.type === 'list' && !Array.isArray(block.items)) {
        errors.push(`Block ${index} (list): items must be an array`);
      }

      if (block.type === 'table') {
        if (!Array.isArray(block.headers)) {
          errors.push(`Block ${index} (table): headers must be an array`);
        }
        if (!Array.isArray(block.rows)) {
          errors.push(`Block ${index} (table): rows must be an array`);
        }
      }

      if (block.type === 'callout' && !block.content) {
        errors.push(`Block ${index} (callout): content is required`);
      }
    });
  }

  return errors;
}
