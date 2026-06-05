"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
            d="M12 4.354a4 4 0 110 5.292M15 12H9m4.854-5.354a4 4 0 11-5.292 0M19 20H5a2 2 0 00-2 2v1h18v-1a2 2 0 00-2-2z"
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
            <Link
              href="/"
              className="text-lg font-extrabold tracking-tight text-text-main"
            >
              <span className="text-bg-main bg-text-main rounded-full p-2">
                Kp
              </span>
              <span className="text-brand-primary text-base">Interns</span>
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
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={`desktop-nav-${index}`}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-base ${
                  isActive
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
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-bg-card border-r border-border-main transition-all duration-300 flex flex-col fixed top-0 left-0 h-screen w-64 shadow-lg z-40 lg:hidden`}
      >
        {/* Mobile Logo Header */}
        <div className="p-4 border-b border-border-main flex items-center justify-between">
          <div className="shrink-0 flex items-center">
            <Link
              href="/"
              className="text-lg font-extrabold tracking-tight text-text-main"
            >
              <span className="text-bg-main bg-text-main rounded-full p-2">
                Kp
              </span>
              <span className="text-brand-primary text-base">Interns</span>
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
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={`mobile-nav-${index}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-base ${
                  isActive
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
        <div className="lg:hidden bg-bg-card border-b border-border-main p-4 flex items-center justify-between sticky top-0 z-20">
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
            <Link
              href="/"
              className="ml-4 text-base font-extrabold tracking-tight text-text-main"
            >
              <span className="text-bg-main bg-text-main rounded-full p-1">
                Kp
              </span>
              <span className="text-brand-primary text-xs">Interns</span>
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
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
