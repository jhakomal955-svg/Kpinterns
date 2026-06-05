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
import { InternshipModel } from "@/models";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const internshipId = url.searchParams.get("id");
    const position = url.searchParams.get("position");

    const Internship = createModel("Internship", InternshipModel);

    if (internshipId) {
      // Get single internship by ID
      const internship = await Internship.findById(internshipId);

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
      // Get internships by position
      const internships = await Internship.find({ position });

      return Response.json(
        { success: true, data: internships, total: internships.length },
        { status: 200 },
      );
    } else {
      // Get all internships
      const internships = await Internship.find();

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

    const data = await request.json();

    // Validate required fields based on model
    const requiredFields = [
      "title",
      "description",
      "position",
      "department",
      "internshipType",
      "company",
      "category",
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

    // Validate department enum
    const validDepartments = [
      "Bsc",
      "BTech",
      "BBA",
      "BCom",
      "BA",
      "BCA",
      "BScIT",
      "BScCS",
      "Other",
    ];
    if (!validDepartments.includes(data.department)) {
      return Response.json(
        { error: "Invalid department selected" },
        { status: 400 },
      );
    }

    // Validate internship type enum
    const validTypes = [
      "Full-Time",
      "Part-Time",
      "Summer",
      "Winter",
      "Project-Based",
    ];
    if (!validTypes.includes(data.internshipType)) {
      return Response.json(
        { error: "Invalid internship type selected" },
        { status: 400 },
      );
    }

    const Internship = createModel("Internship", InternshipModel);

    // Create new internship
    const newInternship = new Internship(data);
    await newInternship.save();

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

    const url = new URL(request.url);
    const internshipId = url.searchParams.get("id");

    if (!internshipId) {
      return Response.json(
        { error: "Internship ID is required" },
        { status: 400 },
      );
    }

    const Internship = createModel("Internship", InternshipModel);

    // Delete internship
    const deletedInternship = await Internship.findByIdAndDelete(internshipId);

    if (!deletedInternship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

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
