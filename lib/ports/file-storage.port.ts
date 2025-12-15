/**
 * IFileStoragePort - Abstraction layer for file storage
 *
 * Supports both local file system and S3 implementations
 * Allows swapping between synthetic (local), mapped (S3), and live modes
 */
export interface IFileStoragePort {
  /**
   * Upload file and store
   * - Validates file type and size
   * - Generates unique path
   * - Returns file path and checksum
   */
  uploadFile(
    file: File,
    bucket: string,
    fileName: string
  ): Promise<{ path: string; checksum: string; size: number }>;

  /**
   * Download file
   */
  downloadFile(filePath: string): Promise<Buffer>;

  /**
   * Get file URL (for retrieval or preview)
   * - For local: returns relative path
   * - For S3: returns signed URL
   */
  getFileUrl(filePath: string): Promise<string>;

  /**
   * Delete file
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>;

  /**
   * Get file metadata (size, type, etc.)
   */
  getFileMetadata(filePath: string): Promise<{ size: number; contentType: string }>;

  /**
   * Copy file (for version creation)
   */
  copyFile(sourcePath: string, destinationPath: string): Promise<{ path: string; checksum: string }>;
}
