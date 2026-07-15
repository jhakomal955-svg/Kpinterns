"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminAuthPage({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isAuthenticated, isLoading: contextLoading } = useAdminAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const isDashboard = 
    pathname.includes("/dashboard") ||
    pathname.includes("/instructors") ||
    pathname.includes("/college-admin") ||
    pathname.includes("/cybercafe-partner");

  const redirectCorrectDashboard = (role) => {
    if (role === "Instructor") {
      router.push("/admin/auth/instructors");
    } else if (role === "College Admin") {
      router.push("/admin/auth/college-admin");
    } else if (role === "Cybercafe Partner") {
      router.push("/admin/auth/cybercafe-partner");
    } else if (role === "Admin" || role === "Employee") {
      router.push("/admin/auth/dashboard");
    } else {
      router.push("/admin/auth/login");
    }
  };

  // Guard routes based on auth status and role
  useEffect(() => {
    if (contextLoading) return;

    const token = localStorage.getItem("adminToken");
    const role = admin?.role;

    if (!token || !isAuthenticated) {
      if (isDashboard) {
        router.push("/admin/auth");
      }
    } else {
      // User is authenticated
      const isAuthEntrance = pathname === "/admin/auth" || pathname === "/admin/auth/login" || pathname === "/admin/auth/register";
      
      if (isAuthEntrance) {
        redirectCorrectDashboard(role);
      } else {
        // Guard unauthorized role access
        const isInstructorPortal = pathname === "/admin/auth/instructors" || pathname.startsWith("/admin/auth/instructors/");
        const isCollegeAdminPortal = pathname === "/admin/auth/college-admin" || pathname.startsWith("/admin/auth/college-admin/");
        const isCybercafePortal = pathname === "/admin/auth/cybercafe-partner" || pathname.startsWith("/admin/auth/cybercafe-partner/");
        const isDashboardPortal = pathname === "/admin/auth/dashboard" || pathname.startsWith("/admin/auth/dashboard/");

        if (isInstructorPortal && role !== "Instructor") {
          redirectCorrectDashboard(role);
        } else if (isCollegeAdminPortal && role !== "College Admin") {
          redirectCorrectDashboard(role);
        } else if (isCybercafePortal && role !== "Cybercafe Partner") {
          redirectCorrectDashboard(role);
        } else if (isDashboardPortal && role !== "Admin" && role !== "Employee") {
          redirectCorrectDashboard(role);
        }
      }
    }
  }, [pathname, isAuthenticated, contextLoading, admin, isDashboard, router]);

  // Sync theme class with global document tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main transition-colors duration-200">
      {/* Header with Logo and Theme Toggle - Hidden on Dashboard */}
      {!isDashboard && (
        <header className="bg-bg-card border-b border-border-main sticky top-0 z-50 transition-colors duration-200 shadow-sm">
          <div className="px-4 sm:px-8 lg:px-[60px]">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/admin/auth" className="flex items-center group">
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-bg-main bg-text-main rounded-full p-2 inline-block group-hover:scale-110 transition-transform">
                    Kp
                  </span>
                  <span className="text-brand-primary  group-hover:text-brand-primary/80 transition-colors">
                    Interns
                  </span>
                </span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-main transition-all"
                title="Change Theme Mode"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 5.657a4 4 0 118 0 4 4 0 01-8 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>
      )}
      {children}
      {/* Footer - Hidden on Dashboard */}
      {!isDashboard && (
        <footer className="bg-bg-card border-t border-border-main mt-20 py-8 transition-colors duration-200">
          <div className="px-4 sm:px-8 lg:px-[60px] text-center text-text-muted text-sm">
            <p>&copy; 2026 KpInterns. All rights reserved. | Admin Portal</p>
          </div>
        </footer>
      )}
    </div>
  );
}
