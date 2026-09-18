import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";
import { isR2Configured } from "@/lib/r2";

export const maxDuration = 300; // 5 minutes execution timeout
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Protect migration endpoint with simple secret
    if (secret !== "kpinterns_migrate_2026") {
      return NextResponse.json(
        { error: "Unauthorized. Provide correct secret parameter: ?secret=kpinterns_migrate_2026" },
        { status: 401 }
      );
    }

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 is not configured in .env.local yet!" },
        { status: 500 }
      );
    }

    await connectDB();
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    // Find all users who have active internships or courses
    const users = await User.find({
      $or: [
        { "ActiveInternship.0": { $exists: true } },
        { "ActiveCources.0": { $exists: true } },
      ],
    }).select("_id fullName email");

    console.log(`[Storage Migration] Starting document check for ${users.length} users...`);

    let updatedCount = 0;
    const results = [];

    for (const user of users) {
      try {
        const changed = await checkAndAutomateDocuments(user._id.toString(), true);
        if (changed) {
          updatedCount++;
          results.push({ userId: user._id, email: user.email, status: "UPDATED" });
        }
      } catch (err) {
        console.error(`[Storage Migration] Error processing user ${user.email}:`, err);
        results.push({ userId: user._id, email: user.email, status: "FAILED", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${updatedCount} users updated with fresh R2 documents.`,
      totalUsersChecked: users.length,
      updatedUsersCount: updatedCount,
      results,
    });
  } catch (error) {
    console.error("[Storage Migration] Fatal error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
