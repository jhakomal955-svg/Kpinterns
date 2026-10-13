import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { InternshipModel, UserModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";
import { after } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate student user
    const auth = verifyAuth(request, ["User"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { internshipId, answers } = await request.json();

    if (!internshipId || !Array.isArray(answers)) {
      return Response.json({ error: "internshipId and answers array are required" }, { status: 400 });
    }

    const User = createModel("User", UserModel);
    const Internship = createModel("Internship", InternshipModel);

    // Fetch the internship
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return Response.json({ error: "Internship not found" }, { status: 404 });
    }

    // Verify test exists and is Published
    if (!internship.test || internship.test.status !== "Published") {
      return Response.json({ error: "Test is not published for this internship" }, { status: 400 });
    }

    const questions = internship.test.questions || [];
    if (questions.length === 0) {
      return Response.json({ error: "Test has no questions" }, { status: 400 });
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

    // Verify that the test was started and check the duration limit
    if (!enrollment.testStartedAt) {
      return Response.json({ error: "Test session was not properly initialized" }, { status: 400 });
    }

    const testDurationSeconds = questions.length * 60;
    const elapsedSeconds = Math.floor((Date.now() - new Date(enrollment.testStartedAt).getTime()) / 1000);
    // Allow a grace period of 30 seconds for network latency/server processing
    if (elapsedSeconds > testDurationSeconds + 30) {
      return Response.json({ error: "Test submission time limit exceeded" }, { status: 400 });
    }

    // Grade the test
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (userAnswer !== undefined && userAnswer !== null && Number(userAnswer) === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    // Save test score details
    student.ActiveInternship[enrollmentIndex].testScore = scorePercentage;
    student.ActiveInternship[enrollmentIndex].testTaken = true;
    student.ActiveInternship[enrollmentIndex].testTakenAt = new Date();

    student.markModified("ActiveInternship");
    await student.save();

    // Defer certificate generation automatically to background
    after(async () => {
      try {
        await checkAndAutomateDocuments(student._id.toString());
      } catch (docErr) {
        console.error("Failed to run checkAndAutomateDocuments after test submission in background:", docErr);
      }
    });

    return Response.json({
      success: true,
      message: "Test submitted successfully",
      score: scorePercentage,
    }, { status: 200 });

  } catch (error) {
    console.error("Error submitting test:", error);
    return Response.json(
      { error: "Failed to submit test", details: error.message },
      { status: 500 }
    );
  }
}
