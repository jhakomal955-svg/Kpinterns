"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const pathname = usePathname();

  // Sync theme class with global document tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Load admin details
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          setAdminData(JSON.parse(stored));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Navigation items for dashboard
  const navItems = [
    {
      label: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard",
    },
    {
      label: "Users",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.243 0-4.32-.647-6.089-1.763v-.108a6 6 0 0111.977-.825M15 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0-3.75a2.906 2.906 0 012.625 2.93c0 .952-.46 1.8-1.17 2.322"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/user",
    },
    {
      label: "Admins",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/admin",
    },
    {
      label: "Instructors",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.9c2.785 0 5.372-.468 7.732-1.32a60.47 60.47 0 00-.491-6.348L12 14.778l-7.74-4.631zm0 0l-.034-.002a7.5 7.5 0 1115.548 0L12 14.778l-7.74-4.631z"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/instructor",
    },
    {
      label: "College Partners",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.685 0-5.223.588-7.5 1.582V21m15 0h-16.5"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/college-admin",
    },
    {
      label: "Cybercafe Partners",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 21v-7.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75zm10.5 0h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H16.5a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/cybercafe",
    },
    {
      label: "Courses",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/course",
    },
    {
      label: "Internships",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/internship",
    },
    {
      label: "Contacts",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/contact",
    },
    {
      label: "Profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      href: "/admin/auth/dashboard/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main transition-colors duration-200 flex flex-col lg:flex-row">
      {/* Desktop Sidebar - Static */}
      <aside className="hidden lg:flex w-64 bg-bg-card border-r border-border-main flex-col fixed top-0 left-0 h-screen shadow-lg z-50">
        {/* Logo Header */}
        <div className="p-4 border-b border-border-main flex items-center justify-between">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-text-main">
              <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span><span className="text-brand-primary">Interns</span>
            </Link>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-main transition-colors flex-shrink-0"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg
                className="w-4 h-4"
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
                className="w-4 h-4"
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

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {(() => {
            if (adminData?.role === "Instructor") {
              return navItems.filter(item => ["Dashboard", "Courses", "Internships", "Profile"].includes(item.label));
            }
            if (adminData?.role === "College Admin" || adminData?.role === "Cybercafe Partner") {
              return navItems.filter(item => ["Profile"].includes(item.label));
            }
            return navItems;
          })().map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={`desktop-nav-${index}`}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-base ${isActive
                  ? "bg-brand-primary text-white shadow-md"
                  : "text-text-main hover:bg-bg-main"
                  }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 ${isActive ? "text-white" : "text-text-muted group-hover:text-brand-primary"}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Go to Website Button */}
        <div className="p-4 border-t border-border-main space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-muted hover:text-text-main hover:bg-bg-main text-base"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M3 8v5m0 0h5m-5-5l6.68-6.68a9.75 9.75 0 016.74 2.74M21 15v5m0 0h-5m5 0l-6.68 6.68"
              />
            </svg>
            <span className="font-medium text-base">Go to Website</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminData");
              window.location.href = "/admin/auth/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-muted hover:text-white hover:bg-red-500 text-base"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-bg-card border-r border-border-main transition-all duration-300 flex flex-col fixed top-0 left-0 h-screen w-64 shadow-lg z-40 lg:hidden`}
      >
        {/* Mobile Logo Header */}
        <div className="p-4 border-b border-border-main flex items-center justify-between">
          <div className="shrink-0 flex items-center">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-text-main">
              <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span><span className="text-brand-primary text-lg">Interns</span>
            </Link>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {(() => {
            if (adminData?.role === "Instructor") {
              return navItems.filter(item => ["Dashboard", "Courses", "Internships", "Profile"].includes(item.label));
            }
            if (adminData?.role === "College Admin" || adminData?.role === "Cybercafe Partner") {
              return navItems.filter(item => ["Profile"].includes(item.label));
            }
            return navItems;
          })().map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={`mobile-nav-${index}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-base ${isActive
                  ? "bg-brand-primary text-white shadow-md"
                  : "text-text-main hover:bg-bg-main"
                  }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 ${isActive ? "text-white" : "text-text-muted group-hover:text-brand-primary"}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Go to Website Button */}
        <div className="p-4 border-t border-border-main space-y-2">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-muted hover:text-text-main hover:bg-bg-main text-base"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M3 8v5m0 0h5m-5-5l6.68-6.68a9.75 9.75 0 016.74 2.74M21 15v5m0 0h-5m5 0l-6.68 6.68"
              />
            </svg>
            <span className="font-medium text-base">Go to Website</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              setSidebarOpen(false);
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminData");
              window.location.href = "/admin/auth/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-text-muted hover:text-white hover:bg-red-500 text-base"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-bg-card border-b border-border-main flex items-center justify-between sticky top-0 z-20 py-2">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
              title="Toggle Sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12h18M3 6h18M3 18h18"
                />
              </svg>
            </button>
            <Link href="/" className="text-xl font-extrabold tracking-tight text-text-main">
              <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span><span className="text-brand-primary">Interns</span>
            </Link>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg
                className="w-5 h-5"
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
                className="w-5 h-5"
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

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {(() => {
            const role = adminData?.role;
            const isInstructor = role === "Instructor";
            const isPartner = role === "College Admin" || role === "Cybercafe Partner";

            // Paths restricted for Instructor
            const isInstructorRestricted =
              pathname.startsWith("/admin/auth/dashboard/user") ||
              pathname.startsWith("/admin/auth/dashboard/admin") ||
              pathname.startsWith("/admin/auth/dashboard/contact") ||
              pathname.startsWith("/admin/auth/dashboard/college-admin") ||
              pathname.startsWith("/admin/auth/dashboard/cybercafe") ||
              pathname.startsWith("/admin/auth/dashboard/instructor");

            // Paths restricted for College Partner & Cybercafe Partner (they can only access dashboard base and profile)
            const isPartnerRestricted =
              pathname !== "/admin/auth/dashboard" &&
              pathname !== "/admin/auth/dashboard/profile";

            if (isPartner && isPartnerRestricted) {
              return (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="bg-bg-card border-2 border-border-main p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-text-main">Access Denied</h2>
                    <p className="text-sm text-text-muted leading-relaxed">
                      You do not have permission to access this page. Please contact the administrator.
                    </p>
                  </div>
                </div>
              );
            }

            if (isInstructor && isInstructorRestricted) {
              return (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="bg-bg-card border-2 border-border-main p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-text-main">Access Denied</h2>
                    <p className="text-sm text-text-muted leading-relaxed">
                      instructor have not acess for this page view and edit contact to admin for any updation
                    </p>
                  </div>
                </div>
              );
            }
            return children;
          })()}
        </div>
      </main>
    </div>
  );
}
