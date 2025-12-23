import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Tenant Context - Extract tenant information from request
 *
 * The middleware injects tenant information into request headers.
 * These utility functions extract that information for use in API routes and server components.
 */

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  userId: string;
  userRole: string;
}

/**
 * Get tenant context from Next.js server component (using headers())
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const headersList = await headers();

  const tenantId = headersList.get('x-tenant-id');
  const tenantSlug = headersList.get('x-tenant-slug');
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!tenantId || !tenantSlug || !userId || !userRole) {
    return null;
  }

  return {
    tenantId,
    tenantSlug,
    userId,
    userRole,
  };
}

/**
 * Get tenant context from API route (using NextRequest)
 */
export function getTenantContextFromRequest(request: NextRequest): TenantContext | null {
  const tenantId = request.headers.get('x-tenant-id');
  const tenantSlug = request.headers.get('x-tenant-slug');
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!tenantId || !tenantSlug || !userId || !userRole) {
    return null;
  }

  return {
    tenantId,
    tenantSlug,
    userId,
    userRole,
  };
}

/**
 * Assert tenant context exists, throw error if not
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const context = await getTenantContext();

  if (!context) {
    throw new Error('Tenant context not found. Ensure user is authenticated.');
  }

  return context;
}

/**
 * Check if user has required role
 */
export function hasRole(context: TenantContext, ...roles: string[]): boolean {
  return roles.includes(context.userRole);
}

/**
 * Assert user has required role, throw error if not
 */
export function requireRole(context: TenantContext, ...roles: string[]): void {
  if (!hasRole(context, ...roles)) {
    throw new Error(`Access denied. Required role: ${roles.join(' or ')}`);
  }
}
