import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "kp_interns_jwt_secret_key_2026_secure";

/**
 * Signs a JWT token with the user/admin payload
 * Expire time: 1 week (7 days)
 */
export function signToken(payload) {
  // Ensure we keep payload lightweight
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verifies a JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Helper to extract and verify JWT from request headers
 */
export function getAuthUser(request) {
  try {
    const xUserId = request.headers.get("x-user-id");
    const xUserEmail = request.headers.get("x-user-email");
    const xUserRole = request.headers.get("x-user-role");

    if (xUserId && xUserEmail && xUserRole) {
      return {
        _id: xUserId,
        email: xUserEmail,
        role: xUserRole,
      };
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware helper for Next.js App Router API routes.
 * Verifies if the request is authenticated and has the correct role.
 */
export function verifyAuth(request, allowedRoles = []) {
  const decoded = getAuthUser(request);
  if (!decoded) {
    return { 
      authenticated: false, 
      error: "Authentication token missing or invalid. Please login again.", 
      status: 401 
    };
  }

  // If roles restriction is specified, verify claims
  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    return { 
      authenticated: false, 
      error: "Access denied: insufficient permissions for this operation.", 
      status: 403 
    };
  }

  return { authenticated: true, user: decoded };
}
