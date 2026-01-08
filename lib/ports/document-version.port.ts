import type {
  DocumentVersion,
  CreateDocumentVersion,
  UpdateDocumentVersion,
  VersionComparison,
  VersionTimelineEntry,
  ImportRawDocument,
  ProcessToMarkdown,
  TransitionToDraft,
  ApproveVersion,
  PublishToActive,
  VersionFilters,
  DocumentLifecycleStatus,
} from '@/lib/contracts/document-version.contract';

/**
 * Document Version Port Interface
 * Provides full provenance tracking for all document versions
 */
export interface IDocumentVersionPort {
  // ===========================================================================
  // CRUD Operations
  // ===========================================================================

  /**
   * Find all versions with optional filters
   */
  findAll(filters?: VersionFilters): Promise<DocumentVersion[]>;

  /**
   * Find a specific version by ID
   */
  findById(id: string): Promise<DocumentVersion | null>;

  /**
   * Get all versions for a specific document
   * Returns versions in chronological order (oldest first)
   */
  findByDocumentId(documentId: string): Promise<DocumentVersion[]>;

  /**
   * Get the latest version for a document
   * Can filter by lifecycle status (e.g., latest ACTIVE_FINAL)
   */
  findLatestVersion(
    documentId: string,
    status?: DocumentLifecycleStatus
  ): Promise<DocumentVersion | null>;

  /**
   * Get a specific version by document ID and version number
   */
  findByVersionNumber(
    documentId: string,
    versionNumber: string
  ): Promise<DocumentVersion | null>;

  /**
   * Create a new document version
   */
  create(data: CreateDocumentVersion): Promise<DocumentVersion>;

  /**
   * Update an existing document version
   */
  update(data: UpdateDocumentVersion): Promise<DocumentVersion>;

  /**
   * Delete a version (soft delete, sets to ARCHIVED)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Hard delete a version (use with caution!)
   */
  hardDelete(id: string): Promise<void>;

  // ===========================================================================
  // Workflow Operations
  // ===========================================================================

  /**
   * Import a RAW document (original source file)
   * Creates initial version with lifecycleStatus = RAW
   */
  importRaw(data: ImportRawDocument): Promise<DocumentVersion>;

  /**
   * Process RAW document to markdown
   * Creates new version with lifecycleStatus = PROCESSED
   * Links to previous RAW version
   */
  processToMarkdown(data: ProcessToMarkdown): Promise<DocumentVersion>;

  /**
   * Transition PROCESSED document to DRAFT
   * Creates new version for editing with lifecycleStatus = DRAFT
   */
  transitionToDraft(data: TransitionToDraft): Promise<DocumentVersion>;

  /**
   * Submit DRAFT for review
   * Updates lifecycleStatus to UNDER_REVIEW
   */
  submitForReview(versionId: string, submittedBy: string): Promise<DocumentVersion>;

  /**
   * Approve a version
   * Updates lifecycleStatus to APPROVED
   * Records approval metadata
   */
  approve(data: ApproveVersion): Promise<DocumentVersion>;

  /**
   * Reject a version (send back to DRAFT)
   * Updates lifecycleStatus back to DRAFT
   */
  reject(
    versionId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<DocumentVersion>;

  /**
   * Publish APPROVED version to ACTIVE_FINAL
   * Supersedes any existing ACTIVE_FINAL version
   * Updates previous active version to SUPERSEDED
   */
  publishToActive(data: PublishToActive): Promise<DocumentVersion>;

  /**
   * Archive a version
   * Updates lifecycleStatus to ARCHIVED
   */
  archive(versionId: string, archivedBy: string): Promise<DocumentVersion>;

  // ===========================================================================
  // Version Comparison & Timeline
  // ===========================================================================

  /**
   * Compare two versions
   * Returns diff and change statistics
   */
  compareVersions(
    versionIdA: string,
    versionIdB: string
  ): Promise<VersionComparison>;

  /**
   * Get version timeline for a document
   * Returns simplified timeline entries for UI visualization
   */
  getTimeline(documentId: string): Promise<VersionTimelineEntry[]>;

  /**
   * Get version history (full audit trail)
   * Returns all versions with full provenance metadata
   */
  getHistory(documentId: string): Promise<DocumentVersion[]>;

  // ===========================================================================
  // Utility Operations
  // ===========================================================================

  /**
   * Calculate checksum for content
   * Used for data integrity verification
   */
  calculateChecksum(content: string): string;

  /**
   * Get next version number
   * Based on change type (MAJOR, MINOR, PATCH)
   */
  getNextVersionNumber(
    documentId: string,
    changeType: 'MAJOR' | 'MINOR' | 'PATCH'
  ): Promise<string>;

  /**
   * Check if version can transition to new status
   * Validates workflow rules
   */
  canTransition(
    versionId: string,
    newStatus: DocumentLifecycleStatus
  ): Promise<{ allowed: boolean; reason?: string }>;

  /**
   * Get version statistics for a document
   */
  getVersionStats(documentId: string): Promise<{
    totalVersions: number;
    versionsByStatus: Record<DocumentLifecycleStatus, number>;
    latestVersion: string;
    activeVersion?: string;
    firstCreated: Date;
    lastModified: Date;
  }>;

  /**
   * Search versions by content
   * Full-text search across version content
   */
  searchContent(
    tenantId: string,
    query: string,
    status?: DocumentLifecycleStatus
  ): Promise<DocumentVersion[]>;
}
