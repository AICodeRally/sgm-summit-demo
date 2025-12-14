import type { ILinkPort } from '@/lib/ports/link.port';
import type {
  Link,
  CreateLink,
  LinkFilters,
  LinkGraph,
  LinkGraphNode,
  LinkGraphEdge,
  CoverageMatrix,
} from '@/lib/contracts/link.contract';
import { syntheticLinks } from '@/lib/data/synthetic';

export class SyntheticLinkProvider implements ILinkPort {
  private links: Map<string, Link>;

  constructor() {
    this.links = new Map(syntheticLinks.map((l) => [l.id, l]));
  }

  async findAll(filters?: LinkFilters): Promise<Link[]> {
    let results = Array.from(this.links.values()).filter((l) => !l.deletedAt);

    if (!filters) return results;

    if (filters.tenantId) results = results.filter((l) => l.tenantId === filters.tenantId);
    if (filters.sourceEntityType)
      results = results.filter((l) => l.sourceEntityType === filters.sourceEntityType);
    if (filters.sourceEntityId)
      results = results.filter((l) => l.sourceEntityId === filters.sourceEntityId);
    if (filters.targetEntityType)
      results = results.filter((l) => l.targetEntityType === filters.targetEntityType);
    if (filters.targetEntityId)
      results = results.filter((l) => l.targetEntityId === filters.targetEntityId);
    if (filters.linkType) results = results.filter((l) => l.linkType === filters.linkType);
    if (filters.includeDeleted) {
      results = Array.from(this.links.values());
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Link | null> {
    const link = this.links.get(id);
    return link && !link.deletedAt ? link : null;
  }

  async findFromSource(entityType: string, entityId: string): Promise<Link[]> {
    return Array.from(this.links.values()).filter(
      (l) =>
        l.sourceEntityType === entityType && l.sourceEntityId === entityId && !l.deletedAt
    );
  }

  async findToTarget(entityType: string, entityId: string): Promise<Link[]> {
    return Array.from(this.links.values()).filter(
      (l) =>
        l.targetEntityType === entityType && l.targetEntityId === entityId && !l.deletedAt
    );
  }

  async findBetween(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string
  ): Promise<Link[]> {
    return Array.from(this.links.values()).filter(
      (l) =>
        l.sourceEntityType === sourceType &&
        l.sourceEntityId === sourceId &&
        l.targetEntityType === targetType &&
        l.targetEntityId === targetId &&
        !l.deletedAt
    );
  }

  async findByType(tenantId: string, linkType: Link['linkType']): Promise<Link[]> {
    return Array.from(this.links.values()).filter(
      (l) => l.tenantId === tenantId && l.linkType === linkType && !l.deletedAt
    );
  }

  async create(data: CreateLink): Promise<Link> {
    const link: Link = {
      ...data,
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.links.set(link.id, link);
    return link;
  }

  async createBatch(links: CreateLink[]): Promise<Link[]> {
    return Promise.all(links.map((l) => this.create(l)));
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const link = this.links.get(id);
    if (!link) throw new Error(`Link ${id} not found`);

    const deleted: Link = {
      ...link,
      deletedBy,
      deletedAt: new Date(),
    };

    this.links.set(deleted.id, deleted);
  }

  async deleteByEntity(entityType: string, entityId: string, deletedBy: string): Promise<number> {
    const links = Array.from(this.links.values()).filter(
      (l) =>
        (l.sourceEntityType === entityType && l.sourceEntityId === entityId) ||
        (l.targetEntityType === entityType && l.targetEntityId === entityId)
    );

    for (const link of links) {
      await this.delete(link.id, deletedBy);
    }

    return links.length;
  }

  async buildGraph(entityType: string, entityId: string, depth: number = 2): Promise<LinkGraph> {
    const nodes: Map<string, LinkGraphNode> = new Map();
    const edges: LinkGraphEdge[] = [];

    const visited = new Set<string>();
    const queue: Array<{ type: string; id: string; level: number }> = [
      { type: entityType, id: entityId, level: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.type}:${current.id}`;

      if (visited.has(key) || current.level > depth) continue;
      visited.add(key);

      // Add node
      nodes.set(key, {
        id: key,
        type: current.type,
        name: `${current.type} ${current.id}`,
      });

      // Find outgoing links
      const outgoing = await this.findFromSource(current.type, current.id);
      for (const link of outgoing) {
        edges.push({
          id: link.id,
          source: key,
          target: `${link.targetEntityType}:${link.targetEntityId}`,
          linkType: link.linkType,
          label: link.linkType.replace(/_/g, ' '),
        });

        if (current.level < depth) {
          queue.push({
            type: link.targetEntityType,
            id: link.targetEntityId,
            level: current.level + 1,
          });
        }
      }

      // Find incoming links
      const incoming = await this.findToTarget(current.type, current.id);
      for (const link of incoming) {
        edges.push({
          id: link.id,
          source: `${link.sourceEntityType}:${link.sourceEntityId}`,
          target: key,
          linkType: link.linkType,
          label: link.linkType.replace(/_/g, ' '),
        });

        if (current.level < depth) {
          queue.push({
            type: link.sourceEntityType,
            id: link.sourceEntityId,
            level: current.level + 1,
          });
        }
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }

  async buildCoverageMatrix(
    rowEntityType: string,
    columnEntityType: string,
    tenantId: string
  ): Promise<CoverageMatrix> {
    // Simplified implementation for synthetic mode
    return {
      rowEntityType,
      columnEntityType,
      rows: [],
      columns: [],
      cells: [],
    };
  }

  async findOrphans(tenantId: string, entityType: string): Promise<string[]> {
    const links = Array.from(this.links.values()).filter(
      (l) => l.tenantId === tenantId && !l.deletedAt
    );

    const connectedIds = new Set<string>();
    links.forEach((l) => {
      if (l.sourceEntityType === entityType) connectedIds.add(l.sourceEntityId);
      if (l.targetEntityType === entityType) connectedIds.add(l.targetEntityId);
    });

    // In synthetic mode, can't easily determine all entity IDs without full registry
    return [];
  }

  async countByType(tenantId: string): Promise<Record<string, number>> {
    const links = Array.from(this.links.values()).filter(
      (l) => l.tenantId === tenantId && !l.deletedAt
    );

    const counts: Record<string, number> = {};
    links.forEach((l) => {
      counts[l.linkType] = (counts[l.linkType] || 0) + 1;
    });

    return counts;
  }
}
