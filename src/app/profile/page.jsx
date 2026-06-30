"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [appliedItems, setAppliedItems] = useState({
    courses: [],
    internships: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const savedUser = localStorage.getItem("userData");
      if (!token || !savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      // Fetch fresh data from the server
      const res = await fetch(`/api/user?id=${parsedUser._id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();

      let profile = parsedUser;
      if (res.ok && result.success && result.data) {
        profile = result.data;
        // Sync back to local storage
        localStorage.setItem("userData", JSON.stringify(result.data));
      }

      setProfileData(profile);

      // Format active courses and internships if they exist
      const formattedCourses = (profile.ActiveCources || []).map((c, index) => ({
        id: c.course?._id || c.course || index,
        enrollmentId: c._id || null,
        name: c.course?.title || "Course",
        instructor: c.course?.instructor?.[0]?.name || "KpInterns Instructor",
        status: c.courseStatus || "Active",
        progress: c.progress || 0,
        certificateUrl: c.certificateUrl || "",
        paymentReceipt: c.paymentreceipt || "",
      }));

      const formattedInternships = (profile.ActiveInternship || []).map((i, index) => ({
        id: i.internship?._id || i.internship || index,
        enrollmentId: i._id || null,
        company: i.internship?.company || "KpInterns",
        position: i.internship?.position || "Intern",
        duration: i.internship?.duration || "2 Weeks",
        status: i.internshipStatus || "Active",
        startDate: i.startDate ? new Date(i.startDate).toLocaleDateString() : (i.paymentDate ? new Date(i.paymentDate).toLocaleDateString() : "N/A"),
        endDate: i.endDate ? new Date(i.endDate).toLocaleDateString() : "N/A",
        progress: i.progress || 0,
        offerLetterUrl: i.offerLetterUrl || "",
        certificationUrl: i.certificationUrl || "",
        paymentReceipt: i.paymentreceipt || "",
        attendance: i.attendance || null,
        testScore: i.testScore,
        testTaken: i.testTaken || false,
        reportPdfUrl: i.internship?.intersnhipReport || "",
        testStatus: i.internship?.test?.status || "Draft",
        testQuestionsCount: i.internship?.test?.questions?.length || 0,
      }));

      setAppliedItems({
        courses: formattedCourses,
        internships: formattedInternships,
      });

    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      // Fallback to local storage if API call fails
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        try {
          const profile = JSON.parse(savedUser);
          setProfileData(profile);
        } catch (e) {}
      } else {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const handleMarkAttendance = async (internshipId) => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: profileData._id,
          internshipId: internshipId,
          status: "Present",
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Attendance marked successfully!");
        fetchUserData();
      } else {
        alert(result.error || "Failed to mark attendance.");
      }
    } catch (err) {
      console.error(err);
      alert("Error marking attendance.");
    }
  };

  const calculateAttendanceStats = (internship) => {
    const records = internship.attendance?.records || [];
    const presentCount = records.filter(r => r.status === "Present").length;
    const explicitAbsentCount = records.filter(r => r.status === "Absent").length;
    const leaveCount = records.filter(r => r.status === "Leave").length;

    const rawStart = internship.startDate || internship.paymentDate;
    if (!rawStart) return { presentCount: 0, leaveCount: 0, absentCount: 0, totalCalendarDays: 1, percentage: 0, isMarkedToday: false };

    let parsedStart = new Date(rawStart);
    if (isNaN(parsedStart.getTime())) {
      const parts = rawStart.split("/");
      if (parts.length === 3) {
        parsedStart = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }

    let parsedEnd = null;
    if (internship.endDate && internship.endDate !== "N/A") {
      parsedEnd = new Date(internship.endDate);
      if (isNaN(parsedEnd.getTime())) {
        const parts = internship.endDate.split("/");
        if (parts.length === 3) {
          parsedEnd = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
    }

    const start = new Date(parsedStart);
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = parsedEnd;
    if (end) end.setHours(0, 0, 0, 0);

    const referenceDate = (end && end < today) ? end : today;
    const diffTime = referenceDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalCalendarDays = diffDays < 1 ? 1 : diffDays;

    // absentCount = explicit "Absent" records + days with NO record at all (auto-absent days)
    const recordedDays = records.length;
    const unmarkedDays = Math.max(0, totalCalendarDays - recordedDays);
    const absentCount = explicitAbsentCount + unmarkedDays;

    const denominator = totalCalendarDays - leaveCount;
    const percentage = denominator > 0 ? Math.round((presentCount / denominator) * 100) : 100;

    const todayKolkata = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const isMarkedToday = records.some(r => r.date === todayKolkata);

    return {
      presentCount,
      leaveCount,
      absentCount,
      totalCalendarDays,
      percentage: Math.min(100, Math.max(0, percentage)),
      isMarkedToday,
    };
  };

  const handleShareCertificate = (certId) => {
    const shareUrl = `${window.location.origin}/verify?id=${certId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedCertId(certId);
        setTimeout(() => setCopiedCertId(null), 2500);
      })
      .catch((err) => console.error("Failed to copy link:", err));
  };

  const courseCertificates = (appliedItems.courses || [])
    .filter(c => c.certificateUrl)
    .map(c => ({
      id: c.enrollmentId || c.id,
      name: c.name,
      type: "Course Completion Certificate",
      issuedBy: c.instructor || "KpInterns Instructor",
      url: c.certificateUrl,
      icon: "🎓",
      color: "from-amber-500/10 to-orange-500/10 hover:from-amber-500/15 hover:to-orange-500/15",
      borderCol: "border-amber-500/30 hover:border-amber-500/60",
      iconCol: "text-amber-500 bg-amber-500/10",
      tagCol: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    }));

  const internshipCertificates = (appliedItems.internships || [])
    .filter(i => i.certificationUrl)
    .map(i => ({
      id: i.enrollmentId || i.id,
      name: `${i.position} Internship`,
      type: "Internship Completion Certificate",
      issuedBy: i.company || "KpInterns",
      url: i.certificationUrl,
      icon: "🏆",
      color: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15",
      borderCol: "border-emerald-500/30 hover:border-emerald-500/60",
      iconCol: "text-emerald-500 bg-emerald-500/10",
      tagCol: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    }));

  const allCertificates = [...courseCertificates, ...internshipCertificates];

  const handleLogout = async () => {
    try {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      window.dispatchEvent(new Event("user-login-change"));
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      window.dispatchEvent(new Event("user-login-change"));
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main dark:bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-text-muted dark:text-text-muted font-poppins">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-bg-main dark:bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-main dark:text-text-main font-poppins mb-4">
            Unable to load profile
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg hover:shadow-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main to-bg-card dark:from-bg-main dark:to-bg-card transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-brand-primary/10 dark:from-brand-primary/20 dark:via-brand-secondary/20 dark:to-brand-primary/20 rounded-2xl border border-brand-primary/30 dark:border-brand-primary/50 p-8 mb-8 animate-fade-in shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {profileData.fullName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-text-main font-poppins mb-2 flex items-center gap-2">
                {profileData.fullName}
                {profileData.verified && (
                  <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full p-1 shadow-md" title="Verified Student">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </h1>
              <p className="text-text-muted dark:text-text-muted font-poppins mb-2">
                {profileData.degree} in {profileData.department}
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-poppins">
                <span className="text-text-muted dark:text-text-muted">
                  📧 {profileData.email}
                </span>
                <span className="text-text-muted dark:text-text-muted">
                  📱 {profileData.phone}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            
              <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 text-text-muted bg-bg-main hover:bg-bg-card rounded-lg transition font-poppins font-medium"
          >
            Logout
          </button>

          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "personal", label: "Personal Info", icon: "👤" },
            { id: "academic", label: "Academic Info", icon: "🎓" },
            { id: "courses", label: "Courses", icon: "📚" },
            { id: "internships", label: "Internships", icon: "💼" },
            { id: "certificates", label: "Certificates", icon: "🏆" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-poppins font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-brand-primary text-white shadow-md"
                  : "bg-bg-card dark:bg-bg-card text-text-muted dark:text-text-muted hover:bg-bg-main dark:hover:bg-bg-main border border-border-main dark:border-border-main"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="animate-fade-in">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="max-w-3xl mx-auto w-full">
              {/* Personal Information Card */}
              <div className="bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main p-8 shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-6 pb-4 border-b border-border-main dark:border-border-main">
                  Personal Details
                </h3>
                <div className="space-y-5">
                  <InfoRow label="Full Name" value={profileData.fullName} />
                  <InfoRow label="Email" value={profileData.email} />
                  <InfoRow label="Phone" value={profileData.phone} />
                  <InfoRow label="Gender" value={profileData.gender} />
                  <InfoRow
                    label="Parent/Guardian"
                    value={profileData.parentName}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Academic Info Tab */}
          {activeTab === "academic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Details */}
              <div className="bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main p-6 shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-6 pb-4 border-b border-border-main dark:border-border-main">
                  Education Details
                </h3>
                <div className="space-y-5">
                  <InfoRow label="University" value={profileData.university} />
                  <InfoRow label="College" value={profileData.college} />
                  <InfoRow label="Degree" value={profileData.degree} />
                  <InfoRow label="Department" value={profileData.department} />
                </div>
              </div>

              {/* Current Enrollment */}
              <div className="bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main p-6 shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-6 pb-4 border-b border-border-main dark:border-border-main">
                  Current Enrollment
                </h3>
                <div className="space-y-5">
                  <InfoRow label="Roll Number" value={profileData.rollNumber} />
                  <InfoRow
                    label="Semester"
                    value={`Semester ${profileData.semester}`}
                  />
                  <InfoRow label="Session" value={profileData.session} />
                  <InfoRow
                    label="Registration No."
                    value={profileData.registrationNumber}
                  />
                </div>
              </div>

              {/* Internship Preferences */}
              <div className="md:col-span-2 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 dark:from-brand-primary/20 dark:to-brand-secondary/20 rounded-2xl border border-brand-primary/30 dark:border-brand-primary/50 p-6 shadow-md">
                <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-6 pb-4 border-b border-brand-primary/30 dark:border-brand-primary/50">
                  Internship Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow
                    label="Preferred Domain"
                    value={profileData.internshipDomain}
                  />
                  <InfoRow label="Mode" value={profileData.mode} />
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div>
              {appliedItems.courses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {appliedItems.courses.map((course, index) => (
                    <ScrollReveal
                      key={course.id}
                      direction="up"
                      delay={index * 60}
                      duration={500}
                    >
                      <div
                        className="bg-bg-card dark:bg-bg-card rounded-xl border border-border-main dark:border-border-main p-6 hover:shadow-lg transition"
                      >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-text-main dark:text-text-main font-poppins">
                              {course.name}
                            </h3>
                            {course.certificateUrl && (
                              <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 font-poppins flex items-center gap-1 animate-pulse">
                                🎓 Certificate Issued
                              </span>
                            )}
                          </div>
                          <p className="text-text-muted dark:text-text-muted font-poppins mb-3">
                            by {course.instructor}
                          </p>

                          {/* Progress Bar */}
                          <div className="w-full bg-border-main dark:bg-border-main rounded-full h-2 mb-2">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted dark:text-text-muted font-poppins">
                            <span>{course.progress}% Complete</span>
                            <div className="flex items-center gap-1 bg-bg-main dark:bg-bg-main px-2 py-0.5 rounded border border-border-main dark:border-border-main text-[10px]">
                              <span className="font-semibold text-text-main dark:text-text-main">ID:</span>
                              <span className="font-mono select-all">{course.id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-4 py-2 rounded-lg font-poppins font-semibold text-sm ${
                              course.status === "Completed"
                                ? "bg-brand-success/20 text-brand-success"
                                : "bg-brand-primary/20 text-brand-primary"
                            }`}
                          >
                            {course.status}
                          </span>
                          <Link href={`/courses/${course.id}`} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center">
                            View
                          </Link>
                          {course.paymentReceipt && (
                            <a
                              href={course.paymentReceipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center gap-1.5"
                            >
                              <span>🧾</span> Receipt
                            </a>
                          )}
                          {course.certificateUrl && (
                            <a
                              href={course.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center gap-1.5"
                            >
                              <span>🎓</span> Certificate
                            </a>
                          )}
                        </div>
                      </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main">
                  <p className="text-text-muted dark:text-text-muted font-poppins mb-4">
                    📚 No courses applied yet
                  </p>
                  <Link
                    href="/courses"
                    className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition font-poppins font-semibold"
                  >
                    Explore Courses
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Internships Tab */}
          {activeTab === "internships" && (
            <div>
              {appliedItems.internships.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {appliedItems.internships.map((internship, index) => (
                    <ScrollReveal
                      key={internship.id}
                      direction="up"
                      delay={index * 60}
                      duration={500}
                    >
                      <div
                        className="bg-bg-card dark:bg-bg-card rounded-xl border border-border-main dark:border-border-main p-6 hover:shadow-lg transition"
                      >
                      <div className="flex flex-col gap-5">
                        {/* Internship header details */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">💼</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-text-main dark:text-text-main font-poppins">
                                {internship.company}
                              </h3>
                              {internship.offerLetterUrl && (
                                <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 font-poppins flex items-center gap-1">
                                  ✉️ Offer Letter Issued
                                </span>
                              )}
                              {internship.certificationUrl && (
                                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-poppins flex items-center gap-1 animate-pulse">
                                  🏆 Certificate Issued
                                </span>
                              )}
                            </div>
                            <p className="text-brand-primary font-poppins font-semibold">
                              {internship.position}
                            </p>
                          </div>
                        </div>

                        {/* Grid with full width on larger screens and proper columns */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="px-3 py-2 bg-bg-main dark:bg-bg-main/30 border border-border-main/50 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-text-muted dark:text-text-muted font-poppins mb-1">
                              Duration
                            </p>
                            <p className="text-sm font-bold text-text-main dark:text-text-main">
                              {internship.duration}
                            </p>
                          </div>
                          <div className="px-3 py-2 bg-bg-main dark:bg-bg-main/30 border border-border-main/50 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-text-muted dark:text-text-muted font-poppins mb-1">
                              Start Date
                            </p>
                            <p className="text-sm font-bold text-text-main dark:text-text-main">
                              {internship.startDate}
                            </p>
                          </div>
                          <div className="px-3 py-2 bg-bg-main dark:bg-bg-main/30 border border-border-main/50 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-text-muted dark:text-text-muted font-poppins mb-1">
                              End Date
                            </p>
                            <p className="text-sm font-bold text-text-main dark:text-text-main">
                              {internship.endDate || "N/A"}
                            </p>
                          </div>
                          <div className="px-3 py-2 bg-bg-main dark:bg-bg-main/30 border border-border-main/50 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-text-muted dark:text-text-muted font-poppins mb-1">
                              Status
                            </p>
                            <span
                              className={`text-sm font-bold ${
                                internship.status === "Active"
                                  ? "text-brand-success"
                                  : "text-brand-secondary"
                              }`}
                            >
                              {internship.status}
                            </span>
                          </div>
                          <div className="px-3 py-2 bg-bg-main dark:bg-bg-main/30 border border-border-main/50 rounded-xl col-span-2 sm:col-span-1">
                            <p className="text-[10px] uppercase font-bold text-text-muted dark:text-text-muted font-poppins mb-1">
                              Internship ID
                            </p>
                            <span className="text-xs font-semibold text-text-main dark:text-text-main font-mono truncate block select-all" title={internship.id}>
                              {internship.id}
                            </span>
                          </div>
                        </div>

                        {/* Internship Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted font-poppins">
                            <span>Program Progress</span>
                            <span className="font-bold text-text-main">{internship.progress}% Complete</span>
                          </div>
                          <div className="w-full bg-border-main dark:bg-border-main/50 rounded-full h-2">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
                              style={{ width: `${internship.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Attendance Tracker Section */}
                        {internship.status === "Active" && (
                          <div className="pt-2 border-t border-border-main/30 space-y-3 animate-fade-in">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-text-main font-poppins flex items-center gap-1">
                                📅 Attendance Tracker
                              </span>
                              <span className={`text-xs font-bold font-poppins px-2 py-0.5 rounded-full ${
                                calculateAttendanceStats(internship).percentage >= 75
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}>
                                {calculateAttendanceStats(internship).percentage}% Present
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-main dark:bg-bg-main/30 p-3.5 rounded-xl border border-border-main/50">
                              <div className="text-xs text-text-muted dark:text-text-muted font-poppins">
                                Present: <span className="font-bold text-text-main">{calculateAttendanceStats(internship).presentCount}</span> | 
                                Leaves: <span className="font-bold text-text-main"> {calculateAttendanceStats(internship).leaveCount}</span> | 
                                Total Elapsed: <span className="font-bold text-text-main"> {calculateAttendanceStats(internship).totalCalendarDays} days</span>
                              </div>
                              {calculateAttendanceStats(internship).isMarkedToday ? (
                                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                  ✓ Marked Today
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarkAttendance(internship.id)}
                                  className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-brand-primary/20 hover:shadow-brand-primary/35 self-start sm:self-auto"
                                >
                                  Mark Today's Attendance
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dedicated Footer Action Buttons Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border-main/30 w-full">
                          <Link href={`/internship/${internship.id}`} className="px-5 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md hover:bg-brand-primary/90 transition font-poppins font-semibold text-center whitespace-nowrap text-xs flex-1 sm:flex-initial">
                            Details
                          </Link>
                          {internship.paymentReceipt && (
                            <a
                              href={internship.paymentReceipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-xs flex-1 sm:flex-initial"
                            >
                              <span>🧾</span> Receipt
                            </a>
                          )}
                          {internship.offerLetterUrl && (
                            <a
                              href={internship.offerLetterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-xs flex-1 sm:flex-initial"
                            >
                              <span>✉️</span> Offer Letter
                            </a>
                          )}
                          {internship.certificationUrl && (
                            <a
                              href={internship.certificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-xs flex-1 sm:flex-initial"
                            >
                              <span>🏆</span> Certificate
                            </a>
                          )}
                          {internship.status === "Completed" && internship.reportPdfUrl && (
                            <a
                              href={internship.reportPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-xs flex-1 sm:flex-initial"
                            >
                              <span>📋</span> Download Report
                            </a>
                          )}
                          {internship.status === "Completed" && internship.testStatus === "Published" && internship.testQuestionsCount > 0 && !internship.testTaken && (
                            <Link
                              href={`/internship/${internship.id}/test`}
                              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-xs flex-1 sm:flex-initial animate-pulse"
                            >
                              <span>📝</span> Appear for Test
                            </Link>
                          )}
                          {internship.status === "Completed" && internship.testTaken && (
                            <span className="px-5 py-2 bg-bg-main dark:bg-bg-main/50 text-text-main border border-border-main rounded-lg text-xs font-semibold font-poppins text-center flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial">
                              🎯 Score: {internship.testScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main">
                  <p className="text-text-muted dark:text-text-muted font-poppins mb-4">
                    💼 No internships applied yet
                  </p>
                  <Link
                    href="/internship"
                    className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition font-poppins font-semibold"
                  >
                    Explore Internships
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === "certificates" && (
            <div>
              {allCertificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCertificates.map((cert, index) => (
                    <ScrollReveal
                      key={cert.id}
                      className="flex flex-col h-full"
                      direction="up"
                      delay={(index % 3) * 80}
                      duration={500}
                    >
                      <div
                        className={`bg-gradient-to-br ${cert.color} rounded-2xl border ${cert.borderCol} p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full`}
                      >
                      <div>
                        {/* Header Badge & Icon */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-poppins border ${cert.tagCol}`}>
                            {cert.icon} {cert.type}
                          </span>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${cert.iconCol}`}>
                            {cert.icon}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-2 line-clamp-2" title={cert.name}>
                          {cert.name}
                        </h3>

                        {/* Details */}
                        <p className="text-sm text-text-muted dark:text-text-muted font-poppins mb-4">
                          Issued by: <span className="font-semibold text-text-main dark:text-text-main">{cert.issuedBy}</span>
                        </p>

                        <div className="bg-bg-main dark:bg-bg-main/50 px-3 py-2 rounded-xl border border-border-main/50 mb-6 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-text-muted font-poppins">Certificate ID</span>
                          <span className="text-xs font-mono text-text-main dark:text-text-main select-all break-all">{cert.id}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-auto">
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition text-xs font-bold font-poppins text-center flex items-center justify-center gap-1"
                        >
                          <span>📥</span> View
                        </a>
                        <Link
                          href={`/verify?id=${cert.id}`}
                          className="px-3 py-2 bg-white dark:bg-bg-card text-text-main border border-border-main rounded-lg hover:bg-bg-main dark:hover:bg-bg-main transition text-xs font-bold font-poppins text-center flex items-center justify-center gap-1"
                        >
                          <span>🔍</span> Verify
                        </Link>
                        <button
                          onClick={() => handleShareCertificate(cert.id)}
                          className={`px-3 py-2 rounded-lg transition text-xs font-bold font-poppins text-center flex items-center justify-center gap-1 ${
                            copiedCertId === cert.id
                              ? "bg-brand-success/20 text-brand-success border border-brand-success/30"
                              : "bg-white dark:bg-bg-card text-text-main border border-border-main hover:bg-bg-main dark:hover:bg-bg-main"
                          }`}
                        >
                          <span>🔗</span> {copiedCertId === cert.id ? "Copied!" : "Share"}
                        </button>
                      </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main shadow-md">
                  <span className="text-5xl block mb-4">🏆</span>
                  <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-2">
                    No Certificates Issued Yet
                  </h3>
                  <p className="text-text-muted dark:text-text-muted font-poppins max-w-md mx-auto mb-6">
                    Complete your courses or internship projects to receive industry-recognized digital credentials.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link
                      href="/courses"
                      className="px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:shadow-md transition font-semibold font-poppins"
                    >
                      Explore Courses
                    </Link>
                    <Link
                      href="/internship"
                      className="px-6 py-2.5 border border-border-main text-text-main rounded-xl hover:bg-bg-main transition font-semibold font-poppins"
                    >
                      Explore Internships
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-sm font-semibold text-text-muted dark:text-text-muted font-poppins min-w-fit">
        {label}:
      </span>
      <span className="text-base font-medium text-text-main dark:text-text-main font-poppins break-words">
        {value || "Not provided"}
      </span>
    </div>
  );
}
