"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminAuthPage({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync theme class with global document tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-bg-main transition-colors duration-200">
      {/* Header with Logo and Theme Toggle - Hidden on Dashboard */}
      {!isDashboard && (
        <header className="bg-bg-card border-b border-border-main sticky top-0 z-50 transition-colors duration-200 shadow-sm">
          <div className="px-4 sm:px-8 lg:px-[96px]">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/admin/auth" className="flex items-center group">
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-bg-main bg-text-main rounded-full p-2 inline-block group-hover:scale-110 transition-transform">
                    Kp
                  </span>
                  <span className="text-brand-primary ml-1 group-hover:text-brand-primary/80 transition-colors">
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
          <div className="px-4 sm:px-8 lg:px-[96px] text-center text-text-muted text-sm">
            <p>&copy; 2026 KpInterns. All rights reserved. | Admin Portal</p>
          </div>
        </footer>
      )}
    </div>
  );
}
