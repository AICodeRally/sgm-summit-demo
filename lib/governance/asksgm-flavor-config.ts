/**
 * AskSGM Flavor Config
 *
 * Implements the bounded operator pattern for AskSGM.
 * AskSGM must produce policy-and-evidence-backed governance outcomes
 * with citations, approvals routing, and audit-ready decision records.
 */

// ============================================================================
// DELIVERABLE TYPES (the only output "shapes")
// ============================================================================

export type DeliverableType =
  | 'RULING'
  | 'EXCEPTION_PACKET'
  | 'DISPUTE_KIT'
  | 'CHANGE_CONTROL_MEMO'
  | 'GOVERNANCE_GAP';

export const ALLOWED_DELIVERABLES: DeliverableType[] = [
  'RULING',
  'EXCEPTION_PACKET',
  'DISPUTE_KIT',
  'CHANGE_CONTROL_MEMO',
  'GOVERNANCE_GAP',
];

export const DELIVERABLE_DESCRIPTIONS: Record<DeliverableType, string> = {
  RULING: 'Authority + evidence exist to decide',
  EXCEPTION_PACKET: 'Policy permits exceptions or relief',
  DISPUTE_KIT: 'Dispute intake → evidence checklist → ruling draft → appeal path',
  CHANGE_CONTROL_MEMO: 'Proposed plan/policy/process changes (esp. retro)',
  GOVERNANCE_GAP: 'Policy is missing/ambiguous/conflicting or evidence cannot be obtained',
};

// ============================================================================
// AUTHORITY PRECEDENCE (court hierarchy)
// ============================================================================

export type AuthorityTier =
  | 'PlanClause'
  | 'PlanAddendum'
  | 'ApprovedPolicy'
  | 'DecisionMemo'
  | 'SOP'
  | 'FAQ'
  | 'Precedent'
  | 'Reference';

export const PRECEDENCE_ORDER: AuthorityTier[] = [
  'PlanClause',      // Tier 1: Highest
  'PlanAddendum',    // Tier 2
  'ApprovedPolicy',  // Tier 3
  'DecisionMemo',    // Tier 4
  'SOP',             // Tier 5
  'FAQ',             // Tier 6
  'Precedent',       // Tier 7
  'Reference',       // Tier 8: Lowest (never decisive)
];

export function getAuthorityTier(tier: AuthorityTier): number {
  return PRECEDENCE_ORDER.indexOf(tier) + 1;
}

// ============================================================================
// ROLE VIEWS
// ============================================================================

export type RoleView = 'rep_safe' | 'internal';

export type RequesterRole =
  | 'Rep'
  | 'Manager'
  | 'SalesOps'
  | 'Finance'
  | 'Admin'
  | 'Auditor';

export const ROLE_VIEW_PERMISSIONS: Record<RequesterRole, RoleView> = {
  Rep: 'rep_safe',
  Manager: 'rep_safe',
  SalesOps: 'internal',
  Finance: 'internal',
  Admin: 'internal',
  Auditor: 'internal',
};

// ============================================================================
// CYCLE STATE
// ============================================================================

export type CycleState =
  | 'Open'
  | 'Pre-Close'
  | 'Closed'
  | 'Post-Close'
  | 'True-Up';

export const CYCLE_STATE_ORDER: CycleState[] = [
  'Open',
  'Pre-Close',
  'Closed',
  'Post-Close',
  'True-Up',
];

// ============================================================================
// JURISDICTION MULTIPLIERS
// ============================================================================

export interface JurisdictionConfig {
  code: string;
  name: string;
  multiplier: number;
  flags: string[];
}

export const JURISDICTION_MULTIPLIERS: JurisdictionConfig[] = [
  {
    code: 'CA',
    name: 'California',
    multiplier: 1.5,
    flags: ['final_pay_immediate', 'written_agreement_required', 'deduction_consent_strict'],
  },
  {
    code: 'NY',
    name: 'New York',
    multiplier: 1.2,
    flags: ['final_pay_next_payday', 'deduction_consent_required'],
  },
  {
    code: 'MA',
    name: 'Massachusetts',
    multiplier: 1.2,
    flags: ['strict_wage_laws', 'commission_protection'],
  },
  {
    code: 'IL',
    name: 'Illinois',
    multiplier: 1.1,
    flags: ['final_pay_next_payday', 'deduction_consent_required'],
  },
  {
    code: 'TX',
    name: 'Texas',
    multiplier: 1.0,
    flags: ['at_will_strong', 'limited_deduction_restrictions'],
  },
  {
    code: 'DEFAULT',
    name: 'Default',
    multiplier: 1.0,
    flags: [],
  },
];

export function getJurisdictionMultiplier(code: string): number {
  const jurisdiction = JURISDICTION_MULTIPLIERS.find(j => j.code === code);
  return jurisdiction?.multiplier ?? 1.0;
}

// ============================================================================
// POLICY SEVERITY
// ============================================================================

export type PolicySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export const CRITICAL_POLICIES = ['C-003', 'D-002', 'E-001', 'F-001'];
export const HIGH_POLICIES = [
  'B-001', 'B-002', 'B-004', 'B-006', 'C-002',
  'D-001', 'D-003', 'E-002', 'F-002', 'F-003',
];

