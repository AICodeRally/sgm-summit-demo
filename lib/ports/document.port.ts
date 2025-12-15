import type {
  Document,
  CreateDocument,
  UpdateDocument,
  DocumentFilters,
  FileType,
} from '@/lib/contracts/document.contract';

/**
 * IDocumentPort - Service interface for Document operations
 *
 * Defines the contract for document management without specifying implementation.
 * Handles document CRUD, file uploads/downloads, versioning, and lifecycle management.
 * Implementations: SyntheticDocumentProvider, LiveDocumentProvider (with Prisma/S3)
 */
export interface IDocumentPort {
  /**
   * Find all documents matching filters
   */
  findAll(filters?: DocumentFilters): Promise<Document[]>;

  /**
   * Find document by ID
   */
  findById(id: string): Promise<Document | null>;

  /**
   * Find documents by type
   */
  findByType(tenantId: string, documentType: Document['documentType']): Promise<Document[]>;

  /**
   * Find documents by status
   */
  findByStatus(tenantId: string, status: Document['status']): Promise<Document[]>;

  /**
   * Find active documents (in ACTIVE status, within effective date range)
   */
  findActive(tenantId: string, asOfDate?: Date): Promise<Document[]>;

  /**
   * Find document versions (all versions of a document lineage)
   */
  findVersions(documentId: string): Promise<Document[]>;

  /**
   * Find latest version of a document
   */
  findLatestVersion(tenantId: string, documentCode: string): Promise<Document | null>;

  /**
   * Create new document (without file)
   */
  create(data: CreateDocument): Promise<Document>;

  /**
   * Upload file for document
   * - Accepts multipart file
   * - Validates file type and size
   * - Stores locally or in S3
   * - Generates SHA-256 checksum
   */
  uploadFile(documentId: string, file: File, fileType: FileType): Promise<Document>;

  /**
   * Download document file
   * - Returns file buffer or stream
   * - Supports partial range requests for large files
   */
  downloadFile(documentId: string): Promise<Buffer>;

  /**
   * Get file URL (for S3 or CDN)
   */
  getFileUrl(documentId: string): Promise<string>;

  /**
   * Update existing document metadata (not file)
   */
  update(data: UpdateDocument): Promise<Document>;

  /**
   * Create new version of existing document
   * - Creates new document with incremented version
   * - Copies file from previous version
   * - Marks previous version as superseded
   * - Links versions via supersedes/supersededBy
   */
  createVersion(
    documentId: string,
    changes: Partial<Document>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Document>;

  /**
   * Submit document for review (draft → under_review)
   */
  submitForReview(documentId: string, submittedBy: string): Promise<Document>;

  /**
   * Submit document for approval (under_review → pending_approval)
   */
  submitForApproval(documentId: string, submittedBy: string, workflowId?: string): Promise<Document>;

  /**
   * Approve document (pending_approval → approved)
   */
  approve(documentId: string, approvedBy: string, comments?: string): Promise<Document>;

  /**
   * Activate document (approved → active, on effective date)
   */
  activate(documentId: string, activatedBy: string): Promise<Document>;

  /**
   * Archive document (active → archived)
   */
  archive(documentId: string, archivedBy: string): Promise<Document>;

  /**
   * Reject document (pending_approval or under_review → draft)
   */
  reject(documentId: string, rejectedBy: string, reason: string): Promise<Document>;

  /**
   * Delete document (soft delete for audit)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Count documents by status
   */
  countByStatus(tenantId: string): Promise<Record<string, number>>;

  /**
   * Count documents by type
   */
  countByType(tenantId: string): Promise<Record<string, number>>;

  /**
   * Search documents (full-text)
   */
  search(tenantId: string, query: string): Promise<Document[]>;

  /**
   * Get documents needing review (past nextReview date)
   */
  findNeedingReview(tenantId: string): Promise<Document[]>;

  /**
   * Get documents pending approval
   */
  findPendingApproval(tenantId: string): Promise<Document[]>;

  /**
   * Link documents (add relationship)
   */
  linkDocuments(sourceDocId: string, targetDocId: string, relationType: string): Promise<void>;

  /**
   * Unlink documents (remove relationship)
   */
  unlinkDocuments(sourceDocId: string, targetDocId: string): Promise<void>;
}
