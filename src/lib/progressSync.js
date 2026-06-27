import connectDB from "./mongodb";
import { createModel } from "./utils/schemaBuilder";
import { CourseModel, InternshipModel } from "@/models";

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
          let newStatus = "Active";
          if (item.progress === 100 && (item.internshipStatus === "Completed" || hasDatePassed)) {
            newStatus = "Completed";
          } else if (item.internshipStatus === "Completed") {
            newStatus = "Completed";
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
          let newStatus = "Active";
          if (item.progress === 100 && (item.courseStatus === "Completed" || hasDatePassed)) {
            newStatus = "Completed";
          } else if (item.courseStatus === "Completed") {
            newStatus = "Completed";
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
    user.markModified("ActiveInternship");
    user.markModified("ActiveCources");
    user.updatedAt = now;
    await user.save();
    return true;
  }

  return false;
}
