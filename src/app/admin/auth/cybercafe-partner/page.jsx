"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CybercafeDashboardPage() {
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        setIsLoading(true);
        const storedAdmin = localStorage.getItem("adminData");
        const token = localStorage.getItem("adminToken");
        if (!storedAdmin || !token) {
          setError("Session expired. Please login again.");
          setIsLoading(false);
          return;
        }

        const adminInfo = JSON.parse(storedAdmin);
        const headers = { "Authorization": `Bearer ${token}` };
        const res = await fetch(`/api/admin?id=${adminInfo._id}`, { headers });
        const data = await res.json();

        if (data.success && data.data) {
          setPartnerProfile(data.data);
        } else {
          setError(data.error || "Failed to fetch partner dashboard data");
        }
      } catch (err) {
        console.error("Error fetching cybercafe details:", err);
        setError("An error occurred while loading dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-text-muted">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-lg mx-auto text-center space-y-4 shadow-xl">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-6 rounded-xl transition duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const usersCreated = partnerProfile?.Usercreated || [];
  const totalRegistrations = usersCreated.length;
  
  // Calculate active programs (internships/courses)
  const activeCount = usersCreated.reduce((acc, user) => {
    const internships = user.ActiveInternship || [];
    const courses = user.ActiveCources || [];
    const activeInternships = internships.filter(i => i.internshipStatus === "Active").length;
    const activeCourses = courses.filter(c => c.courseStatus === "Active").length;
    return acc + activeInternships + activeCourses;
  }, 0);

  // Get last 5 registrations
  const recentRegistrations = [...usersCreated]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary rounded-2xl sm:rounded-3xl p-6 md:p-10 lg:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="relative z-10 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              Welcome back, {partnerProfile?.name || "Partner"}! 👋
            </h1>
            <p className="text-sm sm:text-base md:text-lg opacity-90 leading-relaxed max-w-xl">
              Manage student registrations, enroll new users, and view complete details of students registered under your cybercafe partner account.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-xs sm:text-sm w-fit font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Total Registered Students */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 hover:shadow-lg transition duration-300 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Registered Students</h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main">{totalRegistrations}</p>
          </div>
          <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Active Enrolled Programs */}
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 hover:shadow-lg transition duration-300 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Active Enrollments</h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main">{activeCount}</p>
          </div>
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-text-main">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/auth/cybercafe-partner/new-user">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-2xl p-6 text-left hover:border-brand-primary hover:shadow-lg transition-all duration-300 group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-text-main text-base sm:text-lg">Register Student</h3>
                  <p className="text-xs sm:text-sm text-text-muted">Create a new student enrollment profile</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-text-muted group-hover:text-brand-primary transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>

          <Link href="/admin/auth/cybercafe-partner/all-user">
            <button className="w-full bg-bg-card border-2 border-border-main rounded-2xl p-6 text-left hover:border-brand-primary hover:shadow-lg transition-all duration-300 group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 12H9m4.854-5.354a4 4 0 11-5.292 0M19 20H5a2 2 0 00-2 2v1h18v-1a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-text-main text-base sm:text-lg">All Registered Students</h3>
                  <p className="text-xs sm:text-sm text-text-muted">View and search complete student listings</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-text-muted group-hover:text-brand-primary transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main">Recent Student Registrations</h2>
          <Link href="/admin/auth/cybercafe-partner/all-user" className="text-sm font-semibold text-brand-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm">
          {recentRegistrations.length === 0 ? (
            <div className="p-10 text-center text-text-muted">
              No students have been registered under your cybercafe partner account yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase font-semibold">
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Email & Phone</th>
                    <th className="py-4 px-6">Academic Branch</th>
                    <th className="py-4 px-6">Enrolled Program</th>
                    <th className="py-4 px-6">Reg Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main text-text-main text-sm">
                  {recentRegistrations.map((user) => {
                    const programTitle =
                      user.ActiveInternship?.[0]?.internship?.title ||
                      user.ActiveCources?.[0]?.course?.title ||
                      "N/A";
                    const programType =
                      user.ActiveInternship?.length > 0
                        ? "Internship"
                        : user.ActiveCources?.length > 0
                        ? "Course"
                        : "";
                    
                    return (
                      <tr key={user._id} className="hover:bg-bg-main/30 transition duration-150">
                        <td className="py-4 px-6 font-semibold">{user.fullName}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col text-xs">
                            <span>{user.email}</span>
                            <span className="text-text-muted">{user.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold">{user.college}</span>
                            <span className="text-text-muted">{user.degree} - {user.department}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-text-main">{programTitle}</span>
                            {programType && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${programType === "Internship" ? "text-brand-secondary" : "text-brand-primary"}`}>
                                {programType}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-text-muted font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
