import type { Approval, ApprovalWorkflowStep } from '@/lib/contracts/approval.contract';

/**
 * Synthetic Approval Data
 */

const tenantId = 'demo-tenant-001';
const now = new Date();

export const syntheticApprovals: Approval[] = [
  // Pending: Policy publish approval
  {
    id: 'appr-001',
    tenantId,
    title: 'Publish Territory Overlap Resolution Policy',
    description: 'Request to publish new policy from draft',
    priority: 'high',
    status: 'pending',
    entityType: 'policy',
    entityId: 'pol-004',
    requestType: 'publish',
    requestData: {
      policyId: 'pol-004',
      version: '0.9.0',
      targetVersion: '1.0.0',
    },
    workflowId: 'wf-001',
    currentStep: 0,
    totalSteps: 2,
    submittedBy: 'user-ops-002',
    submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    slaDeadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    metadata: {
      reviewers: ['user-mgr-001', 'user-exec-001'],
    },
  },

  // Approved: Quota adjustment
  {
    id: 'appr-002',
    tenantId,
    title: 'Adjust Q4 Quota for Territory Realignment',
    description: '15% quota reduction due to territory split',
    priority: 'medium',
    status: 'approved',
    entityType: 'quota',
    entityId: 'quota-rep-001-q4',
    requestType: 'update',
    requestData: {
      repId: 'user-rep-001',
      quarter: 'Q4-2025',
      oldQuota: 1000000,
      newQuota: 850000,
      reason: 'Territory realignment',
    },
    workflowId: 'wf-002',
    currentStep: 1,
    totalSteps: 1,
    submittedBy: 'user-mgr-001',
    submittedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    decidedBy: 'user-vp-001',
    decidedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    decision: 'approve',
    decisionNotes: 'Approved based on territory documentation',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  },

  // Rejected: Split credit request
  {
    id: 'appr-003',
    tenantId,
    title: 'Split Credit on Acme Corp Deal',
    description: 'Request 50/50 split with overlay rep',
    priority: 'low',
    status: 'rejected',
    entityType: 'deal',
    entityId: 'deal-123',
    requestType: 'split_credit',
    requestData: {
      dealId: 'deal-123',
      primaryRep: 'user-rep-002',
      secondaryRep: 'user-rep-005',
      splitRatio: [50, 50],
    },
    workflowId: 'wf-003',
    currentStep: 1,
    totalSteps: 1,
    submittedBy: 'user-rep-002',
    submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    decidedBy: 'user-mgr-001',
    decidedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    decision: 'reject',
    decisionNotes: 'Overlay rep was not involved in closing the deal. Standard policy applies (70/30).',
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
  },
];

export const syntheticApprovalWorkflowSteps: ApprovalWorkflowStep[] = [
  // Steps for appr-001 (pending)
  {
    id: 'step-001',
    approvalId: 'appr-001',
    sequence: 0,
    approverId: 'user-mgr-001',
    approverRole: 'sales_manager',
    status: 'pending',
    slaDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'step-002',
    approvalId: 'appr-001',
    sequence: 1,
    approverId: 'user-exec-001',
    approverRole: 'vp_sales',
    status: 'pending',
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  },

  // Steps for appr-002 (approved)
  {
    id: 'step-003',
    approvalId: 'appr-002',
    sequence: 0,
    approverId: 'user-vp-001',
    approverRole: 'vp_sales',
    status: 'approved',
    decision: 'approve',
    comments: 'Approved based on territory documentation',
    decidedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  },

  // Steps for appr-003 (rejected)
  {
    id: 'step-004',
    approvalId: 'appr-003',
    sequence: 0,
    approverId: 'user-mgr-001',
    approverRole: 'sales_manager',
    status: 'rejected',
    decision: 'reject',
    comments: 'Overlay rep was not involved in closing the deal. Standard policy applies (70/30).',
    decidedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  },
];