export function isPolicyCritical(code: string): boolean {
  return CRITICAL_POLICIES.includes(code);
}

export function requiresLegalReview(code: string): boolean {
  return CRITICAL_POLICIES.includes(code);
}

// ============================================================================
// OUTPUT SCHEMA REQUIREMENTS
// ============================================================================

export interface RequiredOutput {
  block: string;
  description: string;
  required: boolean;
}

export const REQUIRED_OUTPUTS: RequiredOutput[] = [
  { block: 'deliverable_type', description: 'One of the 5 allowed types', required: true },
  { block: 'summary', description: '1-2 line summary', required: true },
  { block: 'authority_basis', description: 'Citations or "missing authority"', required: true },
  { block: 'evidence_basis', description: 'Citations/record IDs or required evidence list', required: true },
  { block: 'decision_logic', description: 'Short explicit reasoning', required: true },
  { block: 'approvals_routing', description: 'Owner, approvers, SLA', required: true },
  { block: 'next_steps', description: 'Ordered checklist', required: true },
  { block: 'audit_note', description: 'Exact log entry phrasing', required: true },
];

// ============================================================================
// ROUTING MAP
// ============================================================================

export interface RoutingDestination {
  module: string;
  trigger: string;
}

export const OUT_OF_SCOPE_ROUTES: Record<string, RoutingDestination> = {
  comp_math: { module: 'AskCalc', trigger: 'Requires payout simulation or calculation' },
  territory_design: { module: 'AskSTM', trigger: 'Territory design/strategy question' },
  quota_methodology: { module: 'AskSQM', trigger: 'Quota methodology/design question' },
  data_reconciliation: { module: 'AskData', trigger: 'Data integrity/reconciliation question' },
  comp_mechanics: { module: 'AskICM', trigger: 'Plan mechanics/rate table question' },
  policy_authoring: { module: 'AskPolicy', trigger: 'Policy creation/normalization question' },
};

// ============================================================================
// DOMAIN TAGS
// ============================================================================

export const SGM_DOMAIN_TAGS = [
  'SGM',
  'Governance',
  'Policy',
  'Dispute',
  'Exception',
  'ChangeControl',
  'Retroactivity',
  'Audit',
  'SegregationOfDuties',
  'Communications',
  'Compliance',
  '409A',
  'StateWageLaw',
  'FMLA',
  'Clawback',
  'Termination',
];

// ============================================================================
// FLAVOR CONFIG (complete)
// ============================================================================

export interface AskSGMFlavorConfig {
  module: string;
  domain_full_name: string;
  domain_tags: string[];
  allowed_deliverables: DeliverableType[];
  precedence_order: AuthorityTier[];
  required_outputs: string[];
  role_views: RoleView[];
  critical_policies: string[];
  jurisdiction_multipliers: Record<string, number>;
  routing_map_ref: string;
}

export const ASKSGM_FLAVOR_CONFIG: AskSGMFlavorConfig = {
  module: 'AskSGM',
  domain_full_name: 'Sales Governance Management',
  domain_tags: SGM_DOMAIN_TAGS,
  allowed_deliverables: ALLOWED_DELIVERABLES,
  precedence_order: PRECEDENCE_ORDER,
  required_outputs: [
    'authority_basis',
    'evidence_basis',
    'decision_logic',
    'approvals_routing',
    'next_steps',
    'audit_note',
  ],
  role_views: ['rep_safe', 'internal'],
  critical_policies: CRITICAL_POLICIES,
  jurisdiction_multipliers: {
    CA: 1.5,
    NY: 1.2,
    MA: 1.2,
    IL: 1.1,
    TX: 1.0,
    DEFAULT: 1.0,
  },
  routing_map_ref: 'knowledge/askspm/ASK_MODULE_ROUTING_MAP.md',
};

// ============================================================================
// DECISION RECORD INTERFACE
// ============================================================================

export interface AuthorityBasis {
  source_tier: AuthorityTier;
  doc_id: string;
  anchor: string;
  excerpt_ref?: string;
  effective_start?: string;
  effective_end?: string;
  policy_code?: string;
  severity?: PolicySeverity;
}

export interface EvidenceBasis {
  system: string;
  record_id: string;
  timestamp: string;
  field_refs?: string[];
  notes?: string;
}

export interface DecisionLogic {
  rule_applied: string;
  conditions_met: string[];
  constraints: string[];
  rationale: string;
}

export interface RiskAssessment {
  risk_type: 'Governance' | 'Compliance' | 'Financial' | 'Precedent' | 'RepTrust';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  jurisdiction?: string;
  multiplier?: number;
  notes?: string;
  legal_review_required?: boolean;
}

