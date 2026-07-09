/**
 * Internship API Routes
 * Complete CRUD operations for Internship model
 * GET - Get all internships or a specific internship
 * POST - Create a new internship
 * PUT - Update an internship
 * DELETE - Delete an internship
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { InternshipModel, AdminModel, UserModel } from "@/models";
import { verifyAuth, getAuthUser } from "@/lib/jwt";

// Global memory cache for internships list to avoid database queries on every page navigation
let internshipsCache = global.internshipsCache;
if (!internshipsCache) {
  internshipsCache = global.internshipsCache = {
    allInternships: null,
    lastFetched: 0,
  };
}

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache TTL

function sanitizeInternship(internship, isAdminOrInstructor, hasCompletedInternship = false) {
  if (!internship) return null;
  const obj = typeof internship.toObject === "function" ? internship.toObject() : internship;

  if (!isAdminOrInstructor) {
    if (!hasCompletedInternship) {
      delete obj.intersnhipReport;
    }
  }

  if (!obj.test) return obj;

  if (isAdminOrInstructor) {
    return obj;
  }

  if (obj.test.status === "Draft" || !hasCompletedInternship) {
    delete obj.test;
  } else {
    if (obj.test.questions) {
      obj.test.questions = obj.test.questions.map((q) => {
        const { correctOptionIndex, ...rest } = q;
        return rest;
      });
    }
  }
  return obj;
}

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const internshipId = url.searchParams.get("id");
    const position = url.searchParams.get("position");
    const degree = url.searchParams.get("degree");
    const department = url.searchParams.get("department");
    const domain = url.searchParams.get("domain");

    createModel("Admin", AdminModel);
    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);

    // Check permissions
    let isAdminOrInstructor = false;
    let hasCompletedInternship = false;
    try {
      const decoded = getAuthUser(request);
      if (decoded) {
        if (decoded.role === "Admin" || decoded.role === "Instructor") {
          isAdminOrInstructor = true;
        } else if (decoded.role === "User" && internshipId) {
          const student = await User.findById(decoded._id);
          if (student && student.ActiveInternship) {
            const enrollment = student.ActiveInternship.find(
              (i) => (i.internship?._id || i.internship)?.toString() === internshipId
            );
            if (enrollment && enrollment.internshipStatus === "Completed") {
              hasCompletedInternship = true;
            }
          }
        }
      }
    } catch (err) {}

    if (internshipId) {
      // Get single internship by ID and POPULATE instructor/mentor referenced data
      const internship = await Internship.findById(internshipId)
        .populate("instructor.id", "name role avatar");

      if (!internship) {
        return Response.json(
          { error: "Internship not found" },
          { status: 404 },
        );
      }

      return Response.json(
        { success: true, data: sanitizeInternship(internship, isAdminOrInstructor, hasCompletedInternship) },
        { status: 200 },
      );
    } else if (position) {
      // Get internships by position and POPULATE instructor/mentor referenced data
      const internships = await Internship.find({ position })
        .populate("instructor.id", "name role avatar");

      const sanitizedList = internships.map(item => sanitizeInternship(item, isAdminOrInstructor, false));

      return Response.json(
        { success: true, data: sanitizedList, total: sanitizedList.length },
        { status: 200 },
      );
    } else {
      // Build a filter query from degree / department / domain params
      const query = {};
      if (degree) query.degree = degree;
      if (department) query.department = department;
      if (domain) query.domain = domain;

      const isFilteredQuery = degree || department || domain;
      const now = Date.now();
      let internships;

      if (!isFilteredQuery && internshipsCache.allInternships && (now - internshipsCache.lastFetched < CACHE_TTL_MS)) {
        internships = internshipsCache.allInternships;
      } else {
        // Get internships (filtered or all) and POPULATE instructor/mentor referenced data
        internships = await Internship.find(query)
          .populate("instructor.id", "name role avatar");

        if (!isFilteredQuery) {
          internshipsCache.allInternships = internships;
          internshipsCache.lastFetched = now;
        }
      }

      const sanitizedList = internships.map(item => sanitizeInternship(item, isAdminOrInstructor, false));

      return Response.json(
        { success: true, data: sanitizedList, total: sanitizedList.length },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching internships:", error);
    return Response.json(
      { error: "Failed to fetch internships", details: error.message },
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
      "position",
      "degree",
      "department",
      "internshipType",
      "company",
      "domain",
      "createdBy",
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

    // Validate degree enum
    const validDegrees = InternshipModel.degree.enum;
    const degreeArray = Array.isArray(data.degree) ? data.degree : (data.degree ? [data.degree] : []);
    if (degreeArray.length === 0 || !degreeArray.every((d) => validDegrees.includes(d))) {
      return Response.json(
        { error: "Invalid degree selected" },
        { status: 400 },
      );
    }

    // Validate department enum
    const validDepartments = InternshipModel.department.enum;
    const departmentArray = Array.isArray(data.department) ? data.department : (data.department ? [data.department] : []);
    if (departmentArray.length === 0 || !departmentArray.every((d) => validDepartments.includes(d))) {
      return Response.json(
        { error: "Invalid department selected" },
        { status: 400 },
      );
    }

    // Validate domain enum
    const validDomains = InternshipModel.domain.enum;
    if (!validDomains.includes(data.domain)) {
      return Response.json(
        { error: "Invalid domain selected" },
        { status: 400 },
      );
    }

    // Validate internship type enum
    const validTypes = InternshipModel.internshipType.enum;
    if (!validTypes.includes(data.internshipType)) {
      return Response.json(
        { error: "Invalid internship type selected" },
        { status: 400 },
      );
    }

    const Internship = createModel("Internship", InternshipModel);
    const Admin = createModel("Admin", AdminModel);

    // Create new internship
    const newInternship = new Internship(data);
    await newInternship.save();

    // Sync newly assigned instructors' internshipsOffered field
    if (data.instructor && data.instructor.length > 0) {
      const instructorIds = data.instructor.map((inst) => inst.id).filter(Boolean);
      if (instructorIds.length > 0) {
        await Admin.updateMany(
          { _id: { $in: instructorIds } },
          { $addToSet: { internshipsOffered: newInternship._id } }
        );
      }
    }

    // Internship created
    if (global.internshipsCache) {
      global.internshipsCache.allInternships = null;
    }

    return Response.json(
      {
        success: true,
        message: "Internship created successfully",
        data: newInternship,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating internship:", error);
    return Response.json(
      { error: "Failed to create internship", details: error.message },
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
    const internshipId = url.searchParams.get("id");

    if (!internshipId) {
      return Response.json(
        { error: "Internship ID is required" },
        { status: 400 },
      );
    }

    const data = await request.json();

    const Internship = createModel("Internship", InternshipModel);
    const Admin = createModel("Admin", AdminModel);

    // Fetch the old internship to check authorization and sync
    const oldInternship = await Internship.findById(internshipId);
    if (!oldInternship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // Role-based validation: Instructors can only edit their assigned internships
    if (auth.user.role === "Instructor") {
      const isAssigned = oldInternship.instructor?.some((inst) => {
        const instId = inst.id?._id?.toString() || inst.id?.toString();
        return instId === auth.user._id;
      });
      if (!isAssigned) {
        return Response.json(
          { error: "instructor have not acess for this page view and edit contact to admin for any updation" },
          { status: 403 }
        );
      }
    }

    // Update internship
    const updatedInternship = await Internship.findByIdAndUpdate(
      internshipId,
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedInternship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // Sync instructors' internshipsOffered fields
    const oldInstructorIds = oldInternship.instructor?.map((inst) => inst.id?.toString()).filter(Boolean) || [];
    const newInstructorIds = data.instructor?.map((inst) => inst.id?.toString()).filter(Boolean) || [];

    const instructorsToRemove = oldInstructorIds.filter((id) => !newInstructorIds.includes(id));
    const instructorsToAdd = newInstructorIds.filter((id) => !oldInstructorIds.includes(id));

    if (instructorsToRemove.length > 0) {
      await Admin.updateMany(
        { _id: { $in: instructorsToRemove } },
        { $pull: { internshipsOffered: internshipId } }
      );
    }
    if (instructorsToAdd.length > 0) {
      await Admin.updateMany(
        { _id: { $in: instructorsToAdd } },
        { $addToSet: { internshipsOffered: internshipId } }
      );
    }

    // Internship updated
    if (global.internshipsCache) {
      global.internshipsCache.allInternships = null;
    }

    return Response.json(
      {
        success: true,
        message: "Internship updated successfully",
        data: updatedInternship,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating internship:", error);
    return Response.json(
      { error: "Failed to update internship", details: error.message },
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
    const internshipId = url.searchParams.get("id");

    if (!internshipId) {
      return Response.json(
        { error: "Internship ID is required" },
        { status: 400 },
      );
    }

    const Internship = createModel("Internship", InternshipModel);
    const Admin = createModel("Admin", AdminModel);

    // Delete internship
    const deletedInternship = await Internship.findByIdAndDelete(internshipId);

    if (!deletedInternship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // Remove this internship from all instructors' internshipsOffered list
    await Admin.updateMany(
      { internshipsOffered: internshipId },
      { $pull: { internshipsOffered: internshipId } }
    );

    // Internship deleted
    if (global.internshipsCache) {
      global.internshipsCache.allInternships = null;
    }

    return Response.json(
      {
        success: true,
        message: "Internship deleted successfully",
        data: deletedInternship,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting internship:", error);
    return Response.json(
      { error: "Failed to delete internship", details: error.message },
      { status: 500 },
    );
  }
}