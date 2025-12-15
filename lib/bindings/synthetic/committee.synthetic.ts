import type {
  GovernanceCommittee,
  CommitteeMember,
  DecisionThreshold,
  ICommitteePort,
} from '@/lib/ports/committee.port';

/**
 * Synthetic Committee Provider - In-memory implementation
 *
 * Provides sample SGCC and CRB committees for demonstration
 */
export class SyntheticCommitteeProvider implements ICommitteePort {
  private committees: Map<string, GovernanceCommittee> = new Map();

  constructor() {
    this.initializeSampleCommittees();
  }

  private initializeSampleCommittees() {
    const now = new Date();

    // Sales Compensation Governance Committee (SGCC)
    const sgcc: GovernanceCommittee = {
      id: 'comm-001',
      tenantId: 'demo-tenant-001',
      name: 'Sales Compensation Governance Committee',
      acronym: 'SGCC',
      type: 'PRIMARY',
      description: 'Primary committee for sales compensation governance',
      chair: {
        id: 'user-001',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        role: 'VP Sales Compensation',
        joinedAt: new Date('2024-01-01'),
      },
      viceChair: {
        id: 'user-002',
        name: 'Bob Johnson',
        email: 'bob.johnson@company.com',
        role: 'CFO',
        joinedAt: new Date('2024-01-01'),
      },
      members: [
        {
          id: 'user-003',
          name: 'Sarah Williams',
          email: 'sarah.williams@company.com',
          role: 'CHRO',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-004',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          role: 'General Counsel',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-005',
          name: 'David Rodriguez',
          email: 'david.rodriguez@company.com',
          role: 'Chief Sales Officer',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-006',
          name: 'Lisa Garcia',
          email: 'lisa.garcia@company.com',
          role: 'VP Sales Operations',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-007',
          name: 'Tom Anderson',
          email: 'tom.anderson@company.com',
          role: 'Regional Sales Lead (AMER)',
          joinedAt: new Date('2024-06-01'),
        },
      ],
      decisionThresholds: [
        {
          decisionType: 'SPIF_APPROVAL',
          amountMin: 0,
          amountMax: 50000,
          authority: 'SGCC',
          timelineDays: 5,
        },
        {
          decisionType: 'SPIF_APPROVAL',
          amountMin: 50000,
          amountMax: 250000,
          authority: 'SGCC+CFO',
          timelineDays: 10,
        },
        {
          decisionType: 'SPIF_APPROVAL',
          amountMin: 250000,
          authority: 'SGCC+CEO',
          timelineDays: 15,
        },
        {
          decisionType: 'EXCEPTION_REQUEST',
          amountMin: 0,
          amountMax: 5000,
          authority: 'Manager',
          timelineDays: 5,
        },
        {
          decisionType: 'EXCEPTION_REQUEST',
          amountMin: 5000,
          amountMax: 25000,
          authority: 'Regional',
          timelineDays: 10,
        },
        {
          decisionType: 'EXCEPTION_REQUEST',
          amountMin: 25000,
          authority: 'CRB',
          timelineDays: 15,
        },
        {
          decisionType: 'POLICY_CHANGE',
          authority: 'SGCC+Legal',
          timelineDays: 30,
        },
      ],
      approvalAuthority: [
        'POLICY_APPROVAL',
        'SPIF_APPROVAL',
        'EXCEPTION_APPROVAL',
        'WINDFALL_REVIEW',
      ],
      meetingCadence: 'Monthly',
      quorumRequirement: 5,
      lastMeetingAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      nextMeetingAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 21), // 21 days from now
      totalDecisions: 45,
      totalMeetings: 12,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-01'),
    };

    // Compensation Review Board (CRB)
    const crb: GovernanceCommittee = {
      id: 'comm-002',
      tenantId: 'demo-tenant-001',
      name: 'Compensation Review Board',
      acronym: 'CRB',
      type: 'REVIEW_BOARD',
      description: 'Board for reviewing large deals, SPIFs, and exceptions',
      chair: {
        id: 'user-001',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        role: 'VP Sales Compensation',
        joinedAt: new Date('2024-01-01'),
      },
      members: [
        {
          id: 'user-008',
          name: 'Jennifer Lee',
          email: 'jennifer.lee@company.com',
          role: 'Director of Finance',
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'user-006',
          name: 'Lisa Garcia',
          email: 'lisa.garcia@company.com',
          role: 'Manager, Sales Operations',
          joinedAt: new Date('2024-01-01'),
        },
      ],
      decisionThresholds: [
        {
          decisionType: 'WINDFALL_REVIEW',
          amountMin: 1000000,
          authority: 'CRB',
          timelineDays: 20,
        },
        {
          decisionType: 'SPIF_APPROVAL',
          amountMin: 50000,
          amountMax: 250000,
          authority: 'CRB',
          timelineDays: 15,
        },
        {
          decisionType: 'EXCEPTION_REQUEST',
          amountMin: 25000,
          authority: 'CRB',
          timelineDays: 15,
        },
        {
          decisionType: 'CLAWBACK_APPROVAL',
          amountMin: 25000,
          authority: 'CRB',
          timelineDays: 20,
        },
      ],
      approvalAuthority: [
        'WINDFALL_REVIEW',
        'LARGE_SPIF_APPROVAL',
        'LARGE_EXCEPTION_APPROVAL',
        'CLAWBACK_APPROVAL',
      ],
      meetingCadence: 'Monthly',
      quorumRequirement: 2,
      lastMeetingAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
      nextMeetingAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
      totalDecisions: 23,
      totalMeetings: 12,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-12-01'),
    };

