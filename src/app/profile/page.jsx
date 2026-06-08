"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

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

  useEffect(() => {
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
        const res = await fetch(`/api/user?id=${parsedUser._id}`);
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
        }));

        const formattedInternships = (profile.ActiveInternship || []).map((i, index) => ({
          id: i.internship?._id || i.internship || index,
          enrollmentId: i._id || null,
          company: i.internship?.company || "KpInterns",
          position: i.internship?.position || "Intern",
          duration: i.internship?.duration || "1 month",
          status: i.internshipStatus || "Active",
          startDate: i.paymentDate ? new Date(i.paymentDate).toLocaleDateString() : "N/A",
          progress: i.progress || 0,
          offerLetterUrl: i.offerLetterUrl || "",
          certificationUrl: i.certificationUrl || "",
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

    fetchUserData();
  }, [router]);

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
                  <InfoRow label="Subject" value={profileData.subject} />
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
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
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

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="px-3 py-2 bg-bg-main dark:bg-bg-main rounded-lg">
                              <p className="text-xs text-text-muted dark:text-text-muted font-poppins mb-1">
                                Duration
                              </p>
                              <p className="text-sm font-semibold text-text-main dark:text-text-main">
                                {internship.duration}
                              </p>
                            </div>
                            <div className="px-3 py-2 bg-bg-main dark:bg-bg-main rounded-lg">
                              <p className="text-xs text-text-muted dark:text-text-muted font-poppins mb-1">
                                Start Date
                              </p>
                              <p className="text-sm font-semibold text-text-main dark:text-text-main">
                                {internship.startDate}
                              </p>
                            </div>
                            <div className="px-3 py-2 bg-bg-main dark:bg-bg-main rounded-lg">
                              <p className="text-xs text-text-muted dark:text-text-muted font-poppins mb-1">
                                Status
                              </p>
                              <span
                                className={`text-sm font-semibold ${
                                  internship.status === "Active"
                                    ? "text-brand-success"
                                    : "text-brand-secondary"
                                }`}
                              >
                                {internship.status}
                              </span>
                            </div>
                            <div className="px-3 py-2 bg-bg-main dark:bg-bg-main rounded-lg">
                              <p className="text-xs text-text-muted dark:text-text-muted font-poppins mb-1">
                                Internship ID
                              </p>
                              <span className="text-sm font-semibold text-text-main dark:text-text-main font-mono truncate block select-all" title={internship.id}>
                                {internship.id}
                              </span>
                            </div>
                          </div>

                          {/* Internship Progress Bar */}
                          <div className="mt-5">
                            <div className="w-full bg-border-main dark:bg-border-main rounded-full h-2 mb-2">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
                                style={{ width: `${internship.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-text-muted dark:text-text-muted font-poppins">
                              {internship.progress}% Complete
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          <Link href={`/internship/${internship.id}`} className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center whitespace-nowrap flex-1 sm:flex-initial">
                            Details
                          </Link>
                          {internship.offerLetterUrl && (
                            <a
                              href={internship.offerLetterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial"
                            >
                              <span>✉️</span> Offer Letter
                            </a>
                          )}
                          {internship.certificationUrl && (
                            <a
                              href={internship.certificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg hover:shadow-md transition font-poppins font-semibold text-center flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 sm:flex-initial"
                            >
                              <span>🏆</span> Certificate
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
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card dark:bg-bg-card rounded-2xl p-8 max-w-sm w-full animate-fade-in shadow-2xl">
            <h2 className="text-2xl font-bold text-text-main dark:text-text-main font-poppins mb-4">
              Confirm Logout
            </h2>
            <p className="text-text-muted dark:text-text-muted font-poppins mb-8">
              Are you sure you want to logout? You&apos;ll need to login again to
              access your profile.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 border border-border-main dark:border-border-main text-text-main dark:text-text-main rounded-lg hover:bg-bg-main dark:hover:bg-bg-main transition font-poppins font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-poppins font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
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
