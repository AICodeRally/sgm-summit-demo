/**
 * Live Policy Provider - Prisma-backed implementation
 *
 * CRITICAL: Requires DATABASE_URL with &schema=sgm_summit_demo
 * Uses Prisma ORM for real database operations on isolated schema
 */

import type { IPolicyPort } from '@/lib/ports/policy.port';
import type {
  Policy,
  CreatePolicy,
  UpdatePolicy,
  PolicyFilters,
} from '@/lib/contracts/policy.contract';
import { nextVersion } from '@/lib/contracts/policy.contract';
import { getPrismaClient } from '@/lib/db/prisma';

export class LivePolicyProvider implements IPolicyPort {
  private prisma = getPrismaClient();

  async findAll(filters?: PolicyFilters): Promise<Policy[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.createdBy) where.createdBy = filters.createdBy;
    if (filters?.effectiveAfter) {
      where.effectiveDate = { gte: filters.effectiveAfter };
    }
    if (filters?.effectiveBefore) {
      where.effectiveDate = { ...where.effectiveDate, lte: filters.effectiveBefore };
    }

    const policies = await this.prisma.policy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return policies as Policy[];
  }

  async findById(id: string): Promise<Policy | null> {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
    });

    return policy as Policy | null;
  }

  async findByStatus(tenantId: string, status: Policy['status']): Promise<Policy[]> {
    const policies = await this.prisma.policy.findMany({
      where: { tenantId, status },
      orderBy: { createdAt: 'desc' },
    });

    return policies as Policy[];
  }

  async findActive(tenantId: string, asOfDate?: Date): Promise<Policy[]> {
    const date = asOfDate || new Date();

    const policies = await this.prisma.policy.findMany({
      where: {
        tenantId,
        status: 'published',
        effectiveDate: { lte: date },
        OR: [
          { expirationDate: null },
          { expirationDate: { gte: date } },
        ],
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return policies as Policy[];
  }

  async findVersions(policyId: string): Promise<Policy[]> {
    // Find the root policy
    const policy = await this.findById(policyId);
    if (!policy) return [];

    // Find all policies with same name (version chain)
    const versions = await this.prisma.policy.findMany({
      where: {
        tenantId: policy.tenantId,
        name: policy.name,
      },
      orderBy: { version: 'asc' },
    });

    return versions as Policy[];
  }

  async findLatestVersion(tenantId: string, name: string): Promise<Policy | null> {
    const policies = await this.prisma.policy.findMany({
      where: { tenantId, name },
      orderBy: { version: 'desc' },
      take: 1,
    });

    return policies[0] as Policy | null;
  }

  async create(data: CreatePolicy): Promise<Policy> {
    const policy = await this.prisma.policy.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return policy as Policy;
  }

  async update(data: UpdatePolicy): Promise<Policy> {
    const { id, ...updates } = data;

    const policy = await this.prisma.policy.update({
      where: { id },
      data: {
        ...updates,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined,
      },
    });

    return policy as Policy;
  }

  async createVersion(
    policyId: string,
    changes: Partial<Policy>,
    bumpType: 'major' | 'minor' | 'patch'
  ): Promise<Policy> {
    const existing = await this.findById(policyId);
    if (!existing) {
      throw new Error(`Policy ${policyId} not found`);
    }

    const newVersion = nextVersion(existing.version, bumpType);

    // Mark existing as superseded
    await this.update({
      id: policyId,
      status: 'superseded',
      updatedBy: changes.updatedBy || existing.updatedBy || existing.createdBy,
    });

    // Create new version
    const newPolicy = await this.create({
      ...existing,
      ...changes,
      version: newVersion,
      status: 'draft',
      parentPolicyId: existing.parentPolicyId,
      supersededByPolicyId: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
      createdBy: changes.updatedBy || existing.createdBy,
    } as CreatePolicy);

    // Link versions
    await this.update({
      id: policyId,
      supersededByPolicyId: newPolicy.id,
      updatedBy: changes.updatedBy || existing.updatedBy || existing.createdBy,
    });

    return newPolicy;
  }

  async publish(policyId: string, publishedBy: string): Promise<Policy> {
    return this.update({
      id: policyId,
      status: 'published',
      approvedBy: publishedBy,
      approvedAt: new Date(),
      updatedBy: publishedBy,
    });
  }

  async retire(policyId: string, retiredBy: string): Promise<Policy> {
    return this.update({
      id: policyId,
      status: 'retired',
      updatedBy: retiredBy,
    });
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    // Soft delete: mark as retired
    await this.retire(id, deletedBy);
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.policy.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  async search(tenantId: string, query: string): Promise<Policy[]> {
    const policies = await this.prisma.policy.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return policies as Policy[];
  }
}
