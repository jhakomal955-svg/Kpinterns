"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import AdminResetPasswordModal from "@/components/AdminResetPasswordModal";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState(null);
  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState("");

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch("/api/user", { headers });
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
    
    // Fetch Admin list to map creator associations
    const fetchAdmins = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch("/api/admin", { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAdminsList(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin creators:", err);
      }
    };
    fetchAdmins();

    try {
      const stored = localStorage.getItem("adminData");
      if (stored) {
        setAdminData(JSON.parse(stored));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`/api/user?id=${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("User deleted successfully!");
        setShowConfirmModal(false);
        setTargetIdToDelete(null);
        fetchUsers();
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError("An error occurred while deleting the user");
    }
  };

  const normalizeCollegeName = (college) => {
    if (!college || typeof college !== "string") return college;
    const trimmed = college.trim();
    if (
      trimmed.includes("Bodh Gaya") ||
      trimmed.includes("BodhGaya") ||
      trimmed.includes("BODH GAYA") ||
      trimmed === "R S COLLEGE OF HIGH EDUCATION GAYA" ||
      trimmed === "R. S. College of Higher Education ,Bodh Gaya" ||
      trimmed === "R. S. College of Higher Education , Bodh Gaya"
    ) {
      return "R. S. College of Higher Education , Gaya";
    }
    return trimmed;
  };

  // Dynamic cascading filter values
  const availableUsersForDepartments = users.filter((u) => {
    if (selectedDegree && u.degree !== selectedDegree) return false;
    if (selectedUniversity && u.university !== selectedUniversity) return false;
    if (selectedCollege && normalizeCollegeName(u.college) !== selectedCollege) return false;
    return true;
  });

  const availableUsersForColleges = users.filter((u) => {
    if (selectedUniversity && u.university !== selectedUniversity) return false;
    if (selectedDegree && u.degree !== selectedDegree) return false;
    if (selectedDepartment && u.department !== selectedDepartment) return false;
    return true;
  });

  // Get unique values for filters (cascading based on selection)
  const uniqueSessions = [...new Set(users.map((u) => u.session).filter(Boolean))].sort();
  
  const uniqueDegrees = [...new Set(
    (selectedDepartment ? users.filter((u) => u.department === selectedDepartment) : users)
      .map((u) => u.degree)
      .filter(Boolean)
  )].sort();

  const uniqueDepartments = [...new Set(
    availableUsersForDepartments.map((u) => u.department).filter(Boolean)
  )].sort();

  const uniqueUniversities = [...new Set(
    (selectedCollege ? users.filter((u) => normalizeCollegeName(u.college) === selectedCollege) : users)
      .map((u) => u.university)
      .filter(Boolean)
  )].sort();

  const uniqueColleges = [...new Set(
    availableUsersForColleges.map((u) => normalizeCollegeName(u.college)).filter(Boolean)
  )].sort();

  // Reset department if no longer valid for selected degree/context
  useEffect(() => {
    if (selectedDepartment && !uniqueDepartments.includes(selectedDepartment)) {
      setSelectedDepartment("");
    }
  }, [selectedDegree, selectedUniversity, selectedCollege]);

  // Reset college if no longer valid for selected university/context
  useEffect(() => {
    if (selectedCollege && !uniqueColleges.includes(selectedCollege)) {
      setSelectedCollege("");
    }
  }, [selectedUniversity, selectedDegree, selectedDepartment]);

  const handleResetFilters = () => {
    setSelectedSession("");
    setSelectedDegree("");
    setSelectedDepartment("");
    setSelectedUniversity("");
    setSelectedCollege("");
    setSelectedCreatorId("");
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || selectedSession || selectedDegree || selectedDepartment || selectedUniversity || selectedCollege || selectedCreatorId;

  // Filtered Users
  const userToCreatorMap = {};
  adminsList.forEach(admin => {
    admin.Usercreated?.forEach(userId => {
      const uId = typeof userId === 'object' ? userId._id?.toString() : userId.toString();
      userToCreatorMap[uId] = {
        id: admin._id,
        name: admin.name,
        role: admin.role || "Admin"
      };
    });
  });

  const filteredUsers = users.filter((user) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !term ||
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.includes(term) ||
      user.registrationNumber?.toLowerCase().includes(term);

    const matchesSession = !selectedSession || user.session === selectedSession;
    const matchesDegree = !selectedDegree || user.degree === selectedDegree;
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    const matchesUniversity = !selectedUniversity || user.university === selectedUniversity;
    const matchesCollege = !selectedCollege || normalizeCollegeName(user.college) === selectedCollege;
    const matchesCreator = !selectedCreatorId || userToCreatorMap[user._id]?.id === selectedCreatorId;

    return matchesSearch && matchesSession && matchesDegree && matchesDepartment && matchesUniversity && matchesCollege && matchesCreator;
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

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const selectedCreatorAdmin = adminsList.find((a) => a._id === selectedCreatorId);

      // Enhance filtered users with mapped creator info
      const usersToExport = filteredUsers.map((u) => ({
        ...u,
        creatorInfo: userToCreatorMap[u._id] || null,
      }));

      const activeFiltersSummary = {
        university: selectedUniversity,
        college: selectedCollege,
        department: selectedDepartment,
        degree: selectedDegree,
        session: selectedSession,
        searchQuery: searchQuery,
        creator: selectedCreatorAdmin?.name || "",
      };

      const res = await fetch("/api/user/download-pdf", {
        method: "POST",
        headers,
        body: JSON.stringify({
          users: usersToExport,
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
      a.download = `Filtered_Students_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download error:", err);
      setError(err.message || "Failed to download PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF || filteredUsers.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            title="Download PDF report of current filtered students"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isDownloadingPDF ? "Generating PDF..." : `Download PDF (${filteredUsers.length})`}
          </button>
          <Link
            href="/admin/auth/dashboard/user/create"
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </Link>
        </div>
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
      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 space-y-4">
        {/* Search input */}
        <div className="relative">
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

        {/* Filter selectors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="">All Sessions</option>
              {uniqueSessions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Degree</label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="">All Degrees</option>
              {uniqueDegrees.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">University</label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="">All Universities</option>
              {uniqueUniversities.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="">All Colleges</option>
              {uniqueColleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Created By</label>
            <select
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base appearance-none cursor-pointer"
            >
              <option value="">All Creators</option>
              <optgroup label="Admins">
                {adminsList.filter(a => a.role === "Admin" || !a.role).map(a => (
                  <option key={a._id} value={a._id}>{a.name} (Admin)</option>
                ))}
              </optgroup>
              <optgroup label="Employees">
                {adminsList.filter(a => a.role === "Employee").map(a => (
                  <option key={a._id} value={a._id}>{a.name} (Employee)</option>
                ))}
              </optgroup>
              <optgroup label="Cybercafe Partners">
                {adminsList.filter(a => a.role === "Cybercafe Partner").map(a => (
                  <option key={a._id} value={a._id}>{a.name} (Cybercafe)</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Filters & Search
            </button>
          </div>
        )}
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
                  <th className="py-4 px-6">Created By</th>
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
                        <span className="font-medium">{normalizeCollegeName(user.college)}</span>
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
                      {(() => {
                        const creator = userToCreatorMap[user._id];
                        if (creator) {
                          return (
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold text-text-main">{creator.name}</span>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                                creator.role === "Employee"
                                  ? "text-indigo-500"
                                  : creator.role === "Cybercafe Partner"
                                    ? "text-cyan-500"
                                    : "text-brand-primary"
                              }`}>
                                {creator.role}
                              </span>
                            </div>
                          );
                        }
                        return <span className="text-text-muted italic text-xs">Self Registered</span>;
                      })()}
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
                                    {(i.offerLetterUrl || i.certificationUrl || i.attendanceCertificateUrl || i.paymentreceipt) && (
                                      <div className="flex flex-wrap gap-1 pt-1 border-t border-border-main/50 mt-1">
                                        {i.paymentreceipt && (
                                          <a
                                            href={i.paymentreceipt}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] bg-amber-500/10 text-amber-600 hover:underline px-1.5 py-0.5 rounded font-bold"
                                          >
                                            🧾 Receipt
                                          </a>
                                        )}
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
                                        {i.attendanceCertificateUrl && (
                                          <a
                                            href={i.attendanceCertificateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] bg-purple-500/10 text-purple-600 hover:underline px-1.5 py-0.5 rounded font-bold"
                                          >
                                            📄 Attendance Sheet
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
                                  {(c.certificateUrl || c.paymentreceipt) && (
                                    <div className="flex flex-wrap gap-1 pt-1 border-t border-border-main/50 mt-1">
                                      {c.paymentreceipt && (
                                        <a
                                          href={c.paymentreceipt}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[9px] bg-amber-500/10 text-amber-600 hover:underline px-1.5 py-0.5 rounded font-bold"
                                        >
                                          🧾 Receipt
                                        </a>
                                      )}
                                      {c.certificateUrl && (
                                        <a
                                          href={c.certificateUrl}
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPasswordModalTarget({
                            id: user._id,
                            name: user.fullName || user.name || "Student",
                            email: user.email,
                            role: "Student",
                            type: "user"
                          })}
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Reset Password"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/auth/dashboard/user/${user._id}`}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit User"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        {adminData?.role !== "Employee" && (
                          <button
                            onClick={() => {
                              setTargetIdToDelete(user._id);
                              setShowConfirmModal(true);
                            }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-550 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete User"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTargetIdToDelete(null);
        }}
        onConfirm={() => handleDelete(targetIdToDelete)}
        itemName="user"
      />
      <AdminResetPasswordModal
        isOpen={!!passwordModalTarget}
        targetAccount={passwordModalTarget}
        onClose={() => setPasswordModalTarget(null)}
        onSuccess={() => {
          setMessage(`Password for ${passwordModalTarget?.name} was reset successfully!`);
        }}
      />
    </div>
  );
}
