/**
 * Course API Routes
 * Complete CRUD operations for Course model
 * GET - Get all courses or a specific course
 * POST - Create a new course
 * PUT - Update a course
 * DELETE - Delete a course
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { CourseModel, AdminModel, UserModel } from "@/models";
import { verifyAuth, getAuthUser } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const courseId = url.searchParams.get("id");
    const department = url.searchParams.get("department");

    createModel("Admin", AdminModel);
    const Course = createModel("Course", CourseModel);

    // 1. Fetching a single course by ID
    if (courseId) {
      const course = await Course.findById(courseId)
        .populate("instructor.id", "name role bio");

      if (!course) {
        return Response.json({ error: "Course not found" }, { status: 404 });
      }

      // Check if user has full access (Admin, Assigned Instructor, or Enrolled User)
      let hasFullAccess = false;
      const decoded = getAuthUser(request);
      
      if (decoded) {
        if (decoded.role === "Admin") {
          hasFullAccess = true;
        } else if (decoded.role === "Instructor") {
          hasFullAccess = course.instructor?.some(inst => {
            const instId = typeof inst.id === "object" ? inst.id?._id?.toString() : inst.id?.toString();
            return instId === decoded._id;
          });
        } else if (decoded.role === "User") {
          const User = createModel("User", UserModel);
          const userDoc = await User.findById(decoded._id);
          if (userDoc) {
            hasFullAccess = userDoc.ActiveCources?.some(
              c => (c.course?.toString() === courseId) && c.paymentStatus === true
            );
          }
        }
      }

      const courseObj = course.toObject();

      // Strip sensitive data if they don't have full access
      if (!hasFullAccess && courseObj.content) {
        courseObj.content = courseObj.content.map(mod => ({
          _id: mod._id,
          title: mod.title,
          // Strip VideoUrl, pdfurl, textContent, externalink, imageurl
        }));
      }

      return Response.json({ success: true, data: courseObj }, { status: 200 });
    } 
    
    // 2. Fetching courses filtered by department
    if (department) {
      const courses = await Course.find({ department })
        .populate("instructor.id", "name role avatar");

      // Strip content details for general catalog browse
      const decoded = getAuthUser(request);
      const isAdminOrInstructor = decoded && ["Admin", "Instructor"].includes(decoded.role);
      
      const sanitizedCourses = courses.map(c => {
        const obj = c.toObject();
        if (!isAdminOrInstructor && obj.content) {
          obj.content = obj.content.map(mod => ({ _id: mod._id, title: mod.title }));
        }
        return obj;
      });

      return Response.json(
        { success: true, data: sanitizedCourses, total: sanitizedCourses.length },
        { status: 200 },
      );
    } 

    // 3. Fetching all courses
    const courses = await Course.find().populate("instructor.id", "name role avatar");

    const decoded = getAuthUser(request);
    const isAdminOrInstructor = decoded && ["Admin", "Instructor"].includes(decoded.role);
    
    const sanitizedCourses = courses.map(c => {
      const obj = c.toObject();
      if (!isAdminOrInstructor && obj.content) {
        obj.content = obj.content.map(mod => ({ _id: mod._id, title: mod.title }));
      }
      return obj;
    });

    return Response.json(
      { success: true, data: sanitizedCourses, total: sanitizedCourses.length },
      { status: 200 },
    );

  } catch (error) {
    console.error("Error fetching courses:", error);
    return Response.json(
      { error: "Failed to fetch courses", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate Admin
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const data = await request.json();

    // Validate required fields based on model
    const requiredFields = [
      "title",
      "description",
      "department",
      "instructor",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    // Validate title length
    if (data.title.length < 5) {
      return Response.json(
        { error: "Title must be at least 5 characters long" },
        { status: 400 },
      );
    }

    // Validate description length
    if (data.description.length < 20) {
      return Response.json(
        { error: "Description must be at least 20 characters long" },
        { status: 400 },
      );
    }

    // Validate instructor is array with id
    if (!Array.isArray(data.instructor) || !data.instructor[0]?.id) {
      return Response.json(
        { error: "Valid instructor ID is required" },
        { status: 400 },
      );
    }

    const Course = createModel("Course", CourseModel);
    const Admin = createModel("Admin", AdminModel);

    // Create new course
    const newCourse = new Course(data);
    await newCourse.save();

    // Sync newly assigned instructors' coursesOffered field
    if (data.instructor && data.instructor.length > 0) {
      const instructorIds = data.instructor.map((inst) => inst.id).filter(Boolean);
      if (instructorIds.length > 0) {
        await Admin.updateMany(
          { _id: { $in: instructorIds } },
          { $addToSet: { coursesOffered: newCourse._id } }
        );
      }
    }

    // Course created

    return Response.json(
      {
        success: true,
        message: "Course created successfully",
        data: newCourse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return Response.json(
      { error: "Failed to create course", details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate Admin or Instructor
    const auth = verifyAuth(request, ["Admin", "Instructor"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("id");

    if (!courseId) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    const data = await request.json();

    const Course = createModel("Course", CourseModel);
    const Admin = createModel("Admin", AdminModel);

    // Fetch the old course to check authorization and sync
    const oldCourse = await Course.findById(courseId);
    if (!oldCourse) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    // Role-based validation: Instructors can only edit their assigned courses
    if (auth.user.role === "Instructor") {
      const isAssigned = oldCourse.instructor?.some((inst) => {
        const instId = typeof inst.id === "object" ? inst.id?._id?.toString() : inst.id?.toString();
        return instId === auth.user._id;
      });
      if (!isAssigned) {
        return Response.json(
          { error: "instructor have not acess for this page view and edit contact to admin for any updation" },
          { status: 403 }
        );
      }
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    // Sync instructors' coursesOffered fields
    const oldInstructorIds = oldCourse.instructor?.map((inst) => inst.id?.toString()).filter(Boolean) || [];
    const newInstructorIds = data.instructor?.map((inst) => inst.id?.toString()).filter(Boolean) || [];

    const instructorsToRemove = oldInstructorIds.filter((id) => !newInstructorIds.includes(id));
    const instructorsToAdd = newInstructorIds.filter((id) => !oldInstructorIds.includes(id));

    if (instructorsToRemove.length > 0) {
      await Admin.updateMany(
        { _id: { $in: instructorsToRemove } },
        { $pull: { coursesOffered: courseId } }
      );
    }
    if (instructorsToAdd.length > 0) {
      await Admin.updateMany(
        { _id: { $in: instructorsToAdd } },
        { $addToSet: { coursesOffered: courseId } }
      );
    }

    // Course updated

    return Response.json(
      {
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating course:", error);
    return Response.json(
      { error: "Failed to update course", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    // Authenticate Admin
    const auth = verifyAuth(request, ["Admin"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("id");

    if (!courseId) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    const Course = createModel("Course", CourseModel);
    const Admin = createModel("Admin", AdminModel);

    // Delete course
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    // Remove this course from all instructors' coursesOffered list
    await Admin.updateMany(
      { coursesOffered: courseId },
      { $pull: { coursesOffered: courseId } }
    );

    // Course deleted

    return Response.json(
      {
        success: true,
        message: "Course deleted successfully",
        data: deletedCourse,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return Response.json(
      { error: "Failed to delete course", details: error.message },
      { status: 500 },
    );
  }
}