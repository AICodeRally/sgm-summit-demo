/**
 * Policy JSON Schema - Type Definitions
 *
 * Structured JSON format for compensation policies (SCP-001 through SCP-017).
 * Replaces markdown format to eliminate artifacts and enable structured queries.
 */

/**
 * Policy Status
 */
export type PolicyStatus = 'DRAFT' | 'ACTIVE' | 'TEMPLATE' | 'ARCHIVED';

/**
 * Provision Priority
 */
export type ProvisionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Policy Category
 */
export type PolicyCategory =
  | 'Compliance'
  | 'Financial Controls'
  | 'Payment Processing'
  | 'Sales Operations'
  | 'Territory Management'
  | 'Performance Management'
  | 'Governance';

/**
 * Main Policy JSON Structure
 *
 * Complete structured representation of a compensation policy.
 */
export interface PolicyJSON {
  /** Policy code (e.g., SCP-001) */
  code: string;

  /** Human-readable policy name */
  name: string;

  /** Policy category */
  category: PolicyCategory;

  /** Framework area this policy covers */
  frameworkArea: string;

  /** Current status */
  status: PolicyStatus;

  /** Version number (semver) */
  version: string;

  /** Date policy becomes effective (ISO 8601) */
  effectiveDate: string;

  /** Whether legal review is required */
  legalReviewRequired?: boolean;

  /** Policy purpose and objectives */
  purpose: PolicyPurpose;

  /** Policy scope (who/what it applies to) */
  scope?: PolicyScope;

  /** Key definitions */
  definitions?: PolicyDefinition[];

  /** Policy provisions (rules/requirements) */
  provisions: PolicyProvision[];

  /** Compliance and legal references */
  compliance: PolicyCompliance;

  /** Related policy codes */
  relatedPolicies: string[];

  /** Metadata */
  metadata: PolicyMetadata;
}

/**
 * Policy Purpose
 *
 * Why this policy exists and what it aims to achieve.
 */
export interface PolicyPurpose {
  /** Brief summary of policy purpose */
  summary: string;

  /** List of specific objectives */
  objectives: string[];
}

/**
 * Policy Scope
 *
 * Defines applicability boundaries.
 */
export interface PolicyScope {
  /** What entities/roles this applies to */
  appliesTo: string[];

  /** Any explicit exclusions */
  exclusions?: string[];

  /** Geographic scope if applicable */
  geographic?: string[];
}

/**
 * Policy Definition
 *
 * Key terms and their definitions.
 */
export interface PolicyDefinition {
  /** Term being defined */
  term: string;

  /** Definition text */
  definition: string;

  /** Examples if applicable */
  examples?: string[];
}

/**
 * Policy Provision
 *
 * Individual rule or requirement within the policy.
 */
export interface PolicyProvision {
  /** Unique identifier for this provision */
  id: string;

  /** Provision title/heading */
  title: string;

  /** Provision content (can include sub-points) */
  content: string;

  /** Priority level */
  priority: ProvisionPriority;

  /** Sub-provisions if this is hierarchical */
  subProvisions?: PolicySubProvision[];

  /** Tables if this provision includes structured data */
  tables?: PolicyTable[];
}

/**
 * Policy Sub-Provision
 *
 * Nested provision under a parent provision.
 */
export interface PolicySubProvision {
  /** Sub-provision ID */
  id: string;

  /** Title */
  title: string;

  /** Content */
  content: string;

  /** Bullet points or list items */
  items?: string[];
}

/**
 * Policy Table
 *
 * Structured data within a provision (e.g., approval thresholds).
 */
export interface PolicyTable {
  /** Table identifier */
  id: string;

  /** Optional caption */
  caption?: string;

  /** Column headers */
  headers: string[];

  /** Data rows */
  rows: string[][];
}

/**
 * Policy Compliance
 *
 * Legal and regulatory references.
 */
export interface PolicyCompliance {
  /** Federal laws/regulations */
  federalLaws: string[];

