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
import { CourseModel } from "@/models";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const courseId = url.searchParams.get("id");
    const category = url.searchParams.get("category");

    const Course = createModel("Course", CourseModel);

    if (courseId) {
      // Get single course by ID
      const course = await Course.findById(courseId);

      if (!course) {
        return Response.json({ error: "Course not found" }, { status: 404 });
      }

      return Response.json({ success: true, data: course }, { status: 200 });
    } else if (category) {
      // Get courses by category
      const courses = await Course.find({ category });

      return Response.json(
        { success: true, data: courses, total: courses.length },
        { status: 200 },
      );
    } else {
      // Get all courses
      const courses = await Course.find();

      return Response.json(
        { success: true, data: courses, total: courses.length },
        { status: 200 },
      );
    }
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

    const data = await request.json();

    // Validate required fields based on model
    const requiredFields = [
      "title",
      "description",
      "category",
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

    // Create new course
    const newCourse = new Course(data);
    await newCourse.save();

    console.log("✅ Course created successfully:", newCourse._id);

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

    const url = new URL(request.url);
    const courseId = url.searchParams.get("id");

    if (!courseId) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    const data = await request.json();
    const Course = createModel("Course", CourseModel);

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    console.log("✅ Course updated successfully:", courseId);

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

    const url = new URL(request.url);
    const courseId = url.searchParams.get("id");

    if (!courseId) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    const Course = createModel("Course", CourseModel);

    // Delete course
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    console.log("✅ Course deleted successfully:", courseId);

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
