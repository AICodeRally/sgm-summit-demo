import { NextResponse } from 'next/server';
import { GOVERNANCE_MATRIX, MATRIX_STATS, POLICY_AREAS, AUTHORITY_INFO } from '@/lib/data/synthetic/governance-matrix.data';

export async function GET() {
  return NextResponse.json({
    matrix: GOVERNANCE_MATRIX,
    stats: MATRIX_STATS,
    policyAreas: POLICY_AREAS,
    authorityInfo: AUTHORITY_INFO,
  });
}
