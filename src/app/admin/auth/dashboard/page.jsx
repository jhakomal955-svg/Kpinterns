"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BranchBadges from "@/components/BranchBadges";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    instructors: 0,
    collegePartners: 0,
    cybercafePartners: 0,
    employees: 0,
    courses: 0,
    internships: 0,
    contactMessages: 0,
  });
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminsList, setAdminsList] = useState([]);

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

          // Redirect role-specific admins to their designated panels
          if (currentAdmin.role === "Instructor") {
            window.location.href = "/admin/auth/instructors";
            return;
          } else if (currentAdmin.role === "College Admin") {
            window.location.href = "/admin/auth/college-admin";
            return;
          } else if (currentAdmin.role === "Cybercafe Partner") {
            window.location.href = "/admin/auth/cybercafe-partner";
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // If employee, we also want to fetch their fresh admin profile to get current totalRevenue and Usercreated
        if (currentAdmin && currentAdmin.role === "Employee") {
          const profileRes = await fetch(`/api/admin?id=${currentAdmin._id}`, { headers }).then(r => r.json());
          if (profileRes.success && profileRes.data) {
            setAdminData(profileRes.data);
            localStorage.setItem("adminData", JSON.stringify(profileRes.data));
          }
        }

        if (currentAdmin && currentAdmin.role === "Instructor") {
          const [coursesRes, internshipsRes] = await Promise.all([
            fetch('/api/course', { headers }).then(r => r.json()),
            fetch('/api/internship', { headers }).then(r => r.json()),
          ]);
          if (coursesRes.success) setCourses(coursesRes.data || []);
          if (internshipsRes.success) setInternships(internshipsRes.data || []);
        } else {
          const [users, admins, coursesRes, internshipsRes, contacts] = await Promise.all([
            fetch('/api/user', { headers }).then(r => r.json()),
            fetch('/api/admin', { headers }).then(r => r.json()),
            fetch('/api/course', { headers }).then(r => r.json()),
            fetch('/api/internship', { headers }).then(r => r.json()),
            fetch('/api/contact', { headers }).then(r => r.json()),
          ]);
          
          if (coursesRes.success) setCourses(coursesRes.data || []);
          if (internshipsRes.success) setInternships(internshipsRes.data || []);

          const allAdmins = admins.success && Array.isArray(admins.data) ? admins.data : [];
          setAdminsList(allAdmins);
          
          const adminCount = allAdmins.filter(a => a.role === "Admin" || !a.role).length;
          const employeeCount = allAdmins.filter(a => a.role === "Employee").length;
          const instructorCount = allAdmins.filter(a => a.role === "Instructor").length;
          const collegeCount = allAdmins.filter(a => a.role === "College Admin").length;
          const cybercafeCount = allAdmins.filter(a => a.role === "Cybercafe Partner").length;

          setStats({
            users: users.success && Array.isArray(users.data) ? users.data.length : 0,
            admins: adminCount,
            employees: employeeCount,
            instructors: instructorCount,
            collegePartners: collegeCount,
            cybercafePartners: cybercafeCount,
            courses: coursesRes.success && Array.isArray(coursesRes.data) ? coursesRes.data.length : 0,
            internships: internshipsRes.success && Array.isArray(internshipsRes.data) ? internshipsRes.data.length : 0,
            contactMessages: contacts.success && Array.isArray(contacts.data) ? contacts.data.length : 0,
          });
        }
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
              {count != null ? count.toLocaleString() : 0}
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

  const myCourses = courses.filter(course =>
    course.instructor?.some(inst => {
      const instId = typeof inst.id === "object" ? inst.id?._id : inst.id;
      return instId === adminData?._id;
    })
  );

  const myInternships = internships.filter(internship =>
    internship.instructor?.some(inst => {
      const instId = typeof inst.id === "object" ? inst.id?._id : inst.id;
      return instId === adminData?._id;
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (adminData?.role === "College Admin" || adminData?.role === "Cybercafe Partner") {
    return (
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 text-white shadow-2xl">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
                  Welcome back, {adminData?.name}! 👋
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
                  Your {adminData?.role === "College Admin" ? "College Partner" : "Cybercafe Partner"} account is verified.
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

        {/* Informational Card */}
        <div className="p-8 bg-bg-card border-2 border-border-main rounded-2xl text-center space-y-4 max-w-lg mx-auto shadow-xl">
          <div className="mx-auto w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-main">No Permissions Assigned Yet</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Your account has been verified successfully. The platform administrator will assign your permissions and dashboard tools shortly.
          </p>
        </div>
      </div>
    );
  }

  if (adminData?.role === "Instructor") {
    return (
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-primary via-brand-primary to-brand-secondary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 text-white shadow-2xl">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
                  Welcome back, {adminData?.name}! 👋
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
                  Here's what's happening with your assigned courses and internships today.
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Assigned Courses</h3>
              <p className="text-3xl sm:text-4xl font-extrabold text-text-main">{myCourses.length}</p>
            </div>
            <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
          </div>
          
          <div className="bg-bg-card border-2 border-border-main rounded-xl sm:rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xs sm:text-sm text-text-muted font-bold uppercase tracking-wider">Assigned Internships</h3>
              <p className="text-3xl sm:text-4xl font-extrabold text-text-main">{myInternships.length}</p>
            </div>
            <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assigned Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main">Assigned Courses ({myCourses.length})</h2>
            <Link href="/admin/auth/dashboard/course" className="text-sm font-semibold text-brand-primary hover:underline">Manage Courses</Link>
          </div>
          
          {myCourses.length === 0 ? (
            <div className="p-10 text-center bg-bg-card border-2 border-border-main rounded-2xl text-text-muted">
              You are not currently assigned to any courses.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <div key={course._id} className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-primary/40 transition">
                  <div className="aspect-video bg-bg-main relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-semibold">No Thumbnail</div>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-brand-secondary">{course.department}</span>
                      <h4 className="font-bold text-base text-text-main line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-text-muted line-clamp-2">{course.shortDescription || course.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-main">
                      <span className="text-xs bg-gray-500/10 px-2 py-0.5 rounded border border-border-main text-text-muted">{course.status}</span>
                      <Link href={`/admin/auth/dashboard/course/${course._id}`} className="text-xs bg-brand-primary text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-primary/90 transition">Edit Course</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Internships Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-text-main">Assigned Internships ({myInternships.length})</h2>
            <Link href="/admin/auth/dashboard/internship" className="text-sm font-semibold text-brand-primary hover:underline">Manage Internships</Link>
          </div>
          
          {myInternships.length === 0 ? (
            <div className="p-10 text-center bg-bg-card border-2 border-border-main rounded-2xl text-text-muted">
              You are not currently assigned to any internships.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myInternships.map((internship) => (
                <div key={internship._id} className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-primary/40 transition">
                  <div className="aspect-video bg-bg-main relative">
                    {internship.thumbnail ? (
                      <img src={internship.thumbnail} alt={internship.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-semibold">No Thumbnail</div>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <BranchBadges department={internship.department} maxVisible={1} />
                      <h4 className="font-bold text-base text-text-main line-clamp-1">{internship.title}</h4>
                      <h5 className="font-semibold text-xs text-text-muted">{internship.position}</h5>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-main">
                      <span className="text-xs bg-gray-500/10 px-2 py-0.5 rounded border border-border-main text-text-muted">{internship.status}</span>
                      <Link href={`/admin/auth/dashboard/internship/${internship._id}`} className="text-xs bg-brand-primary text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-primary/90 transition">Edit Internship</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

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
                Welcome back, {adminData?.name || "Admin"}! 👋
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 leading-relaxed">
                Here's what's happening with your {adminData?.role === "Employee" ? "registrations" : "internship platform"} today.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {adminData?.role === "Employee" ? (
          <>
            {/* Total Users Registered by Them */}
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
              label="Users Registered by You"
              count={adminData?.Usercreated?.length || 0}
              href="/admin/auth/dashboard/profile"
              color="bg-blue-100 dark:bg-blue-900/30"
              trend="View list in profile"
            />

            {/* Employee Revenue */}
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              label="Total Revenue Generated"
              count={`₹${adminData?.totalRevenue || 0}`}
              href="/admin/auth/dashboard/profile"
              color="bg-green-100 dark:bg-green-900/30"
              trend={`Commission: ${adminData?.commissionPercentage || 0}%`}
            />

            {/* Payments Done */}
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
              label="Payments Received"
              count={`₹${adminData?.paymentsDone || 0}`}
              href="/admin/auth/dashboard/profile"
              color="bg-purple-100 dark:bg-purple-900/30"
              trend="Paid by Admin"
            />
          </>
        ) : (
          <>
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

        {/* Total Employees */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-indigo-500"
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
          }
          label="Total Employees"
          count={stats.employees}
          href="/admin/auth/dashboard/admin"
          color="bg-indigo-100 dark:bg-indigo-900/30"
          trend="Employee Panel active"
        />

        {/* Total Instructors */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-pink-500"
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
          }
          label="Total Instructors"
          count={stats.instructors}
          href="/admin/auth/dashboard/instructor"
          color="bg-pink-100 dark:bg-pink-900/30"
          trend="↑ 1 new this month"
        />

        {/* Total College Partners */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-amber-500"
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
          }
          label="College Partners"
          count={stats.collegePartners}
          href="/admin/auth/dashboard/college-admin"
          color="bg-amber-100 dark:bg-amber-900/30"
          trend="Pending verification"
        />

        {/* Total Cybercafe Partners */}
        <StatCard
          icon={
            <svg
              className="w-7 sm:w-8 md:w-10 lg:w-10 h-7 sm:h-8 md:h-10 lg:h-10 text-cyan-500"
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
          }
          label="Cybercafe Partners"
          count={stats.cybercafePartners}
          href="/admin/auth/dashboard/cybercafe"
          color="bg-cyan-100 dark:bg-cyan-900/30"
          trend="Pending verification"
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
        </>
        )}
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

      {/* Creator Statistics Breakdown Section - Visible only to Admin */}
      {adminData?.role === "Admin" && (
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-text-main font-poppins">
              User Creation Breakdown
            </h3>
            <p className="text-text-muted text-xs sm:text-sm">
              See the count of student registrations created by each Admin, Employee, and Cybercafe Partner.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admins Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-main pb-2">
                <h4 className="font-bold text-xs text-text-main uppercase tracking-wider">
                  Created by Admins
                </h4>
                <span className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg px-2 py-0.5 text-[10px] text-brand-primary font-bold">
                  {adminsList.filter(a => a.role === "Admin" || !a.role).length} Admins
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main bg-bg-main text-text-muted text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Admin Name</th>
                      <th className="py-2 px-3 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {adminsList.filter(a => a.role === "Admin" || !a.role).map((admin) => (
                      <tr key={admin._id} className="hover:bg-bg-main/20">
                        <td className="py-2 px-3 font-medium text-text-main">
                          {admin.name} {admin._id === adminData._id && "(You)"}
                        </td>
                        <td className="py-2 px-3 text-right text-text-main font-bold">
                          {admin.Usercreated?.length || 0}
                        </td>
                      </tr>
                    ))}
                    {adminsList.filter(a => a.role === "Admin" || !a.role).length === 0 && (
                      <tr>
                        <td colSpan="2" className="py-4 text-center text-text-muted">No admins found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employees Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-main pb-2">
                <h4 className="font-bold text-xs text-text-main uppercase tracking-wider">
                  Created by Employees
                </h4>
                <span className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 text-[10px] text-indigo-600 font-bold">
                  {adminsList.filter(a => a.role === "Employee").length} Employees
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main bg-bg-main text-text-muted text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Employee Name</th>
                      <th className="py-2 px-3 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {adminsList.filter(a => a.role === "Employee").map((emp) => (
                      <tr key={emp._id} className="hover:bg-bg-main/20">
                        <td className="py-2 px-3 font-medium text-text-main">
                          {emp.name}
                        </td>
                        <td className="py-2 px-3 text-right text-text-main font-bold">
                          {emp.Usercreated?.length || 0}
                        </td>
                      </tr>
                    ))}
                    {adminsList.filter(a => a.role === "Employee").length === 0 && (
                      <tr>
                        <td colSpan="2" className="py-4 text-center text-text-muted">No employees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cybercafe Partners Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-main pb-2">
                <h4 className="font-bold text-xs text-text-main uppercase tracking-wider">
                  Created by Cybercafes
                </h4>
                <span className="bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-0.5 text-[10px] text-green-600 font-bold">
                  {adminsList.filter(a => a.role === "Cybercafe Partner").length} Partners
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border-main">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main bg-bg-main text-text-muted text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Partner Name</th>
                      <th className="py-2 px-3 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-xs">
                    {adminsList.filter(a => a.role === "Cybercafe Partner").map((cc) => (
                      <tr key={cc._id} className="hover:bg-bg-main/20">
                        <td className="py-2 px-3 font-medium text-text-main">
                          {cc.name}
                        </td>
                        <td className="py-2.5 px-3 text-right text-text-main font-bold">
                          {cc.Usercreated?.length || 0}
                        </td>
                      </tr>
                    ))}
                    {adminsList.filter(a => a.role === "Cybercafe Partner").length === 0 && (
                      <tr>
                        <td colSpan="2" className="py-4 text-center text-text-muted">No partners found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
