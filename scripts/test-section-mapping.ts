#!/usr/bin/env tsx

/**
 * Test Section Mapping
 *
 * Tests the section mapping engine with parsed document sections.
 */

import { parseAndConvert } from '../lib/services/document-parser';
import { mapSectionsToTemplate } from '../lib/services/section-mapping';
import * as path from 'path';

async function main() {
  console.log('🧪 Testing Section Mapping Engine\n');

  // Test with our sample text file (use structured version with clear headings)
  const testFile = '/tmp/test-compensation-plan-structured.txt';

  console.log(`📄 Parsing: ${path.basename(testFile)}`);
  console.log('⏳ Processing...\n');

  try {
    // Step 1: Parse document and detect sections
    const parseResult = await parseAndConvert(testFile);

    console.log('✅ Parse successful!\n');
    console.log('📊 Parse Statistics:');
    console.log(`   Total Sections: ${parseResult.sections.length}`);
    console.log(`   Total Words: ${parseResult.stats.totalWords}`);
    console.log(`   Processing Time: ${parseResult.stats.processingTime}ms\n`);

    console.log('📑 Detected Sections:');
    parseResult.sections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.detectedTitle} (${section.blocks.length} blocks)`);
    });

    // Step 2: Map sections to template
    console.log('\n🔗 Mapping sections to template...\n');

    const mappingStartTime = Date.now();
    const mappings = await mapSectionsToTemplate(parseResult.sections, {
      fuzzyMatchThreshold: 0.6,
      autoAcceptThreshold: 0.9,
      maxAlternatives: 3,
    });
    const mappingTime = Date.now() - mappingStartTime;

    console.log('✅ Mapping complete!\n');
    console.log('📊 Mapping Statistics:');
    console.log(`   Total Mappings: ${mappings.length}`);
    console.log(`   Processing Time: ${mappingTime}ms\n`);

    // Display mapping results
    console.log('🎯 Mapping Results:\n');

    mappings.forEach((mapping, index) => {
      const statusIcon =
        mapping.status === 'ACCEPTED'
          ? '✅'
          : mapping.status === 'PENDING'
          ? '⏳'
          : '❌';

      const methodIcon =
        mapping.mappingMethod === 'EXACT'
          ? '🎯'
          : mapping.mappingMethod === 'FUZZY'
          ? '🔍'
          : mapping.mappingMethod === 'AI_SUGGESTED'
          ? '🤖'
          : '✋';

      console.log(
        `${index + 1}. ${statusIcon} ${methodIcon} "${mapping.parsedSection.detectedTitle}"`
      );
      console.log(
        `   ➜ Template: "${mapping.templateSection.title}" (${mapping.templateSection.sectionNumber})`
      );
      console.log(
        `   Confidence: ${(mapping.confidenceScore * 100).toFixed(1)}% | Method: ${
          mapping.mappingMethod
        } | Status: ${mapping.status}`
      );

      if (mapping.alternativeSuggestions && mapping.alternativeSuggestions.length > 0) {
        console.log(`   Alternatives:`);
        mapping.alternativeSuggestions.forEach((alt, altIndex) => {
          console.log(
            `      ${altIndex + 1}. "${alt.templateSection.title}" (${(
              alt.score * 100
            ).toFixed(1)}%)`
          );
        });
      }

      console.log('');
    });

    // Display statistics summary
    const engine = new (await import('../lib/services/section-mapping')).MappingEngine();
    const stats = engine.getMappingStatistics(mappings);

    console.log('📈 Statistics Summary:\n');
    console.log(`   Total Mappings: ${stats.total}`);
    console.log(`   Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   Auto-Accepted: ${stats.autoAccepted}`);
    console.log(`   Needs Review: ${stats.needsReview}\n`);

    console.log('   By Method:');
    console.log(`      Exact: ${stats.byMethod.EXACT}`);
    console.log(`      Fuzzy: ${stats.byMethod.FUZZY}`);
    console.log(`      AI Suggested: ${stats.byMethod.AI_SUGGESTED}`);
    console.log(`      Manual: ${stats.byMethod.MANUAL}\n`);

    console.log('   By Status:');
    console.log(`      Accepted: ${stats.byStatus.ACCEPTED}`);
    console.log(`      Pending: ${stats.byStatus.PENDING}`);
    console.log(`      Rejected: ${stats.byStatus.REJECTED}`);
    console.log(`      Modified: ${stats.byStatus.MODIFIED}\n`);

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
