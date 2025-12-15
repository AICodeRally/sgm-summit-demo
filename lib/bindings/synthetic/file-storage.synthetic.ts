import type { IFileStoragePort } from '@/lib/ports/file-storage.port';
import { generateChecksum } from '@/lib/utils/checksum';

/**
 * Synthetic File Storage Provider - In-memory implementation
 *
 * Simulates file storage without actually persisting files.
 * In production, this would be replaced with S3 or local file system implementations.
 */
export class SyntheticFileStorageProvider implements IFileStoragePort {
  private files: Map<string, { buffer: Buffer; contentType: string; checksum: string }> = new Map();

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: File,
    bucket: string,
    fileName: string
  ): Promise<{ path: string; checksum: string; size: number }> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const checksum = await generateChecksum(file);
    const path = `${bucket}/${fileName}`;

    this.files.set(path, {
      buffer,
      contentType: file.type || 'application/octet-stream',
      checksum,
    });

    return {
      path,
      checksum,
      size: buffer.length,
    };
  }

  /**
   * Download file from storage
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const file = this.files.get(filePath);
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }
    return file.buffer;
  }

  /**
   * Get file URL (for S3 or CDN)
   * In synthetic mode, returns the file path
   */
  async getFileUrl(filePath: string): Promise<string> {
    const file = this.files.get(filePath);
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Return a data URL for small files
    if (file.buffer.length < 1000000) {
      // Only for small files (< 1MB)
      return `data:${file.contentType};base64,${file.buffer.toString('base64')}`;
    }

    // For larger files, return the file path
    return filePath;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    this.files.delete(filePath);
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    return this.files.has(filePath);
  }

  /**
   * Get file metadata (size, type, etc.)
   */
  async getFileMetadata(filePath: string): Promise<{ size: number; contentType: string }> {
    const file = this.files.get(filePath);
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    return {
      size: file.buffer.length,
      contentType: file.contentType,
    };
  }

  /**
   * Copy file from source to destination
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<{ path: string; checksum: string }> {
    const file = this.files.get(sourcePath);
    if (!file) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    this.files.set(destinationPath, {
      ...file,
      buffer: Buffer.from(file.buffer),
    });

    return {
      path: destinationPath,
      checksum: file.checksum,
    };
  }
}
