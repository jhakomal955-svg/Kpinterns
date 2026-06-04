/**
 * Cloudinary Configuration
 * Handles image and video uploads to Cloudinary
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary connection
if (cloudinary.config().cloud_name) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Cloudinary Connection Successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`☁️  Cloud Name: ${cloudinary.config().cloud_name}`);
  console.log(`⏰ Configuration Time: ${new Date().toLocaleString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
} else {
  console.warn("⚠️  Cloudinary configuration incomplete!");
}

/**
 * Upload file to Cloudinary
 * @param {string} fileUri - File path or URL to upload
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Cloudinary response with secure_url
 */
export async function uploadToCloudinary(fileUri, options = {}) {
  try {
    const defaultOptions = {
      resource_type: "auto",
      folder: "kpinterns",
      ...options,
    };

    const result = await cloudinary.uploader.upload(fileUri, defaultOptions);
    console.log("✅ File uploaded successfully:", result.secure_url);
    return result;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<object>} - Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("✅ File deleted successfully:", publicId);
    return result;
  } catch (error) {
    console.error("❌ Cloudinary deletion error:", error);
    throw error;
  }
}

/**
 * Get Cloudinary instance
 * @returns {object} - Cloudinary instance for custom operations
 */
export function getCloudinary() {
  return cloudinary;
}

export default cloudinary;
