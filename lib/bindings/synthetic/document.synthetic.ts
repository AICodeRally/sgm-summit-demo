import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  FileType,
  DocumentType,
} from '@/lib/contracts/document.contract';
import type { IDocumentPort } from '@/lib/ports/document.port';
import { nextVersion } from '@/lib/contracts/document.contract';

/**
 * Sample JAMF governance documents (embedded as markdown)
 */
const JAMF_SAMPLE_DOCUMENTS = [
  {
    documentCode: 'FWK-001',
    title: 'Sales Compensation Governance Committee Charter',
    documentType: 'FRAMEWORK',
    category: 'Governance',
    content: `# Sales Compensation Governance Committee Charter

## Purpose
The Sales Compensation Governance Committee (SGCC) establishes and oversees the governance framework for all sales compensation programs.

## Committee Structure
- Chair: VP Sales Compensation
- Vice Chair: CFO or Finance Director
- Members: CHRO, General Counsel, CSO, VP Sales Operations, Regional Sales Lead

## Authority
- Approve new compensation plans
- Establish policy and procedure standards
- Set approval thresholds for exceptions and SPIFs
- Resolve compensation disputes

## Meeting Cadence
Minimum monthly meetings, with additional meetings as needed.

## Quorum Requirements
5 of 7 members required for quorum.
`,
  },
  {
    documentCode: 'FWK-002',
    title: 'Compensation Review Board Charter',
    documentType: 'FRAMEWORK',
    category: 'Governance',
    content: `# Compensation Review Board (CRB) Charter

## Purpose
The Compensation Review Board reviews and approves large deals, SPIFs, and exceptions above certain thresholds.

## Board Composition
- Chair: VP Sales Compensation
- Members: Director of Finance, Manager of Sales Operations
- Non-voting: General Counsel, VP Sales (as needed)

## Authority
- Windfall deal review (>$1M ARR, >$100K commission)
- SPIF approvals ($50K-$250K range)
- Exception requests >$25K
- Individual dispute escalations

## Decision Options for Windfall Deals
1. Full payment
2. Commission cap
3. Amortization
4. Split credit
5. Special recognition bonus
`,
  },
  {
    documentCode: 'POL-001',
    title: 'Sales Crediting Policy',
    documentType: 'POLICY',
    category: 'Compensation',
    content: `# Sales Crediting Policy

## Purpose
Define clear rules for crediting sales transactions to individual sales representatives.

## Primary Crediting Rules

### New Logo Deals
- 100% credit to closing AE
- SE gets allocation if direct contribution

### Named Account Deals
- 100% credit to account owner
- Territory transitions handled by CRB

### Renewal Deals
- 100% credit to account owner
- Lost-to-won scenarios subject to dispute resolution

## Multi-Rep Splits
Common splits for team deals:
- 70% AE / 30% SE
- 50% AE / 50% SE
- Territory transition: 50/50 split during overlap period

## Overlay Role Crediting
- Sales Engineers: GARR/Gross Retention allocation
- CSMs: Gross Renewal metrics
- SDRs: Lead generation credit

## Territory Conflicts
CRB to resolve conflicts within 10 business days.

## Appeals Process
30-day window to appeal credit decisions.
`,
  },
  {
    documentCode: 'POL-002',
    title: 'Quota & Territory Management Policy',
    documentType: 'POLICY',
    category: 'Territory',
    content: `# Quota & Territory Management Policy

## Quota Setting Methodology
- Based on 3-year historical data
- Market potential analysis
- Territory capacity modeling
- Industry benchmarks

## Quota Setting Timeline
- September-October: Quota setting process
- November 1: Quotas announced to sales team
- January 1: Effective date

## Mid-Year Adjustments
- Reviews in May for significant changes
- Threshold: >50% variance requires SGCC approval
- 10-25% adjustments require VP Sales Operations approval

## Territory Changes
- Territory additions: Effective immediately with prorated quota
- Territory removals: 30-day transition period
- Territory splits: 50/50 during 60-day overlap

## Quota Appeals
- 14-day window to submit appeal
- 3-tier review process:
  1. Manager discussion
  2. Regional director review
  3. VP Sales final decision

## Special Situations
- New hire ramp: 50% quota first 90 days
- Return from LOA: Ramp back to full quota over 60 days
- M&A: Special territory alignment procedures
`,
  },
  {
    documentCode: 'POL-003',
    title: 'Payment Timing Policy',
    documentType: 'POLICY',
    category: 'Compensation',
    content: `# Payment Timing Policy

## Commission Earned Date
Commission is earned when deal is CLOSED-WON in Salesforce.

## Monthly Payment Schedule
- Earned during calendar month
- Paid by 5th of following month
- Exception: Large deals (>$500K) may have extended payment terms

## Year-End True-Up
- Final reconciliation in January
- Includes all adjustments from prior year
- Clawbacks processed in January

## Termination Payment Timing

### Voluntary Termination
- Final payment within 72 hours of last day
- Includes earned but unpaid commissions
- Unearned spiffs forfeited

### Involuntary Termination
- Final payment due immediately upon separation
- May include severance in addition to commissions
- Legal review required

## Special Circumstance Payments
- Bonus payments: Within 30 days of decision
- Accelerated payments: Approved by CFO
- Holdbacks: Held for clawback review period (180 days)
`,
  },
  {
    documentCode: 'POL-004',
    title: 'SPIF Governance Policy',
    documentType: 'POLICY',
    category: 'Incentives',
    content: `# SPIF Governance Policy

## SPIF Definition
Special Performance Incentive Fund - short-term incentive programs to drive specific behaviors.

## SPIF Types
1. Product-focused: New product adoption
2. Territory-focused: Quota overachievement
3. Strategic: Multi-year deals
4. Seasonal: Quarter-end push
5. Vendor-funded: Partner-sponsored programs

## Approval Authority
- <$50K: SGCC approval
- $50K-$250K: SGCC + CFO approval
- >$250K: SGCC + CEO approval

## ROI Requirements
- Projected ROI: Minimum 3:1
- Actual ROI tracked: Minimum 2:1 for continuation
- Budget tracking: Monthly dashboard

## SPIF Mechanics
- Minimum earning threshold
- Tiered payout structure
- Accrual during program period
- Payment within 15 days of close

## Conflict Avoidance
- No SPIFs conflicting with base plan
- No double-crediting
- Geographic or segment carve-outs for clarity
`,
  },
  {
    documentCode: 'POL-005',
    title: 'Windfall & Large Deal Policy',
    documentType: 'POLICY',
    category: 'Compensation',
    content: `# Windfall & Large Deal Policy

## Windfall Identification
Deal qualifies as windfall if ANY of:
- ARR >$1,000,000
- Commission >$100,000
- Commission >50% of AE's annual quota

## CRB Review Process
1. Submission within 5 days of deal close
2. CRB review within 10 days
3. Decision and documentation within 15 days

## Treatment Options
1. **Full Payment**: No modification (legitimate windfall)
2. **Cap**: Limited to 2x target incentive or $250K max
3. **Amortization**: Spread over contract term (max 36 months)
4. **Split**: Allocate among team members
5. **Bonus**: $25K-$100K special recognition

## Decision Criteria
- Deal legitimacy
- Sales effort required
- Market conditions
- Historical precedent
- Sustainability

## Examples

### Example 1: $3M New Logo
- Commission: $180K
- Decision: Full Payment
- Rationale: Legitimate new customer, significant effort

### Example 2: $2M Expansion Deal
- Commission: $120K
- Decision: Amortized over 12 months
- Rationale: Revenue recognition alignment

### Example 3: $5M Team Deal
- Commission: $300K
- Decision: Split 60% AE / 25% SE / 15% CSM
- Rationale: Distributed effort

### Example 4: $1.5M Deal with Overlap
- Commission: $90K
- Decision: Cap at $80K (2x target)
- Rationale: Territory dispute, shared credit

## Appeals Process
- 30-day window to appeal CRB decision
- VP Sales final authority
- Documented precedent for future decisions
`,
  },
  {
    documentCode: 'POL-006',
    title: 'Clawback Recovery Policy',
    documentType: 'POLICY',
    category: 'Compensation',
    content: `# Clawback Recovery Policy

## Clawback Events
1. **Churn**: Account cancellation or non-renewal within 180 days
2. **Refund**: Customer refund due to issue or fraud
3. **Fraud**: Misrepresentation or unethical behavior
4. **Compliance**: Regulatory violation or policy breach

## Clawback Amounts
- Full amount for customers not meeting threshold
- Prorated amount based on tenure in customer
- Percentage-based recovery for partial responsibility

## Approval Authority
- <$5K: Manager approval
- $5K-$25K: Director of Sales Operations
- >$25K: CRB approval

## Recovery Mechanisms
1. Payroll deduction (ongoing over 6 months)
2. Offset against future commissions
3. Final paycheck deduction (termination)
4. Negotiated settlement

## Clawback Notifications
- Notice: 30 days minimum (>$25K: 60 days)
- Written explanation of clawback event
- Appeal rights and process

## Clawback Appeals
- **Tier 1**: Manager appeal (5 days)
- **Tier 2**: Regional director (10 days)
- **Tier 3**: CRB final decision (20 days)

## Hardship Exceptions
- Family emergency
- Documented medical issues
- Undue financial hardship (case-by-case)

## State Law Compliance
- California: Clawback restricted to unearned portions only
- Texas: 30-day notice required
- New York: Written agreement required upfront
`,
  },
  {
    documentCode: 'PROC-001',
    title: 'Commission Reconciliation Procedures',
    documentType: 'PROCEDURE',
    category: 'Operations',
    content: `# Commission Reconciliation Procedures

## Monthly Timeline
- Days 1-3: Salesforce data extract and validation
- Days 4-7: Commission calculation and review
- Days 8-10: Exceptions review and approval
- Days 11-15: Payroll submission
- Days 16-20: Final payment processing

## Data Validation Process
1. Verify all deals in CLOSED-WON status
2. Check credit assignment (primary + secondary)
3. Validate AE/SE/CSM allocation percentages
4. Confirm deal amounts against Salesforce
5. Review territory assignments

## Commission Calculation
- Base deal amount × commission rate × credit %
- Apply caps, clawbacks, and adjustments
- Calculate SPIFs and bonuses
- Aggregate to total commission

## Exception Review
- Flagged: Credit discrepancies
- Flagged: Deals missing credit allocation
- Flagged: Large deals (>$100K commission)
- Flagged: Clawback candidates
- All flagged items require Finance approval

## Payment Processing
- QA checklist verification
- Payroll system import
- Final review before disbursement
- Payment confirmation to sales team

## Month-End Close
- Variance analysis (vs. forecast)
- Reserve for potential clawbacks
- Accrual adjustments
- Balance sheet reconciliation

## Documentation
- Retain all calculations for 7 years
- Archive monthly reports
- Document exceptions and approvals
- Maintain exception log for audit
`,
  },
  {
    documentCode: 'PROC-002',
    title: 'Dispute Resolution Procedures',
    documentType: 'PROCEDURE',
    category: 'Operations',
    content: `# Dispute Resolution Procedures

## Tier 1: Manager Discussion (14 days)
**Initiator**: Sales Rep or Manager
**Timeline**: 14 days from request

### Process
1. Submit written dispute with details
2. Manager reviews situation
3. One-on-one discussion with rep
4. Manager proposes resolution
5. Documented outcome

### Possible Outcomes
- Dispute resolved
- Escalate to Tier 2
- Await additional investigation

## Tier 2: Regional Review (14 days)
**Initiator**: Escalation from Tier 1 or rep directly
**Timeline**: 14 days from escalation

### Process
1. Regional Director independent review
2. Interview manager and rep
3. Review historical precedent
4. Evaluate policy compliance
5. Propose resolution

### Possible Outcomes
- Dispute resolved
- Escalate to Tier 3
- Send back to Manager for additional investigation

## Tier 3: CRB Final Review (20 days)
**Initiator**: Escalation from Tier 2
**Timeline**: 20 days from escalation
**Final Authority**: No further appeal

### Process
1. CRB reviews complete file
2. May interview rep and manager
3. Consider policy and precedent
4. CRB vote (3 members)
5. Documented final decision

### Possible Outcomes
- Decision rendered (no appeal)
- Payment adjusted
- Precedent documented for future disputes

## Overall Timeline
- Tier 1: Days 1-14
- Tier 2: Days 15-28
- Tier 3: Days 29-48
- **Total: Maximum 48 days for full resolution**

## Documentation Requirements
- Written dispute submission
- Evidence and supporting documents
- Decision documentation at each level
- All decisions archived for audit

## Common Dispute Types
1. **Credit discrepancies**: Wrong credit allocation
2. **Territory conflicts**: Territory ownership dispute
3. **Clawback disputes**: Challenge to clawback amount
4. **Calculation errors**: Math mistakes
5. **Policy interpretation**: Policy application question
`,
  },
];

