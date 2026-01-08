/**
 * Policy Library Loader
 *
 * Loads all governance policy templates from markdown files.
 * Supports both HenrySchein policies (SCP-xxx.md) and Jamf policies.
 */

import fs from 'fs';
import path from 'path';

export interface PolicyTemplate {
  code: string;
  name: string;
  category: string;
  frameworkArea: string;
  status: 'DRAFT' | 'TEMPLATE' | 'APPROVED';
  legalReviewRequired: boolean;
  content: string;
  wordCount: number;
  source: 'HenrySchein' | 'Jamf';
}

// Framework area mapping for Jamf policies (based on filename)
const JAMF_FRAMEWORK_MAPPING: Record<string, string> = {
  'CLAWBACK_RECOVERY_POLICY.md': 'Clawback/Recovery',
  'DATA_RETENTION_POLICY.md': 'Data/Systems/Controls',
  'LEAVE_OF_ABSENCE_POLICY.md': 'Leave of Absence',
  'PAYMENT_TIMING_POLICY.md': 'Payment Timing',
  'QUOTA_TERRITORY_MANAGEMENT_POLICY.md': 'Territory Management',
  'SALES_CREDITING_POLICY.md': 'Sales Crediting',
  'SPIF_GOVERNANCE_POLICY.md': 'SPIF Governance',
  'TERMINATION_POLICY.md': 'Termination/Final Pay',
  'WINDFALL_LARGE_DEAL_POLICY.md': 'Windfall/Large Deals',
};

const POLICIES_DIR = path.join(process.cwd(), 'lib/data/policies');

let cachedPolicies: PolicyTemplate[] | null = null;

/**
 * Load all policy templates from markdown files
 */
export function loadAllPolicies(): PolicyTemplate[] {
  if (cachedPolicies) {
    return cachedPolicies;
  }

  const policies: PolicyTemplate[] = [];

  // Load HenrySchein policies (SCP-xxx.md format)
  const henryScheinPolicies = loadHenryScheinPolicies();
  policies.push(...henryScheinPolicies);

  // Load Jamf policies
  const jamfPolicies = loadJamfPolicies();
  policies.push(...jamfPolicies);

  cachedPolicies = policies;
  return policies;
}

/**
 * Load HenrySchein policies (SCP-xxx.md format)
 */
