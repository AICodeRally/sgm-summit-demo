/**
 * Generate SHA-256 checksum for file integrity verification
 *
 * Uses Web Crypto API (browser) or crypto module (Node.js)
 */
export async function generateChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Generate checksum from buffer (for server-side verification)
 */
export async function generateChecksumFromBuffer(buffer: Buffer): Promise<string> {
  // Use Node.js crypto module for server-side hashing
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    const { createHash } = await import('crypto');
    return createHash('sha256').update(buffer).digest('hex');
  }

  // Browser fallback: use Web Crypto API (convert Buffer to Uint8Array)
  const uint8Array = new Uint8Array(buffer);
  const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify file checksum
 */
export async function verifyChecksum(file: File, expectedChecksum: string): Promise<boolean> {
  const actualChecksum = await generateChecksum(file);
  return actualChecksum === expectedChecksum;
}
