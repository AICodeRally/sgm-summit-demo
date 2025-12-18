import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
} from '@/lib/contracts/document.contract';
import type { IDocumentPort } from '@/lib/ports/document.port';
import { nextVersion } from '@/lib/contracts/document.contract';
import { ALL_JAMF_DOCUMENTS } from '@/lib/data/synthetic/jamf-documents.data';

/**
 * Synthetic Document Provider - JAMF Governance (48 documents)
 *
 * Uses real JAMF governance document structure:
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
    this.initializeJAMFDocuments();
  }

  /**
   * Initialize with all 48 JAMF governance documents
   */
  private initializeJAMFDocuments() {
    const tenantId = 'demo-tenant-001';
    const now = new Date().toISOString();

    ALL_JAMF_DOCUMENTS.forEach((jamfDoc, index) => {
      const docId = `doc-${String(index + 1).padStart(3, '0')}`;

      const document: Document = {
        id: docId,
        tenantId,
        documentCode: jamfDoc.documentCode,
        title: jamfDoc.title,
        description: jamfDoc.description || '',
        documentType: jamfDoc.documentType as any,
        category: jamfDoc.category,
        tags: this.generateTags(jamfDoc),
        version: jamfDoc.version,
        status: jamfDoc.status as any,
        fileType: 'md',
        filePath: `documents/${jamfDoc.documentCode}.md`,
        fileSize: 15000 + Math.floor(Math.random() * 50000), // 15-65KB
        owner: jamfDoc.owner,
        createdBy: jamfDoc.owner,
        createdAt: this.generateCreatedDate(jamfDoc.status),
        updatedAt: now,
        publishedAt: jamfDoc.status === 'APPROVED' || jamfDoc.status === 'ACTIVE' ?
          '2025-12-01T00:00:00.000Z' : null,
        archivedAt: jamfDoc.status === 'ARCHIVED' ? now : null,
        effectiveDate: jamfDoc.effectiveDate || null,
        expirationDate: null,
        retentionPeriod: 7,
        legalReviewStatus: this.getLegalReviewStatus(jamfDoc),
        legalReviewedAt: jamfDoc.status === 'APPROVED' || jamfDoc.status === 'ACTIVE' ?
          '2025-11-15T00:00:00.000Z' : null,
        legalReviewedBy: jamfDoc.status === 'APPROVED' || jamfDoc.status === 'ACTIVE' ?
          'Legal Counsel' : null,
      };

      this.documents.set(docId, document);
    });
  }

  private generateTags(jamfDoc: any): string[] {
    const tags: string[] = [jamfDoc.documentType.toLowerCase()];

    // Add category-based tags
    if (jamfDoc.category) {
      tags.push(jamfDoc.category.toLowerCase().replace(/\s+/g, '-'));
    }

    // Add document-code prefix as tag
    const prefix = jamfDoc.documentCode.split('-')[0];
    if (prefix) tags.push(prefix.toLowerCase());

    // Add specific tags based on content
    if (jamfDoc.documentCode.includes('SGCC') || jamfDoc.documentCode === 'GC-001') {
      tags.push('sgcc', 'committee');
    }
    if (jamfDoc.documentCode.includes('CRB') || jamfDoc.documentCode === 'CRB-001') {
      tags.push('crb', 'windfall', 'large-deals');
    }
    if (jamfDoc.title.toLowerCase().includes('compliance')) {
      tags.push('compliance', 'legal');
    }
    if (jamfDoc.title.toLowerCase().includes('spif')) {
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

  private getLegalReviewStatus(jamfDoc: any): 'NOT_REQUIRED' | 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' {
    // All policies require legal review
    if (jamfDoc.documentType === 'POLICY') {
      if (jamfDoc.status === 'APPROVED' || jamfDoc.status === 'ACTIVE') {
        return 'APPROVED';
      }
      if (jamfDoc.status === 'UNDER_REVIEW') {
        return 'IN_REVIEW';
      }
      if (jamfDoc.status === 'DRAFT') {
        return 'PENDING';
      }
    }

    // Frameworks also require legal review
    if (jamfDoc.documentType === 'FRAMEWORK') {
      return jamfDoc.status === 'APPROVED' ? 'APPROVED' : 'NOT_REQUIRED';
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

    // Sort by updatedAt descending (most recent first)
    results.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return results;
  }

  async findById(id: string, tenantId: string): Promise<Document | null> {
    const doc = this.documents.get(id);
    if (!doc || doc.tenantId !== tenantId) {
      return null;
    }
    return doc;
  }

  async findByCode(documentCode: string, tenantId: string): Promise<Document | null> {
    const doc = Array.from(this.documents.values()).find(
      d => d.documentCode === documentCode && d.tenantId === tenantId
    );
    return doc || null;
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
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      archivedAt: null,
      effectiveDate: null,
      expirationDate: null,
      retentionPeriod: data.retentionPeriod,
      legalReviewStatus: data.legalReviewStatus,
      legalReviewedAt: null,
      legalReviewedBy: null,
    };

    this.documents.set(id, document);
    return document;
  }

  async update(id: string, tenantId: string, updates: UpdateDocument): Promise<Document> {
    const existing = await this.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Document not found: ${id}`);
    }

    const updated: Document = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.documents.set(id, updated);
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const doc = await this.findById(id, tenantId);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }
    this.documents.delete(id);
  }

  async publish(id: string, tenantId: string): Promise<Document> {
    return this.update(id, tenantId, {
      status: 'APPROVED',
      publishedAt: new Date().toISOString(),
    });
  }

  async archive(id: string, tenantId: string): Promise<Document> {
    return this.update(id, tenantId, {
      status: 'ARCHIVED',
      archivedAt: new Date().toISOString(),
    });
  }

  async supersede(id: string, tenantId: string, newVersion: string): Promise<Document> {
    const original = await this.findById(id, tenantId);
    if (!original) {
      throw new Error(`Document not found: ${id}`);
    }

    // Archive the original
    await this.archive(id, tenantId);

    // Create new version
    const newDoc = await this.create({
      ...original,
      version: newVersion,
      status: 'DRAFT',
      createdBy: 'system',
    });

    return newDoc;
  }
}
