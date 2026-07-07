"use client";

import { useState, useEffect } from "react";

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("adminToken");
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
          setError(data.error || "Failed to fetch student directory.");
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

  // Sync modal student with URL query param `studentId`
  useEffect(() => {
    if (typeof window !== "undefined" && students.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const studentId = params.get("studentId");
      if (studentId) {
        const student = students.find((s) => s._id === studentId);
        if (student) {
          setSelectedStudent(student);
        }
      }
    }
  }, [students]);

  // Clean URL when closing modal
  const handleCloseModal = () => {
    setSelectedStudent(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("studentId");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Select student and update URL (for sharing/deep-linking)
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("studentId", student._id);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Get unique sessions for filter dropdown
  const uniqueSessions = [
    "All",
    ...new Set(
      students
        .map((s) => s.session)
        .filter(Boolean)
        .sort()
    ),
  ];

  // Filtering logic
  const filteredStudents = students.filter((student) => {
    const matchesSession =
      selectedSession === "All" || student.session === selectedSession;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.rollNumber?.toLowerCase().includes(query) ||
      student.registrationNumber?.toLowerCase().includes(query);

    return matchesSession && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        <p className="text-text-muted font-medium">Loading student directory...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          Student Directory
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          Search, filter, and view enrollment details for all students at your college.
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted ml-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, roll number, registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-4 py-3.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition text-sm"
            style={{ paddingLeft: "3.5rem" }}
          />
        </div>

        {/* Session Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[240px]">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted whitespace-nowrap">
            Session:
          </span>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-4 py-3.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm cursor-pointer"
          >
            {uniqueSessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid / Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-16 sm:p-24 text-center text-text-muted space-y-4 shadow-sm">
          <svg
            className="w-16 h-16 mx-auto opacity-40 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.243 0-4.32-.647-6.089-1.763v-.108a6 6 0 0111.977-.825M15 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0-3.75a2.906 2.906 0 012.625 2.93c0 .952-.46 1.8-1.17 2.322"
            />
          </svg>
          <h3 className="font-bold text-xl text-text-main">No Students Found</h3>
          <p className="text-sm sm:text-base text-text-muted max-w-md mx-auto leading-relaxed">
            Try modifying your search query or choosing a different session filter.
          </p>
        </div>
      ) : (
        <div className="bg-bg-card border-2 border-border-main rounded-2xl shadow-sm overflow-hidden mt-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/60 border-b border-border-main text-text-muted text-xs font-bold uppercase">
                  <th className="p-4 sm:p-5">Student Details</th>
                  <th className="p-4 sm:p-5">University / Roll No.</th>
                  <th className="p-4 sm:p-5">Degree & Dept.</th>
                  <th className="p-4 sm:p-5">Session</th>
                  <th className="p-4 sm:p-5 text-center">Enrollments</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50 text-sm">
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-bg-main/40 transition cursor-pointer"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <td className="p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold flex-shrink-0">
                          {student.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-text-main truncate max-w-[180px]">
                            {student.fullName}
                          </div>
                          <div className="text-xs text-text-muted truncate max-w-[180px]">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="text-text-main font-medium">
                        {student.rollNumber}
                      </div>
                      <div className="text-xs text-text-muted truncate max-w-[150px]">
                        {student.registrationNumber}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="text-text-main font-medium">{student.degree}</div>
                      <div className="text-xs text-text-muted">{student.department}</div>
                    </td>
                    <td className="p-4 sm:p-5 text-text-main font-medium">
                      {student.session}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold" title="Courses Enrolled">
                          C: {student.ActiveCources?.length || 0}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-semibold" title="Internships Enrolled">
                          I: {student.ActiveInternship?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSelectStudent(student)}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-lg transition shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          {/* Modal Backdrop click handler */}
          <div className="absolute inset-0" onClick={handleCloseModal} />

          {/* Modal Content container */}
          <div className="bg-bg-card border-2 border-border-main w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative z-10 my-8 md:my-16 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border-main flex justify-between items-center bg-bg-main/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
                  {selectedStudent.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                    {selectedStudent.fullName}
                  </h3>
                  <p className="text-xs text-text-muted">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-9 h-9 flex items-center justify-center bg-bg-main border border-border-main hover:bg-red-500 hover:text-white rounded-lg text-text-muted text-xl font-bold transition flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Academic & Personal Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Profile */}
                <div className="bg-bg-main/50 rounded-xl p-5 border border-border-main/70 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2 border-b border-border-main pb-1">
                    Academic profile
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 text-xs sm:text-sm">
                    <span className="text-text-muted">University:</span>
                    <span className="font-semibold text-text-main truncate">
                      {selectedStudent.university}
                    </span>

                    <span className="text-text-muted">College Name:</span>
                    <span className="font-semibold text-text-main truncate">
                      {selectedStudent.college}
                    </span>

                    <span className="text-text-muted">Degree / Dept:</span>
                    <span className="font-semibold text-text-main truncate">
                      {selectedStudent.degree} - {selectedStudent.department}
                    </span>

                    <span className="text-text-muted">Semester:</span>
                    <span className="font-semibold text-text-main">
                      Sem {selectedStudent.semester}
                    </span>

                    <span className="text-text-muted">Roll Number:</span>
                    <span className="font-mono font-semibold text-text-main">
                      {selectedStudent.rollNumber}
                    </span>

                    <span className="text-text-muted">Registration No:</span>
                    <span className="font-mono font-semibold text-text-main">
                      {selectedStudent.registrationNumber}
                    </span>

                    <span className="text-text-muted">Session Year:</span>
                    <span className="font-semibold text-text-main">
                      {selectedStudent.session}
                    </span>
                  </div>
                </div>

                {/* Personal Profile */}
                <div className="bg-bg-main/50 rounded-xl p-5 border border-border-main/70 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2 border-b border-border-main pb-1">
                    Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2.5 text-xs sm:text-sm">
                    <span className="text-text-muted">Full Name:</span>
                    <span className="font-semibold text-text-main">
                      {selectedStudent.fullName}
                    </span>

                    <span className="text-text-muted">Email Address:</span>
                    <span className="font-semibold text-brand-primary truncate">
                      {selectedStudent.email}
                    </span>

                    <span className="text-text-muted">Phone Number:</span>
                    <span className="font-semibold text-text-main">
                      {selectedStudent.phone}
                    </span>

                    <span className="text-text-muted">Gender:</span>
                    <span className="font-semibold text-text-main">
                      {selectedStudent.gender}
                    </span>

                    <span className="text-text-muted">Guardian Name:</span>
                    <span className="font-semibold text-text-main">
                      {selectedStudent.parentName}
                    </span>

                    <span className="text-text-muted">Registered On:</span>
                    <span className="font-semibold text-text-main">
                      {selectedStudent.createdAt
                        ? new Date(selectedStudent.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coursework Status */}
              <div className="space-y-4">
                <h4 className="font-bold text-base text-text-main border-b border-border-main pb-2">
                  Enrolled Coursework Progress
                </h4>

                {/* Courses */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-text-muted">
                    Courses ({selectedStudent.ActiveCources?.length || 0})
                  </h5>
                  {(!selectedStudent.ActiveCources || selectedStudent.ActiveCources.length === 0) ? (
                    <p className="text-xs text-text-muted italic pl-2">
                      No enrolled courses found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedStudent.ActiveCources.map((item) => {
                        const title = item.course?.title || "Course Program";
                        const progress = item.progress || 0;
                        const status = item.courseStatus || "Active";

                        return (
                          <div
                            key={item._id}
                            className="p-4 bg-bg-main border border-border-main rounded-xl space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div className="min-w-0">
                                <h6 className="font-semibold text-text-main truncate text-sm">
                                  {title}
                                </h6>
                                <p className="text-xs text-text-muted uppercase">
                                  {item.course?.department || "General"}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  status === "Completed"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-text-muted">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-border-main rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progress === 100
                                      ? "bg-green-500"
                                      : "bg-brand-primary"
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Certificates action */}
                            {item.certificateUrl && (
                              <div className="pt-2 flex justify-end">
                                <a
                                  href={item.certificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-white transition"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  View Certificate
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Internships */}
                <div className="space-y-3 pt-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-text-muted">
                    Internships ({selectedStudent.ActiveInternship?.length || 0})
                  </h5>
                  {(!selectedStudent.ActiveInternship || selectedStudent.ActiveInternship.length === 0) ? (
                    <p className="text-xs text-text-muted italic pl-2">
                      No enrolled internships found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedStudent.ActiveInternship.map((item) => {
                        const title =
                          item.internship?.title ||
                          item.internship?.position ||
                          "Internship Program";
                        const progress = item.progress || 0;
                        const status = item.internshipStatus || "Active";

                        return (
                          <div
                            key={item._id}
                            className="p-4 bg-bg-main border border-border-main rounded-xl space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <div className="min-w-0">
                                <h6 className="font-semibold text-text-main truncate text-sm">
                                  {title}
                                </h6>
                                <p className="text-xs text-text-muted uppercase">
                                  {item.internship?.domain ||
                                    item.internship?.category ||
                                    "General"}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  status === "Completed"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-text-muted">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-border-main rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progress === 100
                                      ? "bg-green-500"
                                      : "bg-brand-primary"
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Documents actions */}
                            {(item.offerLetterUrl || item.attendanceCertificateUrl || item.certificationUrl) && (
                              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                                {item.offerLetterUrl && (
                                  <a
                                    href={item.offerLetterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    Offer Letter
                                  </a>
                                )}
                                {item.attendanceCertificateUrl && (
                                   <a
                                     href={item.attendanceCertificateUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-lg text-xs font-bold hover:bg-purple-500 hover:text-white transition"
                                   >
                                     <svg
                                       className="w-3.5 h-3.5"
                                       fill="none"
                                       viewBox="0 0 24 24"
                                       stroke="currentColor"
                                       strokeWidth="2.5"
                                     >
                                       <path
                                         strokeLinecap="round"
                                         strokeLinejoin="round"
                                         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                       />
                                     </svg>
                                     Attendance Sheet
                                   </a>
                                 )}
                                {item.certificationUrl && (
                                  <a
                                    href={item.certificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-white transition"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    Certificate
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-main bg-bg-main/20 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 bg-border-main hover:bg-border-main/80 text-text-main font-semibold rounded-xl text-sm transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
