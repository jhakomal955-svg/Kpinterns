"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/user?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("User deleted successfully!");
        fetchUsers();
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("An error occurred while deleting the user");
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((user) => {
    const term = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.includes(term) ||
      user.registrationNumber?.toLowerCase().includes(term)
    );
  });

  const getAdminAttendanceStats = (i) => {
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

    // absentCount = explicit "Absent" records + days with NO record at all (auto-absent days)
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Manage Users</h1>
          <p className="text-text-muted text-sm sm:text-base">
            Create, view, update, and delete registered student profiles.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/user/new"
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </Link>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between text-sm sm:text-base">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm sm:text-base">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, email, phone, or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            Loading registered users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm sm:text-base">
            No registered users found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">FullName</th>
                  <th className="py-4 px-6">Email & Phone</th>
                  <th className="py-4 px-6">College / Branch</th>
                  <th className="py-4 px-6">Reg No / Sem</th>
                  <th className="py-4 px-6">Enrolled Programs</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-main text-sm sm:text-base">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-bg-main/40 transition duration-150">
                    <td className="py-4 px-6 font-medium text-text-main">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">{user.fullName}</span>
                        <span className="text-xs text-text-muted capitalize">{user.gender}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-sm">
                        <span>{user.email}</span>
                        <span className="text-text-muted">{user.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{user.college}</span>
                        <span className="text-text-muted text-xs">{user.degree} ({user.department})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{user.registrationNumber}</span>
                        <span className="text-text-muted text-xs">Sem: {user.semester} | {user.session}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2 max-w-[250px] text-xs">
                        {/* Internships */}
                        {user.ActiveInternship && user.ActiveInternship.length > 0 ? (
                          <div>
                            <span className="font-bold text-brand-secondary block mb-0.5 uppercase tracking-wide text-[10px]">Internships</span>
                            <div className="space-y-1.5">
                              {user.ActiveInternship.map((i, idx) => {
                                const stats = getAdminAttendanceStats(i);
                                return (
                                  <div key={idx} className="bg-bg-main px-2 py-1.5 rounded-lg border border-border-main space-y-1">
                                    <div className="font-semibold text-text-main leading-tight line-clamp-1">{i.internship?.title || "Internship Reference"}</div>
                                    <div className="text-[10px] text-text-muted space-y-0.5">
                                      <div>📅 Start: {i.startDate ? new Date(i.startDate).toLocaleDateString() : "N/A"}</div>
                                      <div>📅 End: {i.endDate ? new Date(i.endDate).toLocaleDateString() : "N/A"}</div>
                                      <div className="font-medium text-brand-primary">📊 Attendance: {stats.presentCount} / {stats.totalCalendarDays} days ({stats.percentage}%)</div>
                                    </div>
                                    <div className="flex justify-between items-center text-text-muted text-[10px] pt-1">
                                      <span className={i.internshipStatus === "Completed" ? "text-emerald-500 font-semibold" : "text-amber-500 font-semibold"}>
                                        {i.internshipStatus || "Active"} ({i.progress || 0}%)
                                      </span>
                                      <span className={i.paymentStatus ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                                        {i.paymentStatus ? `Paid: ₹${i.amount || 0}` : "Unpaid"}
                                      </span>
                                    </div>
                                  {(i.offerLetterUrl || i.certificationUrl) && (
                                    <div className="flex flex-wrap gap-1 pt-1 border-t border-border-main/50 mt-1">
                                      {i.offerLetterUrl && (
                                        <a
                                          href={i.offerLetterUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[9px] bg-blue-500/10 text-blue-600 hover:underline px-1.5 py-0.5 rounded font-bold"
                                        >
                                          📄 Offer Letter
                                        </a>
                                      )}
                                      {i.certificationUrl && (
                                        <a
                                          href={i.certificationUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[9px] bg-emerald-500/10 text-emerald-600 hover:underline px-1.5 py-0.5 rounded font-bold"
                                        >
                                          🎓 Certificate
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          </div>
                        ) : null}

                        {/* Courses */}
                        {user.ActiveCources && user.ActiveCources.length > 0 ? (
                          <div>
                            <span className="font-bold text-brand-primary block mb-0.5 uppercase tracking-wide text-[10px]">Courses</span>
                            <div className="space-y-1.5">
                              {user.ActiveCources.map((c, idx) => (
                                <div key={idx} className="bg-bg-main px-2 py-1.5 rounded-lg border border-border-main space-y-1">
                                  <div className="font-semibold text-text-main leading-tight line-clamp-1">{c.course?.title || "Course Reference"}</div>
                                  <div className="flex justify-between items-center text-text-muted text-[10px]">
                                    <span className={c.courseStatus === "Completed" ? "text-emerald-500 font-semibold" : "text-amber-500 font-semibold"}>
                                      {c.courseStatus || "Active"} ({c.progress || 0}%)
                                    </span>
                                    <span className={c.paymentStatus ? "text-emerald-500 font-semibold" : "text-red-500 font-semibold"}>
                                      {c.paymentStatus ? `Paid: ₹${c.amount || 0}` : "Unpaid"}
                                    </span>
                                  </div>
                                  {c.certificateUrl && (
                                    <div className="flex flex-wrap gap-1 pt-1 border-t border-border-main/50 mt-1">
                                      <a
                                        href={c.certificateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] bg-emerald-500/10 text-emerald-600 hover:underline px-1.5 py-0.5 rounded font-bold"
                                      >
                                        🎓 Certificate
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {(!user.ActiveInternship || user.ActiveInternship.length === 0) &&
                        (!user.ActiveCources || user.ActiveCources.length === 0) ? (
                          <span className="text-text-muted italic">None</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/auth/dashboard/user/${user._id}`}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit User"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete User"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
