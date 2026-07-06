import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, InternshipModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { internshipId, moduleId, submissionText, fileUrl } = await request.json();

    if (!internshipId || !moduleId) {
      return Response.json(
        { error: "internshipId and moduleId are required" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);

    // Fetch the internship to make sure it exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // Verify the module exists in internship content
    const moduleItem = internship.content?.find((m) => m._id.toString() === moduleId);
    if (!moduleItem) {
      return Response.json({ error: "Module not found in this internship" }, { status: 404 });
    }

    // Fetch the student
    const student = await User.findById(auth.user._id);
    if (!student) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Locate active internship enrollment
    const enrollment = student.ActiveInternship?.find(
      (i) => (i.internship?._id || i.internship)?.toString() === internshipId
    );

    if (!enrollment) {
      return Response.json({ error: "You are not enrolled in this internship" }, { status: 400 });
    }

    if (!enrollment.assignments) {
      enrollment.assignments = [];
    }

    const existingIndex = enrollment.assignments.findIndex((a) => a.moduleId === moduleId);
    const newSubmission = {
      moduleId,
      submittedText: submissionText || "",
      fileUrl: fileUrl || "",
      submittedAt: new Date(),
      status: "Submitted",
    };

    if (existingIndex > -1) {
      // Retain existing marks/feedback if already graded
      const existing = enrollment.assignments[existingIndex];
      enrollment.assignments[existingIndex] = {
        ...existing.toObject(),
        ...newSubmission,
        marks: existing.marks,
        feedback: existing.feedback,
        status: existing.status === "Graded" ? "Graded" : "Submitted",
      };
    } else {
      enrollment.assignments.push(newSubmission);
    }

    student.markModified("ActiveInternship");
    await student.save();

    // Refetch populated to return latest status to user
    const freshUser = await User.findById(student._id)
      .populate("ActiveInternship.internship");

    return Response.json({
      success: true,
      message: "Assignment submitted successfully",
      data: freshUser,
    }, { status: 200 });

  } catch (error) {
    console.error("Error submitting assignment:", error);
    return Response.json(
      { error: "Failed to submit assignment", details: error.message },
      { status: 500 }
    );
  }
}
