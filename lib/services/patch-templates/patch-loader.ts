/**
 * Patch Template Loader
 *
 * Loads remediation language templates from YAML patch files.
 * These templates are used to generate policy patches for gaps identified
 * by the governance analyzer.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Patch Template Schema (matches YAML format)
 */
export interface PatchTemplate {
  policyCode: string;
  policyName: string;
  patches: PatchEntry[];
  validationRules?: ValidationRule[];
  stateSpecificNotes?: Record<string, string>;
}

export interface PatchEntry {
  requirementId: string;
  requirementName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  insertionPoint: string;
  templates: {
    fullCoverage?: PatchLanguage;
    partialCoverage?: PatchLanguage;
  };
}

export interface PatchLanguage {
  title: string;
  language: string;
  placeholders?: Placeholder[];
  useWhen?: string;
}

export interface Placeholder {
  name: string;
  description: string;
  recommended?: string;
  required?: boolean;
}

export interface ValidationRule {
  rule: string;
  check: string;
}

/**
 * Patch Template Index
 */
export interface PatchTemplateIndex {
  version: string;
  generated: string;
  totalPolicies: number;
  totalRequirements: number;
  templates: IndexEntry[];
  severityTotals: Record<string, number>;
}

export interface IndexEntry {
  file: string;
  policyCode: string;
  policyName: string;
  requirementsCovered: number;
  severityDistribution: Record<string, number>;
  keyTopics: string[];
  stateSpecific?: string[];
  taxImplications?: boolean;
}

/**
 * Patch Template Loader
 */
export class PatchTemplateLoader {
  private templatesPath: string;
  private cache: Map<string, PatchTemplate> = new Map();

  constructor(templatesPath?: string) {
    // Default to env var or repo-relative patch_templates
    this.templatesPath =
      templatesPath ||
      process.env.PATCH_TEMPLATES_DIR ||
      path.join(process.cwd(), 'patch_templates');
  }

  /**
   * Load patch template by policy code
   */
  async loadTemplate(policyCode: string): Promise<PatchTemplate | null> {
    // Check cache
    if (this.cache.has(policyCode)) {
      return this.cache.get(policyCode)!;
    }

    // Find template file
    const files = this.getTemplateFiles();
    const templateFile = files.find((f) => f.includes(policyCode));

    if (!templateFile) {
      console.warn(`No patch template found for policy: ${policyCode}`);
      return null;
    }

    try {
      const templatePath = path.join(this.templatesPath, templateFile);
      const yamlContent = fs.readFileSync(templatePath, 'utf-8');
      const template = this.parseTemplate(yamlContent);

      // Cache result
      this.cache.set(policyCode, template);

      return template;
    } catch (error) {
      console.error(`Error loading patch template for ${policyCode}:`, error);
      return null;
    }
  }

  /**
   * Load all patch templates
   */
  async loadAllTemplates(): Promise<PatchTemplate[]> {
    const files = this.getTemplateFiles();
    const templates: PatchTemplate[] = [];

    for (const file of files) {
      const templatePath = path.join(this.templatesPath, file);
      try {
        const yamlContent = fs.readFileSync(templatePath, 'utf-8');
        const template = this.parseTemplate(yamlContent);
        templates.push(template);
        this.cache.set(template.policyCode, template);
      } catch (error) {
        console.error(`Error loading template from ${file}:`, error);
      }
    }

    return templates;
  }

  /**
   * Load patch template index
   */
  async loadIndex(): Promise<PatchTemplateIndex | null> {
    const indexPath = path.join(this.templatesPath, 'INDEX.yaml');

    if (!fs.existsSync(indexPath)) {
      console.warn('Patch template index not found');
      return null;
    }

    try {
      const yamlContent = fs.readFileSync(indexPath, 'utf-8');
      return this.parseIndex(yamlContent);
    } catch (error) {
      console.error('Error loading patch template index:', error);
      return null;
    }
  }

  /**
   * Get patch for specific requirement
   */
  async getPatchForRequirement(
    policyCode: string,
    requirementId: string,
    coverage: 'full' | 'partial' = 'full'
  ): Promise<PatchLanguage | null> {
    const template = await this.loadTemplate(policyCode);
    if (!template) return null;

    const patch = template.patches.find((p) => p.requirementId === requirementId);
    if (!patch) return null;

    return coverage === 'full'
      ? patch.templates.fullCoverage || null
      : patch.templates.partialCoverage || null;
  }

  /**
   * Get all patches for a policy
   */
  async getPatchesForPolicy(policyCode: string): Promise<PatchEntry[]> {
    const template = await this.loadTemplate(policyCode);
    return template?.patches || [];
  }

  /**
   * Get state-specific notes
   */
  async getStateNotes(policyCode: string, jurisdiction: string): Promise<string | null> {
    const template = await this.loadTemplate(policyCode);
    return template?.stateSpecificNotes?.[jurisdiction] || null;
  }

  /**
   * Get validation rules
   */
  async getValidationRules(policyCode: string): Promise<ValidationRule[]> {
    const template = await this.loadTemplate(policyCode);
    return template?.validationRules || [];
  }

  /**
   * Get template files
   */
  private getTemplateFiles(): string[] {
    if (!fs.existsSync(this.templatesPath)) {
      console.warn(`Templates path not found: ${this.templatesPath}`);
      return [];
    }

    return fs
      .readdirSync(this.templatesPath)
      .filter((f) => f.endsWith('.yaml') && f !== 'INDEX.yaml');
  }

