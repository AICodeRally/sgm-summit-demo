#!/usr/bin/env tsx
/**
 * Henry Schein Document Import Script
 *
 * Imports 49 governance documents from the archived Henry Schein project
 * into the SGM production database for the Henry Schein beta tenant.
 *
 * Usage:
 *   npx tsx scripts/import-henryschein-docs.ts
 *
 * Requirements:
 *   - DATABASE_URL configured in .env
 *   - Henry Schein tenant exists in database
 *   - Prisma client generated (npm run db:generate)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const HENRY_SCHEIN_ARCHIVE = '/Users/toddlebaron/dev__archive_20251219_1518/clients/HenrySchien/CLIENT_DELIVERY_PACKAGE';
const TENANT_SLUG = 'henryschein';
const STORAGE_DIR = path.join(process.cwd(), 'storage');

interface ImportMapping {
  sourceDir: string;
  documentType: 'FRAMEWORK' | 'POLICY' | 'PROCEDURE' | 'TEMPLATE' | 'CHECKLIST' | 'GUIDE';
  status: 'DRAFT' | 'UNDER_REVIEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'ARCHIVED';
  legalReviewStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  category: string;
  prefix: string;
}

const IMPORT_MAPPINGS: ImportMapping[] = [
  {
    sourceDir: '02_POLICIES/DRAFT_FOR_REVIEW',
    documentType: 'POLICY',
    status: 'UNDER_REVIEW',
    legalReviewStatus: 'PENDING',
    category: 'Sales Compensation',
    prefix: 'HS-SCP',
  },
  {
    sourceDir: '02_POLICIES',
    documentType: 'POLICY',
    status: 'APPROVED',
    legalReviewStatus: 'APPROVED',
    category: 'Sales Compensation',
    prefix: 'HS-SCP',
  },
  {
    sourceDir: '03_PROCEDURES',
    documentType: 'PROCEDURE',
    status: 'APPROVED',
    legalReviewStatus: 'NOT_REQUIRED',
    category: 'Operations',
    prefix: 'HS-PROC',
  },
  {
    sourceDir: '04_TEMPLATES',
    documentType: 'TEMPLATE',
    status: 'ACTIVE',
    legalReviewStatus: 'NOT_REQUIRED',
    category: 'Forms',
    prefix: 'HS-TPL',
  },
  {
    sourceDir: '05_CHECKLISTS',
    documentType: 'CHECKLIST',
    status: 'ACTIVE',
    legalReviewStatus: 'NOT_REQUIRED',
    category: 'Implementation',
    prefix: 'HS-CHK',
  },
  {
    sourceDir: '01_FRAMEWORK_DOCUMENTS',
    documentType: 'FRAMEWORK',
    status: 'APPROVED',
    legalReviewStatus: 'NOT_REQUIRED',
    category: 'Governance',
    prefix: 'HS-FWK',
  },
  {
    sourceDir: '06_USER_GUIDES',
    documentType: 'GUIDE',
    status: 'ACTIVE',
    legalReviewStatus: 'NOT_REQUIRED',
    category: 'Training',
    prefix: 'HS-GDE',
  },
];

function getFileExtension(filename: string): 'md' | 'docx' | 'pdf' | 'xlsx' | 'pptx' {
  const ext = path.extname(filename).toLowerCase().slice(1);
  if (['md', 'docx', 'pdf', 'xlsx', 'pptx'].includes(ext)) {
    return ext as 'md' | 'docx' | 'pdf' | 'xlsx' | 'pptx';
  }
  return 'pdf'; // default
}

function calculateChecksum(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function extractTitle(filename: string): string {
  // Remove extension and clean up
  return filename
    .replace(/\.(docx|pdf|md|xlsx|pptx)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDescription(title: string, category: string): string {
  const descriptions: Record<string, string> = {
    'Clawback and Recovery Policy': 'Revenue reversal and recovery mechanisms with approval thresholds for clawback situations',
    'Quota Management Policy': 'Quota setting methodology, adjustment triggers, and approval workflows for quota changes',
    'Windfall & Large Deal Policy': 'Deal thresholds ($1M+), CRB review process, and treatment options for windfall deals',
    'SPIF Governance Policy': 'Short-term incentive approval, ROI requirements, budget limits, and SPIF management',
    'Section 409A Compliance Policy': 'IRS deferred compensation compliance requirements and governance',
    'State Wage Law Compliance Policy': 'Multi-state labor law compliance, especially California wage law requirements',
  };

  return descriptions[title] || `${category} document imported from Henry Schein governance framework`;
}

async function importDocuments() {
  console.log('🚀 Starting Henry Schein document import...\n');
  console.log(`📂 Source: ${HENRY_SCHEIN_ARCHIVE}`);
  console.log(`🎯 Target Tenant: ${TENANT_SLUG}\n`);

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Find tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) {
    console.error(`❌ Error: Tenant "${TENANT_SLUG}" not found.`);
    console.log('\nPlease create the tenant first:');
    console.log('  1. Sign in as SUPER_ADMIN');
    console.log('  2. Go to /admin/tenants/new');
    console.log('  3. Create Henry Schein tenant with slug "henryschein"');
    console.log('\nOr run: npx tsx prisma/seed-tenants.ts');
    process.exit(1);
  }

  console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})\n`);

  // Ensure storage directory exists
  const tenantStorageDir = path.join(STORAGE_DIR, tenant.id, 'documents');
  fs.mkdirSync(tenantStorageDir, { recursive: true });
  console.log(`📁 Storage: ${tenantStorageDir}\n`);

  for (const mapping of IMPORT_MAPPINGS) {
    const sourceDir = path.join(HENRY_SCHEIN_ARCHIVE, mapping.sourceDir);

    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Directory not found: ${mapping.sourceDir}`);
      console.log(`   Skipping...`);
      console.log('');
      continue;
    }

    const files = fs.readdirSync(sourceDir).filter(
      (f) => !f.startsWith('.') && !f.startsWith('~') && !f.includes('$') // Skip hidden/temp/lock files
    );

    console.log(`📂 Processing ${mapping.sourceDir} (${files.length} files)`);

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const filePath = path.join(sourceDir, filename);

      try {
        const stats = fs.statSync(filePath);

        if (!stats.isFile()) {
          console.log(`   ⏭️  Skipped: ${filename} (not a file)`);
          totalSkipped++;
          continue;
        }

        const title = extractTitle(filename);
        const description = extractDescription(title, mapping.category);
        const documentCode = `${mapping.prefix}-${String(i + 1).padStart(3, '0')}`;
        const fileType = getFileExtension(filename);
        const checksum = calculateChecksum(filePath);

        // Check if already imported
        const existing = await prisma.document.findFirst({
          where: {
            tenantId: tenant.id,
            title,
          },
        });

        if (existing) {
          console.log(`   ⏭️  Skipped: ${title} (already exists)`);
          totalSkipped++;
          continue;
        }

        // Copy file to storage
        const newFilePath = path.join(tenantStorageDir, `${documentCode}${path.extname(filename)}`);
        fs.copyFileSync(filePath, newFilePath);

        // Create document record
        await prisma.document.create({
          data: {
            tenantId: tenant.id,
            documentCode,
            title,
            description,
            documentType: mapping.documentType,
            category: mapping.category,
            tags: ['Henry Schein', 'Imported', mapping.category, 'BHG Consulting'],
            version: '1.0.0',
            status: mapping.status,
            effectiveDate: new Date('2026-01-01'),
            nextReview: new Date('2027-01-01'),
            fileType,
            filePath: newFilePath,
            fileSize: stats.size,
            checksum,
            owner: 'BHG Consulting',
            createdBy: 'Import Script',
            legalReviewStatus: mapping.legalReviewStatus,
            complianceFlags:
              mapping.documentType === 'POLICY'
                ? ['SECTION_409A', 'STATE_WAGE_LAW', 'FLSA']
                : [],
            retentionPeriod: 7,
            metadata: {
              source: 'Henry Schein Archive',
              importDate: new Date().toISOString(),
              originalPath: filePath,
              consultant: 'Blue Horizons Group',
              projectPhase: 'BHG Consulting Engagement Nov 2025',
            },
          },
        });

        console.log(`   ✅ Imported: ${documentCode} - ${title}`);
        totalImported++;
      } catch (error) {
        console.error(`   ❌ Error: ${filename} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        totalErrors++;
      }
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 Import Summary:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   ✅ Imported:  ${totalImported} documents`);
  console.log(`   ⏭️  Skipped:   ${totalSkipped} documents`);
  console.log(`   ❌ Errors:    ${totalErrors} documents`);
  console.log('═══════════════════════════════════════════════════════');

  if (totalImported > 0) {
    console.log('');
    console.log('🎉 Import complete!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Sign in as a Henry Schein user (@henryschein.com)');
    console.log('  2. Navigate to /documents to see imported files');
    console.log('  3. Review DRAFT policies and submit for approval');
    console.log('  4. Configure committees (SGCC, CRB)');
    console.log('  5. Begin using SGM for governance workflows');
  } else {
    console.log('');
    console.log('⚠️  No documents were imported.');
    console.log('   Check that the archive directory exists and contains files.');
  }
}

// Run import
importDocuments()
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
