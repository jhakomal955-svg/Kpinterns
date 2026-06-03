"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  useEffect(() => {
    // Simulate fetching user data from session/API
    const fetchUserData = async () => {
      try {
        // Mock data - replace with actual API call
        const mockProfile = {
          fullName: "John Doe",
          email: "john@example.com",
          phone: "+91 9876543210",
          gender: "Male",
          parentName: "Mr. Robert Doe",
          // Academic Info
          university: "SBTE Bihar Board (Polytechnic College)",
          college: "Government Polytechnic, Patna-13 (Gulzarbagh)",
          degree: "Diploma",
          department: "Computer Science & Engineering",
          subject: "CSE",
          semester: "6",
          session: "2024-2025",
          registrationNumber: "BP/CSE/2022/001",
          internshipDomain: "Web Development",
          mode: "Online",
          // Emergency Contact
          emergencyName: "Sarah Doe",
          emergencyNumber: "+91 9876543211",
          relationship: "Sister",
        };

        const mockApplied = {
          courses: [
            {
              id: 1,
              name: "Web Development Mastery",
              instructor: "Tech Academy",
              status: "In Progress",
              progress: 65,
            },
            {
              id: 2,
              name: "React Advanced Concepts",
              instructor: "Code Masters",
              status: "Completed",
              progress: 100,
            },
          ],
          internships: [
            {
              id: 1,
              company: "Tech Innovations Ltd.",
              position: "Frontend Developer",
              duration: "3 months",
              status: "Active",
              startDate: "Jan 2024",
            },
            {
              id: 2,
              company: "Digital Solutions Inc.",
              position: "Full Stack Developer",
              duration: "2 months",
              status: "Completed",
              startDate: "Oct 2023",
            },
          ],
        };

        setProfileData(mockProfile);
        setAppliedItems(mockApplied);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
              <h1 className="text-3xl md:text-4xl font-bold text-text-main dark:text-text-main font-poppins mb-2">
                {profileData.fullName}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <div className="bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main p-6 shadow-md hover:shadow-lg transition">
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

              {/* Emergency Contact Card */}
              <div className="bg-bg-card dark:bg-bg-card rounded-2xl border border-border-main dark:border-border-main p-6 shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-text-main dark:text-text-main font-poppins mb-6 pb-4 border-b border-border-main dark:border-border-main">
                  Emergency Contact
                </h3>
                <div className="space-y-5">
                  <InfoRow
                    label="Contact Name"
                    value={profileData.emergencyName}
                  />
                  <InfoRow
                    label="Contact Number"
                    value={profileData.emergencyNumber}
                  />
                  <InfoRow
                    label="Relationship"
                    value={profileData.relationship}
                  />
                  <div className="pt-4 px-4 py-3 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg">
                    <p className="text-xs font-poppins text-text-muted dark:text-text-muted">
                      ℹ️ This information is securely stored and used only in
                      emergencies
                    </p>
                  </div>
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
                  {appliedItems.courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-bg-card dark:bg-bg-card rounded-xl border border-border-main dark:border-border-main p-6 hover:shadow-lg transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-text-main dark:text-text-main font-poppins mb-2">
                            {course.name}
                          </h3>
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
                          <p className="text-xs text-text-muted dark:text-text-muted font-poppins">
                            {course.progress}% Complete
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-2 rounded-lg font-poppins font-semibold text-sm ${
                              course.status === "Completed"
                                ? "bg-brand-success/20 text-brand-success"
                                : "bg-brand-primary/20 text-brand-primary"
                            }`}
                          >
                            {course.status}
                          </span>
                          <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition font-poppins font-semibold">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
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
                  {appliedItems.internships.map((internship) => (
                    <div
                      key={internship.id}
                      className="bg-bg-card dark:bg-bg-card rounded-xl border border-border-main dark:border-border-main p-6 hover:shadow-lg transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">💼</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-text-main dark:text-text-main font-poppins">
                                {internship.company}
                              </h3>
                              <p className="text-brand-primary font-poppins font-semibold">
                                {internship.position}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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
                          </div>
                        </div>

                        <button className="md:w-auto px-6 py-2 bg-brand-primary text-white rounded-lg hover:shadow-md transition font-poppins font-semibold">
                          Details
                        </button>
                      </div>
                    </div>
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
              Are you sure you want to logout? You'll need to login again to
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
