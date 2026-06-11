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
import { InternshipModel, AdminModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

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
    const Internship = createModel("Internship", InternshipModel);

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
        { success: true, data: internship },
        { status: 200 },
      );
    } else if (position) {
      // Get internships by position and POPULATE instructor/mentor referenced data
      const internships = await Internship.find({ position })
        .populate("instructor.id", "name role avatar");

      return Response.json(
        { success: true, data: internships, total: internships.length },
        { status: 200 },
      );
    } else {
      // Build a filter query from degree / department / domain params
      const query = {};
      if (degree) query.degree = degree;
      if (department) query.department = department;
      if (domain) query.domain = domain;

      // Get internships (filtered or all) and POPULATE instructor/mentor referenced data
      const internships = await Internship.find(query)
        .populate("instructor.id", "name role avatar");

      return Response.json(
        { success: true, data: internships, total: internships.length },
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
    if (!validDegrees.includes(data.degree)) {
      return Response.json(
        { error: "Invalid degree selected" },
        { status: 400 },
      );
    }

    // Validate department enum
    const validDepartments = InternshipModel.department.enum;
    if (!validDepartments.includes(data.department)) {
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

    console.log("✅ Internship created successfully:", newInternship._id);

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

    console.log("✅ Internship updated successfully:", internshipId);

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

    console.log("✅ Internship deleted successfully:", internshipId);

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