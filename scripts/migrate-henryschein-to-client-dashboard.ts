/**
 * Migration Script: Henry Schein to Client Dashboard Template
 *
 * This script migrates the Henry Schein demo data from the legacy implementation
 * to the new client dashboard template with proper database models.
 *
 * Run: npx tsx scripts/migrate-henryschein-to-client-dashboard.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PlanData {
  planName: string;
  policyCoverage: Record<string, 'FULL' | 'LIMITED' | 'NO'>;
}

interface HenryScheinData {
  metadata: {
    source: string;
    extractionDate: string;
    totalPlans: number;
    totalPolicyAreas: number;
  };
  policyAreas: string[];
  plans: PlanData[];
}

async function main() {
  console.log('🚀 Starting Henry Schein migration to client dashboard...\n');

  // 1. Load Henry Schein plan data
  console.log('📂 Loading Henry Schein plan data...');
  const dataPath = path.join(__dirname, 'output', 'henryschein-plan-data.json');

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found: ${dataPath}`);
  }

  const henryScheinData: HenryScheinData = JSON.parse(
    fs.readFileSync(dataPath, 'utf-8')
  );

  console.log(`✅ Loaded ${henryScheinData.plans.length} plans with ${henryScheinData.policyAreas.length} policy areas\n`);

  // 2. Create or find Henry Schein tenant
  console.log('🏢 Setting up Henry Schein tenant...');

  let tenant = await prisma.tenant.findUnique({
    where: { slug: 'henryschein' },
    include: { clientEngagement: true },
  });

  if (!tenant) {
    console.log('   Creating new tenant...');
    tenant = await prisma.tenant.create({
      data: {
        name: 'Henry Schein, Inc.',
        slug: 'henryschein',
        tier: 'BETA',
        status: 'ACTIVE',
        features: {
          maxDocuments: 1000,
          maxUsers: 50,
          aiEnabled: true,
          clientDashboard: true,
        },
        settings: {
          industry: 'Healthcare Distribution',
          branding: {
            primaryColor: '#0066cc',
            secondaryColor: '#003d7a',
          },
        },
      },
      include: { clientEngagement: true },
    });
    console.log(`✅ Created tenant: ${tenant.name} (${tenant.slug})`);
  } else {
    console.log(`✅ Found existing tenant: ${tenant.name}`);
  }

  // 3. Create or update ClientEngagement
  console.log('\n📋 Setting up client engagement...');

  let engagement = tenant.clientEngagement;

  if (!engagement) {
    console.log('   Creating new engagement...');
    engagement = await prisma.clientEngagement.create({
      data: {
        tenantId: tenant.id,
        type: 'GAP_ANALYSIS',
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        targetEndDate: new Date('2025-03-31'),
        consultantTeam: [
          { id: 'consultant-1', name: 'Sarah Johnson', role: 'Lead Consultant' },
          { id: 'consultant-2', name: 'Michael Chen', role: 'Governance Specialist' },
        ],
        clientContacts: [
          { name: 'David Miller', title: 'VP Sales Operations', email: 'david.miller@henryschein.com' },
          { name: 'Lisa Wang', title: 'Director Compensation', email: 'lisa.wang@henryschein.com' },
        ],
        brandingConfig: {
          primaryColor: '#0066cc',
          secondaryColor: '#003d7a',
          companyName: 'Henry Schein',
        },
        metadata: {
          source: henryScheinData.metadata.source,
          originalExtractionDate: henryScheinData.metadata.extractionDate,
        },
      },
    });
    console.log(`✅ Created engagement: ${engagement.type}`);
  } else {
    console.log(`✅ Found existing engagement: ${engagement.type}`);
  }

  // 4. Migrate plan analyses
  console.log('\n📊 Migrating plan analyses...');

  for (const plan of henryScheinData.plans) {
    // Calculate coverage metrics
    const coverageMetrics = calculateCoverageMetrics(plan, henryScheinData.policyAreas);

    // Calculate risk score (higher for more NO/LIMITED coverage)
    const riskScore = calculateRiskScore(plan);

    // Format policy coverage as JSON array
    const policyCoverage = henryScheinData.policyAreas.map((area) => ({
      policyArea: area,
      policyName: `${area} Policy`,
      coverage: plan.policyCoverage[area] || 'NO',
      notes: plan.policyCoverage[area] === 'LIMITED' ? 'Partially implemented' : undefined,
    }));

    // Upsert plan analysis
    await prisma.clientPlanAnalysis.upsert({
      where: {
        engagementId_planCode: {
          engagementId: engagement.id,
          planCode: `HS-${plan.planName}`,
        },
      },
      update: {
        planName: formatPlanName(plan.planName),
        planType: getPlanType(plan.planName),
        businessUnit: getBusinessUnit(plan.planName),
        coverageFull: coverageMetrics.full,
        coverageLimited: coverageMetrics.limited,
        coverageNo: coverageMetrics.no,
        riskScore,
        policyCoverage: { policies: policyCoverage },
      },
      create: {
        engagementId: engagement.id,
        planCode: `HS-${plan.planName}`,
        planName: formatPlanName(plan.planName),
        planType: getPlanType(plan.planName),
        businessUnit: getBusinessUnit(plan.planName),
        coverageFull: coverageMetrics.full,
        coverageLimited: coverageMetrics.limited,
        coverageNo: coverageMetrics.no,
        riskScore,
        policyCoverage: { policies: policyCoverage },
      },
    });

    console.log(`   ✓ ${plan.planName}: ${coverageMetrics.full} Full, ${coverageMetrics.limited} Limited, ${coverageMetrics.no} None (Risk: ${riskScore})`);
  }

  console.log(`✅ Migrated ${henryScheinData.plans.length} plan analyses\n`);

  // 5. Generate gap analyses
  console.log('🔍 Generating gap analyses...');

  let gapCount = 0;
  for (const plan of henryScheinData.plans) {
    for (const policyArea of henryScheinData.policyAreas) {
      const coverage = plan.policyCoverage[policyArea];

      if (coverage === 'LIMITED' || coverage === 'NO') {
        const severity = coverage === 'NO' ? 'HIGH' : 'MEDIUM';

        await prisma.clientGapAnalysis.create({
          data: {
            engagementId: engagement.id,
            planCode: `HS-${plan.planName}`,
            policyArea,
            gapDescription: `${policyArea}: ${coverage === 'NO' ? 'Not addressed in plan documentation' : 'Partially documented but lacks complete implementation details'}`,
            severity,
            status: 'OPEN',
            bhgPolicyRef: `BHG-POL-${String(henryScheinData.policyAreas.indexOf(policyArea) + 1).padStart(3, '0')}`,
          },
        });

        gapCount++;
      }
    }
  }

  console.log(`✅ Generated ${gapCount} gap analysis entries\n`);

  // 6. Create roadmap phases
  console.log('🗓️  Creating implementation roadmap...');

  const phases = [
    {
      phase: 'Weeks 1-3',
      title: 'Discovery & Gap Analysis',
      description: 'Analyze 11 compensation plans and identify governance gaps',
      orderIndex: 1,
      status: 'COMPLETED',
      completionPct: 100,
      milestones: [
        { title: 'Plan documentation review', completed: true },
        { title: 'Stakeholder interviews', completed: true },
        { title: 'Gap identification', completed: true },
        { title: 'Initial findings report', completed: true },
      ],
      startDate: new Date('2025-01-01'),
      targetEndDate: new Date('2025-01-21'),
    },
    {
      phase: 'Weeks 4-6',
      title: 'Policy Framework Development',
      description: 'Design governance policies and approval processes',
      orderIndex: 2,
      status: 'IN_PROGRESS',
      completionPct: 65,
      milestones: [
        { title: 'SGCC charter drafted', completed: true },
        { title: 'CRB procedures documented', completed: true },
        { title: 'Territory governance policy', completed: false },
        { title: 'Windfall deal procedures', completed: false },
      ],
      startDate: new Date('2025-01-22'),
      targetEndDate: new Date('2025-02-11'),
    },
    {
      phase: 'Weeks 7-10',
      title: 'Implementation & Training',
      description: 'Roll out policies and train stakeholders',
      orderIndex: 3,
      status: 'NOT_STARTED',
      completionPct: 0,
      milestones: [
        { title: 'Policy documentation finalized', completed: false },
        { title: 'System configuration', completed: false },
        { title: 'Stakeholder training', completed: false },
        { title: 'Pilot program launch', completed: false },
      ],
      startDate: new Date('2025-02-12'),
      targetEndDate: new Date('2025-03-11'),
    },
    {
      phase: 'Weeks 11-12',
      title: 'Validation & Handoff',
      description: 'Final review and transition to operations',
      orderIndex: 4,
      status: 'NOT_STARTED',
      completionPct: 0,
      milestones: [
        { title: 'Compliance audit', completed: false },
        { title: 'Executive review', completed: false },
        { title: 'Documentation handoff', completed: false },
        { title: 'Ongoing support plan', completed: false },
      ],
      startDate: new Date('2025-03-12'),
      targetEndDate: new Date('2025-03-25'),
    },
  ];

  for (const phase of phases) {
    await prisma.clientRoadmapPhase.create({
      data: {
        engagementId: engagement.id,
        ...phase,
      },
    });
    console.log(`   ✓ ${phase.phase}: ${phase.title}`);
  }

  console.log(`✅ Created ${phases.length} roadmap phases\n`);

  // 7. Summary
  console.log('📈 Migration Summary:');
  console.log(`   Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`   Engagement: ${engagement.type} - ${engagement.status}`);
  console.log(`   Plans: ${henryScheinData.plans.length}`);
  console.log(`   Gaps: ${gapCount}`);
  console.log(`   Roadmap Phases: ${phases.length}`);
  console.log(`\n✅ Henry Schein migration complete!`);
  console.log(`\n🔗 Access dashboard at: http://localhost:3003/client/henryschein\n`);
}

// Helper functions
function calculateCoverageMetrics(plan: PlanData, policyAreas: string[]) {
  let full = 0, limited = 0, no = 0;

  for (const area of policyAreas) {
    const coverage = plan.policyCoverage[area];
    if (coverage === 'FULL') full++;
    else if (coverage === 'LIMITED') limited++;
    else no++;
  }

  return { full, limited, no };
}

function calculateRiskScore(plan: PlanData): number {
  let score = 0;

  Object.values(plan.policyCoverage).forEach((coverage) => {
    if (coverage === 'NO') score += 10;
    else if (coverage === 'LIMITED') score += 5;
  });

  // Cap at 100
  return Math.min(score, 100);
}

function formatPlanName(planName: string): string {
  // Convert MED_STD to "Medical Standard Plan"
  const parts = planName.split('_');
  const category = parts[0] === 'MED' ? 'Medical' : parts[0] === 'SURG' ? 'Surgical' : parts[0];
  const variant = parts.slice(1).map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
  return `${category} ${variant} Plan`;
}

function getPlanType(planName: string): string {
  if (planName.startsWith('MED')) return 'MEDICAL';
  if (planName.startsWith('SURG')) return 'SURGICAL';
  if (planName.includes('EXEC')) return 'EXECUTIVE';
  return 'SALES';
}

function getBusinessUnit(planName: string): string {
  if (planName.includes('CA')) return 'Corporate Accounts';
  if (planName.includes('FEDERAL')) return 'Federal';
  if (planName.includes('FIXED')) return 'Fixed Pricing';
  return 'Field Sales';
}

// Run migration
main()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