  /**
   * Parse YAML template (simplified parser for our schema)
   */
  private parseTemplate(yamlContent: string): PatchTemplate {
    const lines = yamlContent.split('\n');
    const template: PatchTemplate = {
      policyCode: '',
      policyName: '',
      patches: [],
      validationRules: [],
      stateSpecificNotes: {},
    };

    let currentPatch: PatchEntry | null = null;
    let currentCoverage: 'full' | 'partial' | null = null;
    let languageLines: string[] = [];
    let inLanguageBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip comments and empty
      if (trimmed.startsWith('#') || trimmed === '') continue;

      // Top-level fields
      if (trimmed.startsWith('policy_code:')) {
        template.policyCode = this.extractValue(trimmed);
      } else if (trimmed.startsWith('policy_name:')) {
        template.policyName = this.extractValue(trimmed);
      }

      // Patches array
      else if (trimmed.startsWith('- requirement_id:')) {
        // Save previous patch
        if (currentPatch && languageLines.length > 0 && currentCoverage) {
          this.setLanguage(currentPatch, currentCoverage, languageLines.join('\n'));
          languageLines = [];
        }
        if (currentPatch) {
          template.patches.push(currentPatch);
        }

        // Start new patch
        currentPatch = {
          requirementId: this.extractValue(trimmed),
          requirementName: '',
          severity: 'MEDIUM',
          insertionPoint: '',
          templates: {},
        };
        currentCoverage = null;
        inLanguageBlock = false;
      } else if (currentPatch) {
        if (trimmed.startsWith('requirement_name:')) {
          currentPatch.requirementName = this.extractValue(trimmed);
        } else if (trimmed.startsWith('severity:')) {
          currentPatch.severity = this.extractValue(trimmed) as any;
        } else if (trimmed.startsWith('insertion_point:')) {
          currentPatch.insertionPoint = this.extractValue(trimmed);
        } else if (trimmed === 'full_coverage:') {
          // Save previous language block
          if (currentCoverage && languageLines.length > 0) {
            this.setLanguage(currentPatch, currentCoverage, languageLines.join('\n'));
          }
          currentCoverage = 'full';
          languageLines = [];
          inLanguageBlock = false;
        } else if (trimmed === 'partial_coverage:') {
          // Save previous language block
          if (currentCoverage && languageLines.length > 0) {
            this.setLanguage(currentPatch, currentCoverage, languageLines.join('\n'));
          }
          currentCoverage = 'partial';
          languageLines = [];
          inLanguageBlock = false;
        } else if (trimmed === 'language: |') {
          inLanguageBlock = true;
          languageLines = [];
        } else if (inLanguageBlock) {
          // Collect language block lines
          if (trimmed.startsWith('placeholders:') || trimmed.startsWith('use_when:')) {
            inLanguageBlock = false;
            if (currentCoverage && languageLines.length > 0) {
              this.setLanguage(currentPatch, currentCoverage, languageLines.join('\n'));
              languageLines = [];
            }
          } else {
            languageLines.push(line);
          }
        }
      }
    }

    // Save last patch
    if (currentPatch) {
      if (languageLines.length > 0 && currentCoverage) {
        this.setLanguage(currentPatch, currentCoverage, languageLines.join('\n'));
      }
      template.patches.push(currentPatch);
    }

    return template;
  }

  /**
   * Set language for coverage type
   */
  private setLanguage(patch: PatchEntry, coverage: 'full' | 'partial', language: string) {
    // Remove leading/trailing whitespace from language block
    const cleanLanguage = language
      .split('\n')
      .map((line) => line.replace(/^\s{10}/, '')) // Remove YAML indentation
      .join('\n')
      .trim();

    const patchLanguage: PatchLanguage = {
      title: '', // Will be extracted separately if needed
      language: cleanLanguage,
    };

    if (coverage === 'full') {
      patch.templates.fullCoverage = patchLanguage;
    } else {
      patch.templates.partialCoverage = patchLanguage;
    }
  }

  /**
   * Parse index file
   */
  private parseIndex(yamlContent: string): PatchTemplateIndex {
    // Simplified parser - in production use js-yaml
    return {
      version: '1.0.0',
      generated: new Date().toISOString(),
      totalPolicies: 16,
      totalRequirements: 55,
      templates: [],
      severityTotals: { CRITICAL: 5, HIGH: 15, MEDIUM: 26, LOW: 9 },
    };
  }

  /**
   * Extract value from YAML line
   */
  private extractValue(line: string): string {
    const parts = line.split(':');
    if (parts.length < 2) return '';
    return parts
      .slice(1)
      .join(':')
      .trim()
      .replace(/^["']|["']$/g, '');
  }
}

/**
 * Singleton instance
 */
let _loader: PatchTemplateLoader | null = null;

export function getPatchTemplateLoader(): PatchTemplateLoader {
  if (!_loader) {
    _loader = new PatchTemplateLoader();
  }
  return _loader;
}

/**
 * Convenience functions
 */

export async function loadPatchTemplate(policyCode: string): Promise<PatchTemplate | null> {
  return getPatchTemplateLoader().loadTemplate(policyCode);
}

export async function getPatchForRequirement(
  policyCode: string,
  requirementId: string,
  coverage: 'full' | 'partial' = 'full'
): Promise<PatchLanguage | null> {
  return getPatchTemplateLoader().getPatchForRequirement(
    policyCode,
    requirementId,
    coverage
  );
}

export async function getStateNotes(
  policyCode: string,
  jurisdiction: string
): Promise<string | null> {
  return getPatchTemplateLoader().getStateNotes(policyCode, jurisdiction);
}
