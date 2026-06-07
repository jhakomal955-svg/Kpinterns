"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

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
            const token = adminToken || userToken;
            
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
        return originalFetch(input, init);
      };
      window.fetchPatched = true;
    }
  }, []);

  // Hide navbar and footer for admin/auth routes
  const isAdminAuthRoute = pathname.startsWith("/admin/auth");

  return (
    <>
      {!isAdminAuthRoute && <Navbar />}
      {children}
      {!isAdminAuthRoute && <Footer />}
    </>
  );
}
