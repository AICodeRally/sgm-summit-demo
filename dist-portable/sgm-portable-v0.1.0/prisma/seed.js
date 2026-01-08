/**
 * SGM Database Seeder
 *
 * BINDING MODE SUPPORT:
 * - synthetic (default): No-op, uses in-memory providers
 * - live: Seeds data to sgm_summit_demo schema via Prisma
 *
 * CRITICAL: Requires BINDING_MODE=live and valid DATABASE_URL with schema=sgm_summit_demo
 */

const { PrismaClient } = require('@prisma/client');

const BINDING_MODE = process.env.BINDING_MODE || 'synthetic';
const DATABASE_URL = process.env.DATABASE_URL || '';
const DATABASE_URL_DIRECT = process.env.DATABASE_URL_DIRECT || '';

// Schema validation helper
function validateSchemaParam(url) {
  if (!url) return false;
  return url.includes('schema=sgm_summit_demo');
}

// Diagnostics helper
function logDiagnostics() {
  console.log('\n=== SGM Seed Diagnostics ===');
  console.log(`Binding Mode: ${BINDING_MODE}`);
  console.log(`Schema Target: ${validateSchemaParam(DATABASE_URL) ? 'sgm_summit_demo' : 'MISSING/INVALID'}`);
  console.log(`DATABASE_URL Present: ${!!DATABASE_URL}`);
  console.log(`DATABASE_URL_DIRECT Present: ${!!DATABASE_URL_DIRECT}`);
  console.log('============================\n');
}

async function seedSynthetic() {
  console.log('🔹 SYNTHETIC MODE: Using in-memory providers, skipping DB seed');
  logDiagnostics();
  console.log('✅ Seed completed (no-op for synthetic mode)');
  process.exit(0);
}

