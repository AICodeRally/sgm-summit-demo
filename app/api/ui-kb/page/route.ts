import { NextRequest, NextResponse } from 'next/server';
import { loadPageKbByPath } from '@/lib/ui-kb/loader';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get('path');

  if (!pathname) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    const kb = await loadPageKbByPath(pathname);
    if (!kb) {
      return NextResponse.json({ error: 'KB entry not found' }, { status: 404 });
    }

    return NextResponse.json(kb);
  } catch (error) {
    console.error('Failed to load KB entry:', error);
    return NextResponse.json({ error: 'Failed to load KB entry' }, { status: 500 });
  }
}
