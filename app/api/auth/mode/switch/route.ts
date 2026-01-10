import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { OperationalMode } from '@/types/operational-mode';
import { canAccessMode } from '@/lib/auth/mode-permissions';

/**
 * POST /api/auth/mode/switch
 *
 * Switch the user's active operational mode
 * Updates the JWT token with the new current mode
 */
export async function POST(request: NextRequest) {
  try {
    // Get current token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { mode } = body;

    // Validate mode parameter
    if (!mode || !Object.values(OperationalMode).includes(mode as OperationalMode)) {
      return NextResponse.json(
        { error: 'Invalid mode parameter' },
        { status: 400 }
      );
    }

    // Check if user has access to target mode
    if (!canAccessMode(token.role as string, mode as OperationalMode)) {
      return NextResponse.json(
        { error: `You don't have access to ${mode} mode` },
        { status: 403 }
      );
    }

    // Note: The actual token update happens in the mode-context.tsx
    // via the session update() function. This endpoint just validates
    // the mode switch is allowed.

    return NextResponse.json({
      success: true,
      mode,
      message: `Switched to ${mode} mode`,
    });
  } catch (error) {
    console.error('Error switching mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
