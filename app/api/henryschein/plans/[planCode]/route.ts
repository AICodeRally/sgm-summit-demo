import { NextRequest, NextResponse } from 'next/server';
import { loadHenryScheinPlan } from '@/lib/data/henryschein-plans';

/**
 * GET /api/henryschein/plans/[planCode]
 * Load a specific Henry Schein plan document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planCode: string }> }
) {
  try {
    const { planCode } = await params;

    const plan = loadHenryScheinPlan(planCode);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found', planCode },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error loading Henry Schein plan:', error);
    return NextResponse.json(
      { error: 'Failed to load plan' },
      { status: 500 }
    );
  }
}
