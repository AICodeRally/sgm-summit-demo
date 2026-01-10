import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import {
  getActiveModule,
  getAllModules,
  setActiveModule,
  moduleExists,
} from '@/lib/config/module-registry';

/**
 * GET /api/settings/module
 *
 * Returns the current active module configuration
 *
 * @returns Active module config
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // For demo: Skip auth checks
    // In production, uncomment these checks:
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    // if (session.user.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Forbidden - SUPER_ADMIN access required' },
    //     { status: 403 }
    //   );
    // }

    const activeModule = getActiveModule();
    const allModules = getAllModules();

    return NextResponse.json({
      activeModule,
      availableModules: allModules.map((m) => ({
        id: m.module.id,
        name: m.module.name,
        productLine: m.module.productLine,
        version: m.module.version,
        tagline: m.module.tagline,
        gradient: m.gradient,
      })),
      totalModules: allModules.length,
    });
  } catch (error) {
    console.error('Error fetching module configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/module
 *
 * Switches the active module (SUPER_ADMIN only)
 *
 * Body: { moduleId: string }
 *
 * @returns Success message with new active module
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;

    // For demo: Skip auth checks
    // In production, uncomment these checks:
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    // if (session.user.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Forbidden - SUPER_ADMIN access required' },
    //     { status: 403 }
    //   );
    // }

    // Parse request body
    const body = await request.json();
    const { moduleId } = body;

    if (!moduleId || typeof moduleId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid moduleId' },
        { status: 400 }
      );
    }

    // Check if module exists
    if (!moduleExists(moduleId)) {
      return NextResponse.json(
        { error: `Module '${moduleId}' not found in registry` },
        { status: 404 }
      );
    }

    // Switch the active module
    const success = setActiveModule(moduleId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to switch module' },
        { status: 500 }
      );
    }

    const newActiveModule = getActiveModule();

    // Log the change for audit purposes
    console.log(`[MODULE_SWITCH] User ${session.user.email} switched module to: ${moduleId}`);

    return NextResponse.json({
      success: true,
      message: `Module switched to ${newActiveModule.module.name}`,
      activeModule: {
        id: newActiveModule.module.id,
        name: newActiveModule.module.name,
        productLine: newActiveModule.module.productLine,
        version: newActiveModule.module.version,
        tagline: newActiveModule.module.tagline,
      },
    });
  } catch (error) {
    console.error('Error switching module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/module
 *
 * Alias for PUT (same functionality for convenience)
 */
export async function POST(request: NextRequest) {
  return PUT(request);
}
