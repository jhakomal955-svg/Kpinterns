"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SocialBannerModal from "./SocialBannerModal.jsx";

// Client-safe JWT expiration validation check
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Patch window.fetch to automatically include headers and intercept 401s
  useEffect(() => {
    if (typeof window !== "undefined" && !window.fetchPatched) {
      const originalFetch = window.fetch;
      window.fetch = async function (input, init) {
        let url = typeof input === "string" ? input : input?.url || "";
        
        // Match relative /api/ or absolute URL
        if (url.startsWith("/api/") || url.startsWith("http://localhost:3000/api/")) {
          init = init || {};
          init.headers = init.headers || {};
          
          let hasAuth = false;
          if (init.headers instanceof Headers) {
            hasAuth = init.headers.has("authorization");
          } else {
            hasAuth = Object.keys(init.headers).some(h => h.toLowerCase() === "authorization");
          }
          
          if (!hasAuth) {
            const adminToken = localStorage.getItem("adminToken");
            const userToken = localStorage.getItem("userToken");
            
            // Prioritize adminToken for dashboard/admin routes, and userToken for student portal routes
            const isAdminRoute = pathname.startsWith("/admin");
            const token = isAdminRoute ? (adminToken || userToken) : (userToken || adminToken);
            
            if (token) {
              if (init.headers instanceof Headers) {
                init.headers.set("authorization", `Bearer ${token}`);
              } else {
                init.headers = {
                  ...init.headers,
                  "Authorization": `Bearer ${token}`
                };
              }
            }
          }
        }

        const response = await originalFetch(input, init);

        // Intercept 401 Unauthorized globally for protected routes
        if (response.status === 401 && !url.includes("/api/user/login") && !url.includes("/api/admin/login")) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          
          window.dispatchEvent(new Event("user-login-change"));

          const isUserProtectedRoute = pathname.startsWith("/profile");
          const isAdminProtectedRoute = pathname.startsWith("/admin") && 
            !pathname.startsWith("/admin/auth/login") && 
            !pathname.startsWith("/admin/auth/register") && 
            !pathname.startsWith("/admin/auth/forgot-password");

          if (isAdminProtectedRoute) {
            window.location.href = "/admin/auth/login";
          } else if (isUserProtectedRoute) {
            window.location.href = "/login";
          }
        }

        return response;
      };
      window.fetchPatched = true;
    }
  }, [pathname]);

  // 1. Verify tokens with server ONLY on initial mount (app boot/refresh)
  useEffect(() => {
    const verifyTokensOnMount = async () => {
      if (typeof window === "undefined") return;

      const adminToken = localStorage.getItem("adminToken");
      const userToken = localStorage.getItem("userToken");

      const handleUserLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        window.dispatchEvent(new Event("user-login-change"));
        
        const isUserProtectedRoute = window.location.pathname.startsWith("/profile");
        if (isUserProtectedRoute) {
          window.location.href = "/login";
        }
      };

      const handleAdminLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        
        const path = window.location.pathname;
        const isAdminProtectedRoute = path.startsWith("/admin") && 
          !path.startsWith("/admin/auth/login") && 
          !path.startsWith("/admin/auth/register") && 
          !path.startsWith("/admin/auth/forgot-password");

        if (isAdminProtectedRoute) {
          window.location.href = "/admin/auth/login";
        }
      };

      // Check adminToken against server
      if (adminToken) {
        if (isTokenExpired(adminToken)) {
          handleAdminLogout();
        } else {
          try {
            const res = await fetch("/api/auth/verify", {
              headers: { "Authorization": `Bearer ${adminToken}` }
            });
            if (res.status === 401) {
              handleAdminLogout();
            }
          } catch (e) {
            console.error("Admin verification error:", e);
          }
        }
      }

      // Check userToken against server
      if (userToken) {
        if (isTokenExpired(userToken)) {
          handleUserLogout();
        } else {
          try {
            const res = await fetch("/api/auth/verify", {
              headers: { "Authorization": `Bearer ${userToken}` }
            });
            if (res.status === 401) {
              handleUserLogout();
            }
          } catch (e) {
            console.error("User verification error:", e);
          }
        }
      }
    };

    verifyTokensOnMount();
  }, []);

  // 2. Perform fast local-only JWT expiry validation on page transitions & periodically (every 15s)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUserLogout = () => {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      window.dispatchEvent(new Event("user-login-change"));
      
      const isUserProtectedRoute = pathname.startsWith("/profile");
      if (isUserProtectedRoute) {
        window.location.href = "/login";
      }
    };

    const handleAdminLogout = () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      
      const isAdminProtectedRoute = pathname.startsWith("/admin") && 
        !pathname.startsWith("/admin/auth/login") && 
        !pathname.startsWith("/admin/auth/register") && 
        !pathname.startsWith("/admin/auth/forgot-password");

      if (isAdminProtectedRoute) {
        window.location.href = "/admin/auth/login";
      }
    };

    const checkExpiry = () => {
      const adminToken = localStorage.getItem("adminToken");
      const userToken = localStorage.getItem("userToken");

      if (adminToken && isTokenExpired(adminToken)) {
        handleAdminLogout();
      }

      if (userToken && isTokenExpired(userToken)) {
        handleUserLogout();
      }
    };

    // Run check immediately on mount/transition
    checkExpiry();

    // Setup periodic check interval
    const interval = setInterval(checkExpiry, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Hide navbar and footer for admin/auth routes
  const isAdminAuthRoute = pathname.startsWith("/admin/auth");

  return (
    <>
      {!isAdminAuthRoute && <Navbar />}
      {!isAdminAuthRoute && <SocialBannerModal />}
      {children}
      {!isAdminAuthRoute && <Footer />}
    </>
  );
}