async function seedLive() {
  console.log('🔹 LIVE MODE: Seeding sgm_summit_demo schema...');
  logDiagnostics();

  // Guard: Require secrets and schema parameter
  if (!DATABASE_URL || !DATABASE_URL_DIRECT) {
    console.error('❌ LIVE mode requires DATABASE_URL and DATABASE_URL_DIRECT');
    process.exit(1);
  }

  if (!validateSchemaParam(DATABASE_URL) || !validateSchemaParam(DATABASE_URL_DIRECT)) {
    console.error('❌ DATABASE_URL must include &schema=sgm_summit_demo');
    console.error('   Example: postgresql://user:pass@host:5432/db?sslmode=require&schema=sgm_summit_demo');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: {
      url: DATABASE_URL,
    },
  });

  try {
    // Verify we're connected to the right schema
    console.log('📊 Verifying database connection and schema...');

    const tenantId = 'demo-tenant-001';
    const now = new Date();

    // Clear existing demo data (for idempotent seeding)
    console.log('🧹 Cleaning existing demo data...');
    await prisma.auditLog.deleteMany({ where: { tenantId } });
    await prisma.approval.deleteMany({ where: { tenantId } });
    await prisma.document.deleteMany({ where: { tenantId } });
    await prisma.territory.deleteMany({ where: { tenantId } });
    await prisma.policy.deleteMany({ where: { tenantId } });

    // Seed Policies
    console.log('📝 Seeding policies...');
    const policy1 = await prisma.policy.create({
      data: {
        tenantId,
        name: 'Sales Compensation Policy 2024',
        description: 'Annual sales compensation structure and guidelines',
        category: 'compensation',
        version: '1.0.0',
        status: 'published',
        effectiveDate: new Date('2024-01-01'),
        content: '# Sales Compensation Policy\n\nThis policy defines the compensation structure for all sales personnel.',
        approvalRequired: true,
        approvedBy: 'jane.doe@example.com',
        approvedAt: new Date('2023-12-15'),
        createdBy: 'admin@example.com',
        createdAt: now,
      },
    });

    const policy2 = await prisma.policy.create({
      data: {
        tenantId,
        name: 'Territory Assignment Rules',
        description: 'Rules for assigning and managing sales territories',
        category: 'territory',
        version: '2.1.0',
        status: 'published',
        effectiveDate: new Date('2024-03-01'),
        content: '# Territory Assignment\n\nGuidelines for territory management and assignment.',
        approvalRequired: true,
        approvedBy: 'john.smith@example.com',
        approvedAt: new Date('2024-02-20'),
        createdBy: 'admin@example.com',
        createdAt: now,
      },
    });

    // Seed Territories
    console.log('🗺️  Seeding territories...');
    const territoryUS = await prisma.territory.create({
      data: {
        tenantId,
        code: 'US-NATIONAL',
        name: 'United States National',
        description: 'National US sales territory',
        type: 'geographic',
        status: 'active',
        level: 0,
        path: '/1',
        coverageRules: {
          countries: ['US'],
        },
        effectiveDate: new Date('2024-01-01'),
        createdBy: 'admin@example.com',
        createdAt: now,
      },
    });

    const territoryWest = await prisma.territory.create({
      data: {
        tenantId,
        code: 'US-WEST',
        name: 'US West Region',
        description: 'Western United States territory',
        type: 'geographic',
        status: 'active',
        parentTerritoryId: territoryUS.id,
        level: 1,
        path: `/1/${territoryUS.id}`,
        assignedToUserId: 'user-west-001',
        assignedAt: new Date('2024-01-15'),
        coverageRules: {
          countries: ['US'],
          states: ['CA', 'OR', 'WA', 'NV', 'AZ'],
        },
        effectiveDate: new Date('2024-01-01'),
        createdBy: 'admin@example.com',
        createdAt: now,
      },
    });

    // Seed Documents
    console.log('📄 Seeding documents...');
    const doc1 = await prisma.document.create({
      data: {
        tenantId,
        documentCode: 'SCP-001',
        title: 'Sales Compensation Plan Framework',
        description: 'Master framework document for all compensation plans',
        documentType: 'FRAMEWORK',
        category: 'Compensation',
        tags: ['compensation', 'framework', 'sales'],
        version: '3.0.0',
        status: 'ACTIVE',
        createdAt: now,
        lastUpdated: now,
        effectiveDate: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        fileType: 'pdf',
        filePath: '/documents/scp-001-v3.pdf',
        fileSize: 245678,
        checksum: 'abc123def456',
        owner: 'Jane Doe',
        createdBy: 'jane.doe@example.com',
        legalReviewStatus: 'APPROVED',
        retentionPeriod: 7,
        complianceFlags: ['SECTION_409A', 'CA_LABOR_CODE'],
        relatedDocs: [],
        referencedBy: [],
      },
    });

    const doc2 = await prisma.document.create({
      data: {
        tenantId,
        documentCode: 'PROC-008',
        title: 'Territory Assignment Procedure',
        description: 'Step-by-step process for territory assignments',
        documentType: 'PROCEDURE',
        category: 'Territory',
        tags: ['territory', 'procedure', 'operations'],
        version: '2.5.0',
        status: 'ACTIVE',
        createdAt: now,
        lastUpdated: now,
        effectiveDate: new Date('2024-02-01'),
        nextReview: new Date('2024-08-01'),
        fileType: 'docx',
        filePath: '/documents/proc-008-v2-5.docx',
        fileSize: 89234,
        owner: 'John Smith',
        createdBy: 'john.smith@example.com',
        legalReviewStatus: 'NOT_REQUIRED',
        retentionPeriod: 5,
        complianceFlags: [],
        relatedDocs: [],
        referencedBy: [],
      },
    });

    // Seed Approvals
    console.log('✅ Seeding approvals...');
    const approval1 = await prisma.approval.create({
      data: {
        tenantId,
        title: 'Q2 Territory Realignment',
        description: 'Proposal to realign western territories for Q2',
        priority: 'high',
        status: 'pending',
        entityType: 'territory',
        entityId: territoryWest.id,
        requestType: 'update',
        requestData: {
          changes: {
            coverageRules: {
              states: ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT'],
            },
          },
        },
        currentStep: 0,
        totalSteps: 2,
        submittedBy: 'manager@example.com',
        submittedAt: now,
        slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: now,
      },
    });

    // Seed Audit Logs
    console.log('📋 Seeding audit logs...');
    await prisma.auditLog.create({
      data: {
        tenantId,
        eventType: 'create',
        severity: 'info',
        message: 'Policy created: Sales Compensation Policy 2024',
        entityType: 'policy',
        entityId: policy1.id,
        entityName: policy1.name,
        actorId: 'admin@example.com',
        actorName: 'Admin User',
        actorRole: 'administrator',
        changesAfter: {
          name: policy1.name,
          version: policy1.version,
          status: policy1.status,
        },
        occurredAt: now,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        eventType: 'publish',
        severity: 'info',
        message: 'Document published: Sales Compensation Plan Framework',
        entityType: 'document',
        entityId: doc1.id,
        entityName: doc1.title,
        actorId: 'jane.doe@example.com',
        actorName: 'Jane Doe',
        actorRole: 'policy_manager',
        changesAfter: {
          status: 'ACTIVE',
          effectiveDate: doc1.effectiveDate,
        },
        occurredAt: now,
      },
    });

    // Get counts for verification
    const counts = {
      policies: await prisma.policy.count({ where: { tenantId } }),
      territories: await prisma.territory.count({ where: { tenantId } }),
      documents: await prisma.document.count({ where: { tenantId } }),
      approvals: await prisma.approval.count({ where: { tenantId } }),
      auditLogs: await prisma.auditLog.count({ where: { tenantId } }),
    };

    console.log('\n📊 Seed Summary:');
    console.log(`   Policies: ${counts.policies}`);
    console.log(`   Territories: ${counts.territories}`);
    console.log(`   Documents: ${counts.documents}`);
    console.log(`   Approvals: ${counts.approvals}`);
    console.log(`   Audit Logs: ${counts.auditLogs}`);

    console.log('\n✅ Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Main
async function main() {
  console.log('\n🌱 SGM Database Seeder\n');

  if (BINDING_MODE === 'live') {
    await seedLive();
  } else {
    await seedSynthetic();
  }
}

main();
