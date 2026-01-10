#!/usr/bin/env tsx

/**
 * Test Policy Recommendations
 *
 * Tests the policy recommendation engine with gap analysis results.
 */

import { parseAndConvert } from '../lib/services/document-parser';
import { analyzeGaps } from '../lib/services/gap-analysis';
import { generateRecommendations } from '../lib/services/policy-recommendation';
import { getAllPoliciesAsJSON } from '../lib/data/policy-library';
import * as path from 'path';

async function main() {
  console.log('🧪 Testing Policy Recommendation Engine\n');

  // Test with our sample text file
  const testFile = '/tmp/test-compensation-plan-structured.txt';

  console.log(`📄 Parsing: ${path.basename(testFile)}`);
  console.log('⏳ Processing...\n');

  try {
    // Step 1: Parse document
    const parseResult = await parseAndConvert(testFile, {
      detector: {
        mergeSmallSections: false,
        minSectionSize: 10,
      },
    });

    console.log('✅ Parse successful!\n');

    // Step 2: Load policies and analyze gaps
    console.log('🔍 Analyzing gaps...\n');

    const policies = getAllPoliciesAsJSON();
    const gaps = await analyzeGaps(parseResult.sections, policies, {
      minSeverity: 'MEDIUM', // Only show MEDIUM and above
      keywordMatchThreshold: 0.3,
    });

    console.log(`✅ Found ${gaps.length} gaps\n`);

    // Step 3: Generate recommendations
    console.log('💡 Generating policy recommendations...\n');

    const recStartTime = Date.now();

    const recommendations = generateRecommendations(gaps, {
      formatStyle: 'detailed',
      includeProvisions: true,
      includeCompliance: true,
      includeDefinitions: true,
    });

    const recTime = Date.now() - recStartTime;

    console.log('✅ Recommendation generation complete!\n');
    console.log(`⏱️  Processing Time: ${recTime}ms\n`);

    // Step 4: Display recommendations
    console.log(`📋 Generated ${recommendations.length} recommendations:\n`);

    recommendations.forEach((rec, index) => {
      const priorityIcon =
        rec.recommendationDetails.priority === 'CRITICAL'
          ? '🔴'
          : rec.recommendationDetails.priority === 'HIGH'
          ? '🟠'
          : rec.recommendationDetails.priority === 'MEDIUM'
          ? '🟡'
          : '🟢';

      console.log(
        `${index + 1}. ${priorityIcon} [${rec.recommendationDetails.priority}] ${
          rec.policyData.name
        } (${rec.policyCode})`
      );
      console.log(`   Status: ${rec.status}`);
      console.log(
        `   Action: ${rec.recommendationDetails.action} into "${rec.recommendationDetails.targetSectionKey}"`
      );
      console.log(
        `   Position: ${rec.recommendationDetails.insertPosition}`
      );
      console.log(`   Effort: ${rec.recommendationDetails.estimatedEffort}`);
      console.log(`   Rationale: ${rec.recommendationDetails.rationale}`);

      // Show preview
      console.log(`   Preview: "${rec.recommendationDetails.previewText}"`);

      // Show content structure
      const content = rec.recommendationDetails.contentJson;
      console.log(
        `   Content: ${content.blocks.length} blocks (${
          content.blocks.filter((b) => b.type === 'heading').length
        } headings, ${
          content.blocks.filter((b) => b.type === 'paragraph').length
        } paragraphs, ${
          content.blocks.filter((b) => b.type === 'list').length
        } lists)`
      );

      console.log('');
    });

    // Step 5: Show detailed content for first 2 recommendations
    console.log('📝 Detailed Content Preview (first 2 recommendations):\n');

    recommendations.slice(0, 2).forEach((rec, index) => {
      console.log(
        `${index + 1}. ${rec.policyData.name} - Generated ContentJSON:\n`
      );

      rec.recommendationDetails.contentJson.blocks.forEach((block, blockIndex) => {
        switch (block.type) {
          case 'heading':
            console.log(`   ${'#'.repeat(block.level)} ${block.content}`);
            break;

          case 'paragraph':
            console.log(`   ${block.content}\n`);
            break;

          case 'list':
            console.log(
              `   ${block.listType === 'ordered' ? 'Ordered' : 'Unordered'} List:`
            );
            block.items.forEach((item, i) => {
              const prefix = block.listType === 'ordered' ? `${i + 1}.` : '•';
              console.log(`      ${prefix} ${item.text}`);
            });
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
            console.log(`   ${icon} [${block.variant.toUpperCase()}] ${block.content}\n`);
            break;
        }
      });

      console.log('---\n');
    });

    // Step 6: Show statistics
    const { RecommendationEngine } = await import(
      '../lib/services/policy-recommendation'
    );
    const engine = new RecommendationEngine();
    const stats = engine.getStatistics(recommendations);

    console.log('📊 Recommendation Statistics:\n');
    console.log(`   Total Recommendations: ${stats.total}`);
    console.log(`   Estimated Total Effort: ${stats.estimatedTotalEffort}\n`);

    console.log('   By Priority:');
    console.log(`      🔴 Critical: ${stats.byPriority.CRITICAL}`);
    console.log(`      🟠 High: ${stats.byPriority.HIGH}`);
    console.log(`      🟡 Medium: ${stats.byPriority.MEDIUM}`);
    console.log(`      🟢 Low: ${stats.byPriority.LOW}\n`);

    console.log('   By Status:');
    console.log(`      Pending: ${stats.byStatus.PENDING}`);
    console.log(`      Applied: ${stats.byStatus.APPLIED}`);
    console.log(`      Rejected: ${stats.byStatus.REJECTED}`);
    console.log(`      Partially Applied: ${stats.byStatus.PARTIALLY_APPLIED}\n`);

    console.log('   By Action:');
    console.log(`      INSERT: ${stats.byAction.INSERT}`);
    console.log(`      UPDATE: ${stats.byAction.UPDATE}`);
    console.log(`      REPLACE: ${stats.byAction.REPLACE}`);
    console.log(`      APPEND: ${stats.byAction.APPEND}\n`);

    // Step 7: Test grouping by section
    const grouped = engine.groupBySection(recommendations);

    console.log('🗂️  Recommendations Grouped by Target Section:\n');

    grouped.forEach((recs, sectionKey) => {
      console.log(`   ${sectionKey}:`);
      recs.forEach((rec) => {
        console.log(`      • ${rec.policyCode}: ${rec.policyData.name}`);
      });
      console.log('');
    });

    // Step 8: Test filtering by priority
    const criticalRecs = engine.filterByPriority(recommendations, 'CRITICAL');

    console.log(
      `🔴 Critical Recommendations (must be applied): ${criticalRecs.length}\n`
    );

    criticalRecs.forEach((rec) => {
      console.log(`   • ${rec.policyCode}: ${rec.policyData.name}`);
      console.log(`     ${rec.recommendationDetails.rationale}`);
      console.log('');
    });

    // Step 9: Show sample JSON output
    if (recommendations.length > 0) {
      console.log('📄 Sample ContentJSON Output (first recommendation):\n');
      console.log(
        JSON.stringify(recommendations[0].recommendationDetails.contentJson, null, 2)
      );
      console.log('');
    }

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
