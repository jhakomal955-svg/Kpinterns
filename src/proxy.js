import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || "kp_interns_jwt_secret_key_2026_secure";

// Edge-safe Base64URL decoder
function base64urlToBytes(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return null;
  }
}

// Edge-safe JWT Verification
async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const keyData = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBin = base64urlToBytes(signatureB64);
    if (!signatureBin) return null;

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBin,
      data
    );

    if (!isValid) return null;

    const payloadBin = base64urlToBytes(payloadB64);
    if (!payloadBin) return null;

    const payloadStr = new TextDecoder().decode(payloadBin);
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isUserRoute = pathname === '/api/user';
  const isAttendanceRoute = pathname === '/api/attendance';
  const isProgressRoute = pathname === '/api/user/progress';
  const isPaymentVerifyRoute = pathname === '/api/payment/verify';
  const isPaymentOrderRoute = pathname === '/api/payment/order';

  const requiresAuth = 
    (isUserRoute && request.method !== 'POST') || 
    isAttendanceRoute || 
    isProgressRoute || 
    isPaymentVerifyRoute;

  const authHeader = request.headers.get('authorization');

  if (requiresAuth || (isPaymentOrderRoute && authHeader)) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication token missing. Please login again.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token, JWT_SECRET);

    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication token is invalid or expired. Please login again.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // Forward the decoded user info in request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded._id || '');
    requestHeaders.set('x-user-email', decoded.email || '');
    requestHeaders.set('x-user-role', decoded.role || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    '/api/user',
    '/api/attendance',
    '/api/user/progress',
    '/api/payment/verify',
    '/api/payment/order',
  ],
};
