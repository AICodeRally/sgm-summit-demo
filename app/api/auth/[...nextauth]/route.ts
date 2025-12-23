import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

/**
 * NextAuth.js API Route Handler
 *
 * Handles all authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/:provider
 * - /api/auth/session
 * - /api/auth/csrf
 * - etc.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
