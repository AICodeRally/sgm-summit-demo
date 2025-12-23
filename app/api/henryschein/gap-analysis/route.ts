import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the JSON plan analysis file
    const filePath = path.join(process.cwd(), 'scripts/output/json-plan-analysis.json');

    if (!fs.existsSync(filePath)) {
      // Return static data if file doesn't exist
      return NextResponse.json({
        totalPlans: 27,
        averageCoverage: 76.3,
        criticalGaps: 408,
        mustHavePolicies: 3,
        riskExposure: 1750000,
        riskMitigation: 2950000,
      });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Calculate summary statistics
    const plans = data.plans || [];
    const totalPlans = plans.length;
    const averageCoverage = data.globalStats?.averageCoverage || 0;

    // Count gaps (NO or LIMITED coverage)
    let criticalGaps = 0;
    plans.forEach((plan: any) => {
      const policyCoverage = plan.policyCoverage || {};
      Object.values(policyCoverage).forEach((coverage: any) => {
        if (coverage.coverage === 'NO' || coverage.coverage === 'LIMITED') {
          criticalGaps++;
        }
      });
    });

    return NextResponse.json({
      totalPlans,
      averageCoverage,
      criticalGaps,
      mustHavePolicies: 3,
      riskExposure: 1750000,
      riskMitigation: 2950000,
      detailedStats: data.globalStats,
    });
  } catch (error) {
    console.error('Error reading gap analysis:', error);
    return NextResponse.json(
      { error: 'Failed to load gap analysis data' },
      { status: 500 }
    );
  }
}
