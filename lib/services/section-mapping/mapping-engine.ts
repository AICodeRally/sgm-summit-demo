/**
 * Section Mapping Engine
 *
 * Maps parsed document sections to plan template sections using 3-level algorithm:
 * Level 1: Exact title match
 * Level 2: Fuzzy match (fuse.js)
 * Level 3: AI-enhanced mapping
 */

import Fuse from 'fuse.js';
import type { ParsedSection } from '@/lib/contracts/content-json.contract';
import { STANDARD_PLAN_TEMPLATE, type TemplateSection } from '@/lib/data/plan-template-library.data';

/**
 * Mapping Method
 */
export type MappingMethod = 'EXACT' | 'FUZZY' | 'AI_SUGGESTED' | 'MANUAL';

/**
 * Mapping Status
 */
export type MappingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED';

/**
 * Section Mapping
 *
 * Links a parsed section to a template section.
 */
export interface SectionMapping {
  /** Unique mapping ID */
  id: string;

  /** Source parsed section */
  parsedSection: ParsedSection;

  /** Target template section key */
  templateSectionId: string;

  /** Template section details */
  templateSection: TemplateSection;

  /** Confidence score (0-1) */
  confidenceScore: number;

  /** Mapping method used */
  mappingMethod: MappingMethod;

  /** Current status */
  status: MappingStatus;

  /** Alternative suggestions */
  alternativeSuggestions?: Array<{
    templateSectionId: string;
    templateSection: TemplateSection;
    score: number;
  }>;
}

/**
 * Mapping Options
 */
export interface MappingOptions {
  /** Exact match: minimum title similarity (0-1) */
  exactMatchThreshold?: number;

  /** Fuzzy match: minimum score (0-1) */
  fuzzyMatchThreshold?: number;

  /** AI match: minimum confidence (0-1) */
  aiMatchThreshold?: number;

  /** Auto-accept threshold (mappings above this are auto-accepted) */
  autoAcceptThreshold?: number;

  /** Number of alternative suggestions to include */
  maxAlternatives?: number;

  /** Template sections to use (defaults to STANDARD_PLAN_TEMPLATE) */
  templateSections?: TemplateSection[];
}

const DEFAULT_OPTIONS: MappingOptions = {
  exactMatchThreshold: 0.95,
  fuzzyMatchThreshold: 0.6,
  aiMatchThreshold: 0.7,
  autoAcceptThreshold: 0.9,
  maxAlternatives: 3,
};

/**
 * Section Mapping Engine
 */
export class MappingEngine {
  private options: MappingOptions;
  private templateSections: TemplateSection[];
  private fuse: Fuse<TemplateSection>;

  constructor(options: Partial<MappingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.templateSections = options.templateSections || STANDARD_PLAN_TEMPLATE;

    // Initialize Fuse.js for fuzzy matching
    this.fuse = new Fuse(this.templateSections, {
      keys: ['title', 'description', 'sectionNumber'],
      threshold: 0.4, // Lower = more strict
      includeScore: true,
      minMatchCharLength: 3,
    });
  }

  /**
   * Map multiple sections to template
   */
  async mapSections(parsedSections: ParsedSection[]): Promise<SectionMapping[]> {
    const mappings: SectionMapping[] = [];

    for (const parsed of parsedSections) {
      const mapping = await this.mapSingleSection(parsed);
      mappings.push(mapping);
    }

    return mappings;
  }

  /**
   * Map a single section to template
   */
  async mapSingleSection(parsedSection: ParsedSection): Promise<SectionMapping> {
    // Level 1: Try exact match
    const exactMatch = this.findExactMatch(parsedSection);
    if (exactMatch) {
      return this.createMapping(
        parsedSection,
        exactMatch.section,
        exactMatch.score,
        'EXACT',
        exactMatch.alternatives
      );
    }

    // Level 2: Try fuzzy match
    const fuzzyMatch = this.findFuzzyMatch(parsedSection);
    if (fuzzyMatch) {
      return this.createMapping(
        parsedSection,
        fuzzyMatch.section,
        fuzzyMatch.score,
        'FUZZY',
        fuzzyMatch.alternatives
      );
    }

    // Level 3: Try AI match (placeholder)
    const aiMatch = await this.findAIMatch(parsedSection);
    if (aiMatch) {
      return this.createMapping(
        parsedSection,
        aiMatch.section,
        aiMatch.score,
        'AI_SUGGESTED',
        aiMatch.alternatives
      );
    }

    // No match found - return best guess from fuzzy search
    const bestGuess = this.findBestGuess(parsedSection);
    return this.createMapping(
      parsedSection,
      bestGuess.section,
      bestGuess.score,
      'MANUAL',
      bestGuess.alternatives
    );
  }

  /**
   * Level 1: Exact title match
   */
  private findExactMatch(
    parsedSection: ParsedSection
  ): { section: TemplateSection; score: number; alternatives: Array<any> } | null {
    const normalizedTitle = this.normalizeTitle(parsedSection.detectedTitle);

    for (const template of this.templateSections) {
      const normalizedTemplate = this.normalizeTitle(template.title);

      // Calculate similarity
      const similarity = this.calculateSimilarity(normalizedTitle, normalizedTemplate);

      if (similarity >= this.options.exactMatchThreshold!) {
        // Find alternatives
        const alternatives = this.findAlternatives(parsedSection, template.id);

        return {
          section: template,
          score: similarity,
          alternatives,
        };
      }
    }

    return null;
  }

