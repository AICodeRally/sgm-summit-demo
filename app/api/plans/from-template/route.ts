import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/lib/bindings/registry';
import { CreatePlanFromTemplateSchema } from '@/lib/contracts/plan.contract';

/**
 * POST /api/plans/from-template
 * Create a new plan from a template
 */
export async function POST(request: NextRequest) {
  try {
    const registry = getRegistry();
    const planProvider = registry.getPlan();

    const body = await request.json();
    const data = CreatePlanFromTemplateSchema.parse(body);

    const plan = await planProvider.createFromTemplate(data);

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan from template:', error);
    return NextResponse.json(
      { error: 'Failed to create plan from template' },
      { status: 500 }
    );
  }
}
