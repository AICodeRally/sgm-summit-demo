import type { Actor } from '@/lib/security/actor';
import { SecurityError } from '@/lib/security/errors';

export function requireRole(actor: Actor, roles: string[]): void {
  if (!roles.includes(actor.role)) {
    throw new SecurityError(403, 'forbidden', 'Access denied');
  }
}
