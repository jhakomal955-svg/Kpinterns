import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel, AttendanceModel } from "@/models";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { generateOfferLetter, generateCertificate, generateAttendanceCertificate, getSequentialNumber, getNextSequentialId } from "@/lib/pdfGenerator";
import { sendOfferLetterEmail, sendCertificateEmail } from "@/lib/nodemailer";

/**
 * Checks a user's enrolled courses and internships, and automatically generates,
 * uploads to Cloudinary, saves, and emails any missing offer letters or certificates.
 * 
 * @param {string} userId - User's MongoDB document ID
 * @returns {Promise<boolean>} - True if document generation/updates occurred, false otherwise
 */
export async function checkAndAutomateDocuments(userId, forceGenerate = false) {
  try {
    await connectDB();

    // Ensure models are registered in Mongoose context
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    const user = await User.findById(userId)
      .populate({
        path: "ActiveCources.course",
        populate: {
          path: "instructor.id",
          model: "Admin",
        }
      })
      .populate({
        path: "ActiveInternship.internship",
        populate: {
          path: "instructor.id",
          model: "Admin",
        }
      });

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

        const isInvalidDocUrl = (url) => {
          if (!url || typeof url !== "string") return true;
          if (url.includes("res.cloudinary.com")) return true;
          if ((url.includes("offer_letter") || url.includes("certificate") || url.includes("attendance")) && url.endsWith(".jpg")) return true;
          return false;
        };

        // A. Offer Letter Generation: Enrolled/Paid but offerLetterUrl is missing or invalid
        if ((item.paymentStatus === true || forceGenerate) && (!item.offerLetterUrl || isInvalidDocUrl(item.offerLetterUrl))) {
          const isReplaced = Boolean(item.offerLetterUrl);
          try {
            if (process.env.NODE_ENV === "development") {
              console.log(`[Document Automation] Generating offer letter for user: ${user.fullName}, program: ${programTitle}`);
            }
            
            const startYear = item.startDate
              ? new Date(item.startDate).getFullYear()
              : new Date().getFullYear();

            if (!item.offerLetterId) {
              if (item.certificateId && item.certificateId.startsWith("kpinterns/")) {
                item.offerLetterId = item.certificateId;
              } else {
                item.offerLetterId = await getNextSequentialId(startYear, verificationId);
              }
              if (!item.certificateId) {
                item.certificateId = item.offerLetterId;
              }
              hasChanges = true;
            }

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

            // Send Email with PDF Attachment (only if new, avoid spamming users during migration)
            if (!isReplaced) {
              await sendOfferLetterEmail(user.email, user.fullName, programTitle, pdfBuffer);
            }
            if (process.env.NODE_ENV === "development") {
              console.log(`[Document Automation] Offer letter successfully generated & sent for verification ID: ${verificationId}`);
            }
          } catch (err) {
            console.error(`[Document Automation] Failed to generate/email offer letter for verification ID: ${verificationId}`, err);
          }
        }

        // B. Internship Certificate Generation: Only generate if status is Completed, test is taken, and fee is paid (or forceGenerate is true)
        const isCompleted = item.internshipStatus === "Completed";
        
        let isTestPending = false;
        if (
          internship.test &&
          internship.test.status === "Published" &&
          internship.test.questions &&
          internship.test.questions.length > 0 &&
          !item.testTaken
        ) {
          isTestPending = true;
        }

        // Students who registered with 0 payment (e.g. college partner 0 rate) must pay original fee before documents generate
        const originalFee = (item.originalAmount && item.originalAmount > 0)
          ? item.originalAmount
          : (internship.RegistrationFee?.amount ? Number(internship.RegistrationFee.amount) : 500);

        const isPaymentPending = (item.amount === 0 || item.amount === undefined || item.amount === null || item.amount <= 0) && originalFee > 0;

        if (isCompleted && !isPaymentPending && (!isTestPending || forceGenerate)) {
          // A. Generate Attendance & Daily Activity Log Sheets (Annexure-2 & 3)
          if (!item.attendanceCertificateUrl || isInvalidDocUrl(item.attendanceCertificateUrl)) {
            try {
              if (process.env.NODE_ENV === "development") {
                console.log(`[Document Automation] Generating attendance sheet for user: ${user.fullName}, program: ${programTitle}`);
              }

              let percentage = 100;
              if (item.attendanceRate) {
                const parsed = parseInt(item.attendanceRate);
                if (!isNaN(parsed)) {
                  percentage = parsed;
                }
              }

              const Attendance = createModel("Attendance", AttendanceModel);
              let attendanceDoc = null;
              if (item.attendance) {
                attendanceDoc = await Attendance.findById(item.attendance);
              }

              if (attendanceDoc) {
                const records = attendanceDoc.records || [];
                const presentCount = records.filter(r => r.status === "Present").length;
                const explicitAbsentCount = records.filter(r => r.status === "Absent").length;
                const leaveCount = records.filter(r => r.status === "Leave").length;

                const startDate = item.startDate || item.paymentDate || new Date();
                const endDate = item.endDate || null;
                const totalCalendarDays = getElapsedDays(startDate, endDate);

                const recordedDays = records.length;
                const unmarkedDays = Math.max(0, totalCalendarDays - recordedDays);
                const absentCount = explicitAbsentCount + unmarkedDays;

                const denominator = totalCalendarDays - leaveCount;
                percentage = denominator > 0 ? Math.round((presentCount / denominator) * 100) : 100;
                percentage = Math.min(100, Math.max(0, percentage));
              }

              // Auto set minimum 85% attendance
              if (percentage < 85) {
                percentage = 85;
              }

              item.attendanceRate = `${percentage}%`;

              // Generate attendance sheet PDF
              const attendancePdfBuffer = await generateAttendanceCertificate(user, internship, verificationId, percentage);
              const attFilename = `attendance_sheet_${verificationId}_${Date.now()}`;
              const attUploadResult = await uploadBufferToCloudinary(attendancePdfBuffer, {
                public_id: attFilename,
                folder: "kpinterns/attendance_sheets",
                resource_type: "auto",
              });

              item.attendanceCertificateUrl = attUploadResult.secure_url;
              hasChanges = true;

              // Delete student daily attendance record to prevent database load
              if (item.attendance) {
                await Attendance.findByIdAndDelete(item.attendance);
                item.attendance = null;
              }
            } catch (attErr) {
              console.error(`[Document Automation] Failed to generate/upload attendance sheet for verification ID: ${verificationId}`, attErr);
            }
          }

          // B. Generate standard landscape Completion Certificate
          if (!item.certificationUrl || isInvalidDocUrl(item.certificationUrl)) {
            const isCertReplaced = Boolean(item.certificationUrl);
            try {
              if (process.env.NODE_ENV === "development") {
                console.log(`[Document Automation] Generating completion certificate for user: ${user.fullName}, program: ${programTitle}`);
              }
              const startYear = item.startDate
                ? new Date(item.startDate).getFullYear()
                : new Date().getFullYear();

              if (!item.certificateId) {
                if (item.offerLetterId && item.offerLetterId.startsWith("kpinterns/")) {
                  item.certificateId = item.offerLetterId;
                } else {
                  item.certificateId = await getNextSequentialId(startYear, verificationId);
                }
                if (!item.offerLetterId) {
                  item.offerLetterId = item.certificateId;
                }
                hasChanges = true;
              }

              const pdfBuffer = await generateCertificate(user, internship, "internship", verificationId);

              // Upload Buffer to Storage (Cloudflare R2)
              const filename = `internship_certificate_${verificationId}_${Date.now()}`;
              const uploadResult = await uploadBufferToCloudinary(pdfBuffer, {
                public_id: filename,
                folder: "kpinterns/certificates",
                resource_type: "auto",
              });

              // Update user record
              item.certificationUrl = uploadResult.secure_url;
              hasChanges = true;

              // Send Email with PDF Attachment (only if newly generated)
              if (!isCertReplaced) {
                await sendCertificateEmail(user.email, user.fullName, programTitle, "internship", pdfBuffer);
              }
              if (process.env.NODE_ENV === "development") {
                console.log(`[Document Automation] Completion certificate successfully generated & sent for verification ID: ${verificationId}`);
              }
            } catch (err) {
              console.error(`[Document Automation] Failed to generate/email internship certificate for verification ID: ${verificationId}`, err);
            }
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

        // A. Course Certificate Generation: Only generate if status is Completed
        const isCompleted = item.courseStatus === "Completed";
        if (isCompleted && (!item.certificateUrl || isInvalidDocUrl(item.certificateUrl))) {
          const isCourseCertReplaced = Boolean(item.certificateUrl);
          try {
            if (process.env.NODE_ENV === "development") {
              console.log(`[Document Automation] Generating course completion certificate for user: ${user.fullName}, course: ${programTitle}`);
            }

            const startYear = item.startDate
              ? new Date(item.startDate).getFullYear()
              : new Date().getFullYear();

            if (!item.certificateId) {
              item.certificateId = await getNextSequentialId(startYear, verificationId);
              hasChanges = true;
            }

            // Generate Landscape PDF Buffer
            const pdfBuffer = await generateCertificate(user, course, "course", verificationId);

            // Upload Buffer to Storage (Cloudflare R2)
            const filename = `course_certificate_${verificationId}_${Date.now()}`;
            const uploadResult = await uploadBufferToCloudinary(pdfBuffer, {
              public_id: filename,
              folder: "kpinterns/certificates",
              resource_type: "auto",
            });

            // Update user record
            item.certificateUrl = uploadResult.secure_url;
            hasChanges = true;

            // Send Email with PDF Attachment (only if newly generated)
            if (!isCourseCertReplaced) {
              await sendCertificateEmail(user.email, user.fullName, programTitle, "course", pdfBuffer);
            }
            if (process.env.NODE_ENV === "development") {
              console.log(`[Document Automation] Course completion certificate successfully generated & sent for verification ID: ${verificationId}`);
            }
          } catch (err) {
            console.error(`[Document Automation] Failed to generate/email course certificate for verification ID: ${verificationId}`, err);
          }
        }
      }
    }

    // Save changes to Database if any documents were generated
    if (hasChanges) {
      const cleanActiveInternship = (user.ActiveInternship || []).map((item) => {
        const obj = item.toObject ? item.toObject() : { ...item };
        return {
          ...obj,
          internship: item.internship?._id || item.internship,
          attendance: item.attendance?._id || item.attendance || null,
        };
      });

      const cleanActiveCources = (user.ActiveCources || []).map((item) => {
        const obj = item.toObject ? item.toObject() : { ...item };
        return {
          ...obj,
          course: item.course?._id || item.course,
        };
      });

      await User.findByIdAndUpdate(userId, {
        $set: {
          ActiveInternship: cleanActiveInternship,
          ActiveCources: cleanActiveCources,
          updatedAt: new Date(),
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log(`[Document Automation] Successfully updated and saved document URLs for user: ${user.fullName} (${userId})`);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Document Automation] Error occurred during checkAndAutomateDocuments:", error);
    return false;
  }
}

function getElapsedDays(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = endDate ? new Date(endDate) : null;
  if (end) end.setHours(0, 0, 0, 0);

  const referenceDate = (end && end < today) ? end : today;
  const diffTime = referenceDate.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays < 1 ? 1 : diffDays;
}
