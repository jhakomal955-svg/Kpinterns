"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import AdminResetPasswordModal from "@/components/AdminResetPasswordModal";
import { getDepartmentsForDegree, getDepartmentsForCollegeAndDegree, getDegreesForUniversityAndCollege, DEGREE_LIST, ALL_DEPARTMENTS } from "@/lib/data/degreeDepartments";
import * as XLSX from "xlsx";

const DEGREE_OPTIONS = DEGREE_LIST;
const DEPARTMENT_OPTIONS = ALL_DEPARTMENTS;

const SEMESTER_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SESSION_OPTIONS = [
  "2023-2027",
  "2024-2028",
  "2022-2026",
  "2025-2029",
  "2021-2025",
  "2024-2027",
  "2025-2028",
];

export default function CollegeAdminPage() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState(null);
  const [passwordModalTarget, setPasswordModalTarget] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // Roster Modal State
  const [activePartnerForRoster, setActivePartnerForRoster] = useState(null);
  const [rosterStudents, setRosterStudents] = useState([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isSubmittingRoster, setIsSubmittingRoster] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [newStudent, setNewStudent] = useState({
    fullName: "",
    registrationNumber: "",
    rollNumber: "",
    email: "",
    phone: "",
    degree: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "6th",
    session: "2023-2027",
  });

  // Fetch College Partners
  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data || []).filter((a) => a.role === "College Admin");
        setPartners(filtered);
      } else {
        setError(data.error || "Failed to fetch college partners");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching college partners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    try {
      const storedData = localStorage.getItem("adminData");
      if (storedData) {
        setAdminData(JSON.parse(storedData));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch Roster for selected Partner
  const fetchRosterForPartner = async (partner) => {
    try {
      setActivePartnerForRoster(partner);
      setIsRosterLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/partner-students?college=${encodeURIComponent(partner.CollegeName || "")}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setRosterStudents(data.students || []);
      }
    } catch (err) {
      console.error("Error loading roster:", err);
    } finally {
      setIsRosterLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin?id=${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setMessage("College Partner deleted successfully!");
        fetchPartners();
      } else {
        setError(data.error || "Failed to delete College Partner");
      }
    } catch (err) {
      setError("An error occurred while deleting the College Partner");
    }
  };

  const toggleVerification = async (partner) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin?id=${partner._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ verified: !partner.verified }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`College Partner verification status updated!`);
        fetchPartners();
      } else {
        setError(data.error || "Failed to toggle verification status");
      }
    } catch (err) {
      setError("An error occurred while toggling verification status");
    }
  };

  // Add single student
  const handleAddSingleStudent = async (e) => {
    e.preventDefault();
    if (!activePartnerForRoster) return;
    try {
      setIsSubmittingRoster(true);
      const token = localStorage.getItem("adminToken");

      const payload = {
        ...newStudent,
        collegeName: activePartnerForRoster.CollegeName,
        university: activePartnerForRoster.UniversityName,
        collegeAdminId: activePartnerForRoster._id,
      };

      const res = await fetch("/api/partner-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddSingleModal(false);
        setNewStudent({
          fullName: "",
          registrationNumber: "",
          rollNumber: "",
          email: "",
          phone: "",
          degree: "B.Tech",
          department: "Computer Science & Engineering",
          semester: "6th",
          session: "2023-2027",
        });
        fetchRosterForPartner(activePartnerForRoster);
      } else {
        alert(data.error || "Failed to add student to roster");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmittingRoster(false);
    }
  };

  // Excel & CSV File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        if (!rows || rows.length === 0) {
          alert("The selected file is empty.");
          return;
        }

        const headerRow = rows[0] || [];
        const headerMap = {};
        let hasHeader = false;

        headerRow.forEach((col, idx) => {
          if (typeof col === "string") {
            const clean = col.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (clean.includes("reg") || clean.includes("registration")) { headerMap.regNo = idx; hasHeader = true; }
            else if (clean.includes("roll")) { headerMap.rollNo = idx; hasHeader = true; }
            else if (clean.includes("parent") || clean.includes("father")) { headerMap.parentName = idx; hasHeader = true; }
            else if (clean.includes("name") || clean.includes("student")) { headerMap.fullName = idx; hasHeader = true; }
            else if (clean.includes("dept") || clean.includes("department") || clean.includes("branch")) { headerMap.department = idx; hasHeader = true; }
            else if (clean.includes("email")) { headerMap.email = idx; hasHeader = true; }
            else if (clean.includes("phone") || clean.includes("mobile") || clean.includes("contact")) { headerMap.phone = idx; hasHeader = true; }
            else if (clean.includes("degree") || clean.includes("course")) { headerMap.degree = idx; hasHeader = true; }
            else if (clean.includes("sem") || clean.includes("semester")) { headerMap.semester = idx; hasHeader = true; }
            else if (clean.includes("session") || clean.includes("batch") || clean.includes("year")) { headerMap.session = idx; hasHeader = true; }
            else if (clean.includes("gender") || clean.includes("sex")) { headerMap.gender = idx; hasHeader = true; }
          }
        });

        const startIndex = hasHeader ? 1 : 0;
        const csvLines = [];

        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue;

          const getVal = (colIdx, defaultPos) => {
            const idx = colIdx !== undefined ? colIdx : defaultPos;
            const val = row[idx];
            return val != null ? String(val).trim() : "";
          };

          const regNo = getVal(headerMap.regNo, 0);
          const rollNo = getVal(headerMap.rollNo, 1);
          const fullName = getVal(headerMap.fullName, 2);
          const department = getVal(headerMap.department, 3);
          const email = getVal(headerMap.email, 4);
          const phone = getVal(headerMap.phone, 5);
          const degree = getVal(headerMap.degree, 6);
          const semester = getVal(headerMap.semester, 7);
          const session = getVal(headerMap.session, 8);
          const gender = getVal(headerMap.gender, 9);
          const parentName = getVal(headerMap.parentName, 10);

          csvLines.push(`${regNo}, ${rollNo}, ${fullName}, ${department}, ${email}, ${phone}, ${degree}, ${semester}, ${session}, ${gender}, ${parentName}`);
        }

        if (csvLines.length === 0) {
          alert("No student data rows were found in the file.");
          return;
        }

        setCsvText(csvLines.join("\n"));
        alert(`Loaded ${csvLines.length} student record(s) from ${file.name}!`);
      } catch (err) {
        console.error("Error reading file:", err);
        alert("Failed to parse file: " + err.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // CSV Bulk Upload
  const handleCsvUploadForPartner = async (e) => {
    e.preventDefault();
    if (!csvText.trim() || !activePartnerForRoster) return;

    try {
      setIsSubmittingRoster(true);
      const token = localStorage.getItem("adminToken");

      const lines = csvText.trim().split("\n");
      const parsedRecords = [];

      for (let line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(",").map((p) => p.trim());
        if (parts[0].toLowerCase().includes("registrationnumber") || parts[0].toLowerCase().includes("regno") || parts[0].toLowerCase().includes("rollno")) continue;

        parsedRecords.push({
          collegeName: activePartnerForRoster.CollegeName,
          university: activePartnerForRoster.UniversityName,
          collegeAdminId: activePartnerForRoster._id,
          registrationNumber: parts[0] || "",
          rollNumber: parts[1] || "",
          fullName: parts[2] || "",
          department: parts[3] || "",
          email: parts[4] || "",
          phone: parts[5] || "",
          degree: parts[6] || "",
          semester: parts[7] || "",
          session: parts[8] || "",
          gender: parts[9] || "",
          parentName: parts[10] || "",
        });
      }

      if (parsedRecords.length === 0) {
        alert("No valid lines found in CSV data. Format: RegNo, RollNo, Name, Department, Email, Phone, Degree, Semester, Session");
        setIsSubmittingRoster(false);
        return;
      }

      const res = await fetch("/api/partner-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsedRecords),
      });

      const data = await res.json();
      if (data.success) {
        setShowCsvModal(false);
        setCsvText("");
        fetchRosterForPartner(activePartnerForRoster);
      } else {
        alert(data.error || "Failed to upload CSV roster");
      }
    } catch (err) {
      alert("CSV Error: " + err.message);
    } finally {
      setIsSubmittingRoster(false);
    }
  };

  const handleDeleteRosterStudent = async (id) => {
    if (!confirm("Are you sure you want to remove this student record?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/partner-students?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchRosterForPartner(activePartnerForRoster);
      } else {
        alert(data.error || "Failed to delete student record");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCopyHeader = () => {
    const header = "RegistrationNumber, RollNumber, FullName, Department, Email, Phone, Degree, Semester, Session";
    navigator.clipboard.writeText(header);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredPartners = partners.filter((partner) => {
    const term = searchQuery.toLowerCase();
    return (
      partner.name?.toLowerCase().includes(term) ||
      partner.email?.toLowerCase().includes(term) ||
      partner.mobile?.includes(term) ||
      partner.UniversityName?.toLowerCase().includes(term) ||
      partner.CollegeName?.toLowerCase().includes(term)
    );
  });

  const filteredRoster = rosterStudents.filter((st) => {
    const term = rosterSearch.toLowerCase();
    return (
      st.fullName?.toLowerCase().includes(term) ||
      st.registrationNumber?.toLowerCase().includes(term) ||
      st.rollNumber?.toLowerCase().includes(term) ||
      st.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Manage College Partners</h1>
          <p className="text-text-muted text-sm sm:text-base">
            Verify, edit, manage pre-approved student rosters, and view metrics for College Partner accounts.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/college-admin/create"
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add College Partner
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
          <input
            type="text"
            placeholder="Search by name, email, college, or university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            Loading college partners...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm sm:text-base">
            No College Partner accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Partner Info</th>
                  <th className="py-4 px-6">University & College</th>
                  <th className="py-4 px-6">Student Roster</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-main text-sm sm:text-base">
                {filteredPartners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-bg-main/40 transition duration-150">
                    <td className="py-4 px-6 font-semibold text-text-main">
                      <div>
                        <div>{partner.name}</div>
                        <div className="text-xs text-text-muted">{partner.email} • {partner.mobile}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-brand-primary uppercase tracking-wide truncate max-w-[250px]" title={partner.UniversityName}>
                          {partner.UniversityName}
                        </div>
                        <div className="text-sm text-text-main truncate max-w-[250px]" title={partner.CollegeName}>
                          {partner.CollegeName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => fetchRosterForPartner(partner)}
                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        📁 Roster & Bulk CSV
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleVerification(partner)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition border flex items-center gap-1.5 ${
                            partner.verified
                              ? "bg-emerald-500/10 border-emerald-500/30 text-brand-success hover:bg-emerald-500/20"
                              : "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${partner.verified ? "bg-brand-success" : "bg-orange-500"}`}></span>
                          {partner.verified ? "Verified" : "Unverified"}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPasswordModalTarget({
                            id: partner._id,
                            name: partner.name || "College Admin",
                            email: partner.email,
                            role: "College Admin",
                            type: "admin"
                          })}
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Reset Password"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/auth/dashboard/college-admin/${partner._id}`}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit Partner"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        {adminData?.role !== "Employee" && (
                          <button
                            onClick={() => {
                              setTargetIdToDelete(partner._id);
                              setShowConfirmModal(true);
                            }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete Partner"
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

      {/* Roster Management Drawer / Modal */}
      {activePartnerForRoster && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-4xl rounded-3xl p-6 shadow-2xl space-y-6 relative my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-4">
              <div>
                <h3 className="font-bold text-xl text-text-main flex items-center gap-2">
                  🎓 Pre-Approved Student Roster: <span className="text-brand-primary">{activePartnerForRoster.CollegeName}</span>
                </h3>
                <p className="text-xs text-text-muted">
                  University: {activePartnerForRoster.UniversityName} • Coordinator: {activePartnerForRoster.name}
                </p>
              </div>
              <button onClick={() => setActivePartnerForRoster(null)} className="w-8 h-8 rounded-lg bg-bg-main font-bold hover:bg-red-500 hover:text-white transition">✕</button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <input
                type="text"
                placeholder="Search roster by name, reg no, roll no..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-bg-main border border-border-main rounded-xl text-sm"
              />
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setNewStudent({
                      fullName: "",
                      registrationNumber: "",
                      rollNumber: "",
                      email: "",
                      phone: "",
                      gender: "",
                      parentName: "",
                      degree: "B.Tech",
                      department: "Computer Science & Engineering",
                      semester: "6th",
                      session: "2023-2027",
                    });
                    setShowAddSingleModal(true);
                  }}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/90"
                >
                  + Add Single Student
                </button>
                <button
                  onClick={() => setShowCsvModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                >
                  📁 Bulk CSV Upload
                </button>
              </div>
            </div>

            {/* Roster Table */}
            {isRosterLoading ? (
              <div className="py-12 text-center text-text-muted">Loading roster records...</div>
            ) : filteredRoster.length === 0 ? (
              <div className="p-8 text-center bg-bg-main rounded-2xl border border-border-main text-text-muted text-sm">
                No pre-approved student records uploaded yet for {activePartnerForRoster.CollegeName}.
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto border border-border-main rounded-2xl">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-bg-main border-b border-border-main text-text-muted uppercase font-bold">
                    <tr>
                      <th className="p-3">Reg No / Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Department & Degree</th>
                      <th className="p-3">Semester & Session</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {filteredRoster.map((st) => (
                      <tr key={st._id} className="hover:bg-bg-main/50">
                        <td className="p-3 font-mono">
                          <div className="font-bold text-text-main">{st.registrationNumber}</div>
                          <div className="text-text-muted text-[11px]">{st.rollNumber}</div>
                        </td>
                        <td className="p-3 font-semibold text-text-main">{st.fullName}</td>
                        <td className="p-3 text-text-muted">
                          <div>{st.department}</div>
                          <div className="text-xs font-semibold text-brand-primary">{st.degree}</div>
                        </td>
                        <td className="p-3 text-text-muted">
                          <div>Sem: {st.semester}</div>
                          <div className="text-xs">{st.session}</div>
                        </td>
                        <td className="p-3 text-center">
                          {st.enrolledUserId ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">✓ Enrolled</span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[10px]">⏳ Pending</span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setNewStudent({
                                _id: st._id,
                                fullName: st.fullName || "",
                                registrationNumber: st.registrationNumber || "",
                                rollNumber: st.rollNumber || "",
                                email: st.email || "",
                                phone: st.phone || "",
                                gender: st.gender || "",
                                parentName: st.parentName || "",
                                degree: st.degree || "",
                                department: st.department || "",
                                semester: st.semester || "",
                                session: st.session || "",
                              });
                              setShowAddSingleModal(true);
                            }}
                            className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-semibold mr-1.5 transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRosterStudent(st._id)}
                            className="px-2.5 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border-main">
              <button onClick={() => setActivePartnerForRoster(null)} className="px-5 py-2 bg-border-main text-text-main rounded-xl font-semibold text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Student Modal with Degree, Department, Semester, Session selectors */}
      {/* Add Single Student Modal */}
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-2">
              <div>
                <h4 className="font-bold text-base text-text-main">
                  {newStudent._id ? "Edit Pre-Approved Student Record" : `Add Student to ${activePartnerForRoster?.CollegeName}`}
                </h4>
                <p className="text-[11px] text-text-muted">All fields are optional for Admin/Employee pre-registration.</p>
              </div>
              <button onClick={() => setShowAddSingleModal(false)} className="font-bold text-text-muted hover:text-text-main">✕</button>
            </div>

            <form onSubmit={handleAddSingleStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Registration No (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.registrationNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, registrationNumber: e.target.value })}
                    placeholder="REG2026100"
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Roll Number (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    placeholder="ROLL101"
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-muted block mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  placeholder="Student Full Name"
                  className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newStudent.email || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Mobile / Phone (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.phone || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="10 digit mobile"
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Gender (Optional)</label>
                  <select
                    value={newStudent.gender || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Parent Name (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.parentName || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    placeholder="Parent Name"
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Degree (Optional)</label>
                  <select
                    value={newStudent.degree}
                    onChange={(e) => {
                      const newDeg = e.target.value;
                      const availableDepts = getDepartmentsForCollegeAndDegree(formData.UniversityName, formData.CollegeName, newDeg);
                      setNewStudent({
                        ...newStudent,
                        degree: newDeg,
                        department: availableDepts[0] || "",
                      });
                    }}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Degree</option>
                    {getDegreesForUniversityAndCollege(formData.UniversityName, formData.CollegeName).map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Department / Domain (Optional)</label>
                  <select
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {getDepartmentsForCollegeAndDegree(formData.UniversityName, formData.CollegeName, newStudent.degree).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Semester (Optional)</label>
                  <select
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTER_OPTIONS.map((sem) => (
                      <option key={sem} value={sem}>{sem} Semester</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Academic Session (Optional)</label>
                  <select
                    value={newStudent.session}
                    onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                    className="w-full p-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Session</option>
                    {SESSION_OPTIONS.map((ses) => (
                      <option key={ses} value={ses}>{ses}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-main">
                <button type="button" onClick={() => setShowAddSingleModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmittingRoster} className="px-5 py-2 bg-brand-primary text-white font-bold rounded-xl">
                  {isSubmittingRoster ? "Saving..." : newStudent._id ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal with Admin Guide & Required Fields Explanation */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-2">
              <h4 className="font-bold text-base text-text-main">
                Bulk CSV Upload Guide & Data Entry for {activePartnerForRoster?.CollegeName}
              </h4>
              <button onClick={() => setShowCsvModal(false)} className="font-bold text-text-muted hover:text-text-main">✕</button>
            </div>

            {/* Admin Guide Box */}
            <div className="bg-bg-main p-4 rounded-xl border border-border-main text-xs space-y-2">
              <div className="font-bold text-brand-primary uppercase tracking-wider flex justify-between items-center">
                <span>📋 CSV Format Guide (All Fields Optional)</span>
                <button
                  type="button"
                  onClick={handleCopyHeader}
                  className="px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-lg text-[10px] font-bold hover:bg-brand-primary hover:text-white transition"
                >
                  {copySuccess ? "✓ Header Copied!" : "📋 Copy Header String"}
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                Admin / Employee can paste single or bulk student data. All columns are optional. Leave missing columns empty.
              </p>
              <div className="p-2 bg-bg-card rounded-lg font-mono text-[10px] text-text-main overflow-x-auto">
                RegistrationNumber, RollNumber, FullName, Department, Email, Phone, Degree, Semester, Session, Gender, ParentName
              </div>
            </div>

            <form onSubmit={handleCsvUploadForPartner} className="space-y-3 text-xs">
              {/* Excel / CSV File Upload Box */}
              <div className="border-2 border-dashed border-blue-500/40 hover:border-blue-500 bg-blue-500/5 rounded-xl p-4 text-center transition cursor-pointer relative group">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-1">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">📊</div>
                  <div className="font-bold text-xs text-blue-500 dark:text-blue-400">
                    Click to Choose or Drag & Drop Excel (.xlsx, .xls) / CSV (.csv) File
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Auto-parses sheets & populates student records below
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-border-main flex-1"></div>
                <span className="text-[10px] text-text-muted font-bold uppercase">Or Edit / Paste Data Manually</span>
                <div className="h-px bg-border-main flex-1"></div>
              </div>

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`REG2026001, ROLL101, Rahul Sharma, Computer Science, rahul@gmail.com, 9876543210, B.Tech, 6th, 2023-2027, Male, S Sharma\nREG2026002, ROLL102, Priya Singh, Electrical Eng, priya@gmail.com, 9876543211, B.Tech, 6th, 2023-2027, Female, R Singh`}
                className="w-full p-3 font-mono text-xs bg-bg-main border border-border-main rounded-xl outline-none"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-border-main">
                <button type="button" onClick={() => setShowCsvModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmittingRoster} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  {isSubmittingRoster ? "Uploading..." : "Upload & Save Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTargetIdToDelete(null);
        }}
        onConfirm={() => handleDelete(targetIdToDelete)}
        itemName="College Partner account"
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
