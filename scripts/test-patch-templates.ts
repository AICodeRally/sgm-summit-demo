#!/usr/bin/env tsx

/**
 * Test Patch Templates
 *
 * Demonstrates loading and applying patch templates for governance gaps.
 */

import {
  getPatchTemplateLoader,
  applyPatch,
  previewPatch,
} from '../lib/services/patch-templates';

async function main() {
  console.log('🔧 PATCH TEMPLATE TEST\n');
  console.log('='.repeat(80));
  console.log('\n');

  // Step 1: Load template index
  console.log('📚 Step 1: Loading template index...\n');
  const loader = getPatchTemplateLoader();
  const index = await loader.loadIndex();

  if (index) {
    console.log(`✅ Loaded index:`);
    console.log(`   Version: ${index.version}`);
    console.log(`   Total Policies: ${index.totalPolicies}`);
    console.log(`   Total Requirements: ${index.totalRequirements}`);
    console.log(`   Severity Totals:`);
    Object.entries(index.severityTotals).forEach(([severity, count]) => {
      console.log(`      ${severity}: ${count}`);
    });
    console.log('');
  }

  // Step 2: Load specific template
  console.log('📄 Step 2: Loading SCP-001 (Clawback) template...\n');
  const scp001 = await loader.loadTemplate('SCP-001');

  if (scp001) {
    console.log(`✅ Loaded SCP-001: ${scp001.policyName}`);
    console.log(`   Requirements: ${scp001.patches.length}`);
    scp001.patches.forEach((patch, i) => {
      console.log(`   ${i + 1}. ${patch.requirementName} [${patch.severity}]`);
    });
    console.log('');
  }

  // Step 3: Preview patch language
  console.log('👁️  Step 3: Preview patch language (full coverage)...\n');
  const preview = await previewPatch('SCP-001', 'R-001-01', 'full', {
    '[90/120/180]': '120',
    '[60/90/120]': '90',
    '[12/18/24]': '18',
    '[STATE]': 'CA',
  });

  if (preview) {
    console.log('Preview:\n');
    console.log(preview.markdown);
    console.log('\n');

    if (preview.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      preview.warnings.forEach((w) => console.log(`   - ${w}`));
      console.log('');
    }
  }

  // Step 4: Apply patch with JSON output
  console.log('🔨 Step 4: Apply patch and generate JSON...\n');
  const applied = await applyPatch({
    policyCode: 'SCP-001',
    requirementId: 'R-001-01',
    coverage: 'full',
    targetSectionKey: 'section-earned',
    insertionPosition: 'END',
    placeholderValues: {
      '[90/120/180]': '120',
      '[60/90/120]': '90',
      '[12/18/24]': '18',
      '[STATE]': 'CA',
    },
    jurisdiction: 'CA',
  });

  if (applied) {
    console.log('✅ Patch applied successfully\n');
    console.log(`JSON Blocks: ${applied.contentJson.blocks.length}`);
    console.log('\nBlock Types:');
    applied.contentJson.blocks.forEach((block, i) => {
      console.log(`   ${i + 1}. ${block.type} (${block.id})`);
    });
    console.log('');

    if (applied.stateNotes) {
      console.log('📝 State-Specific Notes (CA):\n');
      console.log(applied.stateNotes);
      console.log('');
    }
  }

  // Step 5: Test partial coverage
  console.log('='.repeat(80));
  console.log('🔍 Step 5: Testing partial coverage patch...\n');
  const partialPreview = await previewPatch('SCP-001', 'R-001-01', 'partial');

  if (partialPreview) {
    console.log('Partial Coverage Preview:\n');
    console.log(partialPreview.markdown);
    console.log('\n');
  }

  // Step 6: Load all templates
  console.log('='.repeat(80));
  console.log('📦 Step 6: Loading all templates...\n');
  const allTemplates = await loader.loadAllTemplates();
  console.log(`✅ Loaded ${allTemplates.length} templates\n`);

  console.log('Template Summary:');
  allTemplates.forEach((template, i) => {
    const totalPatches = template.patches.length;
    const criticalCount = template.patches.filter((p) => p.severity === 'CRITICAL').length;
    const highCount = template.patches.filter((p) => p.severity === 'HIGH').length;

    console.log(
      `   ${i + 1}. ${template.policyCode}: ${template.policyName} (${totalPatches} patches)`
    );
    if (criticalCount > 0) {
      console.log(`      - CRITICAL: ${criticalCount}`);
    }
    if (highCount > 0) {
      console.log(`      - HIGH: ${highCount}`);
    }
  });
  console.log('');

  // Summary
  console.log('='.repeat(80));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(80));
  console.log('\n');

  console.log('Summary:');
  console.log(`  • Template index loaded: ${index ? 'Yes' : 'No'}`);
  console.log(`  • Templates loaded: ${allTemplates.length}`);
  console.log(`  • Patch preview: ${preview ? 'Success' : 'Failed'}`);
  console.log(`  • Patch application: ${applied ? 'Success' : 'Failed'}`);
  console.log(`  • JSON blocks generated: ${applied?.contentJson.blocks.length || 0}`);
  console.log('');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
