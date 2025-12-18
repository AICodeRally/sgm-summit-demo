import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  FileType,
} from '@/lib/contracts/document.contract';
import type { IDocumentPort } from '@/lib/ports/document.port';
import { nextVersion } from '@/lib/contracts/document.contract';
import { ALL_GOVERNANCE_DOCUMENTS } from '@/lib/data/synthetic/governance-documents.data';

/**
 * Synthetic Document Provider - SPARCC Governance (48 documents)
 *
 * Uses SPARCC governance document structure:
 * - 7 Framework docs
 * - 17 Policies
 * - 10 Procedures
 * - 12 Templates
 * - 1 Checklist
 * - 2 Guides
 */
export class SyntheticDocumentProvider implements IDocumentPort {
  private documents: Map<string, Document> = new Map();
  private idCounter = 1;

  constructor() {
    this.initializeSPARCCDocuments();
  }

  /**
   * Initialize with all 48 SPARCC governance documents
   */
  private initializeSPARCCDocuments() {
    const tenantId = 'demo-tenant-001';
    const now = new Date().toISOString();

    ALL_GOVERNANCE_DOCUMENTS.forEach((govDoc, index) => {
      const docId = `doc-${String(index + 1).padStart(3, '0')}`;

      const document: Document = {
        id: docId,
        tenantId,
        documentCode: govDoc.documentCode,
        title: govDoc.title,
        description: govDoc.description || '',
        documentType: govDoc.documentType as any,
        category: govDoc.category,
        tags: this.generateTags(govDoc),
        version: govDoc.version + '.0', // Convert to semantic versioning (e.g., "1.0" -> "1.0.0")
        status: govDoc.status as any,
        fileType: 'md',
        filePath: `documents/${govDoc.documentCode}.md`,
        fileSize: 15000 + Math.floor(Math.random() * 50000), // 15-65KB
        owner: govDoc.owner,
        createdBy: govDoc.owner,
        createdAt: new Date(this.generateCreatedDate(govDoc.status)),
        lastUpdated: new Date(now),
        effectiveDate: govDoc.effectiveDate ? new Date(govDoc.effectiveDate) : undefined,
        retentionPeriod: 7,
        legalReviewStatus: this.getLegalReviewStatus(govDoc),
      };

      this.documents.set(docId, document);
    });
  }

  private generateTags(govDoc: any): string[] {
    const tags: string[] = [govDoc.documentType.toLowerCase()];

    // Add category-based tags
    if (govDoc.category) {
      tags.push(govDoc.category.toLowerCase().replace(/\s+/g, '-'));
    }

    // Add document-code prefix as tag
    const prefix = govDoc.documentCode.split('-')[0];
    if (prefix) tags.push(prefix.toLowerCase());

    // Add specific tags based on content
    if (govDoc.documentCode.includes('SGCC') || govDoc.documentCode === 'GC-001') {
      tags.push('sgcc', 'committee');
    }
    if (govDoc.documentCode.includes('CRB') || govDoc.documentCode === 'CRB-001') {
      tags.push('crb', 'windfall', 'large-deals');
    }
    if (govDoc.title.toLowerCase().includes('compliance')) {
      tags.push('compliance', 'legal');
    }
    if (govDoc.title.toLowerCase().includes('spif')) {
      tags.push('spif', 'incentives');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private generateCreatedDate(status: string): string {
    // Approved/Active docs created in November
    if (status === 'APPROVED' || status === 'ACTIVE') {
      return '2025-11-01T00:00:00.000Z';
    }
    // Draft/Under Review more recent
    if (status === 'DRAFT') {
      return '2025-12-10T00:00:00.000Z';
    }
    if (status === 'UNDER_REVIEW') {
      return '2025-12-05T00:00:00.000Z';
    }
    return '2025-11-15T00:00:00.000Z';
  }

  private getLegalReviewStatus(govDoc: any): 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED' {
    // All policies require legal review
    if (govDoc.documentType === 'POLICY') {
      if (govDoc.status === 'APPROVED' || govDoc.status === 'ACTIVE') {
        return 'APPROVED';
      }
      if (govDoc.status === 'UNDER_REVIEW' || govDoc.status === 'DRAFT') {
        return 'PENDING';
      }
    }

    // Frameworks also require legal review
    if (govDoc.documentType === 'FRAMEWORK') {
      return govDoc.status === 'APPROVED' ? 'APPROVED' : 'NOT_REQUIRED';
    }

    return 'NOT_REQUIRED';
  }

  async findAll(filters: DocumentFilters): Promise<Document[]> {
    let results = Array.from(this.documents.values()).filter(
      doc => doc.tenantId === filters.tenantId
    );

    if (filters.status) {
      results = results.filter(doc => doc.status === filters.status);
    }

    if (filters.documentType) {
      results = results.filter(doc => doc.documentType === filters.documentType);
    }

    if (filters.category) {
      results = results.filter(doc => doc.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        doc =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.documentCode.toLowerCase().includes(searchLower) ||
          (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
          (doc.tags && doc.tags.some(tag => tag.includes(searchLower)))
      );
    }

    // Sort by lastUpdated descending (most recent first)
    results.sort((a, b) =>
      b.lastUpdated.getTime() - a.lastUpdated.getTime()
    );

    return results;
  }

  async findById(id: string): Promise<Document | null> {
    const doc = this.documents.get(id);
    return doc || null;
  }

  async findByType(tenantId: string, documentType: Document['documentType']): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.documentType === documentType
    );
  }

