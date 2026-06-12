
"use client";

import React from 'react';
import Link from "next/link";

export default function AdminPortalPage() {
  const roles = [
    {
      title: "System Admin",
      description: "Manage global platform settings, view system-wide analytics, oversee internships/courses, and manage administrative accounts.",
      badge: "Full Access",
      color: "from-indigo-500/10 to-blue-500/10 hover:border-indigo-500 border-indigo-500/30",
      iconColor: "text-indigo-500",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      title: "Instructor",
      description: "Manage assigned courses, build and edit curriculum chapters, track student progress, and grade assignments.",
      badge: "Academics",
      color: "from-purple-500/10 to-pink-500/10 hover:border-purple-500 border-purple-500/30",
      iconColor: "text-purple-500",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "College Partner",
      description: "Monitor college-specific student enrollments, view academic performance summaries, and track batch reports.",
      badge: "Partnership",
      color: "from-cyan-500/10 to-teal-500/10 hover:border-cyan-500 border-cyan-500/30",
      iconColor: "text-cyan-500",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: "Cybercafe Partner",
      description: "Create and register new student accounts locally, print application confirmations, and manage user profile entries.",
      badge: "Registration",
      color: "from-emerald-500/10 to-green-500/10 hover:border-emerald-500 border-emerald-500/30",
      iconColor: "text-emerald-500",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <main className="px-4 sm:px-8 lg:px-[96px] py-12 sm:py-16">
      {/* Hero Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-main mb-4 tracking-tight">
          Centralized Admin & <span className="text-brand-primary">Partner Portal</span>
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          Welcome to the KpInterns administrative control panel. All operations, verification dashboards, and partner management tools are accessed securely here.
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16 animate-fade-in">
        {roles.map((r, i) => (
          <div
            key={i}
            className={`bg-bg-card border-2 rounded-2xl p-6 transition-all duration-300 flex flex-col h-full bg-gradient-to-b ${r.color} hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-bg-card/80 shadow-sm ${r.iconColor}`}>
                {r.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-bg-main border border-border-main rounded-full text-text-muted">
                {r.badge}
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">
              {r.title}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed flex-grow">
              {r.description}
            </p>
          </div>
        ))}
      </div>

      {/* Unified Action Callout */}
      <div className="max-w-3xl mx-auto bg-bg-card border-2 border-border-main rounded-3xl p-8 sm:p-10 shadow-xl text-center relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-success"></div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-main mb-3">
          Access Your Unified Workspace
        </h2>
        <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mb-8">
          No matter your role, use our unified secure authorization portal to log into your custom workspace or apply for a partner account.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/admin/auth/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/45 transition-all duration-200 text-center"
          >
            Sign In to Portal
          </Link>
          <Link
            href="/admin/auth/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-bg-main hover:bg-border-main border-2 border-border-main text-text-main font-bold rounded-xl transition-all duration-200 text-center"
          >
            Register as Partner
          </Link>
        </div>
      </div>

      {/* Back to website link */}
      <div className="text-center mt-12 animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-bold transition-all text-sm group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main Website
        </Link>
      </div>
    </main>
  );
}


