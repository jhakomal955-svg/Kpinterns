import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";
import { after } from "next/server";

export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate Admin or User
    const auth = verifyAuth(request, ["Admin", "User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { userId, itemId, type, moduleId, completed } = await request.json();

    if (!userId || !itemId || !type || !moduleId) {
      return Response.json(
        { error: "Missing required fields (userId, itemId, type, moduleId)" },
        { status: 400 }
      );
    }

    // A User role can only modify progress for their own profile
    if (auth.user.role === "User" && userId !== auth.user._id) {
      return Response.json(
        { error: "Access denied: cannot update progress for another user." },
        { status: 403 }
      );
    }

    const User = createModel("User", UserModel);
    const Course = createModel("Course", CourseModel);
    const Internship = createModel("Internship", InternshipModel);

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "course") {
      const courseObj = await Course.findById(itemId);
      if (!courseObj) {
        return Response.json({ error: "Course not found" }, { status: 404 });
      }

      // Find user enrollment for this course
      const courseItem = (user.ActiveCources || []).find(
        (c) => (c.course?._id || c.course).toString() === itemId
      );

      if (!courseItem) {
        return Response.json({ error: "User is not enrolled in this course" }, { status: 400 });
      }

      if (!courseItem.completedModules) {
        courseItem.completedModules = [];
      }

      const modIdStr = moduleId.toString();
      if (completed) {
        if (!courseItem.completedModules.includes(modIdStr)) {
          courseItem.completedModules.push(modIdStr);
        }
      } else {
        courseItem.completedModules = courseItem.completedModules.filter(
          (id) => id !== modIdStr
        );
      }

      const totalModules = courseObj.content ? courseObj.content.length : 0;
      const completedCount = courseItem.completedModules.length;

      let progress = 0;
      if (totalModules > 0) {
        progress = Math.min(100, Math.max(0, Math.round((completedCount / totalModules) * 100)));
      }

      courseItem.progress = progress;
      const hasDatePassed = courseItem.endDate ? new Date() >= new Date(courseItem.endDate) : false;
      if (progress === 100 && (courseItem.courseStatus === "Completed" || hasDatePassed)) {
        courseItem.courseStatus = "Completed";
      } else if (courseItem.courseStatus === "Completed") {
        courseItem.courseStatus = "Completed";
      } else {
        courseItem.courseStatus = "Active";
      }

      user.markModified("ActiveCources");

    } else if (type === "internship") {
      const internshipObj = await Internship.findById(itemId);
      if (!internshipObj) {
        return Response.json({ error: "Internship not found" }, { status: 404 });
      }

      // Find user enrollment for this internship
      const internshipItem = (user.ActiveInternship || []).find(
        (i) => (i.internship?._id || i.internship).toString() === itemId
      );

      if (!internshipItem) {
        return Response.json({ error: "User is not enrolled in this internship" }, { status: 400 });
      }

      if (!internshipItem.completedModules) {
        internshipItem.completedModules = [];
      }

      const modIdStr = moduleId.toString();
      if (completed) {
        if (!internshipItem.completedModules.includes(modIdStr)) {
          internshipItem.completedModules.push(modIdStr);
        }
      } else {
        internshipItem.completedModules = internshipItem.completedModules.filter(
          (id) => id !== modIdStr
        );
      }

      const totalModules = internshipObj.content ? internshipObj.content.length : 0;
      const completedCount = internshipItem.completedModules.length;

      let progress = 0;
      if (totalModules > 0) {
        progress = Math.min(100, Math.max(0, Math.round((completedCount / totalModules) * 100)));
      }

      internshipItem.progress = progress;
      const hasDatePassed = internshipItem.endDate ? new Date() >= new Date(internshipItem.endDate) : false;
      if (progress === 100 && (internshipItem.internshipStatus === "Completed" || hasDatePassed)) {
        internshipItem.internshipStatus = "Completed";
      } else if (internshipItem.internshipStatus === "Completed") {
        internshipItem.internshipStatus = "Completed";
      } else {
        internshipItem.internshipStatus = "Active";
      }

      user.markModified("ActiveInternship");

    } else {
      return Response.json({ error: "Invalid type. Must be 'course' or 'internship'" }, { status: 400 });
    }

    user.updatedAt = new Date();
    await user.save();

    // Defer automated document checks to background (e.g. check if progress became 100% and a certificate is now due)
    after(async () => {
      try {
        await checkAndAutomateDocuments(userId);
      } catch (docError) {
        console.error("❌ Failed to run automated document checks on progress update in background:", docError);
      }
    });

    // Populate references to match standard login / details APIs
    const populatedUser = await User.findById(userId)
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");

    const userObj = populatedUser.toObject();
    delete userObj.password;

    // Add compatibility helpers normally populated at login
    userObj.internshipDomain = userObj.ActiveInternship?.[0]?.internship?.domain || userObj.ActiveInternship?.[0]?.internship?.category || "";
    userObj.mode = userObj.ActiveInternship?.[0]?.internship?.mode || "";

    return Response.json({
      success: true,
      message: "Progress updated successfully",
      data: userObj,
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating progress:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