/**
 * Synthetic Document Provider - In-memory implementation
 *
 * Stores documents in memory with JAMF sample data
 * Used for demos, testing, and MVP
 */
export class SyntheticDocumentProvider implements IDocumentPort {
  private documents: Map<string, Document> = new Map();
  private nextId = 1;

  constructor() {
    // Initialize with JAMF sample documents
    this.initializeSampleDocuments();
  }

  private initializeSampleDocuments() {
    const now = new Date();
    const effectiveDate = new Date();
    effectiveDate.setDate(effectiveDate.getDate() - 30); // 30 days ago

    JAMF_SAMPLE_DOCUMENTS.forEach((sample, index) => {
      const doc: Document = {
        id: `doc-${index + 1}`,
        tenantId: 'demo-tenant-001',
        documentCode: sample.documentCode,
        title: sample.title,
        description: `Sample governance document for demonstration`,
        documentType: sample.documentType as DocumentType,
        category: sample.category,
        tags: ['sample', 'governance', 'jamf'],
        version: '1.0.0',
        status: 'ACTIVE',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
        lastUpdated: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        effectiveDate: effectiveDate,
        expirationDate: undefined,
        nextReview: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90), // 90 days from now
        fileType: 'md',
        filePath: `documents/${sample.documentCode}.md`,
        fileSize: Buffer.byteLength(sample.content),
        checksum: this.simpleHash(sample.content),
        owner: 'VP Sales Compensation',
        createdBy: 'system',
        updatedBy: 'system',
        legalReviewStatus: 'APPROVED',
        approvers: [
          { name: 'Jane Smith', role: 'VP Sales Compensation', approvedAt: effectiveDate },
          { name: 'Bob Johnson', role: 'General Counsel', approvedAt: effectiveDate },
        ],
        relatedDocs: [],
        referencedBy: [],
        retentionPeriod: 7,
        complianceFlags: ['CA_LABOR_CODE', 'SECTION_409A'],
        metadata: { markdown_content: sample.content },
      };

      this.documents.set(doc.id, doc);
    });
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private generateId(): string {
    return `doc-${this.nextId++}-${Date.now()}`;
  }

