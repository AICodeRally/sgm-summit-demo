import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the JSON plan analysis file
    const filePath = path.join(process.cwd(), 'scripts/output/json-plan-analysis.json');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Plans data not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json({
      plans: data.plans || [],
      policyAreas: data.metadata?.standardPolicyAreas || [],
      globalStats: data.globalStats || {},
    });
  } catch (error) {
    console.error('Error reading plans data:', error);
    return NextResponse.json(
      { error: 'Failed to load plans data' },
      { status: 500 }
    );
  }
}
