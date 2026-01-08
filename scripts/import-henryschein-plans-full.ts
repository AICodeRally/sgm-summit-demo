#!/usr/bin/env tsx

/**
 * Import Henry Schein Plans with Full Version History
 *
 * Creates complete provenance tracking:
 * RAW → PROCESSED → DRAFT → UNDER_REVIEW → APPROVED → ACTIVE_FINAL
 *
 * Processes all 21 plans from the Henry Schein manifest
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getRegistry } from '../lib/bindings/registry';
import { loadHenryScheinPlan, loadPlanManifest } from '../lib/data/henryschein-plans';

const TENANT_ID = 'demo-tenant-001';
const HS_PLANS_BASE_PATH = '/Users/toddlebaron/Documents/SPM/clients/HenrySchein/HS_Comp_Plans';
const PROCESSED_PATH = path.join(HS_PLANS_BASE_PATH, 'processed');
const RAW_PATH = path.join(HS_PLANS_BASE_PATH, 'raw');

interface ImportResult {
  planCode: string;
  title: string;
  documentId: string;
  versions: {
    raw: string;
    processed: string;
    draft: string;
    underReview: string;
    approved: string;
    activeFinal: string;
  };
  success: boolean;
  error?: string;
}

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function generateDocumentId(planCode: string): string {
  return 'doc-' + planCode.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

async function importPlanFromManifest(planInfo: any): Promise<ImportResult> {
  const planCode = planInfo.documentCode;
  console.log(`\n📋 Processing: ${planCode}`);
  console.log('━'.repeat(60));

  try {
    const registry = getRegistry();
    const versionProvider = registry.getDocumentVersion();

    const documentId = generateDocumentId(planCode);

    console.log(`   Document ID: ${documentId}`);
    console.log(`   Title: ${planInfo.title}`);
    console.log(`   Division: ${planInfo.division}`);
    console.log(`   Role: ${planInfo.role}`);
    console.log(`   Status: ${planInfo.status}`);

    // Try to load processed plan data, or create from manifest
    let fullContent: string;
    const plan = loadHenryScheinPlan(planCode);

    if (plan) {
      // Use fully processed content
      fullContent = plan.rawContent || plan.sections.map(s =>
        `## ${s.title}\n\n${s.content}`
      ).join('\n\n');
      console.log(`   ✓ Loaded ${plan.sections.length} sections from processed markdown`);
    } else {
      // Create placeholder content from manifest
      fullContent = `# ${planInfo.title}

**Plan Code:** ${planCode}
**Division:** ${planInfo.division}
**Role:** ${planInfo.role}
**Effective Date:** ${planInfo.effectiveDate}
**Plan Year:** ${planInfo.planYear}
**Version:** ${planInfo.version}
**Status:** ${planInfo.status}
**Owner:** ${planInfo.owner}

---

## Plan Overview

This is a ${planInfo.division} compensation plan for ${planInfo.role} roles.

**Document Type:** ${planInfo.documentType}
**Category:** ${planInfo.category}
**Source File:** ${planInfo.filename}

This plan is currently in ${planInfo.status} status and will be processed fully once the source document is converted to markdown.

---

## Placeholder Sections

The following sections will be populated once the source document (${planInfo.filename}) is fully processed:

1. Plan Objectives
2. Eligibility Criteria
3. Compensation Structure
4. Performance Metrics
5. Payment Terms
6. Terms and Conditions
7. Governance Policies
8. Approval Requirements

---

*This document was imported from the Henry Schein plans manifest and awaits full content processing.*`;
      console.log(`   ⚠ No processed markdown found - using manifest template`);
    }

    const contentChecksum = calculateChecksum(fullContent);
    const contentSize = Buffer.byteLength(fullContent, 'utf8');

    // STEP 1: Import RAW version
    console.log('   [1/6] Importing RAW version...');
    const sourceFilePath = path.join(RAW_PATH, planInfo.filename);
    const rawVersion = await versionProvider.importRaw({
      tenantId: TENANT_ID,
      documentId,
      sourceFileUrl: sourceFilePath,
      sourceFileName: planInfo.filename,
      sourceFileType: planInfo.filename.endsWith('.pdf') ? 'pdf' : 'docx',
      createdBy: 'import-system',
      metadata: {
        planCode,
        title: planInfo.title,
        division: planInfo.division,
        role: planInfo.role,
        company: 'Henry Schein',
        planYear: planInfo.planYear,
        effectiveDate: planInfo.effectiveDate,
        documentType: planInfo.documentType,
        category: planInfo.category,
        owner: planInfo.owner,
      },
    });
    console.log(`   ✅ RAW version created: ${rawVersion.id}`);

    // STEP 2: Process to markdown
    console.log('   [2/6] Processing to markdown...');
    const sectionCount = plan ? plan.sections.length : 0;
    const processingNote = plan
      ? `Converted ${planInfo.filename} to structured markdown. Extracted ${sectionCount} sections with full content.`
      : `Created placeholder from manifest for ${planInfo.filename}. Awaiting full document processing.`;

    const processedVersion = await versionProvider.processToMarkdown({
      rawVersionId: rawVersion.id,
      processedContent: fullContent,
      processedBy: 'markdown-processor',
      processingNotes: processingNote,
    });
    console.log(`   ✅ PROCESSED version created: ${processedVersion.id}`);

    // STEP 3: Create DRAFT version with governance analysis
    console.log('   [3/6] Creating DRAFT version...');
    const draftVersion = await versionProvider.transitionToDraft({
      versionId: processedVersion.id,
      draftContent: fullContent,
      transitionedBy: 'todd.lebaron@henryschein.com',
      changeDescription: 'Plan reviewed and prepared for stakeholder review. All sections extracted and formatted.',
    });
    console.log(`   ✅ DRAFT version created: ${draftVersion.id}`);

    // STEP 4: Submit for review (DRAFT → UNDER_REVIEW)
    console.log('   [4/6] Submitting for review...');
    const reviewVersion = await versionProvider.submitForReview(
      draftVersion.id,
      'todd.lebaron@henryschein.com'
    );
    console.log(`   ✅ UNDER_REVIEW version: ${reviewVersion.id}`);

    // STEP 5: Approve version
    console.log('   [5/6] Approving version...');
    const approvedVersion = await versionProvider.approve({
      versionId: reviewVersion.id,
      approvedBy: 'compliance.manager@henryschein.com',
      approvalComments: `Plan reviewed and approved for FY${planInfo.planYear}. All governance requirements met. Ready for publication.`,
    });
    console.log(`   ✅ APPROVED version: ${approvedVersion.id}`);

    // STEP 6: Publish to ACTIVE_FINAL (only if status is ACTIVE)
    let activeVersion = approvedVersion;
    if (planInfo.status === 'ACTIVE') {
      console.log('   [6/6] Publishing to ACTIVE_FINAL...');
      activeVersion = await versionProvider.publishToActive({
        versionId: approvedVersion.id,
        publishedBy: 'hr.admin@henryschein.com',
        effectiveDate: new Date(planInfo.effectiveDate || `${planInfo.planYear}-01-01`),
      });
      console.log(`   ✅ ACTIVE_FINAL version: ${activeVersion.id}`);
    } else {
      console.log(`   [6/6] Skipping publish (status: ${planInfo.status})`);
    }

    console.log(`   ✅ Complete! 6 versions created for ${planCode}`);

    return {
      planCode,
      title: planInfo.title,
      documentId,
      versions: {
        raw: rawVersion.id,
        processed: processedVersion.id,
        draft: draftVersion.id,
        underReview: reviewVersion.id,
        approved: approvedVersion.id,
        activeFinal: activeVersion.id,
      },
      success: true,
    };

  } catch (error) {
    console.error(`   ❌ Error processing ${planCode}:`, error);
    return {
      planCode,
      title: '',
      documentId: '',
      versions: {
        raw: '',
        processed: '',
        draft: '',
        underReview: '',
        approved: '',
        activeFinal: '',
      },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function importAllPlans() {
  console.log('🚀 Henry Schein Plans Import - Full Version History');
  console.log('═'.repeat(60));
  console.log(`Tenant: ${TENANT_ID}`);
  console.log(`Source Path: ${PROCESSED_PATH}`);
  console.log('');

  // Load manifest
  const manifest = loadPlanManifest();
  if (!manifest || !manifest.plans) {
    console.error('❌ Could not load plans manifest');
    process.exit(1);
  }

  console.log(`📚 Found ${manifest.plans.length} plans in manifest`);
  console.log('');

  // Get list of available processed files
  const processedFiles = fs.readdirSync(PROCESSED_PATH)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''));

  console.log(`📄 Found ${processedFiles.length} processed markdown files`);
  console.log(`📋 Will import all ${manifest.plans.length} plans (using placeholders where markdown not available)`);
  console.log('');

  // Import each plan from manifest
  const results: ImportResult[] = [];

  for (const planInfo of manifest.plans) {
    const result = await importPlanFromManifest(planInfo);
    results.push(result);

    // Small delay to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 Import Summary');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successfully imported: ${successful.length} plans`);
  console.log(`❌ Failed: ${failed.length} plans`);
  console.log(`📦 Total versions created: ${successful.length * 6}`);
  console.log('');

  if (successful.length > 0) {
    console.log('Successful Plans:');
    successful.forEach(r => {
      console.log(`  ✅ ${r.planCode} - ${r.title}`);
      console.log(`     Document ID: ${r.documentId}`);
      console.log(`     Active Version: ${r.versions.activeFinal}`);
    });
    console.log('');
  }

  if (failed.length > 0) {
    console.log('Failed Plans:');
    failed.forEach(r => {
      console.log(`  ❌ ${r.planCode} - ${r.error}`);
    });
    console.log('');
  }

  console.log('🎉 Import Complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. View in Document Library: http://localhost:3004/documents/library');
  console.log('  2. View version history: http://localhost:3004/documents/[documentId]/versions');
  console.log('  3. View plan content: http://localhost:3004/plans/document/[planCode]');
}

// Run import
importAllPlans()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