    this.committees.set(sgcc.id, sgcc);
    this.committees.set(crb.id, crb);
  }

  async findAll(tenantId: string): Promise<GovernanceCommittee[]> {
    return Array.from(this.committees.values()).filter(c => c.tenantId === tenantId);
  }

  async findById(id: string): Promise<GovernanceCommittee | null> {
    return this.committees.get(id) || null;
  }

  async findByAcronym(tenantId: string, acronym: string): Promise<GovernanceCommittee | null> {
    const committees = Array.from(this.committees.values()).filter(
      c => c.tenantId === tenantId && c.acronym === acronym
    );
    return committees[0] || null;
  }

  async create(data: Omit<GovernanceCommittee, 'id' | 'createdAt' | 'updatedAt' | 'totalDecisions' | 'totalMeetings'>): Promise<GovernanceCommittee> {
    const committee: GovernanceCommittee = {
      ...data,
      id: `comm-${Date.now()}`,
      totalDecisions: 0,
      totalMeetings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.committees.set(committee.id, committee);
    return committee;
  }

  async update(id: string, data: Partial<GovernanceCommittee>): Promise<GovernanceCommittee> {
    const committee = this.committees.get(id);
    if (!committee) throw new Error(`Committee ${id} not found`);

    const updated: GovernanceCommittee = {
      ...committee,
      ...data,
      id: committee.id, // Preserve ID
      createdAt: committee.createdAt, // Preserve creation date
      updatedAt: new Date(),
    };

    this.committees.set(id, updated);
    return updated;
  }

  async addMember(committeeId: string, member: CommitteeMember): Promise<GovernanceCommittee> {
    const committee = this.committees.get(committeeId);
    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    committee.members.push(member);
    committee.updatedAt = new Date();

    this.committees.set(committeeId, committee);
    return committee;
  }

  async removeMember(committeeId: string, memberId: string): Promise<GovernanceCommittee> {
    const committee = this.committees.get(committeeId);
    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    committee.members = committee.members.filter(m => m.id !== memberId);
    committee.updatedAt = new Date();

    this.committees.set(committeeId, committee);
    return committee;
  }

  async updateThreshold(committeeId: string, threshold: DecisionThreshold): Promise<GovernanceCommittee> {
    const committee = this.committees.get(committeeId);
    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    // Find and update or add threshold
    const existingIndex = committee.decisionThresholds.findIndex(
      t => t.decisionType === threshold.decisionType &&
           t.amountMin === threshold.amountMin &&
           t.amountMax === threshold.amountMax
    );

    if (existingIndex >= 0) {
      committee.decisionThresholds[existingIndex] = threshold;
    } else {
      committee.decisionThresholds.push(threshold);
    }

    committee.updatedAt = new Date();
    this.committees.set(committeeId, committee);
    return committee;
  }

  async getAuthority(
    tenantId: string,
    decisionType: string,
    amount?: number
  ): Promise<{ committee: GovernanceCommittee; threshold: DecisionThreshold } | null> {
    const committees = Array.from(this.committees.values()).filter(c => c.tenantId === tenantId);

    for (const committee of committees) {
      for (const threshold of committee.decisionThresholds) {
        if (threshold.decisionType !== decisionType) continue;

        // Check amount thresholds
        if (amount !== undefined) {
          const minOk = !threshold.amountMin || amount >= threshold.amountMin;
          const maxOk = !threshold.amountMax || amount <= threshold.amountMax;
          if (minOk && maxOk) {
            return { committee, threshold };
          }
        } else if (!threshold.amountMin && !threshold.amountMax) {
          // No amount requirement
          return { committee, threshold };
        }
      }
    }

    return null;
  }

  async recordDecision(
    committeeId: string,
    decisionType: string,
    decision: any
  ): Promise<void> {
    const committee = this.committees.get(committeeId);
    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    // Increment decision counter
    committee.totalDecisions++;
    committee.updatedAt = new Date();

    this.committees.set(committeeId, committee);
  }
}
