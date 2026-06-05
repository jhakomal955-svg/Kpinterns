"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 1245,
    admins: 8,
    courses: 42,
    internships: 156,
    contactMessages: 89,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [users, admins, courses, internships, contacts] = await Promise.all([
          fetch('/api/user').then(r => r.json()),
          fetch('/api/admin').then(r => r.json()),
          fetch('/api/course').then(r => r.json()),
          fetch('/api/internship').then(r => r.json()),
          fetch('/api/contact').then(r => r.json()),
        ]);
        
        setStats({
          users: users.success && Array.isArray(users.data) ? users.data.length : 0,
          admins: admins.success && Array.isArray(admins.data) ? admins.data.length : 0,
          courses: courses.success && Array.isArray(courses.data) ? courses.data.length : 0,
          internships: internships.success && Array.isArray(internships.data) ? internships.data.length : 0,
          contactMessages: contacts.success && Array.isArray(contacts.data) ? contacts.data.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, label, count, href, color, trend }) => (
    <Link href={href} className="group">
      <div className="bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-current hover:shadow-lg transition-all duration-300 h-full">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm md:text-base text-text-muted font-medium tracking-wide truncate">
              {label}
            </h3>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main">
              {count.toLocaleString()}
            </p>
          </div>
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${color}`}
          >
            {Icon}
          </div>
        </div>

        {/* Footer with Trend */}
        <div className="pt-3 sm:pt-4 border-t border-border-main">
          <p className="text-xs md:text-sm text-brand-success font-medium truncate">
            {trend}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 text-white shadow-2xl">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
                Here's what's happening with your internship platform today.
              </p>
            </div>

            {/* Quick Date Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border border-white/20 text-xs sm:text-sm md:text-base w-fit">
              <p className="font-semibold">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {/* Total Users */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-blue-500"
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
          }
          label="Total Users"
          count={stats.users}
          href="/admin/auth/dashboard/user"
          color="bg-blue-100 dark:bg-blue-900/30"
          trend="↑ 12% from last month"
        />

        {/* Total Admins */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-purple-500"
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
          }
          label="Total Admins"
          count={stats.admins}
          href="/admin/auth/dashboard/admin"
          color="bg-purple-100 dark:bg-purple-900/30"
          trend="↑ 2 new this month"
        />

        {/* Total Courses */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-green-500"
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
          }
          label="Total Courses"
          count={stats.courses}
          href="/admin/auth/dashboard/course"
          color="bg-green-100 dark:bg-green-900/30"
          trend="↑ 8% from last month"
        />

        {/* Total Internships */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-orange-500"
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
          }
          label="Total Internships"
          count={stats.internships}
          href="/admin/auth/dashboard/internship"
          color="bg-orange-100 dark:bg-orange-900/30"
          trend="↑ 23% from last month"
        />

        {/* Contact Messages */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-red-500"
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
          }
          label="Contact Messages"
          count={stats.contactMessages}
          href="/admin/auth/dashboard/contact"
          color="bg-red-100 dark:bg-red-900/30"
          trend="↑ 15 new today"
        />
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-text-main px-2 sm:px-0">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Add New Admin */}
          <Link href="/admin/auth/dashboard/admin">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-purple-500 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg
                    className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main text-sm sm:text-base md:text-lg truncate">
                    Manage Admins
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted truncate">
                    Add or edit admin accounts
                  </p>
                </div>
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </button>
          </Link>

          {/* View All Users */}
          <Link href="/admin/auth/dashboard/user">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg
                    className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-blue-500"
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
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main text-sm sm:text-base md:text-lg truncate">
                    View All Users
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted truncate">
                    See all registered users
                  </p>
                </div>
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </button>
          </Link>

          {/* View All Courses */}
          <Link href="/admin/auth/dashboard/course">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-green-500 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-green-100 dark:bg-green-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg
                    className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-green-500"
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
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main text-sm sm:text-base md:text-lg truncate">
                    View All Courses
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted truncate">
                    Manage all courses
                  </p>
                </div>
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </button>
          </Link>

          {/* View All Internships */}
          <Link href="/admin/auth/dashboard/internship">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-orange-500 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg
                    className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-orange-500"
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
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main text-sm sm:text-base md:text-lg truncate">
                    View All Internships
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted truncate">
                    Manage internship listings
                  </p>
                </div>
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </button>
          </Link>

          {/* View Contact Messages */}
          <Link href="/admin/auth/dashboard/contact">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-500 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 md:w-14 sm:h-12 md:h-14 bg-red-100 dark:bg-red-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg
                    className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-red-500"
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
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-text-main text-sm sm:text-base md:text-lg truncate">
                    Contact Messages
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted truncate">
                    View user inquiries
                  </p>
                </div>
                <svg className="w-4 sm:w-5 h-4 sm:h-5 text-text-muted group-hover:text-brand-primary transition-colors flex-shrink-0">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Overview Card - Left */}
        <div className="bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-text-main mb-4 sm:mb-6">
            Platform Statistics
          </h3>
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                <p className="text-xs sm:text-sm text-text-muted font-medium truncate">
                  Active Users
                </p>
              </div>
              <p className="text-text-main font-bold text-xs sm:text-sm ml-2">
                {Math.round(stats.users * 0.85).toLocaleString()}
              </p>
            </div>
            <div className="w-full bg-border-main rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <p className="text-xs sm:text-sm text-text-muted font-medium truncate">
                  Active Internships
                </p>
              </div>
              <p className="text-text-main font-bold text-xs sm:text-sm ml-2">
                {Math.round(stats.internships * 0.72).toLocaleString()}
              </p>
            </div>
            <div className="w-full bg-border-main rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "72%" }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></div>
                <p className="text-xs sm:text-sm text-text-muted font-medium truncate">
                  Course Completion
                </p>
              </div>
              <p className="text-text-main font-bold text-xs sm:text-sm ml-2">
                68%
              </p>
            </div>
            <div className="w-full bg-border-main rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: "68%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Support Section - Right */}
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-2 border-brand-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-text-main mb-4 sm:mb-6">
            Need Help?
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm md:text-base text-text-muted leading-relaxed">
              Access our comprehensive documentation and support resources to
              help you manage your platform effectively.
            </p>

            <div className="space-y-2 sm:space-y-3 pt-2">
              <button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>View Documentation</span>
              </button>
              <button className="w-full bg-white hover:bg-gray-50 dark:bg-bg-main dark:hover:bg-border-main text-brand-primary rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 border-brand-primary/20 text-xs sm:text-sm md:text-base">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
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
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
