import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAuth } from "@/lib/jwt";
import { generateFilteredUsersPDF } from "@/lib/pdfGenerator";

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate Admin, Employee, College Admin, Instructor, Cybercafe
    const auth = verifyAuth(request, ["Admin", "Employee", "College Admin", "Instructor", "Cybercafe"]);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { users = [], activeFilters = {} } = body;

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { success: false, error: "Invalid users payload provided" },
        { status: 400 }
      );
    }

    // Generate PDF Buffer
    const pdfBuffer = await generateFilteredUsersPDF(users, activeFilters);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Filtered_Students_Report.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating filtered users PDF:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