  /**
   * Level 2: Fuzzy match using Fuse.js
   */
  private findFuzzyMatch(
    parsedSection: ParsedSection
  ): { section: TemplateSection; score: number; alternatives: Array<any> } | null {
    const searchText = parsedSection.detectedTitle;
    const results = this.fuse.search(searchText);

    if (results.length === 0) {
      return null;
    }

    const topResult = results[0];
    const score = 1 - (topResult.score || 0); // Fuse returns 0 = perfect match, so invert

    if (score >= this.options.fuzzyMatchThreshold!) {
      const alternatives = results
        .slice(1, this.options.maxAlternatives! + 1)
        .map((r) => ({
          templateSectionId: r.item.id,
          templateSection: r.item,
          score: 1 - (r.score || 0),
        }));

      return {
        section: topResult.item,
        score,
        alternatives,
      };
    }

    return null;
  }

  /**
   * Level 3: AI-enhanced matching (placeholder)
   */
  private async findAIMatch(
    parsedSection: ParsedSection
  ): Promise<{ section: TemplateSection; score: number; alternatives: Array<any> } | null> {
    // Placeholder for AI-enhanced matching
    // Would call OpenAI/Anthropic API to analyze section content and suggest best match
    console.log('[MappingEngine] AI matching not yet implemented');
    return null;
  }

  /**
   * Find best guess when no good match found
   */
  private findBestGuess(
    parsedSection: ParsedSection
  ): { section: TemplateSection; score: number; alternatives: Array<any> } {
    const results = this.fuse.search(parsedSection.detectedTitle);

    if (results.length > 0) {
      const topResult = results[0];
      const alternatives = results
        .slice(1, this.options.maxAlternatives! + 1)
        .map((r) => ({
          templateSectionId: r.item.id,
          templateSection: r.item,
          score: 1 - (r.score || 0),
        }));

      return {
        section: topResult.item,
        score: 1 - (topResult.score || 0),
        alternatives,
      };
    }

    // Return first template section as last resort
    return {
      section: this.templateSections[0],
      score: 0.1,
      alternatives: [],
    };
  }

  /**
   * Find alternative suggestions
   */
  private findAlternatives(
    parsedSection: ParsedSection,
    excludeId: string
  ): Array<{ templateSectionId: string; templateSection: TemplateSection; score: number }> {
    const results = this.fuse.search(parsedSection.detectedTitle);

    return results
      .filter((r) => r.item.id !== excludeId)
      .slice(0, this.options.maxAlternatives!)
      .map((r) => ({
        templateSectionId: r.item.id,
        templateSection: r.item,
        score: 1 - (r.score || 0),
      }));
  }

  /**
   * Create a section mapping
   */
  private createMapping(
    parsedSection: ParsedSection,
    templateSection: TemplateSection,
    score: number,
    method: MappingMethod,
    alternatives?: Array<any>
  ): SectionMapping {
    const status: MappingStatus =
      score >= this.options.autoAcceptThreshold! ? 'ACCEPTED' : 'PENDING';

    return {
      id: this.generateMappingId(),
      parsedSection,
      templateSectionId: templateSection.id,
      templateSection,
      confidenceScore: score,
      mappingMethod: method,
      status,
      alternativeSuggestions: alternatives,
    };
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate similarity between two strings (Levenshtein distance)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate unique mapping ID
   */
  private generateMappingId(): string {
    return `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get mapping statistics
   */
  getMappingStatistics(mappings: SectionMapping[]): {
    total: number;
    byMethod: Record<MappingMethod, number>;
    byStatus: Record<MappingStatus, number>;
    averageConfidence: number;
    autoAccepted: number;
    needsReview: number;
  } {
    const byMethod: Record<MappingMethod, number> = {
      EXACT: 0,
      FUZZY: 0,
      AI_SUGGESTED: 0,
      MANUAL: 0,
    };

    const byStatus: Record<MappingStatus, number> = {
      PENDING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      MODIFIED: 0,
    };

    let totalConfidence = 0;

    mappings.forEach((mapping) => {
      byMethod[mapping.mappingMethod]++;
      byStatus[mapping.status]++;
      totalConfidence += mapping.confidenceScore;
    });

    return {
      total: mappings.length,
      byMethod,
      byStatus,
      averageConfidence: mappings.length > 0 ? totalConfidence / mappings.length : 0,
      autoAccepted: byStatus.ACCEPTED,
      needsReview: byStatus.PENDING + byStatus.MODIFIED,
    };
  }
}

/**
 * Convenience function to map sections
 */
export async function mapSectionsToTemplate(
  parsedSections: ParsedSection[],
  options?: Partial<MappingOptions>
): Promise<SectionMapping[]> {
  const engine = new MappingEngine(options);
  return engine.mapSections(parsedSections);
}
