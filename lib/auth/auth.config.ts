import { buildNextAuthConfig } from '@rally/auth';
import type { RallyAuthConfig } from '@rally/auth';

/**
 * NextAuth.js Configuration using @rally/auth
 *
 * Configured for multi-tenant SGM application with:
 * - Google OAuth (primary)
 * - GitHub OAuth (secondary)
 * - Automatic tenant assignment
 * - Role-based access control
 * - Synthetic mode support
 */

// Get Prisma client conditionally based on binding mode
const getPrismaClient = () => {
  const bindingMode = process.env.BINDING_MODE || 'synthetic';
  if (bindingMode !== 'synthetic' && process.env.DATABASE_URL) {
    const { prisma } = require('@/lib/db/prisma');
    return prisma;
  }
  return undefined;
};

// Build Rally Auth configuration
const rallyConfig: RallyAuthConfig = {
  providers: {
    // Simple passkey authentication for testing
    credentials: {
      type: 'credentials',
      name: 'Passkey',
      credentials: {
        passkey: { label: 'Passkey', type: 'password' },
      },
      authorize: async (credentials: any) => {
        // Simple passkey check
        if (credentials?.passkey === 'bhg2026') {
          return {
            id: 'demo-user-001',
            name: 'Demo User',
            email: 'demo@demo.com',
          };
        }
        return null;
      },
    },
    // Only add Google if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        type: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        accessType: 'offline',
        prompt: 'consent',
      },
    }),
    // Only add GitHub if credentials are available
    ...(process.env.GITHUB_CLIENT_ID && {
      github: {
        type: 'github',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    }),
  },

  tenancy: {
    enabled: true,
    strategy: 'domain',
    domainMapping: {
      'henryschein.com': 'henryschein',
      'bluehorizonsgroup.com': 'bhg',
      'aicoderally.com': 'demo',
    },
    defaultTenant: 'demo',
    // Custom resolver for tenant creation in synthetic mode
    resolver: async (user: any, account: any) => {
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // In synthetic mode, return mock tenant
      if (bindingMode === 'synthetic') {
        return 'demo';
      }

      const emailDomain = user.email!.split('@')[1];
      let tenantSlug = 'demo';

      // Map email domains to tenants
      if (emailDomain === 'henryschein.com') {
        tenantSlug = 'henryschein';
      } else if (emailDomain.includes('bluehorizonsgroup')) {
        tenantSlug = 'bhg';
      }

      const { prisma } = require('@/lib/db/prisma');

      // Find or create tenant
      let tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        // Create demo tenant if it doesn't exist
        if (tenantSlug === 'demo') {
          tenant = await prisma.tenant.create({
            data: {
              name: 'Demo Organization',
              slug: 'demo',
              tier: 'DEMO',
              status: 'ACTIVE',
              features: {
                maxDocuments: 100,
                maxUsers: 10,
                aiEnabled: true,
                auditRetentionDays: 365,
                customBranding: false,
              },
              settings: {
                industry: 'Demo',
              },
            },
          });
        } else {
          // Reject unknown tenants
          console.error(`No tenant found for domain: ${emailDomain}`);
          return null;
        }
      }

      return tenant.slug;
    },
  },

  rbac: {
    enabled: true,
    defaultRole: 'USER',
    domainRoleMapping: {
      'aicoderally.com': 'ADMIN',
      'demo.com': 'ADMIN',
    },
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'VIEWER'],
    // Custom role resolver
    resolver: async (user: any, account: any) => {
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // In synthetic mode, return ADMIN
      if (bindingMode === 'synthetic') {
        return 'ADMIN';
      }

      const { prisma } = require('@/lib/db/prisma');

      // Get role from database if user exists
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      return dbUser?.role || 'USER';
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  callbacks: {
    // Custom signIn callback for tenant validation
    async signIn(params: any) {
      const { user, account } = params;
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // Skip database operations in synthetic mode
      if (bindingMode === 'synthetic') {
        return true;
      }

      const { prisma } = require('@/lib/db/prisma');

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { tenant: true },
      });

      if (existingUser) {
        // Check if tenant is active
        if (existingUser.tenant.status !== 'ACTIVE') {
          console.error(`Tenant ${existingUser.tenant.slug} is not active`);
          return false;
        }
      }

      return true;
    },

    // Custom JWT callback for synthetic mode and tenant info
    async jwt(params: any) {
      const { token, user, account } = params;
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // In synthetic mode, add mock data
      if (bindingMode === 'synthetic') {
        if (user) {
          token.userId = user.id || 'demo-user-001';
          token.role = 'ADMIN';
          token.tenantId = 'demo-tenant-001';
          token.tenantSlug = 'demo';
          token.tenantName = 'Demo Organization';
          token.tenantTier = 'DEMO';
        }
        return token;
      }

      // Add tenant info from database
      if (user) {
        const { prisma } = require('@/lib/db/prisma');

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { tenant: true },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.tenantId = dbUser.tenantId;
          token.tenantSlug = dbUser.tenant.slug;
          token.tenantName = dbUser.tenant.name;
          token.tenantTier = dbUser.tenant.tier;
        }
      }

      return token;
    },

    // Custom session callback for additional tenant fields
    async session(params: any) {
      const { session, token } = params;
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.tenantName = token.tenantName as string;
        session.user.tenantTier = token.tenantTier as string;
      }

      return session;
    },
  },

  events: {
    async signIn(params: any) {
      const { user, isNewUser } = params;
      const bindingMode = process.env.BINDING_MODE || 'synthetic';

      // Skip database operations in synthetic mode
      if (bindingMode === 'synthetic') {
        return;
      }

      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`);

        const { prisma } = require('@/lib/db/prisma');

        // Assign tenant based on email domain
        const emailDomain = user.email!.split('@')[1];
        let tenantSlug = 'demo';

        if (emailDomain === 'henryschein.com') {
          tenantSlug = 'henryschein';
        } else if (emailDomain.includes('bluehorizonsgroup')) {
          tenantSlug = 'bhg';
        }

        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        });

        if (tenant) {
          // Update user with tenant assignment
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              tenantId: tenant.id,
              role: emailDomain === 'demo.com' ? 'ADMIN' : 'USER',
            },
          });
        }
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// Build and export NextAuth configuration
export const authOptions = await buildNextAuthConfig(
  rallyConfig,
  getPrismaClient()
);
