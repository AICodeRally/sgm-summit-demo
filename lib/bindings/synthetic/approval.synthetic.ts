import type { IApprovalPort } from '@/lib/ports/approval.port';
import { isDemoDataEnabled } from '@/lib/config/binding-config';
import type {
  Approval,
  CreateApproval,
  ApprovalFilters,
  ApprovalWorkflowStep,
  SubmitApprovalDecision,
} from '@/lib/contracts/approval.contract';
import { syntheticApprovals, syntheticApprovalWorkflowSteps } from '@/lib/data/synthetic';

export class SyntheticApprovalProvider implements IApprovalPort {
  private approvals: Map<string, Approval>;
  private workflowSteps: Map<string, ApprovalWorkflowStep>;

  constructor() {
    const demoEnabled = isDemoDataEnabled();
    this.approvals = new Map(demoEnabled ? syntheticApprovals.map((a) => [a.id, a]) : []);
    this.workflowSteps = new Map(demoEnabled ? syntheticApprovalWorkflowSteps.map((s) => [s.id, s]) : []);
  }

  async findAll(filters?: ApprovalFilters): Promise<Approval[]> {
    let results = Array.from(this.approvals.values());

    if (!filters) return results;

    if (filters.tenantId) results = results.filter((a) => a.tenantId === filters.tenantId);
    if (filters.status) results = results.filter((a) => a.status === filters.status);
    if (filters.priority) results = results.filter((a) => a.priority === filters.priority);
    if (filters.entityType) results = results.filter((a) => a.entityType === filters.entityType);
    if (filters.entityId) results = results.filter((a) => a.entityId === filters.entityId);
    if (filters.submittedBy) results = results.filter((a) => a.submittedBy === filters.submittedBy);
    if (filters.decidedBy) results = results.filter((a) => a.decidedBy === filters.decidedBy);
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      );
    }

    return results.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async findById(id: string): Promise<Approval | null> {
    return this.approvals.get(id) || null;
  }

  async findPending(tenantId: string, approverId?: string): Promise<Approval[]> {
    let results = Array.from(this.approvals.values()).filter(
      (a) => a.tenantId === tenantId && a.status === 'pending'
    );

    if (approverId) {
      const approverSteps = Array.from(this.workflowSteps.values()).filter(
        (s) => s.approverId === approverId && s.status === 'pending'
      );
      const approvalIds = new Set(approverSteps.map((s) => s.approvalId));
      results = results.filter((a) => approvalIds.has(a.id));
    }

    return results;
  }

  async findByEntity(entityType: string, entityId: string): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(
      (a) => a.entityType === entityType && a.entityId === entityId
    );
  }

  async findBySubmitter(userId: string): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter((a) => a.submittedBy === userId);
  }

  async create(data: CreateApproval): Promise<Approval> {
    const approval: Approval = {
      ...data,
      id: `appr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      currentStep: 0,
      createdAt: new Date(),
    };

    this.approvals.set(approval.id, approval);
    return approval;
  }

  async decide(decision: SubmitApprovalDecision): Promise<Approval> {
    const approval = this.approvals.get(decision.approvalId);
    if (!approval) throw new Error(`Approval ${decision.approvalId} not found`);

    const updated: Approval = {
      ...approval,
      status: decision.decision === 'approve' ? 'approved' : 'rejected',
      decision: decision.decision,
      decidedBy: decision.decidedBy,
      decidedAt: new Date(),
      decisionNotes: decision.comments,
      updatedAt: new Date(),
    };

    this.approvals.set(updated.id, updated);
    return updated;
  }

  async withdraw(approvalId: string, withdrawnBy: string): Promise<Approval> {
    const approval = this.approvals.get(approvalId);
    if (!approval) throw new Error(`Approval ${approvalId} not found`);

    const updated: Approval = {
      ...approval,
      status: 'withdrawn',
      updatedAt: new Date(),
    };

    this.approvals.set(updated.id, updated);
    return updated;
  }

  async escalate(approvalId: string, escalatedBy: string): Promise<Approval> {
    const approval = this.approvals.get(approvalId);
    if (!approval) throw new Error(`Approval ${approvalId} not found`);

    const updated: Approval = {
      ...approval,
      escalatedAt: new Date(),
      updatedAt: new Date(),
    };

    this.approvals.set(updated.id, updated);
    return updated;
  }

  async getWorkflowSteps(approvalId: string): Promise<ApprovalWorkflowStep[]> {
    return Array.from(this.workflowSteps.values())
      .filter((s) => s.approvalId === approvalId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async getStats(tenantId: string): Promise<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    avgDecisionTimeHours: number;
    slaComplianceRate: number;
  }> {
    const approvals = Array.from(this.approvals.values()).filter((a) => a.tenantId === tenantId);

    const totalPending = approvals.filter((a) => a.status === 'pending').length;
    const totalApproved = approvals.filter((a) => a.status === 'approved').length;
    const totalRejected = approvals.filter((a) => a.status === 'rejected').length;

    const decidedApprovals = approvals.filter((a) => a.decidedAt);
    const avgDecisionTimeMs =
      decidedApprovals.reduce((sum, a) => {
        return sum + (a.decidedAt!.getTime() - a.submittedAt.getTime());
      }, 0) / (decidedApprovals.length || 1);

    const avgDecisionTimeHours = avgDecisionTimeMs / (1000 * 60 * 60);

    const withSLA = approvals.filter((a) => a.slaDeadline);
    const metSLA = withSLA.filter((a) => !a.decidedAt || a.decidedAt <= a.slaDeadline!).length;
    const slaComplianceRate = withSLA.length > 0 ? (metSLA / withSLA.length) * 100 : 100;

    return {
      totalPending,
      totalApproved,
      totalRejected,
      avgDecisionTimeHours,
      slaComplianceRate,
    };
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const approvals = Array.from(this.approvals.values()).filter((a) => a.tenantId === tenantId);

    const counts: Record<string, number> = {};
    approvals.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });

    return counts;
  }
}
