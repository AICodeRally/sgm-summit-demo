import type { FileType } from '@/lib/contracts/document.contract';

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES: Record<FileType, string[]> = {
  md: ['text/markdown', 'text/plain', 'application/x-markdown'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  pdf: ['application/pdf'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

const FILE_EXTENSIONS: Record<FileType, string[]> = {
  md: ['.md', '.markdown'],
  docx: ['.docx'],
  pdf: ['.pdf'],
  xlsx: ['.xlsx'],
  pptx: ['.pptx'],
};

// 50MB limit for office docs
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validate file type by MIME type and extension
 */
export function validateFileType(file: File, expectedType: FileType): boolean {
  // Check MIME type
  const validMimeTypes = ALLOWED_FILE_TYPES[expectedType];
  if (!validMimeTypes.includes(file.type)) {
    return false;
  }

  // Check extension
  const fileName = file.name.toLowerCase();
  const validExtensions = FILE_EXTENSIONS[expectedType];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  return hasValidExtension;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size > 0 && file.size <= maxSize;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, expectedType: FileType): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  if (!validateFileType(file, expectedType)) {
    errors.push(`Invalid file type. Expected ${expectedType} file.`);
  }

  if (!validateFileSize(file)) {
    errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get file type from file extension
 */
export function getFileTypeFromExtension(fileName: string): FileType | null {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.')).toLowerCase();

  for (const [type, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return type as FileType;
    }
  }

  return null;
}

/**
 * Get MIME type for file type
 */
export function getMimeType(fileType: FileType): string {
  const mimeTypes: Record<FileType, string> = {
    md: 'text/markdown',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };

  return mimeTypes[fileType];
}

/**
 * Generate unique file name
 */
export function generateUniqueFileName(originalName: string, documentId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const fileName = originalName.substring(0, originalName.lastIndexOf('.'));
  const ext = originalName.substring(originalName.lastIndexOf('.'));

  return `${documentId}-${timestamp}-${random}${ext}`;
}
