import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { SecurityError } from '@/lib/security/errors';

export interface Actor {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
  tenantTier?: string;
  email?: string;
}

export async function getActor(): Promise<Actor | null> {
  const session = await getServerSession(authOptions) as any;
  const user = session?.user;

  if (!user) return null;

  const actor: Actor = {
    userId: user.id,
    tenantId: user.tenantId,
    tenantSlug: user.tenantSlug,
    role: user.role,
    tenantTier: user.tenantTier,
    email: user.email,
  };

  if (!actor.userId || !actor.role) {
    return null;
  }

  return actor;
}

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) {
    throw new SecurityError(401, 'unauthorized', 'Unauthorized');
  }
  return actor;
}
