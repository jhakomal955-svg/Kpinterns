"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CollegeAdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let currentAdmin = null;
    let token = null;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        token = localStorage.getItem("adminToken");
        if (stored) {
          currentAdmin = JSON.parse(stored);
          setAdminData(currentAdmin);
        }
      } catch (err) {
        console.error("Error reading localStorage:", err);
      }
    }

    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        if (!token) {
          setError("Session expired. Please log in again.");
          return;
        }

        const res = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setStudents(data.data || []);
        } else {
          setError(data.error || "Failed to fetch student records.");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("An error occurred while connecting to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Calculate statistics
  const enrolledStudents = students.length;
  let enrolledCourses = 0;
  let enrolledInternships = 0;

  students.forEach((student) => {
    enrolledCourses += student.ActiveCources?.length || 0;
    enrolledInternships += student.ActiveInternship?.length || 0;
  });

  // Get recent 5 enrollments
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        <p className="text-text-muted font-medium">Loading college dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl max-w-lg mx-auto text-center space-y-4 shadow-md">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-sm leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary rounded-2xl sm:rounded-3xl p-6 md:p-8 lg:p-12 text-white shadow-2xl">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                Welcome back, {adminData?.name || "College Admin"}! 👋
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
                Here is the current enrollment status for{" "}
                <span className="font-semibold underline decoration-brand-secondary">
                  {adminData?.CollegeName || "your college"}
                </span>
                .
              </p>
            </div>

            {/* Quick Date Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 border border-white/20 text-xs sm:text-sm md:text-base w-fit">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Students */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-blue-500 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">
              Enrolled Students
            </h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main">
              {enrolledStudents}
            </p>
          </div>
          <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
            <svg
              className="w-8 h-8"
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
        </div>

        {/* Total Enrolled Courses */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-green-500 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">
              Course Enrollments
            </h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main">
              {enrolledCourses}
            </p>
          </div>
          <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
            <svg
              className="w-8 h-8"
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
        </div>

        {/* Total Enrolled Internships */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-orange-500 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">
              Internship Enrollments
            </h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main">
              {enrolledInternships}
            </p>
          </div>
          <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
            <svg
              className="w-8 h-8"
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
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main">Recent Enrollments</h2>
            <Link
              href="/admin/auth/college-admin/students"
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {recentStudents.length === 0 ? (
            <div className="p-8 text-center bg-bg-main rounded-xl border border-border-main text-text-muted text-sm">
              No students enrolled yet from your college.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-text-muted text-xs font-bold uppercase">
                    <th className="pb-3 pr-2">Student</th>
                    <th className="pb-3 pr-2">Roll No. / Dept.</th>
                    <th className="pb-3 pr-2">Session</th>
                    <th className="pb-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/50 text-sm">
                  {recentStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-bg-main/50 transition">
                      <td className="py-3 pr-2">
                        <div className="font-semibold text-text-main">{student.fullName}</div>
                        <div className="text-xs text-text-muted">{student.email}</div>
                      </td>
                      <td className="py-3 pr-2">
                        <div className="text-text-main">{student.rollNumber}</div>
                        <div className="text-xs text-text-muted">
                          {student.degree} - {student.department}
                        </div>
                      </td>
                      <td className="py-3 pr-2 text-text-main">{student.session}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/auth/college-admin/students?studentId=${student._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition"
                        >
                          View
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions & Navigation */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-text-main">Quick Actions</h2>

          <div className="space-y-3">
            <Link href="/admin/auth/college-admin/students" className="block">
              <button className="w-full flex items-center gap-3 p-4 bg-bg-main border border-border-main hover:border-brand-primary rounded-xl text-left hover:shadow-sm transition group">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition flex-shrink-0">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-text-main text-sm">
                    Manage Students
                  </h4>
                  <p className="text-xs text-text-muted">
                    Filter by session and view progress
                  </p>
                </div>
              </button>
            </Link>

            <Link href="/admin/auth/college-admin/profile" className="block">
              <button className="w-full flex items-center gap-3 p-4 bg-bg-main border border-border-main hover:border-brand-primary rounded-xl text-left hover:shadow-sm transition group">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition flex-shrink-0">
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
                </div>
                <div>
                  <h4 className="font-semibold text-text-main text-sm">
                    View Profile
                  </h4>
                  <p className="text-xs text-text-muted">
                    Update college details and bio
                  </p>
                </div>
              </button>
            </Link>
          </div>

          <div className="pt-4 border-t border-border-main space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              College Admin Info
            </h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Role:</span>
                <span className="font-semibold text-text-main">
                  {adminData?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">University:</span>
                <span className="font-semibold text-text-main truncate max-w-[150px]">
                  {adminData?.UniversityName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">College Name:</span>
                <span className="font-semibold text-text-main truncate max-w-[150px]">
                  {adminData?.CollegeName || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
