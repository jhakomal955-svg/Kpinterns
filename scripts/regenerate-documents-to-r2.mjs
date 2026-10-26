/**
 * Document Regeneration & Migration Script for Cloudflare R2
 * 
 * Usage:
 *   node scripts/regenerate-documents-to-r2.mjs
 * 
 * This script connects to MongoDB, finds all users with broken Cloudinary URLs
 * or missing documents, regenerates Offer Letters & Certificates using pdfkit,
 * uploads them to Cloudflare R2, and updates the MongoDB URLs.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local FIRST before other modules evaluate
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const { default: mongoose } = await import("mongoose");
const { uploadBufferToR2, isR2Configured } = await import("../src/lib/r2.js");
const { generateOfferLetter, generateCertificate, generateAttendanceCertificate } = await import("../src/lib/pdfGenerator.js");

async function run() {
  console.log("==================================================");
  console.log("🔄 Starting Document Migration to Cloudflare R2");
  console.log("==================================================");

  if (!isR2Configured()) {
    console.error("❌ Cloudflare R2 is NOT configured in .env.local!");
    console.error("Please add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.");
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB.");

  // Access collections directly
  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");
  const internshipsCollection = db.collection("internships");
  const coursesCollection = db.collection("courses");

  // Fetch internships and courses into memory for quick lookup
  const allInternships = await internshipsCollection.find({}).toArray();
  const internshipMap = new Map(allInternships.map(i => [i._id.toString(), i]));

  const allCourses = await coursesCollection.find({}).toArray();
  const courseMap = new Map(allCourses.map(c => [c._id.toString(), c]));

  // Find users who have internships or courses
  const users = await usersCollection.find({
    $or: [
      { "ActiveInternship.0": { $exists: true } },
      { "ActiveCources.0": { $exists: true } }
    ]
  }).toArray();

  console.log(`Found ${users.length} users to inspect.`);
  let totalFixed = 0;

  for (const user of users) {
    let userModified = false;

    // CLI flags
    const forceAll = process.argv.includes("--force");
    const forceAttendance = process.argv.includes("--attendance");
    const forceOffer = process.argv.includes("--offer");

    // 1. Check Internship Documents
    if (user.ActiveInternship && Array.isArray(user.ActiveInternship)) {
      for (const item of user.ActiveInternship) {
        const internshipId = item.internship ? item.internship.toString() : null;
        const internship = internshipMap.get(internshipId);
        if (!internship) continue;

        const verificationId = item._id ? item._id.toString() : new mongoose.Types.ObjectId().toString();

        // Check Offer Letter
        const hasCloudinaryOfferLetter = item.offerLetterUrl && item.offerLetterUrl.includes("res.cloudinary.com");
        const needsOfferLetter = ((item.paymentStatus === true || item.amount > 0 || item.internshipStatus === "Completed") && (!item.offerLetterUrl || hasCloudinaryOfferLetter)) || forceAll || forceOffer;

        if (needsOfferLetter) {
          try {
            console.log(`📄 Regenerating Offer Letter for ${user.fullName || user.email} (${internship.title || "Internship"})...`);
            const pdfBuffer = await generateOfferLetter(user, internship, verificationId);
            const filename = `offer_letter_${verificationId}_${Date.now()}`;
            const uploadRes = await uploadBufferToR2(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/offer_letters",
              contentType: "application/pdf",
            });
            item.offerLetterUrl = uploadRes.secure_url;
            userModified = true;
            totalFixed++;
          } catch (err) {
            console.error(`⚠️ Failed to generate offer letter for user ${user.email}:`, err.message);
          }
        }

        // Check Internship Completion Certificate
        const isCompleted = item.internshipStatus === "Completed";
        const hasCloudinaryCert = item.certificationUrl && item.certificationUrl.includes("res.cloudinary.com");
        const needsCert = (isCompleted && (!item.certificationUrl || hasCloudinaryCert)) || forceAll;

        if (needsCert) {
          try {
            console.log(`🎓 Regenerating Certificate for ${user.fullName || user.email} (${internship.title || "Internship"})...`);
            const pdfBuffer = await generateCertificate(user, internship, "internship", verificationId);
            const filename = `internship_certificate_${verificationId}_${Date.now()}`;
            const uploadRes = await uploadBufferToR2(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/certificates",
              contentType: "application/pdf",
            });
            item.certificationUrl = uploadRes.secure_url;
            userModified = true;
            totalFixed++;
          } catch (err) {
            console.error(`⚠️ Failed to generate certificate for user ${user.email}:`, err.message);
          }
        }

        // Check Internship Attendance Sheet (Annexure-2 & 3)
        const hasCloudinaryAttendance = item.attendanceCertificateUrl && item.attendanceCertificateUrl.includes("res.cloudinary.com");
        const needsAttendance = (isCompleted && (!item.attendanceCertificateUrl || hasCloudinaryAttendance)) || forceAll || forceAttendance;

        if (needsAttendance) {
          try {
            console.log(`📋 Regenerating Attendance Sheet for ${user.fullName || user.email} (${internship.title || "Internship"})...`);
            const percentage = 100;
            item.attendanceRate = "100%";

            const pdfBuffer = await generateAttendanceCertificate(user, internship, verificationId, percentage);
            const filename = `attendance_sheet_${verificationId}_${Date.now()}`;
            const uploadRes = await uploadBufferToR2(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/attendance_sheets",
              contentType: "application/pdf",
            });
            item.attendanceCertificateUrl = uploadRes.secure_url;
            userModified = true;
            totalFixed++;
          } catch (err) {
            console.error(`⚠️ Failed to generate attendance sheet for user ${user.email}:`, err.message);
          }
        }
      }
    }

    // 2. Check Course Documents
    if (user.ActiveCources && Array.isArray(user.ActiveCources)) {
      for (const item of user.ActiveCources) {
        const courseId = item.course ? item.course.toString() : null;
        const course = courseMap.get(courseId);
        if (!course) continue;

        const verificationId = item._id ? item._id.toString() : new mongoose.Types.ObjectId().toString();
        const isCompleted = item.courseStatus === "Completed";
        const hasCloudinaryCert = item.certificateUrl && item.certificateUrl.includes("res.cloudinary.com");
        const needsCert = isCompleted && (!item.certificateUrl || hasCloudinaryCert);

        if (needsCert) {
          try {
            console.log(`🎓 Regenerating Course Certificate for ${user.fullName || user.email} (${course.title || "Course"})...`);
            const pdfBuffer = await generateCertificate(user, course, "course", verificationId);
            const filename = `course_certificate_${verificationId}_${Date.now()}`;
            const uploadRes = await uploadBufferToR2(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/certificates",
              contentType: "application/pdf",
            });
            item.certificateUrl = uploadRes.secure_url;
            userModified = true;
            totalFixed++;
          } catch (err) {
            console.error(`⚠️ Failed to generate course cert for user ${user.email}:`, err.message);
          }
        }
      }
    }

    // Save user document if updated
    if (userModified) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            ActiveInternship: user.ActiveInternship,
            ActiveCources: user.ActiveCources,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Saved updated documents for user: ${user.fullName || user.email}`);
    }
  }

  console.log("==================================================");
  console.log(`🎉 Migration Completed! Total documents regenerated & saved to R2: ${totalFixed}`);
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error during migration:", err);
  process.exit(1);
});
