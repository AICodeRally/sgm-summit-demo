import type {
  IndexItem,
  CreateIndexItem,
  UpdateIndexItem,
  SearchQuery,
  SearchResponse,
  SearchAggregations,
} from '@/lib/contracts/index-item.contract';

/**
 * ISearchPort - Service interface for Search/Index operations (IndexItem pattern)
 */
export interface ISearchPort {
  /**
   * Index entity for search
   */
  index(data: CreateIndexItem): Promise<IndexItem>;

  /**
   * Batch index entities
   */
  indexBatch(items: CreateIndexItem[]): Promise<IndexItem[]>;

  /**
   * Update indexed item
   */
  updateIndex(data: UpdateIndexItem): Promise<IndexItem>;

  /**
   * Remove from index
   */
  removeFromIndex(entityType: string, entityId: string): Promise<void>;

  /**
   * Reindex entity (delete + re-index)
   */
  reindex(entityType: string, entityId: string, data: CreateIndexItem): Promise<IndexItem>;

  /**
   * Reindex all entities of type
   */
  reindexAll(tenantId: string, entityType: string): Promise<number>;

  /**
   * Search indexed items
   */
  search(query: SearchQuery): Promise<SearchResponse>;

  /**
   * Get search suggestions (autocomplete)
   */
  suggest(tenantId: string, prefix: string, limit?: number): Promise<string[]>;

  /**
   * Get search aggregations (facets)
   */
  getAggregations(tenantId: string, query?: string): Promise<SearchAggregations>;

  /**
   * Find indexed item by entity
   */
  findByEntity(entityType: string, entityId: string): Promise<IndexItem | null>;

  /**
   * Find all indexed items for entity type
   */
  findByEntityType(tenantId: string, entityType: string): Promise<IndexItem[]>;

  /**
   * Count indexed items
   */
  count(tenantId: string): Promise<number>;

  /**
   * Count indexed items by entity type
   */
  countByEntityType(tenantId: string): Promise<Record<string, number>>;

  /**
   * Clear all indexed items (use with caution)
   */
  clearIndex(tenantId: string): Promise<number>;
}
