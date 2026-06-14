"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("userToken");
      const data = localStorage.getItem("userData");
      if (token && data) {
        setIsLoggedIn(true);
        try {
          setUser(JSON.parse(data));
        } catch (e) {
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkLogin();
    window.addEventListener("user-login-change", checkLogin);
    return () => window.removeEventListener("user-login-change", checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    window.dispatchEvent(new Event("user-login-change"));
    window.location.href = "/login";
  };

  // Sync theme class with global document tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Dynamic Array for your menu links to keep code clean and maintainable
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Internship", href: "/internship" },
    { label: "Courses", href: "/courses" },
    { label: "Verify", href: "/verify" },
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/contact" },
    
  ];

  return (
    <nav className="bg-bg-card border-b border-border-main sticky top-0 z-50 transition-colors duration-200 shadow-sm">
      <div className="px-4 sm:px-8 lg:px-[60px]">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo Section from your notes */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-text-main">
              <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span><span className="text-brand-primary">Interns</span>
            </Link>
          </div>

          {/* Desktop Navigation Links Menu */}
          <div className="hidden lg:flex items-center space-x-15">
            {navLinks.map((link) => (
              <Link   
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text-muted hover:text-brand-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Controls (Theme Mode + Actions) */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Dark/Light Mode Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
              title="Change Theme Mode"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 5.657a4 4 0 118 0 4 4 0 01-8 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 text-sm font-semibold text-text-muted hover:text-text-main px-3 py-2 transition-colors bg-bg-main rounded-xl border border-border-main">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center text-xs font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span>{user?.fullName?.split(" ")[0] || "Profile"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-text-muted hover:text-text-main px-3 py-2 transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="bg-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-all shadow-md">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile View Right Side Controls */}
          <div className="flex items-center lg:hidden space-x-2">
            {/* Mobile Mode Toggle Switch */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 5.657a4 4 0 118 0 4 4 0 01-8 0z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-main focus:outline-none transition-colors"
            >
              {!isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Drawer Slide-Down Panel */}
      <div className={`${isOpen ? "block" : "hidden"} lg:hidden border-t border-border-main bg-bg-card`} id="mobile-menu">
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-text-muted hover:bg-bg-main hover:text-brand-primary transition-all"
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-4 mt-2 border-t border-border-main px-3 flex flex-col space-y-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-3 rounded-xl text-base font-semibold bg-bg-main text-text-main border border-border-main hover:bg-bg-card transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center text-sm font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span>{user?.fullName || "My Profile"}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full bg-red-500 text-center text-white text-base font-semibold py-3 rounded-xl hover:bg-red-600 transition-all shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full text-center text-base font-semibold text-text-muted hover:text-text-main py-2.5 transition-colors">
                  Log In
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="w-full bg-brand-primary text-center text-white text-base font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition-all shadow-md">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}