import type {
  Approval,
  CreateApproval,
  ApprovalFilters,
  ApprovalWorkflowStep,
  SubmitApprovalDecision,
} from '@/lib/contracts/approval.contract';

/**
 * IApprovalPort - Service interface for Approval operations
 */
export interface IApprovalPort {
  /**
   * Find all approvals matching filters
   */
  findAll(filters?: ApprovalFilters): Promise<Approval[]>;

  /**
   * Find approval by ID
   */
  findById(id: string): Promise<Approval | null>;

  /**
   * Find pending approvals for user
   */
  findPending(tenantId: string, approverId?: string): Promise<Approval[]>;

  /**
   * Find approvals by entity
   */
  findByEntity(entityType: string, entityId: string): Promise<Approval[]>;

  /**
   * Find approvals submitted by user
   */
  findBySubmitter(userId: string): Promise<Approval[]>;

  /**
   * Create new approval request
   */
  create(data: CreateApproval): Promise<Approval>;

  /**
   * Submit approval decision
   */
  decide(decision: SubmitApprovalDecision): Promise<Approval>;

  /**
   * Withdraw approval request
   */
  withdraw(approvalId: string, withdrawnBy: string): Promise<Approval>;

  /**
   * Escalate approval (past SLA deadline)
   */
  escalate(approvalId: string, escalatedBy: string): Promise<Approval>;

  /**
   * Get workflow steps for approval
   */
  getWorkflowSteps(approvalId: string): Promise<ApprovalWorkflowStep[]>;

  /**
   * Get approval statistics
   */
  getStats(tenantId: string): Promise<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    avgDecisionTimeHours: number;
    slaComplianceRate: number;
  }>;

  /**
   * Count approvals by status
   */
  countByStatus(tenantId: string): Promise<Record<string, number>>;
}