  /** State laws/regulations */
  stateLaws: string[];

  /** Industry standards */
  industryStandards?: string[];

  /** Keywords for gap analysis */
  keywords: string[];
}

/**
 * Policy Metadata
 *
 * Audit trail and version information.
 */
export interface PolicyMetadata {
  /** When policy was created (ISO 8601) */
  createdAt: string;

  /** When policy was last updated (ISO 8601) */
  updatedAt: string;

  /** Who created the policy */
  createdBy: string;

  /** Who approved the policy */
  approvedBy?: string;

  /** Original source file if migrated */
  sourceFile?: string;

  /** Word count */
  wordCount?: number;

  /** Change log entries */
  changeLog?: PolicyChangeLogEntry[];
}

/**
 * Policy Change Log Entry
 *
 * Records a change to the policy.
 */
export interface PolicyChangeLogEntry {
  /** Version this change introduced */
  version: string;

  /** Date of change */
  date: string;

  /** Who made the change */
  author: string;

  /** Description of changes */
  description: string;
}

/**
 * Policy Library Index
 *
 * Registry of all available policies.
 */
export interface PolicyLibraryIndex {
  /** All policies */
  policies: PolicyIndexEntry[];

  /** Metadata about the library */
  metadata: {
    /** Total number of policies */
    totalPolicies: number;

    /** Count by status */
    statusCounts: Record<PolicyStatus, number>;

    /** Last updated */
    lastUpdated: string;
  };
}

/**
 * Policy Index Entry
 *
 * Lightweight reference to a policy in the library index.
 */
export interface PolicyIndexEntry {
  /** Policy code */
  code: string;

  /** Policy name */
  name: string;

  /** Category */
  category: PolicyCategory;

  /** Framework area */
  frameworkArea: string;

  /** Status */
  status: PolicyStatus;

  /** File path to full JSON */
  filePath: string;

  /** Word count */
  wordCount?: number;

  /** Legal review required */
  legalReviewRequired?: boolean;
}

/**
 * Type guard to check if an object is a valid PolicyJSON
 */
export function isPolicyJSON(obj: any): obj is PolicyJSON {
  return (
    obj &&
    typeof obj.code === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.frameworkArea === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.effectiveDate === 'string' &&
    obj.purpose &&
    typeof obj.purpose.summary === 'string' &&
    Array.isArray(obj.purpose.objectives) &&
    Array.isArray(obj.provisions) &&
    obj.compliance &&
    Array.isArray(obj.compliance.federalLaws) &&
    Array.isArray(obj.compliance.stateLaws) &&
    Array.isArray(obj.compliance.keywords) &&
    Array.isArray(obj.relatedPolicies) &&
    obj.metadata &&
    typeof obj.metadata.createdAt === 'string'
  );
}

/**
 * Validate a PolicyJSON object
 *
 * @param policy - Policy to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validatePolicyJSON(policy: any): string[] {
  const errors: string[] = [];

  if (!policy.code || !policy.code.match(/^SCP-\d{3}$/)) {
    errors.push('Invalid policy code (expected format: SCP-001)');
  }

  if (!policy.name || policy.name.trim().length === 0) {
    errors.push('Policy name is required');
  }

  if (!policy.version || !policy.version.match(/^\d+\.\d+\.\d+$/)) {
    errors.push('Invalid version (expected semver format: 1.0.0)');
  }

  if (!policy.effectiveDate || isNaN(Date.parse(policy.effectiveDate))) {
    errors.push('Invalid effectiveDate (expected ISO 8601 date)');
  }

  if (!policy.provisions || policy.provisions.length === 0) {
    errors.push('At least one provision is required');
  }

  if (policy.provisions) {
    policy.provisions.forEach((prov: any, idx: number) => {
      if (!prov.id || !prov.title || !prov.content) {
        errors.push(`Provision ${idx + 1}: id, title, and content are required`);
      }
    });
  }

  return errors;
}
