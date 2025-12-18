/**
 * Governance Matrix - Policy Coverage and Compliance Mapping
 * Maps governance policies to comp artifacts and approval authorities
 */

export interface MatrixEntry {
  id: string;
  policyArea: string;
  documentCode: string;
  documentTitle: string;
  compArtifacts: string[]; // What compensation artifacts this governs
  approvalAuthority: 'SGCC' | 'CRB' | 'VP_COMP' | 'MANAGER' | 'AUTO';
  approvalThreshold?: string;
  sla?: string;
  coverage: 'FULL' | 'PARTIAL' | 'GAP';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastReviewed: string;
  nextReview: string;
  owner: string;
  relatedDocuments: string[];
}

/**
 * Policy area categories
 */
export const POLICY_AREAS = [
  'Plan Design',
  'Quota Setting',
  'Commission Calculation',
  'Territory Management',
  'SPIF Management',
  'Windfall Deals',
  'Exception Handling',
  'Dispute Resolution',
  'Payment Processing',
  'Compliance & Audit',
  'Committee Governance',
  'Data & Systems',
] as const;

/**
 * Comprehensive governance matrix
 */
export const GOVERNANCE_MATRIX: MatrixEntry[] = [
  // Plan Design
  {
    id: 'matrix-001',
    policyArea: 'Plan Design',
    documentCode: 'SCP-001',
    documentTitle: 'Compensation Plan Design & Approval Policy',
    compArtifacts: ['Plan Documents', 'Plan Amendments', 'Role Assignments'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'All new plans and material changes',
    sla: '30 business days',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-11-15',
    nextReview: '2026-05-15',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['GC-001', 'SCP-011', 'SCP-017'],
  },
  {
    id: 'matrix-002',
    policyArea: 'Plan Design',
    documentCode: 'SCP-017',
    documentTitle: 'Mid-Period Plan Change Policy',
    compArtifacts: ['Plan Amendments', 'Grandfathering Rules', 'Transition Plans'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'All mid-year plan changes',
    sla: '30 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-12-15',
    nextReview: '2026-06-15',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-001', 'SCP-011'],
  },

  // Quota Setting
  {
    id: 'matrix-003',
    policyArea: 'Quota Setting',
    documentCode: 'SCP-002',
    documentTitle: 'Quota Setting & Allocation Framework',
    compArtifacts: ['Quota Assignments', 'Territory Quotas', 'Capacity Models'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'Annual quota plan',
    sla: '45 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-10-01',
    nextReview: '2026-04-01',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-003', 'SCP-006'],
  },
  {
    id: 'matrix-004',
    policyArea: 'Quota Setting',
    documentCode: 'SCP-006',
    documentTitle: 'New Hire Ramp Policy',
    compArtifacts: ['Ramp Schedules', 'Quota Adjustments', 'Draw Agreements'],
    approvalAuthority: 'VP_COMP',
    approvalThreshold: 'Standard ramps: VP approval. Exceptions: SGCC',
    sla: '10 business days',
    coverage: 'FULL',
    riskLevel: 'MEDIUM',
    lastReviewed: '2025-09-20',
    nextReview: '2026-03-20',
    owner: 'Sales Compensation Manager',
    relatedDocuments: ['SCP-002', 'SCP-012'],
  },

  // Territory Management
  {
    id: 'matrix-005',
    policyArea: 'Territory Management',
    documentCode: 'SCP-003',
    documentTitle: 'Territory Alignment & Coverage Policy',
    compArtifacts: ['Territory Assignments', 'Account Lists', 'Coverage Rules'],
    approvalAuthority: 'CRB',
    approvalThreshold: 'Mid-period territory changes >$25K quota impact',
    sla: '15 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-11-01',
    nextReview: '2026-05-01',
    owner: 'VP Sales Operations',
    relatedDocuments: ['SCP-002', 'SCP-005'],
  },
  {
    id: 'matrix-006',
    policyArea: 'Territory Management',
    documentCode: 'SCP-005',
    documentTitle: 'Split Credit & Overlay Rules',
    compArtifacts: ['Split Rules', 'Overlay Credits', 'Team Selling'],
    approvalAuthority: 'MANAGER',
    approvalThreshold: 'Manager approval for standard splits',
    sla: '5 business days',
    coverage: 'FULL',
    riskLevel: 'MEDIUM',
    lastReviewed: '2025-10-10',
    nextReview: '2026-04-10',
    owner: 'Sales Compensation Manager',
    relatedDocuments: ['SCP-003', 'SCP-009'],
  },

  // SPIF Management
  {
    id: 'matrix-007',
    policyArea: 'SPIF Management',
    documentCode: 'SCP-010',
    documentTitle: 'SPIF Design & Approval Thresholds',
    compArtifacts: ['SPIF Programs', 'Incentive Payments', 'Contest Rules'],
    approvalAuthority: 'SGCC',
    approvalThreshold: '<$50K: Chair approval. $50K-$250K: SGCC + CFO',
    sla: '5-10 business days',
    coverage: 'FULL',
    riskLevel: 'MEDIUM',
    lastReviewed: '2025-11-30',
    nextReview: '2026-05-30',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-001', 'CRB-001'],
  },

  // Windfall Deals
  {
    id: 'matrix-008',
    policyArea: 'Windfall Deals',
    documentCode: 'SCP-007',
    documentTitle: 'Windfall Deal Review Policy',
    compArtifacts: ['Large Deal Credits', 'Commission Caps', 'Amortization'],
    approvalAuthority: 'CRB',
    approvalThreshold: '>$1M ARR OR >$100K commission OR >50% quarterly quota',
    sla: '20 business days',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-12-01',
    nextReview: '2026-06-01',
    owner: 'CRB Chair',
    relatedDocuments: ['CRB-001', 'SCP-005'],
  },

  // Exception Handling
  {
    id: 'matrix-009',
    policyArea: 'Exception Handling',
    documentCode: 'SCP-011',
    documentTitle: 'Exception Request Policy',
    compArtifacts: ['Exception Requests', 'Policy Waivers', 'One-Time Adjustments'],
    approvalAuthority: 'CRB',
    approvalThreshold: '>$25K: CRB. <$25K: VP Comp',
    sla: '15 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-10-20',
    nextReview: '2026-04-20',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-013', 'CRB-001'],
  },

  // Dispute Resolution
  {
    id: 'matrix-010',
    policyArea: 'Dispute Resolution',
    documentCode: 'SCP-013',
    documentTitle: 'Dispute Resolution & Appeals Process',
    compArtifacts: ['Dispute Cases', 'Appeals', 'Resolutions'],
    approvalAuthority: 'CRB',
    approvalThreshold: 'All formal disputes',
    sla: '20 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-09-15',
    nextReview: '2026-03-15',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-011', 'CRB-001', 'GC-001'],
  },

  // Commission Calculation
  {
    id: 'matrix-011',
    policyArea: 'Commission Calculation',
    documentCode: 'SCP-009',
    documentTitle: 'Commission Calculation & Payment Rules',
    compArtifacts: ['Commission Runs', 'Rate Tables', 'Accelerators'],
    approvalAuthority: 'AUTO',
    approvalThreshold: 'System-calculated per plan rules',
    sla: 'Monthly run cycle',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-11-10',
    nextReview: '2026-05-10',
    owner: 'Sales Compensation Manager',
    relatedDocuments: ['SCP-001', 'SCP-014'],
  },
  {
    id: 'matrix-012',
    policyArea: 'Commission Calculation',
    documentCode: 'SCP-014',
    documentTitle: 'Clawback & Repayment Policy',
    compArtifacts: ['Clawbacks', 'Repayments', 'Overpayment Recovery'],
    approvalAuthority: 'VP_COMP',
    approvalThreshold: 'All clawbacks require documentation',
    sla: '10 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-10-05',
    nextReview: '2026-04-05',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-009', 'SCP-012'],
  },

  // Payment Processing
  {
    id: 'matrix-013',
    policyArea: 'Payment Processing',
    documentCode: 'PROC-002',
    documentTitle: 'Commission Payment & Statement Distribution',
    compArtifacts: ['Payment Files', 'Statements', 'Tax Withholding'],
    approvalAuthority: 'AUTO',
    approvalThreshold: 'Automated payroll integration',
    sla: 'Monthly payment cycle',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-12-05',
    nextReview: '2026-06-05',
    owner: 'Sales Compensation Manager',
    relatedDocuments: ['SCP-009', 'PROC-003'],
  },
  {
    id: 'matrix-014',
    policyArea: 'Payment Processing',
    documentCode: 'SCP-012',
    documentTitle: 'Draw & Guarantee Policy',
    compArtifacts: ['Draw Agreements', 'Guarantees', 'Repayment Terms'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'All draw agreements',
    sla: '15 business days',
    coverage: 'FULL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-12-10',
    nextReview: '2026-06-10',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-006', 'SCP-014'],
  },

  // Compliance & Audit
  {
    id: 'matrix-015',
    policyArea: 'Compliance & Audit',
    documentCode: 'SCP-015',
    documentTitle: 'Compliance & Audit Requirements',
    compArtifacts: ['Audit Logs', 'SOX Controls', 'Compliance Reports'],
    approvalAuthority: 'AUTO',
    approvalThreshold: 'Continuous logging',
    sla: 'Real-time',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-11-20',
    nextReview: '2026-05-20',
    owner: 'Director of Finance',
    relatedDocuments: ['GC-001', 'PROC-005'],
  },

  // Committee Governance
  {
    id: 'matrix-016',
    policyArea: 'Committee Governance',
    documentCode: 'GC-001',
    documentTitle: 'SGCC Charter',
    compArtifacts: ['Committee Decisions', 'Meeting Minutes', 'Approvals'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'Quorum: 5 of 7 voting members',
    sla: 'Quarterly meetings minimum',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-12-01',
    nextReview: '2026-06-01',
    owner: 'SGCC Chair',
    relatedDocuments: ['CRB-001', 'SCP-001'],
  },
  {
    id: 'matrix-017',
    policyArea: 'Committee Governance',
    documentCode: 'CRB-001',
    documentTitle: 'CRB Charter',
    compArtifacts: ['Windfall Decisions', 'Exception Approvals', 'Dispute Resolutions'],
    approvalAuthority: 'CRB',
    approvalThreshold: 'Quorum: 2 of 3 voting members',
    sla: 'Ad-hoc as needed',
    coverage: 'FULL',
    riskLevel: 'CRITICAL',
    lastReviewed: '2025-12-01',
    nextReview: '2026-06-01',
    owner: 'CRB Chair',
    relatedDocuments: ['GC-001', 'SCP-007'],
  },

  // Data & Systems
  {
    id: 'matrix-018',
    policyArea: 'Data & Systems',
    documentCode: 'PROC-004',
    documentTitle: 'Data Governance & System Access',
    compArtifacts: ['System Access', 'Data Quality', 'Integration Rules'],
    approvalAuthority: 'VP_COMP',
    approvalThreshold: 'VP approval for system access',
    sla: '5 business days',
    coverage: 'PARTIAL',
    riskLevel: 'HIGH',
    lastReviewed: '2025-09-30',
    nextReview: '2026-03-30',
    owner: 'VP Sales Operations',
    relatedDocuments: ['SCP-015', 'PROC-002'],
  },

  // Coverage Gaps (identified)
  {
    id: 'matrix-019',
    policyArea: 'Plan Design',
    documentCode: 'GAP-001',
    documentTitle: '[GAP] Role-Based Plan Standards',
    compArtifacts: ['Role Definitions', 'Standard Plan Templates', 'Comp Bands'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'TBD - Policy needed',
    sla: 'TBD',
    coverage: 'GAP',
    riskLevel: 'MEDIUM',
    lastReviewed: '2025-12-01',
    nextReview: '2026-01-15',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-001'],
  },
  {
    id: 'matrix-020',
    policyArea: 'Commission Calculation',
    documentCode: 'GAP-002',
    documentTitle: '[GAP] ARR Recognition & Renewal Credits',
    compArtifacts: ['ARR Credits', 'Renewal Payments', 'Expansion Credits'],
    approvalAuthority: 'SGCC',
    approvalThreshold: 'TBD - Policy needed',
    sla: 'TBD',
    coverage: 'GAP',
    riskLevel: 'HIGH',
    lastReviewed: '2025-12-01',
    nextReview: '2026-02-01',
    owner: 'VP Sales Compensation',
    relatedDocuments: ['SCP-009'],
  },
];

/**
 * Matrix statistics
 */
export const MATRIX_STATS = {
  totalPolicies: GOVERNANCE_MATRIX.length,
  fullCoverage: GOVERNANCE_MATRIX.filter(m => m.coverage === 'FULL').length,
  partialCoverage: GOVERNANCE_MATRIX.filter(m => m.coverage === 'PARTIAL').length,
  gaps: GOVERNANCE_MATRIX.filter(m => m.coverage === 'GAP').length,
  criticalRisk: GOVERNANCE_MATRIX.filter(m => m.riskLevel === 'CRITICAL').length,
  highRisk: GOVERNANCE_MATRIX.filter(m => m.riskLevel === 'HIGH').length,
  byAuthority: {
    SGCC: GOVERNANCE_MATRIX.filter(m => m.approvalAuthority === 'SGCC').length,
    CRB: GOVERNANCE_MATRIX.filter(m => m.approvalAuthority === 'CRB').length,
    VP_COMP: GOVERNANCE_MATRIX.filter(m => m.approvalAuthority === 'VP_COMP').length,
    MANAGER: GOVERNANCE_MATRIX.filter(m => m.approvalAuthority === 'MANAGER').length,
    AUTO: GOVERNANCE_MATRIX.filter(m => m.approvalAuthority === 'AUTO').length,
  },
  byPolicyArea: POLICY_AREAS.reduce((acc, area) => {
    acc[area] = GOVERNANCE_MATRIX.filter(m => m.policyArea === area).length;
    return acc;
  }, {} as Record<string, number>),
};

/**
 * Authority level metadata
 */
export const AUTHORITY_INFO = {
  SGCC: {
    name: 'Sales Governance Committee',
    description: 'Strategic governance decisions and policy approval',
    members: 7,
    quorum: '5 of 7 voting members',
  },
  CRB: {
    name: 'Compensation Review Board',
    description: 'Windfall deals, exceptions, and dispute resolution',
    members: 3,
    quorum: '2 of 3 voting members',
  },
  VP_COMP: {
    name: 'VP Sales Compensation',
    description: 'Operational decisions and standard processes',
    members: 1,
    quorum: 'Single approver',
  },
  MANAGER: {
    name: 'Sales Manager',
    description: 'Day-to-day approvals and territory management',
    members: null,
    quorum: 'Manager discretion',
  },
  AUTO: {
    name: 'Automated/System',
    description: 'System-calculated processes and automated workflows',
    members: null,
    quorum: 'N/A',
  },
};
