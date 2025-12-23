import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

/**
 * Tenant API - CRUD operations for tenants
 * Only accessible to SUPER_ADMIN users
 */

const CreateTenantSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  tier: z.enum(['DEMO', 'BETA', 'PRODUCTION']),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED']),
  features: z.object({
    maxDocuments: z.number().int().positive(),
    maxUsers: z.number().int().positive(),
    aiEnabled: z.boolean(),
    auditRetentionDays: z.number().int().positive(),
    customBranding: z.boolean(),
  }),
  settings: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
});

// GET /api/admin/tenants - List all tenants
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            documents: true,
            policies: true,
            cases: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/admin/tenants - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = CreateTenantSchema.parse(body);

    // Check if slug already exists
    const existing = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Tenant slug already exists' }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        tier: data.tier,
        status: data.status,
        features: data.features,
        settings: data.settings || {},
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }

    console.error('Error creating tenant:', error);
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
