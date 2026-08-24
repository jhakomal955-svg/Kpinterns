import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, InternshipModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate Admin, Employee, or Instructor
    const auth = verifyAuth(request, ["Admin", "Employee", "Instructor"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { internshipId } = await request.json();

    if (!internshipId) {
      return Response.json(
        { error: "internshipId is required" },
        { status: 400 }
      );
    }

    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);

    // Fetch the internship
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // If role is Instructor, verify assignment
    if (auth.user.role === "Instructor") {
      const isAssigned = internship.instructor?.some((inst) => {
        const instId = inst.id?._id?.toString() || inst.id?.toString();
        return instId === auth.user._id;
      });

      if (!isAssigned) {
        return Response.json(
          { error: "Access denied: you are not assigned as an instructor to this internship." },
          { status: 403 }
        );
      }
    }

    // Find all users enrolled in this internship
    const enrolledUsers = await User.find({
      "ActiveInternship.internship": internship._id,
    });

    if (!enrolledUsers || enrolledUsers.length === 0) {
      return Response.json(
        { success: true, message: "No enrolled students found for this internship.", updatedCount: 0, totalEnrolled: 0 },
        { status: 200 }
      );
    }

    let updatedCount = 0;
    const now = new Date();

    for (const student of enrolledUsers) {
      let userModified = false;

      for (const item of student.ActiveInternship || []) {
        const enrolledIntId = (item.internship?._id || item.internship)?.toString();
        if (enrolledIntId === internshipId.toString()) {
          // If already completed and progress is 100, we still re-trigger document automation in case docs were missing
          if (item.internshipStatus !== "Completed" || item.progress !== 100) {
            item.internshipStatus = "Completed";
            item.progress = 100;
            userModified = true;
            updatedCount++;
          }
        }
      }

      if (userModified) {
        student.markModified("ActiveInternship");
        student.updatedAt = now;
        await student.save();
      }

      // Trigger document automation check (generates certificate or waits for test if active)
      try {
        await checkAndAutomateDocuments(student._id.toString());
      } catch (docErr) {
        console.error(`[Bulk Complete] Error generating documents for student ${student._id}:`, docErr);
      }
    }

    const testActive = (
      internship.test &&
      internship.test.status === "Published" &&
      internship.test.questions &&
      internship.test.questions.length > 0
    );

    const message = testActive
      ? `Successfully marked ${updatedCount} student(s) as Completed! Since a test is published, students can now appear for the test from their dashboard to receive certificates.`
      : `Successfully marked ${updatedCount} student(s) as Completed! Certificates and attendance sheets have been generated and emailed directly.`;

    return Response.json(
      {
        success: true,
        message,
        updatedCount,
        totalEnrolled: enrolledUsers.length,
        testActive: !!testActive,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk complete internship:", error);
    return Response.json(
      { error: "Failed to mark internship completed for students", details: error.message },
      { status: 500 }
    );
  }
}
