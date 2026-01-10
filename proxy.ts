import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getModeForRoute, canAccessMode } from '@/lib/auth/mode-permissions';
import { OperationalMode } from '@/types/operational-mode';

/**
 * Proxy - Tenant-aware routing, authentication, and mode enforcement
 *
 * Responsibilities:
 * 1. Enforce authentication on protected routes
 * 2. Inject tenant context into requests
 * 3. Role-based access control (RBAC)
 * 4. Admin route protection
 * 5. Operational mode detection and enforcement
 */

const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  // Temporary for testing
  '/templates',
  '/plans',
  '/policies',
  '/governance-framework',
  '/api/plan-templates',
  '/api/plans',
  '/api/policies',
  '/api/governance-framework',
  '/api/ai/agents',
  '/api/ai/asksgm', // AskSGM bounded operator - public for testing
];

const ADMIN_ROUTES = ['/admin'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token.role !== 'SUPER_ADMIN') {
      // Forbidden - redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Detect operational mode for the current route
  const requiredMode = getModeForRoute(pathname);
  let currentMode = (token.currentMode as OperationalMode) || null;

  // If route requires a specific mode and user doesn't have access, redirect
  if (requiredMode && !canAccessMode(token.role as string, requiredMode)) {
    // Redirect to user's default mode or home
    const defaultRoute = token.defaultMode === OperationalMode.DESIGN ? '/design' :
                        token.defaultMode === OperationalMode.DISPUTE ? '/dispute' :
                        token.defaultMode === OperationalMode.OVERSEE ? '/oversee' :
                        '/operate'; // Default to OPERATE
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  // Inject tenant context and mode context into request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', token.tenantId as string);
  requestHeaders.set('x-tenant-slug', token.tenantSlug as string);
  requestHeaders.set('x-user-id', token.userId as string);
  requestHeaders.set('x-user-role', token.role as string);

  // Add mode context headers
  if (requiredMode) {
    requestHeaders.set('x-required-mode', requiredMode);
  }
  if (currentMode) {
    requestHeaders.set('x-current-mode', currentMode);
  }
  if (token.availableModes && Array.isArray(token.availableModes)) {
    requestHeaders.set('x-available-modes', (token.availableModes as OperationalMode[]).join(','));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
