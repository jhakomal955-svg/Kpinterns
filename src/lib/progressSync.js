import connectDB from "./mongodb";
import { createModel } from "./utils/schemaBuilder";
import { CourseModel, InternshipModel, UserModel } from "@/models";

/**
 * Synchronizes and recalculates the progress and completion status
 * for all active courses and internships of a user.
 * Marks fields as modified and saves the user if any changes occurred.
 * 
 * @param {Document} user - The mongoose user document
 * @returns {Promise<boolean>} - True if changes were made and saved, false otherwise
 */
export async function syncUserProgressAndStatus(user) {
  await connectDB();
  
  let hasChanges = false;
  const now = new Date();
  
  const Course = createModel("Course", CourseModel);
  const Internship = createModel("Internship", InternshipModel);

  // 1. Recalculate Internships
  if (user.ActiveInternship && user.ActiveInternship.length > 0) {
    for (const item of user.ActiveInternship) {
      if (item.internship) {
        // Resolve the actual internship document (whether populated or just an ID)
        let internshipDoc = item.internship;
        if (internshipDoc && !internshipDoc.content) {
          internshipDoc = await Internship.findById(internshipDoc._id || internshipDoc);
        }
        
        if (internshipDoc) {
          const total = internshipDoc.content ? internshipDoc.content.length : 0;
          const completed = item.completedModules ? item.completedModules.length : 0;
          
          let calculatedProgress = 0;
          if (total > 0) {
            calculatedProgress = Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
          }

          if (item.progress !== calculatedProgress) {
            item.progress = calculatedProgress;
            hasChanges = true;
          }

          // Re-calculate completion status
          const hasDatePassed = item.endDate ? now >= new Date(item.endDate) : false;

          let isTestPending = false;
          if (
            internshipDoc.test &&
            internshipDoc.test.status === "Published" &&
            internshipDoc.test.questions &&
            internshipDoc.test.questions.length > 0 &&
            !item.testTaken
          ) {
            isTestPending = true;
          }

          const originalFee = (item.originalAmount && item.originalAmount > 0)
            ? item.originalAmount
            : (internshipDoc.RegistrationFee?.amount ? Number(internshipDoc.RegistrationFee.amount) : 500);

          const isPaymentPending = item.paymentStatus === false || ((item.amount === 0 || item.amount === undefined || item.amount === null || item.amount <= 0) && originalFee > 0);

          // Only auto-complete on date passed if paid AND test is not pending
          const canAutoCompleteOnDate = hasDatePassed && !isPaymentPending && !isTestPending;

          let newStatus = "Active";
          if (canAutoCompleteOnDate || item.progress === 100 || item.internshipStatus === "Completed") {
            newStatus = "Completed";
            if (canAutoCompleteOnDate && item.progress !== 100) {
              item.progress = 100;
              hasChanges = true;
            }
          } else {
            newStatus = "Active";
          }

          if (item.internshipStatus !== newStatus) {
            item.internshipStatus = newStatus;
            hasChanges = true;
          }
        }
      }
    }
  }

  // 2. Recalculate Courses
  if (user.ActiveCources && user.ActiveCources.length > 0) {
    for (const item of user.ActiveCources) {
      if (item.course) {
        // Resolve the actual course document (whether populated or just an ID)
        let courseDoc = item.course;
        if (courseDoc && !courseDoc.content) {
          courseDoc = await Course.findById(courseDoc._id || courseDoc);
        }

        if (courseDoc) {
          const total = courseDoc.content ? courseDoc.content.length : 0;
          const completed = item.completedModules ? item.completedModules.length : 0;
          
          let calculatedProgress = 0;
          if (total > 0) {
            calculatedProgress = Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
          }

          if (item.progress !== calculatedProgress) {
            item.progress = calculatedProgress;
            hasChanges = true;
          }

          // Re-calculate completion status
          const hasDatePassed = item.endDate ? now >= new Date(item.endDate) : false;

          const originalCourseFee = (item.originalAmount && item.originalAmount > 0)
            ? item.originalAmount
            : (courseDoc.price ? Number(courseDoc.price) : 0);

          const isCoursePaymentPending = item.paymentStatus === false || ((item.amount === 0 || item.amount === undefined || item.amount === null || item.amount <= 0) && originalCourseFee > 0);

          // Only auto-complete on date passed if paid
          const canAutoCompleteCourseOnDate = hasDatePassed && !isCoursePaymentPending;

          let newStatus = "Active";
          if (canAutoCompleteCourseOnDate || item.progress === 100 || item.courseStatus === "Completed") {
            newStatus = "Completed";
            if (canAutoCompleteCourseOnDate && item.progress !== 100) {
              item.progress = 100;
              hasChanges = true;
            }
          } else {
            newStatus = "Active";
          }

          if (item.courseStatus !== newStatus) {
            item.courseStatus = newStatus;
            hasChanges = true;
          }
        }
      }
    }
  }

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

    const User = createModel("User", UserModel);
    await User.findByIdAndUpdate(user._id, {
      $set: {
        ActiveInternship: cleanActiveInternship,
        ActiveCources: cleanActiveCources,
        updatedAt: now,
      },
    });
    return true;
  }

  return false;
}