  async findAll(filters?: DocumentFilters): Promise<Document[]> {
    let results = Array.from(this.documents.values());

    if (filters?.tenantId) {
      results = results.filter(d => d.tenantId === filters.tenantId);
    }
    if (filters?.documentType) {
      results = results.filter(d => d.documentType === filters.documentType);
    }
    if (filters?.status) {
      results = results.filter(d => d.status === filters.status);
    }
    if (filters?.category) {
      results = results.filter(d => d.category === filters.category);
    }
    if (filters?.owner) {
      results = results.filter(d => d.owner === filters.owner);
    }
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(d => filters.tags!.some(tag => d.tags?.includes(tag)));
    }

    return results;
  }

  async findById(id: string): Promise<Document | null> {
    return this.documents.get(id) || null;
  }

  async findByType(tenantId: string, documentType: DocumentType): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      d => d.tenantId === tenantId && d.documentType === documentType
    );
  }

  async findByStatus(tenantId: string, status: Document['status']): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      d => d.tenantId === tenantId && d.status === status
    );
  }

  async findActive(tenantId: string, asOfDate?: Date): Promise<Document[]> {
    const now = asOfDate || new Date();
    return Array.from(this.documents.values()).filter(d =>
      d.tenantId === tenantId &&
      d.status === 'ACTIVE' &&
      d.effectiveDate && d.effectiveDate <= now &&
      (!d.expirationDate || d.expirationDate >= now)
    );
  }

  async findVersions(documentId: string): Promise<Document[]> {
    const doc = this.documents.get(documentId);
    if (!doc) return [];

    // Return all documents with same documentCode in order of version
    return Array.from(this.documents.values())
      .filter(d => d.documentCode === doc.documentCode)
      .sort((a, b) => {
        const aV = a.version.split('.').map(Number);
        const bV = b.version.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aV[i] !== bV[i]) return aV[i] - bV[i];
        }
        return 0;
      });
  }

  async findLatestVersion(tenantId: string, documentCode: string): Promise<Document | null> {
    const docs = Array.from(this.documents.values())
      .filter(d => d.tenantId === tenantId && d.documentCode === documentCode);

    if (docs.length === 0) return null;

    return docs.reduce((latest, current) => {
      const latestV = latest.version.split('.').map(Number);
      const currentV = current.version.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (currentV[i] > latestV[i]) return current;
        if (currentV[i] < latestV[i]) return latest;
      }
      return latest;
    });
  }

  async create(data: CreateDocument): Promise<Document> {
    const doc: Document = {
      id: this.generateId(),
      tenantId: data.tenantId,
      documentCode: data.documentCode,
      title: data.title,
      description: data.description,
      documentType: data.documentType,
      category: data.category,
      tags: data.tags,
      version: data.version,
      status: data.status,
      createdAt: new Date(),
      lastUpdated: new Date(),
      effectiveDate: data.effectiveDate,
      expirationDate: data.expirationDate,
      nextReview: data.nextReview,
      fileType: data.fileType,
      filePath: data.filePath || `documents/${data.documentCode}.md`,
      fileSize: data.fileSize || 0,
      checksum: data.checksum || this.simpleHash(JSON.stringify(data)),
      owner: data.owner,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      approvers: data.approvers,
      approvalWorkflowId: data.approvalWorkflowId,
      legalReviewStatus: data.legalReviewStatus,
      relatedDocs: data.relatedDocs,
      referencedBy: data.referencedBy,
      supersedes: data.supersedes,
      supersededBy: data.supersededBy,
      retentionPeriod: data.retentionPeriod,
      complianceFlags: data.complianceFlags,
      metadata: data.metadata,
    };

    this.documents.set(doc.id, doc);
    return doc;
  }

  async uploadFile(documentId: string, file: File, fileType: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const checksum = this.simpleHash(await file.text());
    const updated: Document = {
      ...doc,
      fileType: fileType as FileType,
      fileSize: file.size,
      checksum,
      filePath: `documents/${documentId}/${file.name}`,
      lastUpdated: new Date(),
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    // Return mock buffer
    return Buffer.from(doc.metadata?.markdown_content || `Document: ${doc.title}`);
  }

  async getFileUrl(documentId: string): Promise<string> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    return `/api/sgm/documents/${documentId}/download`;
  }

  async update(data: UpdateDocument): Promise<Document> {
    const doc = this.documents.get(data.id);
    if (!doc) throw new Error(`Document ${data.id} not found`);

    const updated: Document = {
      ...doc,
      ...data,
      lastUpdated: new Date(),
    };

    this.documents.set(data.id, updated);
    return updated;
  }

  async createVersion(
    documentId: string,
    changes: Partial<Document>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Document> {
    const existing = this.documents.get(documentId);
    if (!existing) throw new Error(`Document ${documentId} not found`);

    const newVersion = nextVersion(existing.version, bumpType);
    const newDoc: Document = {
      ...existing,
      ...changes,
      id: this.generateId(),
      version: newVersion,
      status: 'DRAFT',
      createdAt: new Date(),
      lastUpdated: new Date(),
      supersedes: documentId,
    };

    // Mark old as superseded
    const oldDoc: Document = {
      ...existing,
      status: 'ARCHIVED',
      supersededBy: newDoc.id,
      lastUpdated: new Date(),
    };

    this.documents.set(documentId, oldDoc);
    this.documents.set(newDoc.id, newDoc);

    return newDoc;
  }

  async submitForReview(documentId: string, submittedBy: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const updated: Document = {
      ...doc,
      status: 'UNDER_REVIEW',
      lastUpdated: new Date(),
      updatedBy: submittedBy,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async submitForApproval(documentId: string, submittedBy: string, workflowId?: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const updated: Document = {
      ...doc,
      status: 'PENDING_APPROVAL',
      approvalWorkflowId: workflowId,
      lastUpdated: new Date(),
      updatedBy: submittedBy,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async approve(documentId: string, approvedBy: string, comments?: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const approvers = doc.approvers || [];
    approvers.push({ name: approvedBy, role: 'Approver', approvedAt: new Date(), comments });

    const updated: Document = {
      ...doc,
      status: 'APPROVED',
      approvers,
      lastUpdated: new Date(),
      updatedBy: approvedBy,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async activate(documentId: string, activatedBy: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const updated: Document = {
      ...doc,
      status: 'ACTIVE',
      lastUpdated: new Date(),
      updatedBy: activatedBy,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async archive(documentId: string, archivedBy: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const updated: Document = {
      ...doc,
      status: 'ARCHIVED',
      lastUpdated: new Date(),
      updatedBy: archivedBy,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async reject(documentId: string, rejectedBy: string, reason: string): Promise<Document> {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const updated: Document = {
      ...doc,
      status: 'DRAFT',
      lastUpdated: new Date(),
      updatedBy: rejectedBy,
      metadata: {
        ...doc.metadata,
        rejection_reason: reason,
      },
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    this.documents.delete(id);
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {
      DRAFT: 0,
      UNDER_REVIEW: 0,
      PENDING_APPROVAL: 0,
      APPROVED: 0,
      ACTIVE: 0,
      ARCHIVED: 0,
    };

    Array.from(this.documents.values())
      .filter(d => d.tenantId === tenantId)
      .forEach(d => {
        counts[d.status]++;
      });

    return counts;
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    Array.from(this.documents.values())
      .filter(d => d.tenantId === tenantId)
      .forEach(d => {
        counts[d.documentType] = (counts[d.documentType] || 0) + 1;
      });

    return counts;
  }

  async search(tenantId: string, query: string): Promise<Document[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(d =>
      d.tenantId === tenantId &&
      (d.title.toLowerCase().includes(lowerQuery) ||
        d.documentCode.toLowerCase().includes(lowerQuery) ||
        d.description?.toLowerCase().includes(lowerQuery) ||
        d.tags?.some(t => t.toLowerCase().includes(lowerQuery)))
    );
  }

  async findNeedingReview(tenantId: string): Promise<Document[]> {
    const now = new Date();
    return Array.from(this.documents.values()).filter(d =>
      d.tenantId === tenantId &&
      d.nextReview &&
      d.nextReview < now
    );
  }

  async findPendingApproval(tenantId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d =>
      d.tenantId === tenantId &&
      d.status === 'PENDING_APPROVAL'
    );
  }

  async linkDocuments(sourceDocId: string, targetDocId: string, relationType: string): Promise<void> {
    const sourceDoc = this.documents.get(sourceDocId);
    const targetDoc = this.documents.get(targetDocId);

    if (!sourceDoc || !targetDoc) throw new Error('Document not found');

    // Add to related docs
    if (!sourceDoc.relatedDocs) sourceDoc.relatedDocs = [];
    if (!sourceDoc.relatedDocs.includes(targetDocId)) {
      sourceDoc.relatedDocs.push(targetDocId);
    }

    if (!targetDoc.referencedBy) targetDoc.referencedBy = [];
    if (!targetDoc.referencedBy.includes(sourceDocId)) {
      targetDoc.referencedBy.push(sourceDocId);
    }

    this.documents.set(sourceDocId, sourceDoc);
    this.documents.set(targetDocId, targetDoc);
  }

  async unlinkDocuments(sourceDocId: string, targetDocId: string): Promise<void> {
    const sourceDoc = this.documents.get(sourceDocId);
    const targetDoc = this.documents.get(targetDocId);

    if (!sourceDoc || !targetDoc) throw new Error('Document not found');

    if (sourceDoc.relatedDocs) {
      sourceDoc.relatedDocs = sourceDoc.relatedDocs.filter(id => id !== targetDocId);
    }

    if (targetDoc.referencedBy) {
      targetDoc.referencedBy = targetDoc.referencedBy.filter(id => id !== sourceDocId);
    }

    this.documents.set(sourceDocId, sourceDoc);
    this.documents.set(targetDocId, targetDoc);
  }
}