function loadHenryScheinPolicies(): PolicyTemplate[] {
  const policies: PolicyTemplate[] = [];

  // Load index file
  const indexPath = path.join(POLICIES_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.warn('Policy index not found:', indexPath);
    return policies;
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  for (const policyMeta of index.policies || []) {
    const filePath = path.join(process.cwd(), policyMeta.file_path);

    if (!fs.existsSync(filePath)) {
      console.warn('Policy file not found:', filePath);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    policies.push({
      code: policyMeta.code,
      name: policyMeta.name,
      category: policyMeta.category,
      frameworkArea: policyMeta.framework_area,
      status: policyMeta.status === 'DRAFT' ? 'DRAFT' : 'TEMPLATE',
      legalReviewRequired: policyMeta.legal_review_required,
      content,
      wordCount: policyMeta.word_count,
      source: 'HenrySchein',
    });
  }

  return policies;
}

/**
 * Load Jamf policies (direct markdown files)
 */
function loadJamfPolicies(): PolicyTemplate[] {
  const policies: PolicyTemplate[] = [];

  for (const [filename, frameworkArea] of Object.entries(JAMF_FRAMEWORK_MAPPING)) {
    const filePath = path.join(POLICIES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract policy name and code from content
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const codeMatch = content.match(/\*\*Policy Code:\*\*\s+(\S+)/);

    const name = nameMatch ? nameMatch[1] : filename.replace('.md', '').replace(/_/g, ' ');
    const code = codeMatch ? codeMatch[1] : `JAMF-${policies.length + 1}`;

    policies.push({
      code,
      name,
      category: getCategoryFromFrameworkArea(frameworkArea),
      frameworkArea,
      status: 'APPROVED',
      legalReviewRequired: false,
      content,
      wordCount: content.split(/\s+/).length,
      source: 'Jamf',
    });
  }

  return policies;
}

/**
 * Get policy by framework area
 */
export function getPolicyByFrameworkArea(frameworkArea: string): PolicyTemplate | null {
  const policies = loadAllPolicies();

  // Normalize framework area for matching
  const normalized = frameworkArea.toLowerCase().trim();

  return policies.find(p =>
    p.frameworkArea.toLowerCase() === normalized
  ) || null;
}

/**
 * Get all policies for a specific framework area (may return multiple)
 */
export function getPoliciesByFrameworkArea(frameworkArea: string): PolicyTemplate[] {
  const policies = loadAllPolicies();

  const normalized = frameworkArea.toLowerCase().trim();

  return policies.filter(p =>
    p.frameworkArea.toLowerCase() === normalized
  );
}

/**
 * Extract purpose section from policy content
 */
export function extractPurpose(content: string): string | null {
  const purposeMatch = content.match(/##?\s+PURPOSE\s*\n+([\s\S]+?)(?=\n##|\n---|\n\*\*|$)/i);
  return purposeMatch ? purposeMatch[1].trim() : null;
}

/**
 * Extract key provisions from policy content
 */
export function extractKeyProvisions(content: string): string[] {
  const provisions: string[] = [];

  // Look for numbered or bulleted lists after headers
  const sections = content.split(/\n##\s+/);

  for (const section of sections) {
    // Skip purpose/overview sections
    if (section.match(/^(PURPOSE|OVERVIEW|INTRODUCTION)/i)) {
      continue;
    }

    // Extract first heading and first paragraph
    const headingMatch = section.match(/^(.+?)\n/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      const paragraphMatch = section.match(/\n+(.+?)(?=\n\n|\n-|\n\d+\.|\n##|$)/);
      if (paragraphMatch) {
        provisions.push(`${heading}: ${paragraphMatch[1].trim()}`);
      }
    }
  }

  return provisions.slice(0, 5); // Return top 5 provisions
}

/**
 * Map framework area to category
 */
function getCategoryFromFrameworkArea(frameworkArea: string): string {
  const mapping: Record<string, string> = {
    'Clawback/Recovery': 'Financial Controls',
    'Quota Management': 'Performance Management',
    'Territory Management': 'Territory Rules',
    'Sales Crediting': 'Commission Rules',
    'SPIF Governance': 'Incentive Programs',
    'Windfall/Large Deals': 'Deal Governance',
    'Termination/Final Pay': 'HR Policies',
    'Leave of Absence': 'HR Policies',
    'Payment Timing': 'Payroll',
    'Compliance (409A, State Wage)': 'Legal Compliance',
    'Exceptions/Disputes': 'Governance',
    'Data/Systems/Controls': 'IT Governance',
    'Draws/Guarantees': 'Financial Controls',
    'Mid-Period Changes': 'Plan Administration',
    'New Hire/Onboarding': 'HR Policies',
    'International Requirements': 'Legal Compliance',
  };

  return mapping[frameworkArea] || 'Governance';
}

/**
 * Get statistics about the policy library
 */
export function getPolicyLibraryStats() {
  const policies = loadAllPolicies();

  return {
    totalPolicies: policies.length,
    byStatus: {
      draft: policies.filter(p => p.status === 'DRAFT').length,
      template: policies.filter(p => p.status === 'TEMPLATE').length,
      approved: policies.filter(p => p.status === 'APPROVED').length,
    },
    bySource: {
      henrySchein: policies.filter(p => p.source === 'HenrySchein').length,
      jamf: policies.filter(p => p.source === 'Jamf').length,
    },
    frameworkAreas: Array.from(new Set(policies.map(p => p.frameworkArea))).sort(),
  };
}
