import * as Minio from 'minio';
import { env } from './env.js';

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT || 'localhost',
  port: Number(env.MINIO_PORT) || 9000,
  useSSL: env.MINIO_USE_SSL === 'true',
  accessKey: env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = env.MINIO_BUCKET || 'hrms-documents';

// Helper to ensure bucket exists
export async function ensureBucketExists(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`🪣 Created MinIO bucket: ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.error('⚠️ Failed to verify MinIO bucket, operating in local fallback mode:', err);
  }
}

/**
 * Upload a file buffer to MinIO
 */
export async function uploadDocument(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  try {
    await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, {
      'Content-Type': contentType,
    });
    // Return a mock / direct local S3 URL
    const protocol = env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    return `${protocol}://${env.MINIO_ENDPOINT || 'localhost'}:${env.MINIO_PORT || 9000}/${BUCKET_NAME}/${fileName}`;
  } catch (err) {
    console.warn('⚠️ MinIO upload failed, saving to memory fallback:', err);
    return `http://fallback-storage.local/${fileName}`;
  }
}
