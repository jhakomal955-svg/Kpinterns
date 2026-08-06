"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CybercafeAllUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch users registered by the cybercafe
  const fetchUsers = async () => {
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
        setUsers(data.data.Usercreated || []);
      } else {
        setError(data.error || "Failed to fetch student list");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Compute attendance stats (similar to admin view)
  const getAttendanceStats = (i) => {
    const records = i.attendance?.records || [];
    const presentCount = records.filter(r => r.status === "Present").length;
    const leaveCount = records.filter(r => r.status === "Leave").length;
    const explicitAbsentCount = records.filter(r => r.status === "Absent").length;

    const rawStart = i.startDate || i.paymentDate;
    if (!rawStart) return { presentCount: 0, totalCalendarDays: 1, percentage: 0 };

    const start = new Date(rawStart);
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = i.endDate ? new Date(i.endDate) : null;
    if (end) end.setHours(0, 0, 0, 0);

    const referenceDate = (end && end < today) ? end : today;
    const diffTime = referenceDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalCalendarDays = diffDays < 1 ? 1 : diffDays;

    const recordedDays = records.length;
    const unmarkedDays = Math.max(0, totalCalendarDays - recordedDays);
    const absentCount = explicitAbsentCount + unmarkedDays;

    const denominator = totalCalendarDays - leaveCount;
    const percentage = denominator > 0 ? Math.round((presentCount / denominator) * 100) : 100;

    return {
      presentCount,
      leaveCount,
      absentCount,
      totalCalendarDays,
      percentage: Math.min(100, Math.max(0, percentage)),
    };
  };

  // Unique sessions list for dropdown filter
  const availableSessions = [...new Set(users.map(u => u.session).filter(Boolean))].sort();

  // Filter users based on query and session
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      user.registrationNumber?.toLowerCase().includes(query);

    const matchesSession = selectedSession === "" || user.session === selectedSession;

    return matchesQuery && matchesSession;
  });

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const activeFiltersSummary = {
        session: selectedSession || "",
        searchQuery: searchQuery,
      };

      const res = await fetch("/api/user/download-pdf", {
        method: "POST",
        headers,
        body: JSON.stringify({
          users: filteredUsers,
          activeFilters: activeFiltersSummary,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to download PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cybercafe_Students_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download error:", err);
      alert(err.message || "Failed to download PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Student Directory</h1>
          <p className="text-text-muted text-sm sm:text-base">
            View all students registered under your account and inspect enrollment statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF || filteredUsers.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
            title="Download PDF report of current filtered students"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDownloadingPDF ? "Generating PDF..." : `Download PDF (${filteredUsers.length})`}
          </button>
          <Link
            href="/admin/auth/cybercafe-partner/new-user"
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register Student
          </Link>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone, registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm"
          />
        </div>

        {/* Dropdown Filter */}
        <div className="w-full md:w-64 flex items-center gap-2">
          <label className="text-sm font-semibold text-text-muted shrink-0">Session:</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main outline-none focus:border-brand-primary transition text-sm"
          >
            <option value="">All Sessions</option>
            {availableSessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User Count Summary */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-semibold text-text-muted">
          Showing <span className="text-brand-primary font-bold">{filteredUsers.length}</span> of {users.length} registered students
        </p>
      </div>

      {/* Student List Table */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            Loading student records...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-medium">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-text-muted">
            No students found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Name & Gender</th>
                  <th className="py-4 px-6">Email & Phone</th>
                  <th className="py-4 px-6">College / Stream</th>
                  <th className="py-4 px-6">Reg No / Session</th>
                  <th className="py-4 px-6">Programs</th>
                  <th className="py-4 px-6 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-main text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-bg-main/30 transition duration-150">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">{user.fullName}</span>
                        <span className="text-xs text-text-muted capitalize">{user.gender}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        <span className="text-text-muted text-xs">{user.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold truncate max-w-[200px]" title={user.college}>{user.college}</span>
                        <span className="text-text-muted text-xs">{user.degree} ({user.department})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span>{user.registrationNumber}</span>
                        <span className="text-text-muted text-xs">Sem {user.semester} | Session: {user.session}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 max-w-[220px]">
                        {user.ActiveInternship?.map((i, idx) => (
                          <span key={`int-${idx}`} className="px-2 py-0.5 rounded bg-blue-500/10 text-brand-primary text-[10px] font-bold uppercase truncate">
                            💼 {i.internship?.title || "Internship"}
                          </span>
                        ))}
                        {user.ActiveCources?.map((c, idx) => (
                          <span key={`crs-${idx}`} className="px-2 py-0.5 rounded bg-emerald-500/10 text-brand-success text-[10px] font-bold uppercase truncate">
                            📚 {c.course?.title || "Course"}
                          </span>
                        ))}
                        {(!user.ActiveInternship?.length && !user.ActiveCources?.length) && (
                          <span className="text-text-muted italic text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-xl transition duration-200"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Read-Only Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto flex justify-center items-start p-4 sm:p-6 md:p-10 z-50 animate-fade-in">
          <div className="bg-bg-card border-2 border-border-main rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-auto relative">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-text-main">{selectedUser.fullName}</h2>
                <p className="text-text-muted text-xs md:text-sm">Read-only student profile profile information</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 text-text-muted hover:text-text-main bg-bg-main border border-border-main rounded-full transition"
                title="Close Modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 font-poppins text-sm">
              {/* Personal Info Grid */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-brand-primary tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-bg-main/50 p-4 rounded-2xl border border-border-main">
                  <div>
                    <span className="text-xs text-text-muted block">Gender</span>
                    <span className="font-semibold text-text-main capitalize">{selectedUser.gender}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Email Address</span>
                    <span className="font-semibold text-text-main break-all">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Phone Number</span>
                    <span className="font-semibold text-text-main">{selectedUser.phone}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Parent/Guardian</span>
                    <span className="font-semibold text-text-main">{selectedUser.parentName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Student Since</span>
                    <span className="font-semibold text-text-main">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic Info Grid */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-brand-primary tracking-wider">Academic Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-bg-main/50 p-4 rounded-2xl border border-border-main">
                  <div className="sm:col-span-2">
                    <span className="text-xs text-text-muted block">University</span>
                    <span className="font-semibold text-text-main">{selectedUser.university}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Degree Stream</span>
                    <span className="font-semibold text-text-main">{selectedUser.degree}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-text-muted block">College / Institute</span>
                    <span className="font-semibold text-text-main">{selectedUser.college}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Department</span>
                    <span className="font-semibold text-text-main">{selectedUser.department}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Roll Number</span>
                    <span className="font-semibold text-text-main font-mono">{selectedUser.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Registration Number</span>
                    <span className="font-semibold text-text-main font-mono">{selectedUser.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Semester / Session</span>
                    <span className="font-semibold text-text-main">Sem {selectedUser.semester} | {selectedUser.session}</span>
                  </div>
                </div>
              </div>

              {/* Programs Enrollments Details */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-brand-primary tracking-wider">Programs & Enrollments</h3>

                {/* Internships List */}
                {selectedUser.ActiveInternship?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase px-1">Internship Enrollments</h4>
                    <div className="space-y-3">
                      {selectedUser.ActiveInternship.map((i, index) => {
                        const att = getAttendanceStats(i);
                        return (
                          <div key={index} className="bg-bg-main/50 border border-border-main rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <h5 className="font-bold text-text-main text-base">{i.internship?.title || "Internship Reference"}</h5>
                                <span className="text-xs text-text-muted block">ID: {i.internship?._id || "N/A"}</span>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${i.internshipStatus === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-blue-500/10 text-brand-primary border-brand-primary/20"
                                }`}>
                                {i.internshipStatus || "Active"} ({i.progress || 0}%)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs md:text-sm">
                              <div>
                                <span className="text-text-muted block">Enrollment Period</span>
                                <span className="font-semibold text-text-main">
                                  {i.startDate ? new Date(i.startDate).toLocaleDateString() : "N/A"} - {i.endDate ? new Date(i.endDate).toLocaleDateString() : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-text-muted block">Payment Status</span>
                                <span className={`font-bold ${i.paymentStatus ? "text-emerald-500" : "text-red-500"}`}>
                                  {i.paymentStatus ? `Paid (₹${i.amount})` : "Unpaid"}
                                </span>
                              </div>
                              <div>
                                <span className="text-text-muted block">Attendance</span>
                                <span className="font-semibold text-brand-primary">
                                  {att.presentCount} / {att.totalCalendarDays} days ({att.percentage}%)
                                </span>
                              </div>
                            </div>

                            {/* Documents and slips */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border-main/50">
                              {i.offerLetterUrl && (
                                <a
                                  href={i.offerLetterUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-blue-500/10 text-brand-primary hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                                >
                                  📄 Offer Letter
                                </a>
                              )}
                              {i.attendanceCertificateUrl && (
                                <a
                                  href={i.attendanceCertificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                                >
                                  📄 Attendance Sheet
                                </a>
                              )}
                              {i.certificationUrl && (
                                <a
                                  href={i.certificationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-emerald-500/10 text-brand-success hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                                >
                                  🎓 Certificate
                                </a>
                              )}
                              {i.paymentreceipt && (
                                <a
                                  href={i.paymentreceipt}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                                >
                                  💳 Payment Receipt
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Courses List */}
                {selectedUser.ActiveCources?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase px-1">Course Enrollments</h4>
                    <div className="space-y-3">
                      {selectedUser.ActiveCources.map((c, index) => (
                        <div key={index} className="bg-bg-main/50 border border-border-main rounded-2xl p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <h5 className="font-bold text-text-main text-base">{c.course?.title || "Course Reference"}</h5>
                              <span className="text-xs text-text-muted block">ID: {c.course?._id || "N/A"}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.courseStatus === "Completed"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-blue-500/10 text-brand-primary border-brand-primary/20"
                              }`}>
                              {c.courseStatus || "Active"} ({c.progress || 0}%)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs md:text-sm">
                            <div>
                              <span className="text-text-muted block">Access Duration</span>
                              <span className="font-semibold text-text-main">
                                {c.startDate ? new Date(c.startDate).toLocaleDateString() : "N/A"} - {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Lifetime"}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-muted block">Payment Status</span>
                              <span className={`font-bold ${c.paymentStatus ? "text-emerald-500" : "text-red-500"}`}>
                                {c.paymentStatus ? `Paid (₹${c.amount})` : "Unpaid"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border-main/50">
                            {c.certificateUrl && (
                              <a
                                href={c.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-emerald-500/10 text-brand-success hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                              >
                                🎓 Course Certificate
                              </a>
                            )}
                            {c.paymentreceipt && (
                              <a
                                href={c.paymentreceipt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg font-semibold transition"
                              >
                                💳 Payment Receipt
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!selectedUser.ActiveInternship?.length && !selectedUser.ActiveCources?.length) && (
                  <div className="bg-bg-main/50 border border-border-main rounded-2xl p-5 text-center text-text-muted italic">
                    This student is not registered in any active courses or internships.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border-main pt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-2.5 bg-border-main hover:bg-border-main/80 text-text-main font-semibold rounded-xl transition"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
