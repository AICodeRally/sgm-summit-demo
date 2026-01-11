import { NextRequest } from 'next/server';
import { handleKbccReport } from '@/lib/kbcc/report';

export async function POST(request: NextRequest) {
  return handleKbccReport(request);
}
