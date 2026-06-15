/**
 * Testimonial API Routes
 * GET - Fetch all approved testimonials
 * POST - Submit a new testimonial (Requires User authentication)
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { TestimonialModel, UserModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const Testimonial = createModel("Testimonial", TestimonialModel);
    
    // Fetch approved testimonials, sorting by newest first
    const testimonials = await Testimonial.find({ status: "Approved" })
      .sort({ createdAt: -1 })
      .limit(12);

    return Response.json(
      { success: true, data: testimonials },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return Response.json(
      { error: "Failed to fetch testimonials", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate the student (token role must be "User")
    const auth = verifyAuth(request, ["User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { comment, rating } = await request.json();

    // Validation
    if (!comment || comment.trim().length < 10) {
      return Response.json(
        { error: "Comment is required and must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return Response.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);
    const Testimonial = createModel("Testimonial", TestimonialModel);

    // Fetch the authenticated user's real profile fields
    const user = await User.findById(auth.user._id);
    if (!user) {
      return Response.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Format a descriptive batch role from the user's semester / active programs
    let roleText = "Student";
    if (user.semester) {
      roleText = `Student | Semester ${user.semester}`;
    } else if (user.ActiveInternship && user.ActiveInternship.length > 0) {
      roleText = "Student | Intern";
    }

    // Check if the user has already submitted a testimonial to prevent spam
    const existingTestimonial = await Testimonial.findOne({ user: user._id });
    if (existingTestimonial) {
      // If testimonial exists, we update their review instead of creating a duplicate and reset to Pending
      existingTestimonial.comment = comment.trim();
      existingTestimonial.rating = numericRating;
      existingTestimonial.role = roleText;
      existingTestimonial.university = user.university;
      existingTestimonial.status = "Pending"; // Needs admin review again
      await existingTestimonial.save();

      return Response.json(
        {
          success: true,
          message: "Testimonial updated successfully and is pending review.",
          data: existingTestimonial,
        },
        { status: 200 }
      );
    }

    // Create a new verified testimonial
    const newTestimonial = new Testimonial({
      user: user._id,
      name: user.fullName,
      comment: comment.trim(),
      rating: numericRating,
      role: roleText,
      university: user.university,
      status: "Pending"
    });

    await newTestimonial.save();

    return Response.json(
      {
        success: true,
        message: "Testimonial submitted successfully!",
        data: newTestimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return Response.json(
      { error: "Failed to submit testimonial", details: error.message },
      { status: 500 }
    );
  }
}
