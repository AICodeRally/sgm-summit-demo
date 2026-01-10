/**
 * Local stub for @rally/auth when running standalone
 * In production, this is replaced by the actual @rally/auth package
 */

import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ReactNode } from 'react';

export interface RallyAuthConfig {
  providers?: any[];
  prisma?: any;
  secret?: string;
  sessionStrategy?: 'jwt' | 'database';
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
  };
  callbacks?: AuthOptions['callbacks'];
}

export function buildNextAuthConfig(config: RallyAuthConfig): AuthOptions {
  return {
    providers: config.providers || [
      CredentialsProvider({
        name: 'Demo',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          // Demo mode - accept any credentials
          if (credentials?.email) {
            return {
              id: '1',
              email: credentials.email,
              name: credentials.email.split('@')[0],
            };
          }
          return null;
        },
      }),
    ],
    session: {
      strategy: config.sessionStrategy || 'jwt',
    },
    secret: config.secret || process.env.NEXTAUTH_SECRET || 'demo-secret-key',
    pages: config.pages || {
      signIn: '/auth/signin',
    },
    callbacks: config.callbacks,
  };
}

export function RallySessionProvider({ children }: { children: ReactNode }) {
  // This is a pass-through wrapper - actual session handled by NextAuth's SessionProvider
  return children as any;
}

export function useRallySession() {
  // Return mock session data for standalone operation
  return {
    data: null,
    status: 'unauthenticated' as const,
    user: null,
    tenant: null,
  };
}

export { NextAuth };
