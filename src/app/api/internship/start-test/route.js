import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { InternshipModel, UserModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate student user
    const auth = verifyAuth(request, ["User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { internshipId } = await request.json();

    if (!internshipId) {
      return Response.json({ error: "internshipId is required" }, { status: 400 });
    }

    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);

    // Fetch the internship
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // Fetch the student
    const student = await User.findById(auth.user._id);
    if (!student) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Locate active internship
    const enrollmentIndex = student.ActiveInternship?.findIndex(
      (i) => (i.internship?._id || i.internship)?.toString() === internshipId
    );

    if (enrollmentIndex === -1 || enrollmentIndex === undefined) {
      return Response.json({ error: "You are not enrolled in this internship" }, { status: 400 });
    }

    const enrollment = student.ActiveInternship[enrollmentIndex];

    // Check if internship is completed
    const hasPassed = enrollment.endDate ? new Date() >= new Date(enrollment.endDate) : false;
    if (enrollment.internshipStatus !== "Completed" && !hasPassed && (enrollment.progress || 0) < 100) {
      return Response.json({ error: "You must complete the internship first before appearing for the test" }, { status: 400 });
    }

    if (hasPassed && enrollment.internshipStatus !== "Completed") {
      enrollment.internshipStatus = "Completed";
      enrollment.progress = 100;
    }

    // Check if test was already taken
    if (enrollment.testTaken) {
      return Response.json({ error: "You have already appeared for this test" }, { status: 400 });
    }

    // Set testStartedAt if not already set
    if (!enrollment.testStartedAt) {
      enrollment.testStartedAt = new Date();
      student.markModified("ActiveInternship");
      await student.save();
    }

    return Response.json({
      success: true,
      testStartedAt: enrollment.testStartedAt,
    }, { status: 200 });

  } catch (error) {
    console.error("Error starting test:", error);
    return Response.json(
      { error: "Failed to start test session", details: error.message },
      { status: 500 }
    );
  }
}
