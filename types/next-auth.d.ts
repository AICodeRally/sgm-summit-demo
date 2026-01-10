import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { OperationalMode } from './operational-mode';

declare module 'next-auth' {
  /**
   * Extended session with tenant, role, and operational mode information
   */
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      tenantTier: string;
      currentMode: OperationalMode | null;
      availableModes: OperationalMode[];
      defaultMode: OperationalMode | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string;
    tenantId?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT token with custom claims including operational mode
   */
  interface JWT extends DefaultJWT {
    userId?: string;
    role?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
    tenantTier?: string;
    currentMode?: OperationalMode | null;
    availableModes?: OperationalMode[];
    defaultMode?: OperationalMode | null;
  }
}
