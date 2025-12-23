import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extended session with tenant and role information
   */
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      tenantTier: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string;
    tenantId?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT token with custom claims
   */
  interface JWT extends DefaultJWT {
    userId?: string;
    role?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
    tenantTier?: string;
  }
}
