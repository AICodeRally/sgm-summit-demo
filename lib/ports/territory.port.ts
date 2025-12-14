import type {
  Territory,
  CreateTerritory,
  UpdateTerritory,
  TerritoryFilters,
  TerritoryAssignment,
} from '@/lib/contracts/territory.contract';

/**
 * ITerritoryPort - Service interface for Territory operations
 */
export interface ITerritoryPort {
  /**
   * Find all territories matching filters
   */
  findAll(filters?: TerritoryFilters): Promise<Territory[]>;

  /**
   * Find territory by ID
   */
  findById(id: string): Promise<Territory | null>;

  /**
   * Find territories by status
   */
  findByStatus(tenantId: string, status: Territory['status']): Promise<Territory[]>;

  /**
   * Find root territories (no parent)
   */
  findRoots(tenantId: string): Promise<Territory[]>;

  /**
   * Find child territories
   */
  findChildren(parentId: string): Promise<Territory[]>;

  /**
   * Find territory hierarchy (tree)
   */
  findHierarchy(tenantId: string): Promise<Territory[]>;

  /**
   * Find territories assigned to user
   */
  findByAssignee(userId: string): Promise<Territory[]>;

  /**
   * Create new territory
   */
  create(data: CreateTerritory): Promise<Territory>;

  /**
   * Update existing territory
   */
  update(data: UpdateTerritory): Promise<Territory>;

  /**
   * Assign territory to user
   */
  assign(territoryId: string, userId: string, assignedBy: string): Promise<Territory>;

  /**
   * Unassign territory from user
   */
  unassign(territoryId: string, unassignedBy: string): Promise<Territory>;

  /**
   * Delete territory
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Get assignment history
   */
  getAssignmentHistory(territoryId: string): Promise<TerritoryAssignment[]>;

  /**
   * Count territories by type
   */
  countByType(tenantId: string): Promise<Record<string, number>>;
}
