"use client";

import { useEffect, useRef, useState } from "react";

export default function Turnstile({ onSuccess, theme = "dark" }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Cloudflare Turnstile Site Key (public-facing). Falls back to the official site key.
  const configuredSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAADgYmAR21zK4jKhe";
  const [siteKey, setSiteKey] = useState(configuredSiteKey);

  // Store the onSuccess callback in a ref to avoid infinite re-render loop
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Sync state if the prop or env value changes, and handle local host key check upfront
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || 
                      window.location.hostname === "127.0.0.1" || 
                      window.location.hostname.startsWith("192.168.");
      if (isLocal && configuredSiteKey !== "1x00000000000000000000AA") {
        setSiteKey("1x00000000000000000000AA");
        return;
      }
    }
    setSiteKey(configuredSiteKey);
  }, [configuredSiteKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId);

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: theme,
            size: "normal",
            callback: (token) => {
              if (onSuccessRef.current) onSuccessRef.current(token);
            },
            "error-callback": (errorCode) => {
              console.warn(`⚠️ Cloudflare Turnstile error ${errorCode} for sitekey: ${siteKey}`);
              
              // Detect if running on localhost/127.0.0.1 or similar development hostnames
              const isLocal = typeof window !== "undefined" && 
                (window.location.hostname === "localhost" || 
                 window.location.hostname === "127.0.0.1" || 
                 window.location.hostname.startsWith("192.168."));
              
              if (isLocal && siteKey !== "1x00000000000000000000AA") {
                console.info("🔄 Localhost/dev environment detected. Falling back to Cloudflare's dummy Turnstile sitekey to prevent Error 400020...");
                setSiteKey("1x00000000000000000000AA");
              }
              return true; // Return true to indicate we handled the error (prevents console exceptions)
            }
          });
          widgetIdRef.current = id;
        } catch (error) {
          console.error("Error rendering Cloudflare Turnstile:", error);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else {
      if (window.turnstile) {
        renderWidget();
      } else {
        const originalOnload = script.onload;
        script.onload = (e) => {
          if (originalOnload) originalOnload(e);
          renderWidget();
        };
      }
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          // Ignore removal errors on unmount
        }
      }
    };
  }, [siteKey, theme]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}
