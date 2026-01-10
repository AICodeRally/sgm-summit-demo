/**
 * Document Upload API Endpoint
 *
 * POST /api/client/[tenantSlug]/documents/upload
 *
 * Accepts multipart file upload for compensation plan documents.
 * Validates file type, saves to disk, creates database record.
 *
 * Supported file types: PDF, DOCX, TXT, XLSX, XLS
 */

import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm, File as FormidableFile, Fields, Files } from 'formidable';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { db } from '@/lib/db';
import { triggerBackgroundProcessing } from '@/lib/services/document-processing';

// File type validation
const ALLOWED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadResult {
  success: boolean;
  documentId?: string;
  status?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

/**
 * Parse multipart form data from NextRequest
 */
async function parseFormData(request: NextRequest): Promise<{ fields: Fields; files: Files }> {
  // Convert NextRequest to Node.js IncomingMessage format
  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);

  // Create formidable parser
  const form = new IncomingForm({
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    // @ts-ignore - formidable types don't match exactly
    form.parse(readable, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

/**
 * Calculate SHA-256 checksum of file
 */
function calculateChecksum(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Ensure upload directory exists
 */
function ensureUploadDir(tenantSlug: string): string {
  const uploadDir = path.join(process.cwd(), 'uploads', tenantSlug);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
}

/**
 * POST /api/client/[tenantSlug]/documents/upload
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
): Promise<NextResponse<UploadResult>> {
  try {
    const { tenantSlug } = await params;

    // Get user from session/auth (simplified for now)
    const uploadedBy = request.headers.get('x-user-id') || 'system';

    // Parse multipart form data
    let fields: Fields;
    let files: Files;

    try {
      const parsed = await parseFormData(request);
      fields = parsed.fields;
      files = parsed.files;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse form data: ' + (error instanceof Error ? error.message : 'Unknown error'),
        },
        { status: 400 }
      );
    }

    // Extract uploaded file
    const fileArray = files.file;
    if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file uploaded',
        },
        { status: 400 }
      );
    }

    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    // Validate file type
    const mimeType = file.mimetype || '';
    if (!ALLOWED_FILE_TYPES.hasOwnProperty(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${mimeType}. Allowed types: PDF, DOCX, TXT, XLSX`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = ensureUploadDir(tenantSlug);

    // Generate unique file name
    const originalName = file.originalFilename || 'document';
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const timestamp = Date.now();
    const uniqueFileName = `${baseName}-${timestamp}${extension}`;
    const destinationPath = path.join(uploadDir, uniqueFileName);

    // Move file from temp location to uploads directory
    if (file.filepath) {
      fs.copyFileSync(file.filepath, destinationPath);
      fs.unlinkSync(file.filepath); // Clean up temp file
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'File path not found in upload',
        },
        { status: 500 }
      );
    }

    // Calculate checksum
    const checksum = calculateChecksum(destinationPath);

    // Get tenant ID (simplified - you may need to look this up from database)
    const tenantId = tenantSlug; // In production, map slug to ID

    // Create database record
    const uploadedDocument = await db.uploadedDocument.create({
      data: {
        tenantId,
        fileName: originalName,
        fileType: ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES],
        fileSize,
        filePath: destinationPath,
        checksum,
        status: 'UPLOADED',
        uploadedBy,
      },
    });

    // Trigger background parsing job (async, non-blocking)
    triggerBackgroundProcessing(uploadedDocument.id);

    return NextResponse.json({
      success: true,
      documentId: uploadedDocument.id,
      status: uploadedDocument.status,
      fileName: uploadedDocument.fileName,
      fileSize: uploadedDocument.fileSize,
    });
  } catch (error) {
    console.error('Document upload error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/client/[tenantSlug]/documents/upload
 * Returns upload configuration and limits
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    allowedFileTypes: Object.values(ALLOWED_FILE_TYPES),
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
  });
}
