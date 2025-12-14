import type {
  Link,
  CreateLink,
  LinkFilters,
  LinkGraph,
  CoverageMatrix,
} from '@/lib/contracts/link.contract';

/**
 * ILinkPort - Service interface for Link operations (ConnectItem pattern)
 */
export interface ILinkPort {
  /**
   * Find all links matching filters
   */
  findAll(filters?: LinkFilters): Promise<Link[]>;

  /**
   * Find link by ID
   */
  findById(id: string): Promise<Link | null>;

  /**
   * Find links from source entity
   */
  findFromSource(entityType: string, entityId: string): Promise<Link[]>;

  /**
   * Find links to target entity
   */
  findToTarget(entityType: string, entityId: string): Promise<Link[]>;

  /**
   * Find links between two entities (bidirectional)
   */
  findBetween(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string
  ): Promise<Link[]>;

  /**
   * Find links by type
   */
  findByType(tenantId: string, linkType: Link['linkType']): Promise<Link[]>;

  /**
   * Create new link
   */
  create(data: CreateLink): Promise<Link>;

  /**
   * Create batch of links
   */
  createBatch(links: CreateLink[]): Promise<Link[]>;

  /**
   * Delete link (soft delete)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Delete all links for entity
   */
  deleteByEntity(entityType: string, entityId: string, deletedBy: string): Promise<number>;

  /**
   * Build link graph for visualization
   */
  buildGraph(entityType: string, entityId: string, depth?: number): Promise<LinkGraph>;

  /**
   * Build coverage matrix
   */
  buildCoverageMatrix(
    rowEntityType: string,
    columnEntityType: string,
    tenantId: string
  ): Promise<CoverageMatrix>;

  /**
   * Find orphaned entities (no links)
   */
  findOrphans(tenantId: string, entityType: string): Promise<string[]>;

  /**
   * Count links by type
   */
  countByType(tenantId: string): Promise<Record<string, number>>;
}
