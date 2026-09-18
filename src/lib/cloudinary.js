/**
 * Storage Service (Powered by Cloudflare R2)
 * Maintains backward-compatible method names (uploadToCloudinary, uploadBufferToCloudinary, deleteFromCloudinary)
 * so existing API routes and document automation continue working seamlessly without Cloudinary dependency.
 */

import { isR2Configured, uploadBufferToR2, uploadToR2, deleteFromR2 } from "./r2";

if (isR2Configured()) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Active Storage: Cloudflare R2 (S3-Compatible)");
  console.log(`📦 Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${process.env.R2_PUBLIC_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
} else {
  console.warn("⚠️  Cloudflare R2 is not configured in .env.local!");
}

/**
 * Upload file URI (base64 or remote URL) to Cloudflare R2
 * @param {string} fileUri - File path, base64 or URL to upload
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Response with secure_url, url, public_id
 */
export async function uploadToCloudinary(fileUri, options = {}) {
  return await uploadToR2(fileUri, options);
}

/**
 * Upload file buffer directly to Cloudflare R2
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Response with secure_url, url, public_id
 */
export async function uploadBufferToCloudinary(buffer, options = {}) {
  return await uploadBufferToR2(buffer, options);
}

/**
 * Delete file from Cloudflare R2
 * @param {string} publicId - Public ID or key of the file to delete
 * @returns {Promise<object>} - Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  return await deleteFromR2(publicId);
}

export default {
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
