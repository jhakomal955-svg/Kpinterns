import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, InternshipModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Instructor"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { userId, internshipId, moduleId, marks, feedback } = await request.json();

    if (!userId || !internshipId || !moduleId || marks === undefined) {
      return Response.json(
        { error: "userId, internshipId, moduleId, and marks are required" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);

    // Fetch the student
    const student = await User.findById(userId);
    if (!student) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Locate active internship enrollment
    const enrollment = student.ActiveInternship?.find(
      (i) => (i.internship?._id || i.internship)?.toString() === internshipId
    );

    if (!enrollment) {
      return Response.json({ error: "User is not enrolled in this internship" }, { status: 400 });
    }

    if (!enrollment.assignments) {
      enrollment.assignments = [];
    }

    const existingIndex = enrollment.assignments.findIndex((a) => a.moduleId === moduleId);
    
    if (existingIndex === -1) {
      return Response.json({ error: "No submission found for this module assignment to grade" }, { status: 404 });
    }

    const existing = enrollment.assignments[existingIndex];
    enrollment.assignments[existingIndex] = {
      ...existing.toObject(),
      marks: Number(marks),
      feedback: feedback || "",
      status: "Graded",
    };

    student.markModified("ActiveInternship");
    await student.save();

    // Refetch populated to return latest status
    const freshUser = await User.findById(userId)
      .populate("ActiveInternship.internship");

    return Response.json({
      success: true,
      message: "Assignment graded successfully",
      data: freshUser,
    }, { status: 200 });

  } catch (error) {
    console.error("Error grading assignment:", error);
    return Response.json(
      { error: "Failed to grade assignment", details: error.message },
      { status: 500 }
    );
  }
}
