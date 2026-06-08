import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { generateOfferLetter, generateCertificate } from "@/lib/pdfGenerator";
import { sendOfferLetterEmail, sendCertificateEmail } from "@/lib/nodemailer";

/**
 * Checks a user's enrolled courses and internships, and automatically generates,
 * uploads to Cloudinary, saves, and emails any missing offer letters or certificates.
 * 
 * @param {string} userId - User's MongoDB document ID
 * @returns {Promise<boolean>} - True if document generation/updates occurred, false otherwise
 */
export async function checkAndAutomateDocuments(userId) {
  try {
    await connectDB();

    // Ensure models are registered in Mongoose context
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    const user = await User.findById(userId)
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");

    if (!user) {
      console.warn(`[Document Automation] User not found for ID: ${userId}`);
      return false;
    }

    let hasChanges = false;

    // 1. Process Internship Documents (Offer Letters & Certificates)
    if (user.ActiveInternship && user.ActiveInternship.length > 0) {
      for (let i = 0; i < user.ActiveInternship.length; i++) {
        const item = user.ActiveInternship[i];
        const internship = item.internship;
        const verificationId = item._id.toString();

        if (!internship) continue;

        const programTitle = internship.title || internship.position || "Internship Program";

        // A. Offer Letter Generation: Enrolled/Paid but offerLetterUrl is missing
        if (item.paymentStatus === true && !item.offerLetterUrl) {
          try {
            console.log(`[Document Automation] Generating offer letter for user: ${user.fullName}, program: ${programTitle}`);
            
            // Generate PDF Buffer
            const pdfBuffer = await generateOfferLetter(user, internship, verificationId);

            // Upload Buffer to Cloudinary
            const filename = `offer_letter_${verificationId}_${Date.now()}`;
            const uploadResult = await uploadBufferToCloudinary(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/offer_letters",
              resource_type: "auto",
            });

            // Update user record
            item.offerLetterUrl = uploadResult.secure_url;
            hasChanges = true;

            // Send Email with PDF Attachment
            await sendOfferLetterEmail(user.email, user.fullName, programTitle, pdfBuffer);
            console.log(`[Document Automation] Offer letter successfully generated & sent for verification ID: ${verificationId}`);
          } catch (err) {
            console.error(`[Document Automation] Failed to generate/email offer letter for verification ID: ${verificationId}`, err);
          }
        }

        // B. Internship Certificate Generation: Completed or 100% progress but certificationUrl is missing
        const isCompleted = item.internshipStatus === "Completed" || item.progress === 100;
        if (isCompleted && !item.certificationUrl) {
          try {
            console.log(`[Document Automation] Generating completion certificate for user: ${user.fullName}, program: ${programTitle}`);

            // Ensure progress is updated to 100% and status is marked Completed
            item.progress = 100;
            item.internshipStatus = "Completed";

            // Generate Landscape PDF Buffer
            const pdfBuffer = await generateCertificate(user, internship, "internship", verificationId);

            // Upload Buffer to Cloudinary
            const filename = `internship_certificate_${verificationId}_${Date.now()}`;
            const uploadResult = await uploadBufferToCloudinary(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/certificates",
              resource_type: "auto",
            });

            // Update user record
            item.certificationUrl = uploadResult.secure_url;
            hasChanges = true;

            // Send Email with PDF Attachment
            await sendCertificateEmail(user.email, user.fullName, programTitle, "internship", pdfBuffer);
            console.log(`[Document Automation] Completion certificate successfully generated & sent for verification ID: ${verificationId}`);
          } catch (err) {
            console.error(`[Document Automation] Failed to generate/email internship certificate for verification ID: ${verificationId}`, err);
          }
        }
      }
    }

    // 2. Process Course Documents (Completion Certificates)
    if (user.ActiveCources && user.ActiveCources.length > 0) {
      for (let i = 0; i < user.ActiveCources.length; i++) {
        const item = user.ActiveCources[i];
        const course = item.course;
        const verificationId = item._id.toString();

        if (!course) continue;

        const programTitle = course.title || "Specialized Course";

        // A. Course Certificate Generation: Completed or 100% progress but certificateUrl is missing
        const isCompleted = item.courseStatus === "Completed" || item.progress === 100;
        if (isCompleted && !item.certificateUrl) {
          try {
            console.log(`[Document Automation] Generating course completion certificate for user: ${user.fullName}, course: ${programTitle}`);

            // Ensure progress is updated to 100% and status is marked Completed
            item.progress = 100;
            item.courseStatus = "Completed";

            // Generate Landscape PDF Buffer
            const pdfBuffer = await generateCertificate(user, course, "course", verificationId);

            // Upload Buffer to Cloudinary
            const filename = `course_certificate_${verificationId}_${Date.now()}`;
            const uploadResult = await uploadBufferToCloudinary(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/certificates",
              resource_type: "auto",
            });

            // Update user record
            item.certificateUrl = uploadResult.secure_url;
            hasChanges = true;

            // Send Email with PDF Attachment
            await sendCertificateEmail(user.email, user.fullName, programTitle, "course", pdfBuffer);
            console.log(`[Document Automation] Course completion certificate successfully generated & sent for verification ID: ${verificationId}`);
          } catch (err) {
            console.error(`[Document Automation] Failed to generate/email course certificate for verification ID: ${verificationId}`, err);
          }
        }
      }
    }

    // Save changes to Database if any documents were generated
    if (hasChanges) {
      user.markModified("ActiveInternship");
      user.markModified("ActiveCources");
      user.updatedAt = new Date();
      await user.save();
      console.log(`[Document Automation] Successfully updated and saved document URLs for user: ${user.fullName} (${userId})`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Document Automation] Error occurred during checkAndAutomateDocuments:", error);
    return false;
  }
}
