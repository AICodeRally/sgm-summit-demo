/**
 * YAML Requirement Matrix Loader
 *
 * Loads and parses requirement-matrix-full.yaml into TypeScript types.
 * Supports the full GovLens requirement schema.
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  RequirementMatrixEntry,
  PolicyRequirement,
  RiskTriggerDefinition,
  JurisdictionDefinition,
} from '@/lib/contracts/governance-gap.contract';

/**
 * YAML Schema Types
 */
interface YAMLRequirementMatrix {
  policies: YAMLPolicy[];
  riskTriggers?: YAMLRiskTrigger[];
  jurisdictions?: YAMLJurisdiction[];
}

interface YAMLPolicy {
  code: string;
  name: string;
  category: string;
  requirements: YAMLRequirement[];
}

interface YAMLRequirement {
  id: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detection: {
    positivePatterns?: string[];
    negativePatterns?: string[];
    requiredElements?: Array<{
      name: string;
      type: 'value' | 'list';
      expectedValues?: string[];
    }>;
  };
  scoring: {
    A: string;
    B: string;
    C: string;
  };
  insertionPoint: string;
}

interface YAMLRiskTrigger {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  liabilityImpact: number;
  category?: string;
}

interface YAMLJurisdiction {
  code: string;
  name: string;
  multiplier: number;
  wageLawFlags: string[];
}

/**
 * Load and parse YAML requirement matrix
 */
export function loadRequirementMatrix(): RequirementMatrixEntry[] {
  const yamlPath = path.join(
    process.cwd(),
    'lib',
    'data',
    'governance',
    'requirement-matrix-full.yaml'
  );

  if (!fs.existsSync(yamlPath)) {
    console.warn('YAML requirement matrix not found, using TypeScript fallback');
    return [];
  }

  try {
    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    const parsed = parseYAML(yamlContent);

    return parsed.policies.map((policy) => convertPolicyToTS(policy));
  } catch (error) {
    console.error('Error loading YAML requirement matrix:', error);
    return [];
  }
}

/**
 * Load risk triggers from YAML
 */
export function loadRiskTriggers(): RiskTriggerDefinition[] {
  const yamlPath = path.join(
    process.cwd(),
    'lib',
    'data',
    'governance',
    'requirement-matrix-full.yaml'
  );

  if (!fs.existsSync(yamlPath)) {
    return [];
  }

  try {
    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    const parsed = parseYAML(yamlContent);

    return (parsed.riskTriggers || []).map((trigger) => convertRiskTriggerToTS(trigger));
  } catch (error) {
    console.error('Error loading risk triggers from YAML:', error);
    return [];
  }
}

/**
 * Load jurisdictions from YAML
 */
export function loadJurisdictions(): JurisdictionDefinition[] {
  const yamlPath = path.join(
    process.cwd(),
    'lib',
    'data',
    'governance',
    'requirement-matrix-full.yaml'
  );

  if (!fs.existsSync(yamlPath)) {
    return [];
  }

  try {
    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    const parsed = parseYAML(yamlContent);

    return (parsed.jurisdictions || []).map((jurisdiction) => ({
      code: jurisdiction.code,
      name: jurisdiction.name,
      multiplier: jurisdiction.multiplier,
      wageLawFlags: jurisdiction.wageLawFlags,
    }));
  } catch (error) {
    console.error('Error loading jurisdictions from YAML:', error);
    return [];
  }
}

/**
 * Simple YAML parser (handles our specific schema)
 */
