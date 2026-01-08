/**
 * Google Cloud Storage utility for audio file management
 *
 * Handles upload, retrieval, and deletion of recitation audio files.
 * Uses signed URLs for secure, private access to audio files.
 */

import { Storage } from '@google-cloud/storage';

// Initialize GCS client
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: process.env.GCS_CREDENTIALS
    ? JSON.parse(process.env.GCS_CREDENTIALS)
    : undefined,
  // Alternative: use key file path
  // keyFilename: process.env.GCS_KEY_FILE_PATH,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'simakin-recitation-audio-dev';
const bucket = storage.bucket(bucketName);

/**
 * Upload audio file to Google Cloud Storage
 *
 * @param file - The audio file to upload (File or Blob)
 * @param userId - User ID for organizing files
 * @param recitationId - Recitation ID for unique naming
 * @returns Public URL to the uploaded file (requires signed URL for access)
 */
export async function uploadAudioToGCS(
  file: File | Blob,
  userId: string,
  recitationId: string
): Promise<string> {
  try {
    // Create a unique file path: users/{userId}/recitations/{recitationId}.webm
    const fileName = `users/${userId}/recitations/${recitationId}.webm`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to GCS
    const gcsFile = bucket.file(fileName);
    await gcsFile.save(fileBuffer, {
      metadata: {
        contentType: file.type || 'audio/webm',
        metadata: {
          userId,
          recitationId,
          uploadedAt: new Date().toISOString(),
        },
      },
      // Make file private (not publicly accessible)
      public: false,
    });

    console.log(`[GCS] Uploaded audio file: ${fileName}`);

    // Return the GCS URI (not a signed URL yet)
    return `gs://${bucketName}/${fileName}`;
  } catch (error) {
    console.error('[GCS] Error uploading audio:', error);
    throw new Error('Failed to upload audio to cloud storage');
  }
}

/**
 * Generate a signed URL for private audio access
 *
 * @param gcsUri - GCS URI (gs://bucket/path/to/file)
 * @param expiresInMinutes - URL expiration time in minutes (default: 60)
 * @returns Signed URL that expires after specified time
 */
export async function getSignedAudioUrl(
  gcsUri: string,
  expiresInMinutes: number = 60
): Promise<string> {
  try {
    // Extract file path from GCS URI (gs://bucket/path → path)
    const filePath = gcsUri.replace(`gs://${bucketName}/`, '');

    const [signedUrl] = await bucket.file(filePath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return signedUrl;
  } catch (error) {
    console.error('[GCS] Error generating signed URL:', error);
    throw new Error('Failed to generate audio access URL');
  }
}

/**
 * Delete audio file from Google Cloud Storage
 *
 * @param gcsUri - GCS URI (gs://bucket/path/to/file)
 */
export async function deleteAudioFromGCS(gcsUri: string): Promise<void> {
  try {
    const filePath = gcsUri.replace(`gs://${bucketName}/`, '');
    await bucket.file(filePath).delete();

    console.log(`[GCS] Deleted audio file: ${filePath}`);
  } catch (error) {
    console.error('[GCS] Error deleting audio:', error);
    // Don't throw error - deletion failure shouldn't block other operations
  }
}

/**
 * Check if audio file exists in GCS
 *
 * @param gcsUri - GCS URI (gs://bucket/path/to/file)
 * @returns true if file exists, false otherwise
 */
export async function audioExistsInGCS(gcsUri: string): Promise<boolean> {
  try {
    const filePath = gcsUri.replace(`gs://${bucketName}/`, '');
    const [exists] = await bucket.file(filePath).exists();
    return exists;
  } catch (error) {
    console.error('[GCS] Error checking file existence:', error);
    return false;
  }
}

/**
 * Get audio file metadata from GCS
 *
 * @param gcsUri - GCS URI (gs://bucket/path/to/file)
 * @returns File metadata including size, content type, and custom metadata
 */
export async function getAudioMetadata(gcsUri: string): Promise<{
  size: number;
  contentType: string;
  createdAt: string;
  userId?: string;
  recitationId?: string;
}> {
  try {
    const filePath = gcsUri.replace(`gs://${bucketName}/`, '');
    const [metadata] = await bucket.file(filePath).getMetadata();

    return {
      size: parseInt(metadata.size || '0'),
      contentType: metadata.contentType || 'audio/webm',
      createdAt: metadata.timeCreated || new Date().toISOString(),
      userId: metadata.metadata?.userId,
      recitationId: metadata.metadata?.recitationId,
    };
  } catch (error) {
    console.error('[GCS] Error getting file metadata:', error);
    throw new Error('Failed to get audio file metadata');
  }
}
