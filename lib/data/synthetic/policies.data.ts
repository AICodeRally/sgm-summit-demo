import type { Policy } from '@/lib/contracts/policy.contract';

/**
 * Synthetic Policy Data
 *
 * Pre-loaded mock data for demo purposes.
 * Represents realistic governance policies with versioning and lifecycle states.
 */

const tenantId = 'demo-tenant-001';
const now = new Date();
const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

export const syntheticPolicies: Policy[] = [
  // Policy 1: Commission Rate Policy (Published)
  {
    id: 'pol-001',
    tenantId,
    name: 'Standard Commission Rate Policy',
    description: 'Defines standard commission rates for various product lines and deal sizes.',
    category: 'compensation',
    version: '2.1.0',
    status: 'published',
    effectiveDate: oneMonthAgo,
    content: `# Standard Commission Rate Policy\n\n## Overview\nThis policy defines commission rates for sales representatives across all product lines.\n\n## Rates\n- Software: 8%\n- Services: 12%\n- Hardware: 5%\n\n## Thresholds\n- Deals < $50K: Standard rate\n- Deals $50K-$250K: +1% bonus\n- Deals > $250K: +2% bonus`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(oneMonthAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-001',
    createdAt: new Date(oneMonthAgo.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedBy: 'user-ops-001',
    updatedAt: oneMonthAgo,
    metadata: {
      owner: 'Sales Operations',
      reviewDate: oneMonthFromNow.toISOString(),
    },
  },

  // Policy 2: Split Credit Policy (Published)
  {
    id: 'pol-002',
    tenantId,
    name: 'Split Credit Policy',
    description: 'Rules for splitting commission credit between multiple sales reps.',
    category: 'compensation',
    version: '1.3.0',
    status: 'published',
    effectiveDate: oneMonthAgo,
    content: `# Split Credit Policy\n\n## Scenarios\n### Territory Transfer\n- Rep leaving: 50% for deals in progress\n- Rep joining: 50% for closed deals\n\n### Team Selling\n- Primary rep: 60%\n- Supporting rep: 40%\n\n### Overlay Specialists\n- Account Executive: 70%\n- Solutions Architect: 30%`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: oneMonthAgo,
    createdBy: 'user-ops-002',
    createdAt: new Date(oneMonthAgo.getTime() - 10 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
    },
  },

  // Policy 3: Quota Adjustment Policy (Published)
  {
    id: 'pol-003',
    tenantId,
    name: 'Quota Adjustment Policy',
    description: 'Procedures for adjusting sales quotas mid-quarter.',
    category: 'quota',
    version: '1.0.0',
    status: 'published',
    effectiveDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    content: `# Quota Adjustment Policy\n\n## Approval Requirements\n- <10% adjustment: Sales Manager approval\n- 10-25% adjustment: Sales VP approval\n- >25% adjustment: Executive approval\n\n## Valid Reasons\n- Territory realignment\n- Market conditions\n- Workforce changes\n- Product availability`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-001',
    createdAt: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
    },
  },

  // Policy 4: Territory Overlap Policy (Draft)
  {
    id: 'pol-004',
    tenantId,
    name: 'Territory Overlap Resolution Policy',
    description: 'Guidelines for resolving territory overlap conflicts.',
    category: 'territory',
    version: '0.9.0',
    status: 'draft',
    effectiveDate: oneMonthFromNow,
    content: `# Territory Overlap Resolution Policy\n\n## Draft - For Review\n\n## Overlap Scenarios\n1. Geographic overlap\n2. Account overlap\n3. Industry vertical overlap\n\n## Resolution Process\n1. Identify overlap\n2. Manager review\n3. Rep negotiation\n4. Executive decision (if needed)`,
    approvalRequired: true,
    createdBy: 'user-ops-002',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedBy: 'user-ops-002',
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
      reviewers: ['user-mgr-001', 'user-mgr-002'],
    },
  },

  // Policy 5: Accelerator Policy (Published)
  {
    id: 'pol-005',
    tenantId,
    name: 'Quota Accelerator Policy',
    description: 'Bonus accelerators for exceeding quota targets.',
    category: 'compensation',
    version: '1.2.0',
    status: 'published',
    effectiveDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    content: `# Quota Accelerator Policy\n\n## Tiers\n- 100-110% attainment: 1.2x multiplier\n- 110-125% attainment: 1.5x multiplier\n- 125-150% attainment: 2.0x multiplier\n- >150% attainment: 2.5x multiplier\n\n## Eligibility\n- Must be in role for full quarter\n- Must have no compliance violations`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(now.getTime() - 88 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-001',
    createdAt: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
    },
  },

  // Policy 6: Commission Rate Policy v2.0.0 (Superseded)
  {
    id: 'pol-006',
    tenantId,
    name: 'Standard Commission Rate Policy',
    description: 'Previous version of commission rate policy.',
    category: 'compensation',
    version: '2.0.0',
    status: 'superseded',
    effectiveDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
    expirationDate: oneMonthAgo,
    supersededByPolicyId: 'pol-001',
    content: `# Standard Commission Rate Policy (v2.0.0)\n\n## Previous Rates\n- Software: 7%\n- Services: 10%\n- Hardware: 5%`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(now.getTime() - 118 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-001',
    createdAt: new Date(now.getTime() - 125 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
      supersededBy: 'pol-001',
    },
  },

  // Policy 7: Deal Registration Policy (Published)
  {
    id: 'pol-007',
    tenantId,
    name: 'Deal Registration Policy',
    description: 'Requirements and procedures for registering sales opportunities.',
    category: 'process',
    version: '1.1.0',
    status: 'published',
    effectiveDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    content: `# Deal Registration Policy\n\n## Registration Requirements\n- Deal must be registered within 3 days of first contact\n- Minimum deal size: $10,000\n- Required fields: Account, Contact, Products, Value\n\n## Protection Period\n- Enterprise deals: 90 days\n- SMB deals: 60 days\n- Inside sales: 30 days`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(now.getTime() - 43 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-002',
    createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
    },
  },

  // Policy 8: Clawback Policy (Published)
  {
    id: 'pol-008',
    tenantId,
    name: 'Commission Clawback Policy',
    description: 'Rules for reclaiming commissions on cancelled deals.',
    category: 'compensation',
    version: '1.0.0',
    status: 'published',
    effectiveDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
    content: `# Commission Clawback Policy\n\n## Clawback Scenarios\n- Deal cancelled within 90 days: 100% clawback\n- Deal cancelled within 90-180 days: 50% clawback\n- Deal cancelled after 180 days: No clawback\n\n## Process\n- Finance notifies Sales Ops\n- Rep notified within 5 days\n- Deduction from next commission check`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(now.getTime() - 178 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-001',
    createdAt: new Date(now.getTime() - 185 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
      reviewedBy: 'Legal',
    },
  },

  // Policy 9: New Hire Ramp Policy (Draft)
  {
    id: 'pol-009',
    tenantId,
    name: 'New Hire Quota Ramp Policy',
    description: 'Quota ramp schedule for new sales representatives.',
    category: 'quota',
    version: '0.5.0',
    status: 'draft',
    effectiveDate: oneMonthFromNow,
    content: `# New Hire Quota Ramp Policy\n\n## Draft\n\n## Ramp Schedule\n- Month 1: 25% of full quota\n- Month 2: 50% of full quota\n- Month 3: 75% of full quota\n- Month 4+: 100% of full quota\n\n## Commission During Ramp\n- Standard rates apply to ramp quota\n- Accelerators apply after Month 4`,
    approvalRequired: true,
    createdBy: 'user-ops-002',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
      status: 'In Review',
    },
  },

  // Policy 10: SPIFFs Policy (Published)
  {
    id: 'pol-010',
    tenantId,
    name: 'Special Incentive (SPIFF) Policy',
    description: 'Guidelines for special short-term sales incentives.',
    category: 'compensation',
    version: '1.0.0',
    status: 'published',
    effectiveDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    content: `# SPIFF Policy\n\n## Approval Requirements\n- VP Sales approval for SPIFFs < $10K total\n- Executive approval for SPIFFs > $10K\n\n## Rules\n- Maximum duration: 30 days\n- Clear eligibility criteria\n- Documented payout terms\n- No conflicts with base comp\n\n## Examples\n- New product launch incentives\n- End-of-quarter push\n- Competitive win bonuses`,
    approvalRequired: true,
    approvedBy: 'user-exec-001',
    approvedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
    createdBy: 'user-ops-001',
    createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
    metadata: {
      owner: 'Sales Operations',
    },
  },
];
