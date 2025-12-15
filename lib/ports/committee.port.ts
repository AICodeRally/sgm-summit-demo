/**
 * Committee Member
 */
export interface CommitteeMember {
  id: string;
  name: string;
  email?: string;
  role: string; // e.g., "Chair", "VP Sales Compensation", "CFO"
  joinedAt: Date;
}

/**
 * Decision Threshold
 */
export interface DecisionThreshold {
  decisionType: string; // e.g., "SPIF_APPROVAL", "EXCEPTION_REQUEST", "POLICY_CHANGE"
  amountMin?: number;
  amountMax?: number;
  authority: string; // Committee or specific role
  timelineDays: number; // SLA in days
}

/**
 * Governance Committee
 */
export interface GovernanceCommittee {
  id: string;
  tenantId: string;
  name: string;
  acronym: string; // e.g., "SGCC", "CRB"
  type: 'PRIMARY' | 'REVIEW_BOARD';
  description?: string;

  // Members
  chair: CommitteeMember;
  viceChair?: CommitteeMember;
  members: CommitteeMember[];

  // Authority
  decisionThresholds: DecisionThreshold[];
  approvalAuthority: string[]; // e.g., ["POLICY_APPROVAL", "SPIF_APPROVAL"]

  // Operations
  meetingCadence: string; // e.g., "Monthly", "Quarterly"
  quorumRequirement: number; // Number of members required for quorum
  lastMeetingAt?: Date;
  nextMeetingAt?: Date;

  // Tracking
  totalDecisions: number;
  totalMeetings: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ICommitteePort - Service interface for Committee operations
 */
export interface ICommitteePort {
  /**
   * Find all committees
   */
  findAll(tenantId: string): Promise<GovernanceCommittee[]>;

  /**
   * Find committee by ID
   */
  findById(id: string): Promise<GovernanceCommittee | null>;

  /**
   * Find committee by acronym
   */
  findByAcronym(tenantId: string, acronym: string): Promise<GovernanceCommittee | null>;

  /**
   * Create committee
   */
  create(data: Omit<GovernanceCommittee, 'id' | 'createdAt' | 'updatedAt' | 'totalDecisions' | 'totalMeetings'>): Promise<GovernanceCommittee>;

  /**
   * Update committee
   */
  update(id: string, data: Partial<GovernanceCommittee>): Promise<GovernanceCommittee>;

  /**
   * Add member to committee
   */
  addMember(committeeId: string, member: CommitteeMember): Promise<GovernanceCommittee>;

  /**
   * Remove member from committee
   */
  removeMember(committeeId: string, memberId: string): Promise<GovernanceCommittee>;

  /**
   * Update decision threshold
   */
  updateThreshold(committeeId: string, threshold: DecisionThreshold): Promise<GovernanceCommittee>;

  /**
   * Get decision authority for a decision type and amount
   */
  getAuthority(
    tenantId: string,
    decisionType: string,
    amount?: number
  ): Promise<{ committee: GovernanceCommittee; threshold: DecisionThreshold } | null>;

  /**
   * Record committee decision
   */
  recordDecision(
    committeeId: string,
    decisionType: string,
    decision: any
  ): Promise<void>;
}
