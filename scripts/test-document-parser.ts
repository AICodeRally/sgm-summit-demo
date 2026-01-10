#!/usr/bin/env tsx

/**
 * Test Document Parser
 *
 * Tests the document parser with a sample markdown file.
 */

import { parseAndConvert } from '../lib/services/document-parser';
import * as path from 'path';

async function main() {
  console.log('🧪 Testing Document Parser\n');

  // Test with a sample text file
  const testFile = '/tmp/test-compensation-plan.txt';

  console.log(`📄 Parsing: ${path.basename(testFile)}`);
  console.log('⏳ Processing...\n');

  try {
    const result = await parseAndConvert(testFile);

    console.log('✅ Parse successful!\n');
    console.log('📊 Statistics:');
    console.log(`   Total Pages: ${result.stats.totalPages}`);
    console.log(`   Total Words: ${result.stats.totalWords}`);
    console.log(`   Total Sections: ${result.stats.totalSections}`);
    console.log(`   Avg Section Size: ${result.stats.averageSectionSize} words`);
    console.log(`   Processing Time: ${result.stats.processingTime}ms\n`);

    console.log('📑 Detected Sections:');
    result.sections.forEach((section, index) => {
      const wordCount = section.blocks.reduce((sum, block) => {
        if (block.type === 'paragraph' || block.type === 'heading') {
          return sum + block.content.split(/\s+/).length;
        }
        return sum;
      }, 0);

      console.log(
        `   ${index + 1}. ${section.detectedTitle} (${section.blocks.length} blocks, ${wordCount} words)`
      );
    });

    console.log('\n📝 Sample Section (first section):');
    const firstSection = result.sections[0];
    console.log(`   Title: ${firstSection.detectedTitle}`);
    console.log(`   Blocks: ${firstSection.blocks.length}`);
    console.log(`   Confidence: ${firstSection.confidence}`);
    console.log(`   Detection: ${firstSection.detectionMethod}`);

    console.log('\n🧱 Block Types:');
    const blockTypes = new Map<string, number>();
    result.sections.forEach((section) => {
      section.blocks.forEach((block) => {
        blockTypes.set(block.type, (blockTypes.get(block.type) || 0) + 1);
      });
    });

    blockTypes.forEach((count, type) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n✨ JSON Output Sample (first block):');
    const firstBlock = result.sections[0].blocks[0];
    console.log(JSON.stringify(firstBlock, null, 2));

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
