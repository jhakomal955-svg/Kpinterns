import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ? process.env.R2_PUBLIC_URL.replace(/\/$/, "") : "";

let s3ClientInstance = null;

export function isR2Configured() {
  return Boolean(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME &&
    R2_PUBLIC_URL
  );
}

export function getR2Client() {
  if (!isR2Configured()) {
    return null;
  }
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
}

const MIME_MAP = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getMimeType(fileName = "", defaultType = "application/octet-stream") {
  const ext = fileName.split(".").pop().toLowerCase();
  return MIME_MAP[ext] || defaultType;
}

/**
 * Upload a Buffer to Cloudflare R2
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options (folder, public_id, fileName, contentType)
 * @returns {Promise<object>} - Returns object with secure_url, url, public_id
 */
export async function uploadBufferToR2(buffer, options = {}) {
  const client = getR2Client();
  if (!client) {
    throw new Error("Cloudflare R2 is not configured. Missing required environment variables.");
  }

  const folder = options.folder ? options.folder.replace(/^\/|\/$/g, "") : "uploads";
  let baseName = options.public_id || options.fileName || `file_${Date.now()}`;
  
  // Clean special characters
  baseName = baseName.replace(/[^a-zA-Z0-9_.-]/g, "_");

  // Inspect buffer magic bytes for 100% accurate file type detection
  const isPdfBuffer = buffer && buffer.length >= 4 && buffer.subarray(0, 4).toString() === "%PDF";
  const isPngBuffer = buffer && buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJpgBuffer = buffer && buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isWebpBuffer = buffer && buffer.length >= 12 && buffer.subarray(8, 12).toString() === "WEBP";

  // Determine Content-Type and extension
  let contentType = options.contentType;
  if (!contentType) {
    if (
      isPdfBuffer ||
      options.resource_type === "raw" ||
      baseName.toLowerCase().endsWith(".pdf") ||
      baseName.includes("offer_letter") ||
      baseName.includes("certificate") ||
      baseName.includes("attendance_sheet") ||
      baseName.includes("receipt")
    ) {
      contentType = "application/pdf";
    } else if (isPngBuffer) {
      contentType = "image/png";
    } else if (isJpgBuffer) {
      contentType = "image/jpeg";
    } else if (isWebpBuffer) {
      contentType = "image/webp";
    } else {
      contentType = getMimeType(baseName, "application/octet-stream");
    }
  }

  // Ensure extension in key if missing
  let key = `${folder}/${baseName}`;
  if (!key.includes(".")) {
    if (contentType === "application/pdf") {
      key += ".pdf";
    } else if (contentType === "image/png") {
      key += ".png";
    } else if (contentType === "image/jpeg") {
      key += ".jpg";
    } else if (contentType === "image/webp") {
      key += ".webp";
    }
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  console.log("✅ File uploaded to Cloudflare R2:", publicUrl);

  return {
    secure_url: publicUrl,
    url: publicUrl,
    public_id: key,
    key: key,
  };
}

/**
 * Upload fileUri (base64 or remote URL) to Cloudflare R2
 * @param {string} fileUri - Base64 data URI or HTTP URL
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Returns object with secure_url, url, public_id
 */
export async function uploadToR2(fileUri, options = {}) {
  let buffer;
  let detectedContentType = options.contentType;

  if (fileUri.startsWith("data:")) {
    const match = fileUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid base64 data URI format");
    }
    detectedContentType = match[1];
    buffer = Buffer.from(match[2], "base64");
  } else if (fileUri.startsWith("http://") || fileUri.startsWith("https://")) {
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URI: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    detectedContentType = response.headers.get("content-type") || detectedContentType;
  } else {
    throw new Error("Unsupported fileUri format for R2 upload.");
  }

  return uploadBufferToR2(buffer, {
    ...options,
    contentType: detectedContentType || options.contentType,
  });
}

/**
 * Delete a file from Cloudflare R2
 * @param {string} key - R2 Object Key
 * @returns {Promise<object>}
 */
export async function deleteFromR2(key) {
  const client = getR2Client();
  if (!client) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  // If a full public URL was passed instead of key, extract key
  let objectKey = key;
  if (key.startsWith("http")) {
    try {
      const urlObj = new URL(key);
      objectKey = urlObj.pathname.replace(/^\//, "");
    } catch {
      objectKey = key;
    }
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  });

  await client.send(command);
  console.log("✅ File deleted from Cloudflare R2:", objectKey);
  return { success: true, key: objectKey };
}
