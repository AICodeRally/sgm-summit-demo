import type { IAuditPort } from '@/lib/ports/audit.port';
import type {
  AuditLog,
  CreateAuditLog,
  AuditLogFilters,
  AuditSummary,
} from '@/lib/contracts/audit-log.contract';

export class SyntheticAuditProvider implements IAuditPort {
  private logs: Map<string, AuditLog>;

  constructor() {
    this.logs = new Map();
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    let results = Array.from(this.logs.values());

    if (!filters) return results;

    if (filters.tenantId) results = results.filter((l) => l.tenantId === filters.tenantId);
    if (filters.eventType) results = results.filter((l) => l.eventType === filters.eventType);
    if (filters.severity) results = results.filter((l) => l.severity === filters.severity);
    if (filters.entityType) results = results.filter((l) => l.entityType === filters.entityType);
    if (filters.entityId) results = results.filter((l) => l.entityId === filters.entityId);
    if (filters.actorId) results = results.filter((l) => l.actorId === filters.actorId);
    if (filters.occurredAfter)
      results = results.filter((l) => l.occurredAt >= filters.occurredAfter!);
    if (filters.occurredBefore)
      results = results.filter((l) => l.occurredAt <= filters.occurredBefore!);
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter((l) => l.message.toLowerCase().includes(query));
    }

    return results.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => l.entityType === entityType && l.entityId === entityId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async findByActor(actorId: string): Promise<AuditLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => l.actorId === actorId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async findByEventType(
    tenantId: string,
    eventType: AuditLog['eventType']
  ): Promise<AuditLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => l.tenantId === tenantId && l.eventType === eventType)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }

  async findRecent(tenantId: string, limit: number = 50): Promise<AuditLog[]> {
    return Array.from(this.logs.values())
      .filter((l) => l.tenantId === tenantId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, limit);
  }

  async create(data: CreateAuditLog): Promise<AuditLog> {
    const log: AuditLog = {
      ...data,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      occurredAt: new Date(),
    };

    this.logs.set(log.id, log);
    return log;
  }

  async createBatch(entries: CreateAuditLog[]): Promise<AuditLog[]> {
    return Promise.all(entries.map((entry) => this.create(entry)));
  }

  async getSummary(tenantId: string, startDate?: Date, endDate?: Date): Promise<AuditSummary> {
    let logs = Array.from(this.logs.values()).filter((l) => l.tenantId === tenantId);

    if (startDate) logs = logs.filter((l) => l.occurredAt >= startDate);
    if (endDate) logs = logs.filter((l) => l.occurredAt <= endDate);

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const actorCounts: Map<string, { name?: string; count: number }> = new Map();

    logs.forEach((l) => {
      eventsByType[l.eventType] = (eventsByType[l.eventType] || 0) + 1;
      eventsBySeverity[l.severity] = (eventsBySeverity[l.severity] || 0) + 1;

      const actor = actorCounts.get(l.actorId) || { name: l.actorName, count: 0 };
      actor.count++;
      actorCounts.set(l.actorId, actor);
    });

    const topActors = Array.from(actorCounts.entries())
      .map(([actorId, data]) => ({
        actorId,
        actorName: data.name,
        eventCount: data.count,
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const recentEvents = logs
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 20);

    return {
      totalEvents: logs.length,
      eventsByType,
      eventsBySeverity,
      topActors,
      recentEvents,
    };
  }

  async countByEventType(tenantId: string): Promise<Record<string, number>> {
    const logs = Array.from(this.logs.values()).filter((l) => l.tenantId === tenantId);

    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      counts[l.eventType] = (counts[l.eventType] || 0) + 1;
    });

    return counts;
  }

  async countBySeverity(tenantId: string): Promise<Record<string, number>> {
    const logs = Array.from(this.logs.values()).filter((l) => l.tenantId === tenantId);

    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      counts[l.severity] = (counts[l.severity] || 0) + 1;
    });

    return counts;
  }

  async export(filters: AuditLogFilters, format: 'json' | 'csv'): Promise<string> {
    const logs = await this.findAll(filters);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV export
    const headers = [
      'ID',
      'Tenant ID',
      'Event Type',
      'Severity',
      'Message',
      'Entity Type',
      'Entity ID',
      'Actor ID',
      'Occurred At',
    ];

    const rows = logs.map((l) => [
      l.id,
      l.tenantId,
      l.eventType,
      l.severity,
      l.message,
      l.entityType,
      l.entityId,
      l.actorId,
      l.occurredAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
