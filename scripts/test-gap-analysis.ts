#!/usr/bin/env tsx

/**
 * Test Gap Analysis
 *
 * Tests the gap analysis engine with parsed document sections and policy library.
 */

import { parseAndConvert } from '../lib/services/document-parser';
import { analyzeGaps, generateGapSummary } from '../lib/services/gap-analysis';
import { getAllPoliciesAsJSON } from '../lib/data/policy-library';
import * as path from 'path';

async function main() {
  console.log('🧪 Testing Gap Analysis Engine\n');

  // Test with our sample text file
  const testFile = '/tmp/test-compensation-plan-structured.txt';

  console.log(`📄 Parsing: ${path.basename(testFile)}`);
  console.log('⏳ Processing...\n');

  try {
    // Step 1: Parse document and detect sections
    const parseResult = await parseAndConvert(testFile, {
      detector: {
        mergeSmallSections: false,
        minSectionSize: 10,
      },
    });

    console.log('✅ Parse successful!\n');
    console.log('📊 Parse Statistics:');
    console.log(`   Total Sections: ${parseResult.sections.length}`);
    console.log(`   Total Words: ${parseResult.stats.totalWords}\n`);

    console.log('📑 Detected Sections:');
    parseResult.sections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.detectedTitle}`);
    });

    // Step 2: Load policies
    console.log('\n📚 Loading policy library...\n');

    const policies = getAllPoliciesAsJSON();
    console.log(`✅ Loaded ${policies.length} policies\n`);

    // Step 3: Run gap analysis
    console.log('🔍 Analyzing gaps...\n');

    const gapStartTime = Date.now();
    const gaps = await analyzeGaps(parseResult.sections, policies, {
      minSeverity: 'LOW', // Include all gaps
      keywordMatchThreshold: 0.3, // 30% keyword match required
    });
    const gapTime = Date.now() - gapStartTime;

    console.log('✅ Gap analysis complete!\n');
    console.log(`⏱️  Processing Time: ${gapTime}ms\n`);

    // Step 4: Display gaps
    if (gaps.length === 0) {
      console.log('🎉 No gaps detected! Plan has excellent policy coverage.\n');
    } else {
      console.log(`⚠️  Found ${gaps.length} gaps:\n`);

      gaps.forEach((gap, index) => {
        const severityIcon =
          gap.severity === 'CRITICAL'
            ? '🔴'
            : gap.severity === 'HIGH'
            ? '🟠'
            : gap.severity === 'MEDIUM'
            ? '🟡'
            : '🟢';

        console.log(
          `${index + 1}. ${severityIcon} [${gap.severity}] ${gap.policy.name} (${gap.policyCode})`
        );
        console.log(`   Area: ${gap.policyArea}`);
        console.log(`   Risk Score: ${gap.impactAnalysis.riskScore}/100`);

        if (gap.impactAnalysis.financialExposure) {
          const exp = gap.impactAnalysis.financialExposure;
          console.log(
            `   Financial Exposure: ${exp.currency} ${exp.amount.toLocaleString()} ${
              exp.period
            }`
          );
        }

        console.log(`   Missing Elements: ${gap.missingElements.length}`);
        gap.missingElements.forEach((elem, i) => {
          console.log(`      ${i + 1}. [${elem.type}] ${elem.description}`);
        });

        console.log(`   Keywords Searched: ${gap.searchedKeywords.slice(0, 5).join(', ')}...`);

        console.log(`   Recommendations: ${gap.recommendations.length}`);
        gap.recommendations.forEach((rec, i) => {
          console.log(
            `      ${i + 1}. ${rec.action} into "${rec.targetSectionKey}" (${
              rec.estimatedEffort
            })`
          );
        });

        console.log('');
      });
    }

    // Step 5: Generate summary
    const summary = generateGapSummary(gaps);

    console.log('📈 Gap Analysis Summary:\n');
    console.log(`   Total Gaps: ${summary.totalGaps}`);
    console.log(`   Overall Risk Score: ${summary.overallRiskScore.toFixed(1)}/100`);
    console.log(`   Coverage Percentage: ${summary.coveragePercentage.toFixed(1)}%\n`);

    console.log('   By Severity:');
    console.log(`      🔴 Critical: ${summary.bySeverity.critical}`);
    console.log(`      🟠 High: ${summary.bySeverity.high}`);
    console.log(`      🟡 Medium: ${summary.bySeverity.medium}`);
    console.log(`      🟢 Low: ${summary.bySeverity.low}\n`);

    console.log('   By Status:');
    console.log(`      Open: ${summary.byStatus.open}`);
    console.log(`      In Progress: ${summary.byStatus.inProgress}`);
    console.log(`      Resolved: ${summary.byStatus.resolved}`);
    console.log(`      Accepted Risk: ${summary.byStatus.acceptedRisk}\n`);

    if (summary.totalFinancialExposure) {
      console.log(
        `   Total Financial Exposure: $${summary.totalFinancialExposure.toLocaleString()}\n`
      );
    }

    if (summary.topRiskAreas.length > 0) {
      console.log('   Top Risk Areas:');
      summary.topRiskAreas.forEach((area, i) => {
        console.log(
          `      ${i + 1}. ${area.policyArea} (Risk: ${area.riskScore.toFixed(
            1
          )}, Gaps: ${area.gapCount})`
        );
      });
      console.log('');
    }

    // Step 6: Show gap details for top 3
    if (gaps.length > 0) {
      console.log('🔍 Top Gaps Detail:\n');

      const topGaps = gaps
        .sort((a, b) => b.impactAnalysis.riskScore - a.impactAnalysis.riskScore)
        .slice(0, 3);

      topGaps.forEach((gap, index) => {
        console.log(`${index + 1}. ${gap.policy.name} (${gap.policyCode})`);
        console.log(`   Risk Factors:`);
        gap.impactAnalysis.riskFactors.forEach((factor) => {
          console.log(`      • ${factor}`);
        });
        console.log(`   Compliance Risk: ${gap.impactAnalysis.complianceRisk}`);
        console.log(
          `   Affected Sections: ${gap.impactAnalysis.affectedSections.slice(0, 3).join(', ')}${
            gap.impactAnalysis.affectedSections.length > 3 ? '...' : ''
          }`
        );
        console.log('');
      });
    }

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
