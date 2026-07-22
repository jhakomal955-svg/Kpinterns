/**
 * Cloudinary Configuration
 * Handles image and video uploads to Cloudinary
 */

import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

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
 * Stream a file buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Cloudinary response with secure_url
 */
export async function uploadBufferToCloudinary(buffer, options = {}, retries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const currentOptions = {
          resource_type: "auto",
          folder: "kpinterns",
          timeout: 600000, // 10 minutes timeout
          ...options,
        };

        // If a previous attempt failed due to network/502/ECONNRESET with "auto", fallback resource_type
        if (attempt === 2 && currentOptions.resource_type === "auto") {
          currentOptions.resource_type = "raw";
        } else if (attempt === 3 && (currentOptions.resource_type === "auto" || currentOptions.resource_type === "raw")) {
          currentOptions.resource_type = "image";
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          currentOptions,
          (error, res) => {
            if (error) {
              reject(error);
            } else {
              resolve(res);
            }
          }
        );

        Readable.from(buffer).pipe(uploadStream);
      });

      console.log(`✅ File uploaded successfully via stream (attempt ${attempt}):`, result.secure_url);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Cloudinary stream upload attempt ${attempt}/${retries} failed: ${error.message || error.code || error}`);
      if (attempt < retries) {
        // Exponential delay before retry (1s, 2s)
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  console.error("❌ Cloudinary upload stream error after retries:", lastError);
  throw lastError;
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
