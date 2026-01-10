#!/usr/bin/env tsx

/**
 * Test Governance Gap Analysis
 *
 * Demonstrates comprehensive governance analysis with:
 * - A/B/C coverage grading
 * - 1-5 liability scoring
 * - Risk trigger detection
 * - Gap register output
 */

import { parseAndConvert } from '../lib/services/document-parser';
import { analyzeGovernance } from '../lib/services/governance-gap-analysis';
import { getAllPoliciesAsJSON } from '../lib/data/policy-library';
import * as fs from 'fs';

async function main() {
  console.log('🔍 GOVERNANCE GAP ANALYSIS TEST\n');
  console.log('='.repeat(80));
  console.log('\n');

  const testFile = '/tmp/test-compensation-plan-structured.txt';

  if (!fs.existsSync(testFile)) {
    console.error(`❌ Test file not found: ${testFile}`);
    console.log('\nPlease run the document parser test first.');
    process.exit(1);
  }

  // Step 1: Parse document
  console.log('📄 Step 1: Parsing document...\n');
  const parseResult = await parseAndConvert(testFile);
  console.log(`✅ Parsed ${parseResult.sections.length} sections\n`);

  // Step 2: Load policies
  console.log('📚 Step 2: Loading policy library...\n');
  const policies = getAllPoliciesAsJSON();
  console.log(`✅ Loaded ${policies.length} policies\n`);

  // Step 3: Run governance analysis
  console.log('🔍 Step 3: Running governance gap analysis...\n');
  const startTime = Date.now();

  const report = await analyzeGovernance(parseResult.sections, policies, {
    jurisdiction: 'CA',
    planOnlyScoring: true,
  });

  const analysisTime = Date.now() - startTime;
  console.log(`✅ Analysis complete in ${analysisTime}ms\n`);

  // Display results
  console.log('='.repeat(80));
  console.log('GOVERNANCE GAP REPORT');
  console.log('='.repeat(80));
  console.log('\n');

  // Plan info
  console.log('📋 PLAN INFORMATION\n');
  console.log(`   Plan: ${report.planName}`);
  console.log(`   Analyzed: ${report.analyzedAt.toLocaleString()}`);
  console.log(`   Jurisdiction: ${report.jurisdiction.primaryJurisdiction} (${report.jurisdiction.multiplier}x multiplier)`);
  console.log(`   Wage Law Flags: ${report.jurisdiction.wageLawFlags.join(', ')}\n`);

  // Overall risk
  console.log('⚠️  OVERALL RISK ASSESSMENT\n');
  console.log(`   Risk Level: ${report.riskSummary.overallRisk}`);
  console.log(`   Critical Gaps: ${report.riskSummary.criticalGaps.length}`);
  console.log(`   High-Liability Areas: ${report.riskSummary.highLiabilityAreas.length}\n`);

  // Statistics
  console.log('📊 STATISTICS\n');
  console.log('   Coverage Distribution:');
  console.log(`      A (Adequate): ${report.statistics.coverageDistribution.A} policies`);
  console.log(`      B (Deficient): ${report.statistics.coverageDistribution.B} policies`);
  console.log(`      C (Missing): ${report.statistics.coverageDistribution.C} policies\n`);

  console.log('   Liability Distribution:');
  console.log(`      5 (Critical): ${report.statistics.liabilityDistribution[5]} policies`);
  console.log(`      4 (High): ${report.statistics.liabilityDistribution[4]} policies`);
  console.log(`      3 (Medium-High): ${report.statistics.liabilityDistribution[3]} policies`);
  console.log(`      2 (Medium): ${report.statistics.liabilityDistribution[2]} policies`);
  console.log(`      1 (Low): ${report.statistics.liabilityDistribution[1]} policies\n`);

  console.log('   Risk Indicators:');
  console.log(`      Total Risk Triggers: ${report.statistics.totalRiskTriggers}`);
  console.log(`      Total Conflicts: ${report.statistics.totalConflicts}`);
  console.log(`      Unmet Requirements: ${report.statistics.totalRequirements}\n`);

  // Risk triggers
  if (report.riskSummary.topRiskTriggers.length > 0) {
    console.log('🚨 TOP RISK TRIGGERS DETECTED\n');
    report.riskSummary.topRiskTriggers.forEach((trigger, i) => {
      console.log(`   ${i + 1}. ${trigger.name} (${trigger.id})`);
      console.log(`      Impact: +${trigger.liabilityImpact}`);
      console.log(`      Description: ${trigger.description}`);
      console.log(`      Matched Patterns: ${trigger.matchedPatterns.slice(0, 2).join(', ')}`);
      console.log(`      Found In: ${trigger.foundIn.slice(0, 3).join(', ')}\n`);
    });
  }

  // Gap register (table format)
  console.log('='.repeat(80));
  console.log('GAP REGISTER');
  console.log('='.repeat(80));
  console.log('\n');

  console.log(
    '| # | Governance Area                 | Code    | Cov | Liab | Triggers | Conflicts | Priority |'
  );
  console.log(
    '|---|---------------------------------|---------|-----|------|----------|-----------|----------|'
  );

  report.gaps
    .sort((a, b) => b.liability - a.liability)
    .forEach((gap, i) => {
      const area = gap.governanceArea.substring(0, 30).padEnd(31);
      const code = gap.policyCode.padEnd(7);
      const cov = gap.coverage.padEnd(3);
      const liab = gap.liability.toString().padEnd(4);
      const triggers = gap.riskTriggers.length.toString().padEnd(8);
      const conflicts = (gap.conflicts?.length || 0).toString().padEnd(9);
      const priority = gap.recommendedPatch.priority.padEnd(8);

      console.log(
        `| ${(i + 1).toString().padStart(2)} | ${area} | ${code} | ${cov} | ${liab} | ${triggers} | ${conflicts} | ${priority} |`
      );
    });

  console.log('\n');

  // Detailed gap entries (first 5)
  console.log('='.repeat(80));
  console.log('DETAILED GAP ANALYSIS (Top 5)');
  console.log('='.repeat(80));
  console.log('\n');

  report.gaps
    .sort((a, b) => b.liability - a.liability)
    .slice(0, 5)
    .forEach((gap, i) => {
      console.log(`${i + 1}. ${gap.governanceArea} (${gap.policyCode})\n`);
      console.log(`   Coverage: ${gap.coverage} | Liability: ${gap.liability}\n`);

      // Unmet requirements
      if (gap.unmetRequirements.length > 0) {
        console.log(`   Unmet Requirements:`);
        gap.unmetRequirements.slice(0, 3).forEach((req) => {
          console.log(`      • ${req.name} [${req.severity}]`);
          console.log(`        ${req.description}`);
          console.log(`        Status: ${req.status}`);
        });
        if (gap.unmetRequirements.length > 3) {
          console.log(`      ... and ${gap.unmetRequirements.length - 3} more\n`);
        } else {
          console.log('');
        }
      }

      // Risk triggers
      if (gap.riskTriggers.length > 0) {
        console.log(`   Risk Triggers:`);
        gap.riskTriggers.forEach((trigger) => {
          console.log(`      • ${trigger.name} (+${trigger.liabilityImpact})`);
          console.log(`        ${trigger.description}`);
        });
        console.log('');
      }

      // Conflicts
      if (gap.conflicts && gap.conflicts.length > 0) {
        console.log(`   Conflicts:`);
        gap.conflicts.slice(0, 2).forEach((conflict) => {
          console.log(`      • ${conflict.type}: ${conflict.severity}`);
          console.log(`        Plan: "${conflict.planLanguage}"`);
          console.log(`        Policy: "${conflict.policyRequirement}"`);
        });
        console.log('');
      }

      // Patch recommendation
      console.log(`   Recommended Patch:`);
      console.log(`      Type: ${gap.recommendedPatch.type}`);
      console.log(`      Target: ${gap.recommendedPatch.targetSection}`);
      console.log(`      Priority: ${gap.recommendedPatch.priority}`);
      console.log(`      Rationale: ${gap.recommendedPatch.rationale}\n`);

      console.log('-'.repeat(80));
      console.log('');
    });

  // Immediate actions
  console.log('🎯 IMMEDIATE ACTIONS RECOMMENDED\n');
  report.riskSummary.immediateActions.slice(0, 5).forEach((action, i) => {
    console.log(`   ${i + 1}. ${action}`);
  });
  console.log('\n');

  // Summary
  console.log('='.repeat(80));
  console.log('✅ ANALYSIS COMPLETE');
  console.log('='.repeat(80));
  console.log('\n');

  console.log('Summary:');
  console.log(
    `  • Analyzed ${report.gaps.length} governance areas against ${policies.length} policies`
  );
  console.log(`  • Overall Risk: ${report.riskSummary.overallRisk}`);
  console.log(`  • Coverage: ${report.statistics.coverageDistribution.A}A / ${report.statistics.coverageDistribution.B}B / ${report.statistics.coverageDistribution.C}C`);
  console.log(
    `  • Liability: ${report.statistics.liabilityDistribution[5]} Critical (5) / ${report.statistics.liabilityDistribution[4]} High (4)`
  );
  console.log(`  • Risk Triggers: ${report.statistics.totalRiskTriggers} detected`);
  console.log(`  • Conflicts: ${report.statistics.totalConflicts} identified`);
  console.log(`  • Analysis Time: ${analysisTime}ms\n`);
}

main();
