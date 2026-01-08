import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const UpdateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tier: z.enum(['DEMO', 'BETA', 'PRODUCTION']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED']).optional(),
  features: z
    .object({
      maxDocuments: z.number().int().positive(),
      maxUsers: z.number().int().positive(),
      aiEnabled: z.boolean(),
      auditRetentionDays: z.number().int().positive(),
      customBranding: z.boolean(),
    })
    .optional(),
  settings: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

// GET /api/admin/tenants/[id] - Get single tenant
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    const role = (session as any)?.user?.role;
    if (!session || role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            documents: true,
            policies: true,
            cases: true,
            approvals: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

// PATCH /api/admin/tenants/[id] - Update tenant
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    const role = (session as any)?.user?.role;
    if (!session || role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = UpdateTenantSchema.parse(body);

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.tier && { tier: data.tier }),
        ...(data.status && { status: data.status }),
        ...(data.features && { features: data.features }),
        ...(data.settings && { settings: data.settings }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 });
    }

    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// DELETE /api/admin/tenants/[id] - Delete tenant
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    const role = (session as any)?.user?.role;
    if (!session || role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if tenant has users
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant._count.users > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tenant with active users' },
        { status: 400 }
      );
    }

    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
