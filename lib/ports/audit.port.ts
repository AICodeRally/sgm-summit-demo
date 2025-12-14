import type {
  AuditLog,
  CreateAuditLog,
  AuditLogFilters,
  AuditSummary,
} from '@/lib/contracts/audit-log.contract';

/**
 * IAuditPort - Service interface for Audit Log operations
 *
 * Audit logs are append-only. Once created, they cannot be modified or deleted.
 */
export interface IAuditPort {
  /**
   * Find all audit logs matching filters
   */
  findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;

  /**
   * Find audit logs for specific entity
   */
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;

  /**
   * Find audit logs by actor
   */
  findByActor(actorId: string): Promise<AuditLog[]>;

  /**
   * Find audit logs by event type
   */
  findByEventType(tenantId: string, eventType: AuditLog['eventType']): Promise<AuditLog[]>;

  /**
   * Find recent audit logs
   */
  findRecent(tenantId: string, limit?: number): Promise<AuditLog[]>;

  /**
   * Create audit log entry (append-only)
   */
  create(data: CreateAuditLog): Promise<AuditLog>;

  /**
   * Create batch of audit log entries
   */
  createBatch(entries: CreateAuditLog[]): Promise<AuditLog[]>;

  /**
   * Get audit summary (aggregated stats)
   */
  getSummary(tenantId: string, startDate?: Date, endDate?: Date): Promise<AuditSummary>;

  /**
   * Count audit logs by event type
   */
  countByEventType(tenantId: string): Promise<Record<string, number>>;

  /**
   * Count audit logs by severity
   */
  countBySeverity(tenantId: string): Promise<Record<string, number>>;

  /**
   * Export audit logs (for compliance)
   */
  export(filters: AuditLogFilters, format: 'json' | 'csv'): Promise<string>;
}
