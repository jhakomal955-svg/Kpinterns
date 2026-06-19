/**
 * API Route to verify JWT tokens
 * GET - Checks if the token passed in Authorization header is valid and not expired
 */

import { verifyAuth } from "@/lib/jwt";
import connectDB from "@/lib/mongodb";

export async function GET(request) {
  try {
    await connectDB();
    const auth = verifyAuth(request);
    
    if (!auth.authenticated) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }
    
    return Response.json(
      { success: true, user: auth.user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification API error:", error);
    return Response.json(
      { success: false, error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
