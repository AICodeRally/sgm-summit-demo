import type { Actor } from '@/lib/security/actor';
import { SecurityError } from '@/lib/security/errors';

export function requireTenantContext(actor: Actor): Actor {
  if (!actor.tenantId || !actor.tenantSlug) {
    throw new SecurityError(403, 'tenant_missing', 'Tenant context missing');
  }
  return actor;
}
