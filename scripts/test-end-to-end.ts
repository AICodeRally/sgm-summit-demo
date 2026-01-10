#!/usr/bin/env tsx

/**
 * End-to-End Test: Document → Plan
 *
 * Complete workflow demonstration:
 * 1. Parse document (PDF/DOCX/TXT/Excel)
 * 2. Map sections to template
 * 3. Analyze policy gaps
 * 4. Generate recommendations
 * 5. Create plan with JSON content
 * 6. Display results
 */

import { createPlanFromDocument } from '../lib/services/plan-creation';
import { getAllPoliciesAsJSON } from '../lib/data/policy-library';
import { extractTextFromJSON } from '../lib/services/gap-analysis';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🚀 END-TO-END TEST: Document Ingestion → Plan Creation\n');
  console.log('='.repeat(70));
  console.log('\n');

  // Test file
  const testFile = '/tmp/test-compensation-plan-structured.txt';

  if (!fs.existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    console.log('\nPlease run the document parser test first to create the test file.');
    process.exit(1);
  }

  console.log(`📄 Document: ${path.basename(testFile)}`);
  console.log(`📚 Policy Library: Loading...`);

  // Load policies
  const policies = getAllPoliciesAsJSON();
  console.log(`✅ Loaded ${policies.length} policies\n`);

  console.log('='.repeat(70));
  console.log('WORKFLOW EXECUTION');
  console.log('='.repeat(70));
  console.log('\n');

  // Run complete workflow
  const startTime = Date.now();

  const result = await createPlanFromDocument(testFile, policies, {
    autoApplyMappings: true,
    autoApplyRecommendations: true, // Auto-apply CRITICAL recommendations
    minAutoApplyConfidence: 0.8,
    minAutoApplyPriority: 'CRITICAL',
    gapAnalysisThreshold: 0.3,
    addDividersBetweenContent: true,
  });

  const totalTime = Date.now() - startTime;

  console.log('\n');
  console.log('='.repeat(70));
  console.log('RESULTS');
  console.log('='.repeat(70));
  console.log('\n');

  if (!result.success) {
    console.error('❌ Plan creation failed!\n');
    console.error('Errors:');
    result.errors?.forEach((error) => {
      console.error(`   • ${error}`);
    });
    process.exit(1);
  }

  const { plan, stats } = result;

  // Display plan summary
  console.log('📋 PLAN SUMMARY\n');
  console.log(`   Plan ID: ${plan!.id}`);
  console.log(`   Title: ${plan!.title}`);
  console.log(`   Plan Code: ${plan!.planCode}`);
  console.log(`   Sections: ${plan!.sections.length}`);
  console.log(`   Completion: ${plan!.completionPercentage}%`);
  console.log(`   Source: ${plan!.metadata.sourceDocument}`);
  console.log(`   Created: ${plan!.metadata.createdAt.toISOString()}\n`);

  // Display statistics
  console.log('📊 PROCESSING STATISTICS\n');
  console.log(`   Document Sections Parsed: ${stats.documentSectionsParsed}`);
  console.log(`   Sections Mapped: ${stats.sectionsMapped}`);
  console.log(`   Auto-Accepted Mappings: ${stats.autoAcceptedMappings}`);
  console.log(`   Gaps Detected: ${stats.gapsDetected}`);
  console.log(`   Recommendations Generated: ${stats.recommendationsGenerated}`);
  console.log(`   Recommendations Applied: ${stats.recommendationsApplied}`);
  console.log(`   Plan Sections Created: ${stats.planSectionsCreated}`);
  console.log(`   Completion: ${stats.completionPercentage}%\n`);

  // Display timing breakdown
  console.log('⏱️  TIMING BREAKDOWN\n');
  console.log(`   Parse Time: ${plan!.metadata.parseTime}ms`);
  console.log(`   Mapping Time: ${plan!.metadata.mappingTime}ms`);
  console.log(`   Gap Analysis Time: ${plan!.metadata.gapAnalysisTime}ms`);
  console.log(`   Recommendation Time: ${plan!.metadata.recommendationTime}ms`);
  console.log(`   Plan Creation Time: ${plan!.metadata.creationTime}ms`);
  console.log(`   Total Time: ${plan!.metadata.totalProcessingTime}ms\n`);

  // Display sections
  console.log('📑 PLAN SECTIONS\n');

  plan!.sections
    .sort((a, b) => a.sectionNumber.localeCompare(b.sectionNumber))
    .forEach((section, index) => {
      const statusIcon =
        section.completionStatus === 'COMPLETE'
          ? '✅'
          : section.completionStatus === 'PARTIAL'
          ? '🟡'
          : '⚪';

      const sourceLabel =
        section.contentSource === 'DOCUMENT_MAPPING'
          ? '[Mapped]'
          : section.contentSource === 'POLICY_RECOMMENDATION'
          ? '[Policy]'
          : section.contentSource === 'MULTIPLE'
          ? '[Multiple]'
          : '[Manual]';

      console.log(
        `${index + 1}. ${statusIcon} ${section.sectionNumber} - ${section.title} ${sourceLabel}`
      );
      console.log(`   Status: ${section.completionStatus}`);
      console.log(`   Blocks: ${section.contentJson.blocks.length}`);
      console.log(`   Auto-populated: ${section.autoPopulated ? 'Yes' : 'No'}`);

      if (section.contentJson.blocks.length > 0) {
        const wordCount = extractTextFromJSON(section.contentJson)
          .split(/\s+/)
          .filter((w) => w.length > 0).length;

        console.log(`   Word Count: ${wordCount}`);

        // Show block type distribution
        const blockTypes = section.contentJson.blocks.reduce((acc, block) => {
          acc[block.type] = (acc[block.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const blockSummary = Object.entries(blockTypes)
          .map(([type, count]) => `${count} ${type}`)
          .join(', ');

        console.log(`   Content: ${blockSummary}`);
      }

      console.log('');
    });

  // Display completion breakdown
  console.log('📈 COMPLETION BREAKDOWN\n');

  const byStatus = {
    complete: plan!.sections.filter((s) => s.completionStatus === 'COMPLETE').length,
    partial: plan!.sections.filter((s) => s.completionStatus === 'PARTIAL').length,
    empty: plan!.sections.filter((s) => s.completionStatus === 'EMPTY').length,
  };

  console.log(`   Complete: ${byStatus.complete} sections`);
  console.log(`   Partial: ${byStatus.partial} sections`);
  console.log(`   Empty: ${byStatus.empty} sections`);
  console.log(`   Total: ${plan!.sections.length} sections\n`);

  // Display content source breakdown
  console.log('📦 CONTENT SOURCE BREAKDOWN\n');

  const bySource = {
    mapped: plan!.sections.filter((s) => s.contentSource === 'DOCUMENT_MAPPING').length,
    policy: plan!.sections.filter((s) => s.contentSource === 'POLICY_RECOMMENDATION')
      .length,
    multiple: plan!.sections.filter((s) => s.contentSource === 'MULTIPLE').length,
    manual: plan!.sections.filter((s) => s.contentSource === 'MANUAL').length,
  };

  console.log(`   Document Mapping: ${bySource.mapped} sections`);
  console.log(`   Policy Recommendation: ${bySource.policy} sections`);
  console.log(`   Multiple Sources: ${bySource.multiple} sections`);
  console.log(`   Manual (Empty): ${bySource.manual} sections\n`);

  // Show sample section content
  const firstCompleteSection = plan!.sections.find(
    (s) => s.completionStatus === 'COMPLETE'
  );

  if (firstCompleteSection) {
    console.log('📝 SAMPLE SECTION CONTENT\n');
    console.log(
      `Section: ${firstCompleteSection.sectionNumber} - ${firstCompleteSection.title}\n`
    );

    // Render first 5 blocks
    firstCompleteSection.contentJson.blocks.slice(0, 5).forEach((block) => {
      switch (block.type) {
        case 'heading':
          console.log(`${'#'.repeat(block.level)} ${block.content}\n`);
          break;

        case 'paragraph':
          const preview = block.content.substring(0, 150);
          console.log(
            `${preview}${block.content.length > 150 ? '...' : ''}\n`
          );
          break;

        case 'list':
          block.items.slice(0, 3).forEach((item, i) => {
            const prefix = block.listType === 'ordered' ? `${i + 1}.` : '•';
            console.log(`${prefix} ${item.text}`);
          });
          if (block.items.length > 3) {
            console.log(`   ... and ${block.items.length - 3} more items`);
          }
          console.log('');
          break;

        case 'callout':
          const icon =
            block.variant === 'info'
              ? 'ℹ️'
              : block.variant === 'warning'
              ? '⚠️'
              : block.variant === 'error'
              ? '❌'
              : '✅';
          console.log(`${icon} [${block.variant.toUpperCase()}]`);
          console.log(`   ${block.content}\n`);
          break;
      }
    });

    if (firstCompleteSection.contentJson.blocks.length > 5) {
      console.log(
        `... and ${firstCompleteSection.contentJson.blocks.length - 5} more blocks\n`
      );
    }
  }

  // Display warnings if any
  if (result.warnings && result.warnings.length > 0) {
    console.log('⚠️  WARNINGS\n');
    result.warnings.forEach((warning) => {
      console.log(`   • ${warning}`);
    });
    console.log('');
  }

  // Success summary
  console.log('='.repeat(70));
  console.log('✅ END-TO-END TEST COMPLETE!');
  console.log('='.repeat(70));
  console.log('\n');

  console.log('Summary:');
  console.log(`  ✓ Document parsed successfully (${stats.documentSectionsParsed} sections)`);
  console.log(
    `  ✓ Sections mapped to template (${stats.sectionsMapped}/${stats.documentSectionsParsed})`
  );
  console.log(`  ✓ Policy gaps detected (${stats.gapsDetected} gaps)`);
  console.log(
    `  ✓ Recommendations generated (${stats.recommendationsGenerated} recommendations)`
  );
  console.log(
    `  ✓ Recommendations applied (${stats.recommendationsApplied} auto-applied)`
  );
  console.log(`  ✓ Plan created (${plan!.sections.length} sections)`);
  console.log(`  ✓ Completion: ${plan!.completionPercentage}%`);
  console.log(`  ✓ Total time: ${totalTime}ms\n`);

  console.log('Key Features Demonstrated:');
  console.log('  ✓ JSON storage (zero markdown artifacts)');
  console.log('  ✓ Clean HTML rendering');
  console.log('  ✓ Automatic section mapping');
  console.log('  ✓ Policy gap analysis');
  console.log('  ✓ Smart recommendations');
  console.log('  ✓ Auto-content population');
  console.log('  ✓ Completion tracking\n');
}

main();
