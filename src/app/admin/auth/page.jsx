
import React from 'react';
import Link from "next/link";

function page() {
  return (
    <>
{/* Main Content */}

      <main className="px-4 sm:px-8 lg:px-[96px] py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-main mb-4">
            Admin <span className="text-brand-primary">Portal</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Welcome to the KpInterns Admin Control Center. Select your role to continue.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Login Card */}
          <div className="group">
            <div className="bg-bg-card border-2 border-border-main rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-brand-primary h-full flex flex-col">
              {/* Icon */}
              <div className="mb-6 inline-flex">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-text-main mb-3">
                Admin Login
              </h2>
              <p className="text-text-muted mb-8 flex-grow">
                Sign in to your admin account to access the management dashboard and control panel.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Manage internships
                </li>
                <li className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Monitor applications
                </li>
                <li className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  View analytics
                </li>
              </ul>

              {/* Button */}
              <Link
                href="/admin/auth/login"
                className="w-full bg-brand-primary text-white font-semibold py-3 rounded-xl hover:bg-brand-primary/90 transition-all duration-200 text-center group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  Sign In as Admin
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Admin Register Card */}
          <div className="group">
            <div className="bg-bg-card border-2 border-border-main rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-brand-secondary h-full flex flex-col">
              {/* Icon */}
              <div className="mb-6 inline-flex">
                <div className="w-16 h-16 bg-brand-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-secondary/20 transition-colors">
                  <svg className="w-8 h-8 text-brand-secondary" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-text-main mb-3">
                Admin Register
              </h2>
              <p className="text-text-muted mb-8 flex-grow">
                Create a new admin account to access the management dashboard and administrative features.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Full admin privileges
                </li>
                <li className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Secure authentication
                </li>
                <li className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-brand-success" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Role-based access
                </li>
              </ul>

              {/* Button */}
              <Link
                href="/admin/auth/register"
                className="w-full bg-brand-secondary text-white font-semibold py-3 rounded-xl hover:bg-brand-secondary/90 transition-all duration-200 text-center group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  Create Admin Account
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-12">
          <p className="text-text-muted mb-4">
            Not an admin?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go to Home
          </Link>
        </div>
      </main>
    </>
  )
}

export default page


