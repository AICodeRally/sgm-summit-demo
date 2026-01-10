#!/usr/bin/env npx tsx
/**
 * Test AICR Platform Integration
 *
 * Run: npx tsx scripts/test-aicr.ts
 */

import 'dotenv/config';
import { getAICRClient, isAICRConfigured } from '../lib/aicr';

async function main() {
  console.log('=== AICR Integration Test ===\n');

  // Check configuration
  console.log('1. Configuration Check:');
  console.log(`   AICR_API_URL: ${process.env.AICR_API_URL || '(not set)'}`);
  console.log(`   AICR_TENANT_ID: ${process.env.AICR_TENANT_ID || '(not set)'}`);
  console.log(`   isAICRConfigured(): ${isAICRConfigured()}`);

  if (!isAICRConfigured()) {
    console.log('\n❌ AICR is not configured. Set AICR_API_URL in .env');
    return;
  }

  // Health check
  console.log('\n2. Health Check:');
  const client = getAICRClient({ debug: true });
  try {
    const healthy = await client.healthCheck();
    console.log(`   Health: ${healthy ? '✅ OK' : '❌ Failed'}`);
  } catch (err) {
    console.log(`   Health: ❌ Error - ${err}`);
  }

  // Test Ask SGM
  console.log('\n3. Ask SGM Test:');
  try {
    const response = await client.askSGM({
      message: 'What is the policy for crediting splits on a deal?',
      domain: 'sgm',
      context: {
        jurisdiction: 'CA',
        cycleState: 'active',
      },
    });

    console.log('   ✅ Response received:');
    console.log(`   Expert: ${response.expert?.name || 'unknown'} (${response.expert?.slug})`);
    console.log(`   Confidence: ${response.confidence || 'N/A'}`);
    console.log(`   Deliverable Type: ${response.deliverableType || 'N/A'}`);
    console.log(`   Answer preview: ${response.answer?.slice(0, 200)}...`);
    if (response.citations?.length) {
      console.log(`   Citations: ${response.citations.length}`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err}`);
  }

  console.log('\n=== Test Complete ===');
}

main().catch(console.error);
