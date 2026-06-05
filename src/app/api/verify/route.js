import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";
import mongoose from "mongoose";

export const maxDuration = 60; // 1 minute execution limit

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query) {
      return Response.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    // Ensure models are initialized in Mongoose context
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    let users = [];
    const trimmedQuery = query.trim();

    // 1. Check if the query is a valid MongoDB ObjectId (to look up specific certificate ID)
    if (mongoose.Types.ObjectId.isValid(trimmedQuery)) {
      const user = await User.findOne({
        $or: [
          { "ActiveCources._id": trimmedQuery },
          { "ActiveInternship._id": trimmedQuery }
        ]
      })
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");

      if (user) {
        users = [user];
      }
    }

    // 2. If no user matched by direct ID, look up by email, phone, or registration number
    if (users.length === 0) {
      const searchRegex = new RegExp(`^${trimmedQuery}$`, "i");
      users = await User.find({
        $or: [
          { email: searchRegex },
          { phone: trimmedQuery },
          { registrationNumber: searchRegex }
        ]
      })
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");
    }

    if (!users || users.length === 0) {
      return Response.json(
        { success: false, error: "No records found matching your query." },
        { status: 404 }
      );
    }

    const certificates = [];

    for (const user of users) {
      // Extract from courses
      if (user.ActiveCources && user.ActiveCources.length > 0) {
        for (const c of user.ActiveCources) {
          // Verify both that certificate URL exists
          if (c.certificateUrl) {
            // If query is a valid ObjectId, only include the certificate that matches it
            if (mongoose.Types.ObjectId.isValid(trimmedQuery) && c._id.toString() !== trimmedQuery) {
              continue;
            }
            certificates.push({
              certificateId: c._id.toString(),
              holder: user.fullName,
              course: c.course?.title || "Specialized Course",
              type: "Course Completion Certificate",
              issuedDate: c.paymentDate
                ? new Date(c.paymentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
              expiryDate: "Lifetime Validity",
              certificateUrl: c.certificateUrl,
            });
          }
        }
      }

      // Extract from internships
      if (user.ActiveInternship && user.ActiveInternship.length > 0) {
        for (const i of user.ActiveInternship) {
          const isDirectMatch = mongoose.Types.ObjectId.isValid(trimmedQuery) && i._id.toString() === trimmedQuery;
          const isGenericMatch = !mongoose.Types.ObjectId.isValid(trimmedQuery);

          // 1. Internship Certificate
          if (i.certificationUrl && (isDirectMatch || isGenericMatch)) {
            certificates.push({
              certificateId: i._id.toString(),
              holder: user.fullName,
              course: i.internship?.title || `${i.position || 'Internship'} at ${i.company || 'KpInterns'}`,
              type: "Internship Completion Certificate",
              issuedDate: i.paymentDate
                ? new Date(i.paymentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
              expiryDate: "Lifetime Validity",
              certificateUrl: i.certificationUrl,
            });
          }

          // 2. Internship Offer Letter
          if (i.offerLetterUrl && (isDirectMatch || isGenericMatch)) {
            certificates.push({
              certificateId: i._id.toString(),
              holder: user.fullName,
              course: i.internship?.title || `${i.position || 'Internship'} at ${i.company || 'KpInterns'}`,
              type: "Internship Offer Letter",
              issuedDate: i.paymentDate
                ? new Date(i.paymentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
              expiryDate: "Active during internship",
              certificateUrl: i.offerLetterUrl,
            });
          }
        }
      }
    }

    if (certificates.length === 0) {
      return Response.json(
        { success: false, error: "No certificates have been issued for this record yet." },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: certificates }, { status: 200 });
  } catch (error) {
    console.error("Certificate verification API error:", error);
    return Response.json(
      { success: false, error: "Failed to perform verification", details: error.message },
      { status: 500 }
    );
  }
}
