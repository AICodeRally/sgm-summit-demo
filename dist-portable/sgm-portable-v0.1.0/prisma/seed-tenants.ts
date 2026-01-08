#!/usr/bin/env tsx
/**
 * Tenant Seeding Script
 *
 * Creates initial tenants for SGM multi-tenant deployment:
 * - Demo tenant (for general demos)
 * - Henry Schein tenant (beta client)
 * - BHG tenant (Blue Horizons Group - consultant)
 *
 * Usage:
 *   npx tsx prisma/seed-tenants.ts
 *
 * Requirements:
 *   - DATABASE_URL configured in .env
 *   - Prisma client generated (npm run db:generate)
 *   - Database migrated (npm run db:migrate)
 */

// Lazy-require to avoid build-time dependency on generated Prisma types.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client') as {
  PrismaClient: new (args?: Record<string, unknown>) => any;
};

export {};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding tenants...\n');

  // 1. Demo Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
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
        description: 'General demo tenant with SPARCC governance documents',
      },
    },
  });

  console.log(`✅ Demo Tenant: ${demoTenant.name} (${demoTenant.slug})`);

  // 2. Henry Schein Tenant
  const henryScheinTenant = await prisma.tenant.upsert({
    where: { slug: 'henryschein' },
    update: {},
    create: {
      name: 'Henry Schein, Inc.',
      slug: 'henryschein',
      tier: 'BETA',
      status: 'ACTIVE',
      features: {
        maxDocuments: 500,
        maxUsers: 50,
        aiEnabled: true,
        auditRetentionDays: 2555, // 7 years
        customBranding: true,
      },
      settings: {
        logo: '/logos/henryschein.png',
        primaryColor: '#005EB8', // Henry Schein blue
        secondaryColor: '#00A3E0',
        industry: 'Healthcare Distribution',
        employeeCount: 21000,
        description: 'Beta client - Sales compensation governance framework implementation',
        consultant: 'Blue Horizons Group',
        engagementPeriod: 'September 2024 - November 2025',
        riskExposure: 1750000,
        potentialSavings: 1020000,
        website: 'https://www.henryschein.com',
      },
      expiresAt: new Date('2026-12-31'), // Beta expires end of 2026
    },
  });

  console.log(`✅ Henry Schein Tenant: ${henryScheinTenant.name} (${henryScheinTenant.slug})`);

  // 3. Blue Horizons Group Tenant
  const bhgTenant = await prisma.tenant.upsert({
    where: { slug: 'bhg' },
    update: {},
    create: {
      name: 'Blue Horizons Group',
      slug: 'bhg',
      tier: 'PRODUCTION',
      status: 'ACTIVE',
      features: {
        maxDocuments: 1000,
        maxUsers: 100,
        aiEnabled: true,
        auditRetentionDays: 2555,
        customBranding: true,
      },
      settings: {
        logo: '/logos/bhg.png',
        primaryColor: '#1E3A8A', // Navy blue
        secondaryColor: '#3B82F6',
        industry: 'Consulting - Sales Compensation',
        description: 'Sales compensation consulting and governance framework delivery',
        website: 'https://www.bluehorizonsgroup.com',
      },
    },
  });

  console.log(`✅ BHG Tenant: ${bhgTenant.name} (${bhgTenant.slug})`);

  console.log('\n📊 Tenant Summary:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Demo:         ${demoTenant.id}`);
  console.log(`   Henry Schein: ${henryScheinTenant.id}`);
  console.log(`   BHG:          ${bhgTenant.id}`);
  console.log('═══════════════════════════════════════════════════════');

  console.log('\n📧 Email Domain Mapping:');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   @henryschein.com         → Henry Schein tenant');
  console.log('   @bluehorizonsgroup.com   → BHG tenant');
  console.log('   All others               → Demo tenant');
  console.log('═══════════════════════════════════════════════════════');

  console.log('\n✨ Tenant seeding complete!');
  console.log('\nNext steps:');
  console.log('  1. Sign in with Google OAuth');
  console.log('  2. Your user will be auto-assigned to a tenant based on email');
  console.log('  3. Set your role to SUPER_ADMIN to access /admin/tenants');
  console.log('  4. Import Henry Schein documents: npx tsx scripts/import-henryschein-docs.ts');
}

main()
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
