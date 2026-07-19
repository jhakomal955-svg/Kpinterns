import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { AdminModel } from "@/models";

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const college = url.searchParams.get("college");

    if (!college) {
      return Response.json(
        { success: false, error: "College name is required" },
        { status: 400 }
      );
    }

    const Admin = createModel("Admin", AdminModel);

    // Escape special regex characters in the college name for safe lookup
    const escapedCollege = college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    
    // Find verified College Admin with matching CollegeName (case-insensitive)
    const collegeAdmin = await Admin.findOne({
      role: "College Admin",
      verified: true,
      CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") }
    });

    if (!collegeAdmin) {
      return Response.json(
        { success: true, registered: false },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        registered: true,
        internshipRate: collegeAdmin.internshipRate || 0,
        courseRate: collegeAdmin.courseRate || 0
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in college-rate API GET:", error);
    return Response.json(
      { success: false, error: "Failed to resolve college rates", details: error.message },
      { status: 500 }
    );
  }
}
