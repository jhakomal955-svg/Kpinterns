/**
 * Cloudflare Turnstile Verification Helper
 */

export async function verifyTurnstileToken(token) {
  // Use user-defined Secret Key or default to Cloudflare's official testing secret key (always passes)
  const secretKey = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";

  if (!token) {
    console.warn("⚠️ Turnstile verification requested but no token was provided.");
    return false;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();
    
    if (data.success) {
      return true;
    }

    // Dynamic development mode fallback: if verification fails and we are running in localhost/dev mode,
    // retry validation using the official Cloudflare Turnstile testing secret key (always passes).
    if (process.env.NODE_ENV === "development") {
      console.info("ℹ️ Turnstile verification failed using production keys on localhost. Retrying with Cloudflare testing keys...");
      const dummySecretKey = "1x0000000000000000000000000000000AA";
      const dummyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${encodeURIComponent(dummySecretKey)}&response=${encodeURIComponent(token)}`,
      });
      const dummyData = await dummyResponse.json();
      return !!dummyData.success;
    }

    return false;
  } catch (error) {
    console.error("❌ Cloudflare Turnstile siteverify request failed:", error);
    return false;
  }
}