export interface Approval {
  approver_role: string;
  approver_id?: string;
  approval_type: string;
  due_by?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DecisionRecord {
  decision_id: string;
  decision_type: DeliverableType;
  status: 'Draft' | 'Proposed' | 'Approved' | 'Published' | 'Closed' | 'Rejected';
  tenant_id: string;
  created_at: string;
  created_by: string;
  requester_role: RequesterRole;
  plan_ref?: {
    plan_year: number;
    plan_version: string;
    plan_doc_id?: string;
  };
  cycle_state?: CycleState;
  domain_tags: string[];
  summary: string;
  authority_basis: AuthorityBasis[];
  evidence_basis: EvidenceBasis[];
  decision_logic: DecisionLogic;
  risk_assessment?: RiskAssessment;
  owner: {
    role: string;
    person_id?: string;
  };
  approvals_required: Approval[];
  sla?: {
    target_hours: number;
    escalation_path: string;
  };
  rep_safe_message: string;
  internal_detail: string;
  next_steps: string[];
  audit_note: string;
  missing_authority: string[];
  missing_evidence: string[];
  blockers: string[];
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

export function buildAskSGMSystemPrompt(config: {
  department?: string;
  currentPage?: string;
  cycleState?: CycleState;
  jurisdiction?: string;
  userRole?: RequesterRole;
  policyLibrarySummary: string;
  policyLibraryContext: string;
}): string {
  const roleView = config.userRole
    ? ROLE_VIEW_PERMISSIONS[config.userRole]
    : 'rep_safe';

  const jurisdictionMultiplier = config.jurisdiction
    ? getJurisdictionMultiplier(config.jurisdiction)
    : 1.0;

  return `You are AskSGM, a **bounded governance operator** for Sales Governance Management (SGM).

## CRITICAL: You are NOT a chatbot. You are a governance operator.

You must produce **policy-and-evidence-backed governance artifacts** — not conversational advice.

## Allowed Deliverable Types (ONLY these 5 outputs)
Every response must be EXACTLY ONE of:
1. **RULING** — When authority + evidence exist to decide
2. **EXCEPTION_PACKET** — When policy permits exceptions or relief
3. **DISPUTE_KIT** — Dispute intake → evidence checklist → ruling draft → appeal path
4. **CHANGE_CONTROL_MEMO** — Proposed plan/policy/process changes (esp. retro)
5. **GOVERNANCE_GAP** — When policy is missing/ambiguous/conflicting

## Failure Mode
If authority/evidence/state is insufficient → output **GOVERNANCE_GAP** and list what's missing.

## Current Context
- **Department:** ${config.department || 'governance'}
- **User Role:** ${config.userRole || 'unknown'} (View: ${roleView})
- **Cycle State:** ${config.cycleState || 'unknown'}
- **Jurisdiction:** ${config.jurisdiction || 'DEFAULT'} (Multiplier: ${jurisdictionMultiplier}x)
- **Current Page:** ${config.currentPage || 'dashboard'}

## Policy Library (21 Policies)
${config.policyLibrarySummary}

## Policy Details
${config.policyLibraryContext}

## Authority Precedence (Highest to Lowest)
1. Signed Plan / Contract clause
2. Plan Addendum / Annex
3. Approved Policy (versioned + effective dated)
4. Comp Committee / PRB / CRB Decision Memo
5. SOP / Runbook
6. FAQ / Enablement
7. Precedent (only if policy allows)
8. General domain knowledge (NEVER decisive)

## Required Output Blocks (every deliverable)
Your response MUST include these sections:

\`\`\`markdown
## {DELIVERABLE_TYPE}: {Summary}

### Authority Basis
- Policy code: {A-001 to F-003}
- Section/clause citation
- Tier: {1-8}
- Effective: {date range}

### Evidence Basis
- System: record_id @ timestamp
- OR: **Evidence Required:** [checklist]

### Decision Logic
{Short explicit reasoning - no ramble}

### Risk Assessment
- Severity: {Low | Medium | High | Critical}
- Jurisdiction: ${config.jurisdiction || 'DEFAULT'} (${jurisdictionMultiplier}x)
- Legal review required: {yes/no}

### Approvals & Routing
- Owner: {role}
- Approvers: {chain}
- SLA: {hours}
- Escalation: {path}

### Next Steps
1. {action}
2. {action}

### Audit Note
\`SGM:{TYPE} {status} | {summary} | refs: {citations}\`
\`\`\`

## CRITICAL Policies (require legal review)
- **C-003:** Section 409A Compliance (20% penalty + interest)
- **D-002:** Leave of Absence (FMLA/USERRA violations)
- **E-001:** Termination and Final Pay (CA waiting time penalties)
- **F-001:** State Wage Law Compliance (class action exposure)

## Guardrails (must refuse)
- Requests to bypass approvals/controls → refuse, provide compliant path
- Requests to fabricate evidence → refuse
- Out-of-scope requests → route to correct module (AskCalc, AskSTM, AskSQM, AskData)

## Acceptance Criteria
Your response FAILS if it:
- Doesn't choose an allowed deliverable type
- Makes rulings without authority + evidence
- Ignores effective dating or cycle state
- Omits owner/approver/SLA
- Lacks an audit note
- Produces generic advice instead of a governance artifact

Produce auditable, structured governance artifacts backed by the 21-policy library.`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ASKSGM_FLAVOR_CONFIG as default,
};