function parseYAML(content: string): YAMLRequirementMatrix {
  // This is a simplified parser for our specific YAML format
  // In production, use a library like 'js-yaml'

  const result: YAMLRequirementMatrix = {
    policies: [],
    riskTriggers: [],
    jurisdictions: [],
  };

  let currentSection: 'policies' | 'riskTriggers' | 'jurisdictions' | null = null;
  let currentPolicy: YAMLPolicy | null = null;
  let currentRequirement: YAMLRequirement | null = null;
  let currentTrigger: YAMLRiskTrigger | null = null;
  let currentJurisdiction: YAMLJurisdiction | null = null;

  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      i++;
      continue;
    }

    // Detect sections
    if (trimmed === 'policies:') {
      currentSection = 'policies';
      i++;
      continue;
    }
    if (trimmed === 'riskTriggers:' || trimmed === 'risk_triggers:') {
      currentSection = 'riskTriggers';
      i++;
      continue;
    }
    if (trimmed === 'jurisdictions:') {
      currentSection = 'jurisdictions';
      i++;
      continue;
    }

    // Parse based on current section
    if (currentSection === 'policies') {
      // New policy
      if (trimmed.startsWith('- code:')) {
        if (currentPolicy) {
          result.policies.push(currentPolicy);
        }
        currentPolicy = {
          code: extractValue(trimmed),
          name: '',
          category: '',
          requirements: [],
        };
        currentRequirement = null;
      } else if (currentPolicy) {
        if (trimmed.startsWith('name:')) {
          currentPolicy.name = extractValue(trimmed);
        } else if (trimmed.startsWith('category:')) {
          currentPolicy.category = extractValue(trimmed);
        } else if (trimmed === 'requirements:') {
          // Start requirements array
        } else if (trimmed.startsWith('- id:')) {
          // New requirement
          if (currentRequirement) {
            currentPolicy.requirements.push(currentRequirement);
          }
          currentRequirement = {
            id: extractValue(trimmed),
            name: '',
            description: '',
            severity: 'MEDIUM',
            detection: {},
            scoring: { A: '', B: '', C: '' },
            insertionPoint: '',
          };
        } else if (currentRequirement) {
          // Parse requirement fields
          if (trimmed.startsWith('name:')) {
            currentRequirement.name = extractValue(trimmed);
          } else if (trimmed.startsWith('description:')) {
            currentRequirement.description = extractValue(trimmed);
          } else if (trimmed.startsWith('severity:')) {
            currentRequirement.severity = extractValue(trimmed) as any;
          } else if (trimmed.startsWith('insertionPoint:')) {
            currentRequirement.insertionPoint = extractValue(trimmed);
          }
          // Handle detection, scoring (simplified)
        }
      }
    }

    i++;
  }

  // Push last policy
  if (currentPolicy) {
    if (currentRequirement) {
      currentPolicy.requirements.push(currentRequirement);
    }
    result.policies.push(currentPolicy);
  }

  return result;
}

/**
 * Extract value from YAML line (key: value)
 */
function extractValue(line: string): string {
  const parts = line.split(':');
  if (parts.length < 2) return '';
  return parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
}

/**
 * Convert YAML policy to TypeScript format
 */
function convertPolicyToTS(policy: YAMLPolicy): RequirementMatrixEntry {
  return {
    policyCode: policy.code,
    policyName: policy.name,
    category: policy.category,
    requirements: policy.requirements.map((req) => convertRequirementToTS(req)),
  };
}

/**
 * Convert YAML requirement to TypeScript format
 */
function convertRequirementToTS(req: YAMLRequirement): PolicyRequirement {
  const requiredElements: Record<string, any> = {};

  if (req.detection.requiredElements) {
    req.detection.requiredElements.forEach((elem) => {
      if (elem.type === 'list' && elem.expectedValues) {
        requiredElements[elem.name] = elem.expectedValues;
      } else {
        requiredElements[elem.name] = elem.expectedValues?.[0] || 'value required';
      }
    });
  }

  return {
    id: req.id,
    name: req.name,
    description: req.description,
    severity: req.severity,
    detection: {
      positivePatterns: req.detection.positivePatterns || [],
      negativePatterns: req.detection.negativePatterns || [],
      requiredElements,
    },
    scoring: req.scoring,
    insertionPoint: req.insertionPoint,
    status: 'UNMET',
  };
}

/**
 * Convert YAML risk trigger to TypeScript format
 */
function convertRiskTriggerToTS(trigger: YAMLRiskTrigger): RiskTriggerDefinition {
  return {
    id: trigger.id,
    name: trigger.name,
    description: trigger.description,
    patterns: trigger.patterns,
    liabilityImpact: trigger.liabilityImpact,
    category: trigger.category,
  };
}