  async findByStatus(tenantId: string, status: Document['status']): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.status === status
    );
  }

  async findActive(tenantId: string, asOfDate?: Date): Promise<Document[]> {
    const targetDate = asOfDate || new Date();
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.status === 'ACTIVE' &&
        (!doc.effectiveDate || doc.effectiveDate <= targetDate) &&
        (!doc.expirationDate || doc.expirationDate > targetDate)
    );
  }

  async findVersions(documentId: string): Promise<Document[]> {
    const doc = await this.findById(documentId);
    if (!doc) return [];

    // Find all documents with same documentCode (different versions)
    return Array.from(this.documents.values()).filter(
      d => d.documentCode === doc.documentCode && d.tenantId === doc.tenantId
    );
  }

  async findLatestVersion(tenantId: string, documentCode: string): Promise<Document | null> {
    const docs = Array.from(this.documents.values()).filter(
      d => d.documentCode === documentCode && d.tenantId === tenantId
    );

    if (docs.length === 0) return null;

    // Sort by version (assuming semantic versioning)
    docs.sort((a, b) => b.version.localeCompare(a.version));
    return docs[0];
  }

  async create(data: CreateDocument): Promise<Document> {
    const id = `doc-custom-${this.idCounter++}`;
    const now = new Date().toISOString();

    const document: Document = {
      id,
      tenantId: data.tenantId,
      documentCode: data.documentCode,
      title: data.title,
      description: data.description || '',
      documentType: data.documentType,
      category: data.category || '',
      tags: data.tags || [],
      version: data.version,
      status: data.status,
      fileType: data.fileType,
      filePath: data.filePath,
      fileSize: data.fileSize,
      owner: data.owner,
      createdBy: data.createdBy,
      createdAt: new Date(now),
      lastUpdated: new Date(now),
      retentionPeriod: data.retentionPeriod,
      legalReviewStatus: data.legalReviewStatus,
    };

    this.documents.set(id, document);
    return document;
  }

  async update(data: UpdateDocument): Promise<Document> {
    const existing = await this.findById(data.id);
    if (!existing) {
      throw new Error(`Document not found: ${data.id}`);
    }

    const updated: Document = {
      ...existing,
      ...data,
      lastUpdated: new Date(),
    };

    this.documents.set(data.id, updated);
    return updated;
  }

  async uploadFile(documentId: string, file: File, fileType: FileType): Promise<Document> {
    throw new Error('uploadFile not implemented in synthetic provider');
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    throw new Error('downloadFile not implemented in synthetic provider');
  }

  async getFileUrl(documentId: string): Promise<string> {
    const doc = await this.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);
    return doc.filePath;
  }

  async createVersion(
    documentId: string,
    changes: Partial<Document>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Document> {
    throw new Error('createVersion not implemented in synthetic provider');
  }

  async submitForReview(documentId: string, submittedBy: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: submittedBy,
      status: 'UNDER_REVIEW',
    });
  }

  async submitForApproval(documentId: string, submittedBy: string, workflowId?: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: submittedBy,
      status: 'PENDING_APPROVAL',
      approvalWorkflowId: workflowId,
    });
  }

  async approve(documentId: string, approvedBy: string, comments?: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: approvedBy,
      status: 'APPROVED',
    });
  }

  async activate(documentId: string, activatedBy: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: activatedBy,
      status: 'ACTIVE',
    });
  }

  async archive(documentId: string, archivedBy: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: archivedBy,
      status: 'ARCHIVED',
    });
  }

  async reject(documentId: string, rejectedBy: string, reason: string): Promise<Document> {
    return this.update({
      id: documentId,
      updatedBy: rejectedBy,
      status: 'DRAFT',
    });
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }
    this.documents.delete(id);
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    Array.from(this.documents.values())
      .filter(doc => doc.tenantId === tenantId)
      .forEach(doc => {
        counts[doc.status] = (counts[doc.status] || 0) + 1;
      });
    return counts;
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    Array.from(this.documents.values())
      .filter(doc => doc.tenantId === tenantId)
      .forEach(doc => {
        counts[doc.documentType] = (counts[doc.documentType] || 0) + 1;
      });
    return counts;
  }

  async search(tenantId: string, query: string): Promise<Document[]> {
    return this.findAll({ tenantId, search: query });
  }

  async findNeedingReview(tenantId: string): Promise<Document[]> {
    const now = new Date();
    return Array.from(this.documents.values()).filter(
      doc => doc.tenantId === tenantId && doc.nextReview && doc.nextReview <= now
    );
  }

  async findPendingApproval(tenantId: string): Promise<Document[]> {
    return this.findByStatus(tenantId, 'PENDING_APPROVAL');
  }

  async linkDocuments(sourceDocId: string, targetDocId: string, relationType: string): Promise<void> {
    // Simplified implementation - just update relatedDocs array
    const source = await this.findById(sourceDocId);
    if (!source) throw new Error(`Source document not found: ${sourceDocId}`);

    const relatedDocs = source.relatedDocs || [];
    if (!relatedDocs.includes(targetDocId)) {
      await this.update({
        id: sourceDocId,
        updatedBy: 'system',
        relatedDocs: [...relatedDocs, targetDocId],
      });
    }
  }

  async unlinkDocuments(sourceDocId: string, targetDocId: string): Promise<void> {
    const source = await this.findById(sourceDocId);
    if (!source) throw new Error(`Source document not found: ${sourceDocId}`);

    const relatedDocs = source.relatedDocs || [];
    await this.update({
      id: sourceDocId,
      updatedBy: 'system',
      relatedDocs: relatedDocs.filter(id => id !== targetDocId),
    });
  }
}
