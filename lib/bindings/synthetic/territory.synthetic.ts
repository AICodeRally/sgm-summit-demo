import type { ITerritoryPort } from '@/lib/ports/territory.port';
import { isDemoDataEnabled } from '@/lib/config/binding-config';
import type {
  Territory,
  CreateTerritory,
  UpdateTerritory,
  TerritoryFilters,
  TerritoryAssignment,
} from '@/lib/contracts/territory.contract';
import { syntheticTerritories } from '@/lib/data/synthetic';

export class SyntheticTerritoryProvider implements ITerritoryPort {
  private territories: Map<string, Territory>;

  constructor() {
    const demoEnabled = isDemoDataEnabled();
    this.territories = new Map(demoEnabled ? syntheticTerritories.map((t) => [t.id, t]) : []);
  }

  async findAll(filters?: TerritoryFilters): Promise<Territory[]> {
    let results = Array.from(this.territories.values());

    if (!filters) return results;

    if (filters.tenantId) {
      results = results.filter((t) => t.tenantId === filters.tenantId);
    }
    if (filters.status) {
      results = results.filter((t) => t.status === filters.status);
    }
    if (filters.type) {
      results = results.filter((t) => t.type === filters.type);
    }
    if (filters.parentTerritoryId) {
      results = results.filter((t) => t.parentTerritoryId === filters.parentTerritoryId);
    }
    if (filters.assignedToUserId) {
      results = results.filter((t) => t.assignedToUserId === filters.assignedToUserId);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return results.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<Territory | null> {
    return this.territories.get(id) || null;
  }

  async findByStatus(tenantId: string, status: Territory['status']): Promise<Territory[]> {
    return this.findAll({ tenantId, status });
  }

  async findRoots(tenantId: string): Promise<Territory[]> {
    return Array.from(this.territories.values()).filter(
      (t) => t.tenantId === tenantId && !t.parentTerritoryId
    );
  }

  async findChildren(parentId: string): Promise<Territory[]> {
    return Array.from(this.territories.values()).filter((t) => t.parentTerritoryId === parentId);
  }

  async findHierarchy(tenantId: string): Promise<Territory[]> {
    return this.findAll({ tenantId });
  }

  async findByAssignee(userId: string): Promise<Territory[]> {
    return Array.from(this.territories.values()).filter((t) => t.assignedToUserId === userId);
  }

  async create(data: CreateTerritory): Promise<Territory> {
    const territory: Territory = {
      ...data,
      id: `terr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level: data.parentTerritoryId
        ? (this.territories.get(data.parentTerritoryId)?.level || 0) + 1
        : 0,
      path: data.parentTerritoryId
        ? `${this.territories.get(data.parentTerritoryId)?.path || ''}/${Date.now()}`
        : `/${Date.now()}`,
      createdAt: new Date(),
    };

    this.territories.set(territory.id, territory);
    return territory;
  }

  async update(data: UpdateTerritory): Promise<Territory> {
    const existing = this.territories.get(data.id);
    if (!existing) throw new Error(`Territory ${data.id} not found`);

    const updated: Territory = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.territories.set(updated.id, updated);
    return updated;
  }

  async assign(territoryId: string, userId: string, assignedBy: string): Promise<Territory> {
    const territory = this.territories.get(territoryId);
    if (!territory) throw new Error(`Territory ${territoryId} not found`);

    const updated: Territory = {
      ...territory,
      assignedToUserId: userId,
      assignedAt: new Date(),
      updatedBy: assignedBy,
      updatedAt: new Date(),
    };

    this.territories.set(updated.id, updated);
    return updated;
  }

  async unassign(territoryId: string, unassignedBy: string): Promise<Territory> {
    const territory = this.territories.get(territoryId);
    if (!territory) throw new Error(`Territory ${territoryId} not found`);

    const updated: Territory = {
      ...territory,
      assignedToUserId: undefined,
      assignedAt: undefined,
      updatedBy: unassignedBy,
      updatedAt: new Date(),
    };

    this.territories.set(updated.id, updated);
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    this.territories.delete(id);
  }

  async getAssignmentHistory(territoryId: string): Promise<TerritoryAssignment[]> {
    // In synthetic mode, return empty array
    // In live mode, this would query assignment history table
    return [];
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const territories = Array.from(this.territories.values()).filter((t) => t.tenantId === tenantId);

    const counts: Record<string, number> = {};
    territories.forEach((t) => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });

    return counts;
  }
}
