/**
 * Admin Testimonial API Routes
 * Restricted to authenticated Admin accounts only
 * GET - Fetch all testimonials (Pending & Approved)
 * PUT - Update a testimonial status (Pending / Approved)
 * DELETE - Delete a testimonial
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { TestimonialModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin
    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const Testimonial = createModel("Testimonial", TestimonialModel);

    // Fetch all testimonials, sorting by newest first
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    return Response.json({ success: true, data: testimonials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin testimonials:", error);
    return Response.json(
      { error: "Failed to fetch testimonials", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Authenticate Admin
    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id, status } = await request.json();

    if (!id) {
      return Response.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    if (!status || !["Pending", "Approved"].includes(status)) {
      return Response.json({ error: "Valid status ('Pending' or 'Approved') is required" }, { status: 400 });
    }

    const Testimonial = createModel("Testimonial", TestimonialModel);

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return Response.json(
      { success: true, message: "Testimonial status updated successfully", data: updatedTestimonial },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin testimonial status:", error);
    return Response.json(
      { error: "Failed to update status", details: error.message },
      { status: 500 }
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
    const testimonialId = url.searchParams.get("id");

    if (!testimonialId) {
      return Response.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    const Testimonial = createModel("Testimonial", TestimonialModel);

    const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId);

    if (!deletedTestimonial) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return Response.json(
      { success: true, message: "Testimonial deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin testimonial:", error);
    return Response.json(
      { error: "Failed to delete testimonial", details: error.message },
      { status: 500 }
    );
  }
}
