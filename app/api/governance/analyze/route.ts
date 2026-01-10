import { NextRequest, NextResponse } from 'next/server';
import { getGovLensClient } from '@/lib/services/govlens/api-client';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large documents

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jurisdiction = (formData.get('jurisdiction') as string) || 'CA';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, DOC, or TXT files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Call GovLens Python API
    const client = getGovLensClient();
    const result = await client.analyzeDocument(file, {
      jurisdiction,
      outputFormats: ['json', 'markdown'],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}
