"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { universitiesData } from "@/lib/data/universities";
import { getDepartmentsForDegree, DEGREE_LIST, ALL_DEPARTMENTS } from "@/lib/data/degreeDepartments";
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

export default function CollegeAdminEditPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params?.id;

  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Roster Tab state
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "College Admin",
    bio: "",
    verified: false,
    UniversityName: "",
    CollegeName: "",
    bankDetails: {
      name: "",
      accountNumber: "",
      ifscCode: "",
    },
    commissionPercentage: 0,
    paymentsDone: 0,
    totalRevenue: 0,
    employedate: "",
    internshipRate: 0,
    courseRate: 0,
    internshipStartDate: "",
  });

  const findUniversityKey = (fullName) => {
    if (!fullName) return "";
    const found = Object.entries(universitiesData).find(([key, u]) => u.name === fullName);
    return found ? found[0] : "";
  };

  const findCollegeKey = (univKey, fullName) => {
    if (!univKey || !fullName) return "";
    const colleges = universitiesData[univKey]?.colleges || {};
    const found = Object.entries(colleges).find(([key, c]) => c.name === fullName);
    return found ? found[0] : "";
  };

  const fetchPartner = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/admin?id=${partnerId}`, { headers });
      const data = await res.json();
      if (data.success && data.data) {
        const partner = data.data;
        const univKey = findUniversityKey(partner.UniversityName);
        const collegeKey = findCollegeKey(univKey, partner.CollegeName);

        setFormData({
          name: partner.name || "",
          email: partner.email || "",
          mobile: partner.mobile || "",
          role: "College Admin",
          bio: partner.bio || "",
          verified: partner.verified !== undefined ? partner.verified : false,
          password: "",
          UniversityName: univKey,
          CollegeName: collegeKey,
          bankDetails: {
            name: partner.bankDetails?.name || "",
            accountNumber: partner.bankDetails?.accountNumber || "",
            ifscCode: partner.bankDetails?.ifscCode || "",
          },
          commissionPercentage: partner.commissionPercentage || 0,
          paymentsDone: partner.paymentsDone || 0,
          totalRevenue: partner.totalRevenue || 0,
          employedate: partner.employedate ? new Date(partner.employedate).toISOString().split("T")[0] : "",
          internshipRate: partner.internshipRate || 0,
          courseRate: partner.courseRate || 0,
          internshipStartDate: partner.internshipStartDate ? new Date(partner.internshipStartDate).toISOString().split("T")[0] : "",
        });

        if (partner.CollegeName) {
          fetchRoster(partner.CollegeName);
        }
      } else {
        setError(data.error || "Failed to load College Admin profile");
      }
    } catch (err) {
      setError("Error loading College Admin: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoster = async (collegeName) => {
    try {
      setIsRosterLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/partner-students?college=${encodeURIComponent(collegeName)}`, {
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

  useEffect(() => {
    if (partnerId) {
      fetchPartner();
    }
  }, [partnerId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "UniversityName") {
        updated.CollegeName = "";
      }
      return updated;
    });
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      setError(null);
      setIsSubmitting(true);

      if (!/^\d{10}$/.test(formData.mobile)) {
        setError("Mobile number must be exactly 10 digits");
        setIsSubmitting(false);
        return;
      }

      const resolvedUniversityName = universitiesData[formData.UniversityName]?.name || formData.UniversityName;
      const resolvedCollegeName = universitiesData[formData.UniversityName]?.colleges[formData.CollegeName]?.name || formData.CollegeName;

      const payload = {
        ...formData,
        UniversityName: resolvedUniversityName,
        CollegeName: resolvedCollegeName,
        bankDetails: {
          name: formData.bankDetails.name.trim(),
          accountNumber: formData.bankDetails.accountNumber.trim(),
          ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
        },
      };

      if (!payload.password) {
        delete payload.password;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(`/api/admin?id=${partnerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("College Admin profile updated successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/college-admin");
        }, 1500);
      } else {
        setError(data.error || "Failed to update College Admin");
      }
    } catch (err) {
      setError("An error occurred while saving profile changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Roster Management Handlers
  const handleAddSingleStudent = async (e) => {
    e.preventDefault();
    const resolvedCollegeName = universitiesData[formData.UniversityName]?.colleges[formData.CollegeName]?.name || formData.CollegeName;

    try {
      setIsSubmittingRoster(true);
      const token = localStorage.getItem("adminToken");

      const payload = {
        ...newStudent,
        collegeName: resolvedCollegeName,
        university: universitiesData[formData.UniversityName]?.name || formData.UniversityName,
        collegeAdminId: partnerId,
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
        fetchRoster(resolvedCollegeName);
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

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const resolvedCollegeName = universitiesData[formData.UniversityName]?.colleges[formData.CollegeName]?.name || formData.CollegeName;

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
          collegeName: resolvedCollegeName,
          university: universitiesData[formData.UniversityName]?.name || formData.UniversityName,
          collegeAdminId: partnerId,
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
        alert("No valid CSV lines found.");
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
        fetchRoster(resolvedCollegeName);
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
    const resolvedCollegeName = universitiesData[formData.UniversityName]?.colleges[formData.CollegeName]?.name || formData.CollegeName;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/partner-students?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchRoster(resolvedCollegeName);
      } else {
        alert(data.error || "Failed to delete student");
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

  const filteredRoster = rosterStudents.filter((st) => {
    const term = rosterSearch.toLowerCase();
    return (
      st.fullName?.toLowerCase().includes(term) ||
      st.registrationNumber?.toLowerCase().includes(term) ||
      st.rollNumber?.toLowerCase().includes(term) ||
      st.department?.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Edit College Partner Profile & Roster
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Modify credentials, institution details, bank accounts, rates, and pre-approved student rosters.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/college-admin"
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to College Admins
        </Link>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between text-sm sm:text-base animate-fade-in">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm sm:text-base animate-fade-in">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b-2 border-border-main mb-4 bg-bg-card rounded-t-2xl p-4">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2.5 font-semibold transition-all cursor-pointer text-sm ${
            activeTab === "personal"
              ? "border-b-2 border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-text-muted hover:text-text-main"
          }`}
        >
          Personal Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("institution")}
          className={`px-4 py-2.5 font-semibold transition-all cursor-pointer text-sm ${
            activeTab === "institution"
              ? "border-b-2 border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-text-muted hover:text-text-main"
          }`}
        >
          Institution Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-2.5 font-semibold transition-all cursor-pointer text-sm ${
            activeTab === "bank"
              ? "border-b-2 border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-text-muted hover:text-text-main"
          }`}
        >
          Bank Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("financials")}
          className={`px-4 py-2.5 font-semibold transition-all cursor-pointer text-sm ${
            activeTab === "financials"
              ? "border-b-2 border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-text-muted hover:text-text-main"
          }`}
        >
          Financials & Rates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2.5 font-semibold transition-all cursor-pointer text-sm flex items-center gap-1.5 ${
            activeTab === "roster"
              ? "border-b-2 border-brand-primary text-brand-primary font-bold"
              : "border-transparent text-text-muted hover:text-text-main"
          }`}
        >
          🎓 Student Roster ({rosterStudents.length})
        </button>
      </div>

      {/* Tab 5: Student Roster Management */}
      {activeTab === "roster" ? (
        <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-main pb-4">
            <div>
              <h3 className="text-lg font-bold text-text-main">
                Pre-Approved Student Roster Management
              </h3>
              <p className="text-xs text-text-muted">
                Upload student Reg No & Roll No lists for this college partner so students can self-verify on the website.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
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
                className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl"
              >
                + Add Single Student
              </button>
              <button
                type="button"
                onClick={() => setShowCsvModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                📁 Bulk CSV Upload
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Filter roster by name, reg no, roll no..."
            value={rosterSearch}
            onChange={(e) => setRosterSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-main border border-border-main rounded-xl text-sm"
          />

          {isRosterLoading ? (
            <div className="py-8 text-center text-text-muted">Loading roster records...</div>
          ) : filteredRoster.length === 0 ? (
            <div className="p-8 text-center bg-bg-main rounded-2xl border border-border-main text-text-muted text-sm">
              No pre-approved student records uploaded for this partner college yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-border-main rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-bg-main border-b border-border-main text-text-muted uppercase font-bold">
                    <th className="p-3">Reg No & Roll No</th>
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
                      <td className="p-3 font-mono font-medium">
                        <div>Reg: {st.registrationNumber}</div>
                        <div className="text-text-muted text-xs">Roll: {st.rollNumber}</div>
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
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">✓ Enrolled</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs">⏳ Pending</span>
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
                          className="px-3 py-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-semibold mr-1.5 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRosterStudent(st._id)}
                          className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-semibold transition"
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
        </div>
      ) : (
        /* Form for other tabs */
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "personal" && (
            <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
                1. Personal Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Password (leave blank to keep)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "institution" && (
            <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
                2. Institution Mapping
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">University *</label>
                  <select
                    name="UniversityName"
                    value={formData.UniversityName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none"
                  >
                    <option value="">Select University</option>
                    {Object.entries(universitiesData).map(([key, u]) => (
                      <option key={key} value={key}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">College *</label>
                  <select
                    name="CollegeName"
                    value={formData.CollegeName}
                    onChange={handleInputChange}
                    disabled={!formData.UniversityName}
                    required
                    className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none"
                  >
                    <option value="">{formData.UniversityName ? "Select College" : "Select University first"}</option>
                    {formData.UniversityName &&
                      Object.entries(universitiesData[formData.UniversityName]?.colleges || {}).map(([key, c]) => (
                        <option key={key} value={key}>{c.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bank" && (
            <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
                3. Bank Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Holder Name</label>
                  <input type="text" name="name" value={formData.bankDetails.name} onChange={handleBankInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Account Number</label>
                  <input type="text" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">IFSC Code</label>
                  <input type="text" name="ifscCode" value={formData.bankDetails.ifscCode} onChange={handleBankInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "financials" && (
            <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
                4. Rates & Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">College Special Internship Rate (₹)</label>
                  <input type="number" name="internshipRate" value={formData.internshipRate} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">College Special Course Rate (₹)</label>
                  <input type="number" name="courseRate" value={formData.courseRate} onChange={handleInputChange} className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 items-center justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-md">
              {isSubmitting ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Add Single Modal */}
      {showAddSingleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-2">
              <div>
                <h4 className="font-bold text-base text-text-main">
                  {newStudent._id ? "Edit Pre-Approved Student Record" : "Add Student to Roster"}
                </h4>
                <p className="text-[11px] text-text-muted">All fields are optional for Admin/Employee pre-registration.</p>
              </div>
              <button onClick={() => setShowAddSingleModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSingleStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Registration No (Optional)</label>
                  <input type="text" value={newStudent.registrationNumber} onChange={(e) => setNewStudent({ ...newStudent, registrationNumber: e.target.value })} placeholder="e.g. REG2026100" className="w-full p-2.5 bg-bg-main border rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Roll Number (Optional)</label>
                  <input type="text" value={newStudent.rollNumber} onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })} placeholder="e.g. ROLL101" className="w-full p-2.5 bg-bg-main border rounded-xl" />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-muted block mb-1">Full Name (Optional)</label>
                <input type="text" value={newStudent.fullName} onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })} placeholder="Student Full Name" className="w-full p-2.5 bg-bg-main border rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Email Address (Optional)</label>
                  <input type="email" value={newStudent.email || ""} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="student@example.com" className="w-full p-2.5 bg-bg-main border rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Mobile / Phone (Optional)</label>
                  <input type="text" value={newStudent.phone || ""} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} placeholder="10 digit mobile" className="w-full p-2.5 bg-bg-main border rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Gender (Optional)</label>
                  <select value={newStudent.gender || ""} onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })} className="w-full p-2.5 bg-bg-main border rounded-xl">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Parent / Guardian Name (Optional)</label>
                  <input type="text" value={newStudent.parentName || ""} onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })} placeholder="Parent Name" className="w-full p-2.5 bg-bg-main border rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-muted block mb-1">Degree (Optional)</label>
                  <select
                    value={newStudent.degree}
                    onChange={(e) => {
                      const newDeg = e.target.value;
                      const availableDepts = getDepartmentsForDegree(newDeg);
                      setNewStudent({
                        ...newStudent,
                        degree: newDeg,
                        department: availableDepts[0] || "",
                      });
                    }}
                    className="w-full p-2.5 bg-bg-main border rounded-xl"
                  >
                    <option value="">Select Degree</option>
                    {DEGREE_OPTIONS.map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-text-muted block mb-1">Department / Domain (Optional)</label>
                  <select
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full p-2.5 bg-bg-main border rounded-xl"
                  >
                    <option value="">Select Department</option>
                    {getDepartmentsForDegree(newStudent.degree).map((dept) => (
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
                    className="w-full p-2.5 bg-bg-main border rounded-xl"
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
                    className="w-full p-2.5 bg-bg-main border rounded-xl"
                  >
                    <option value="">Select Session</option>
                    {SESSION_OPTIONS.map((ses) => (
                      <option key={ses} value={ses}>{ses}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddSingleModal(false)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmittingRoster} className="px-4 py-1.5 bg-brand-primary text-white font-bold rounded-lg">
                  {isSubmittingRoster ? "Saving..." : newStudent._id ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Modal with Admin Guide */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-2">
              <h4 className="font-bold text-base text-text-main">Bulk CSV Roster Upload Guide</h4>
              <button onClick={() => setShowCsvModal(false)}>✕</button>
            </div>

            <div className="bg-bg-main p-4 rounded-xl border border-border-main text-xs space-y-2">
              <div className="font-bold text-brand-primary uppercase tracking-wider flex justify-between items-center">
                <span>📋 CSV Format Guide (All Fields Optional)</span>
                <button
                  type="button"
                  onClick={handleCopyHeader}
                  className="px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-lg text-[10px] font-bold"
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

            <form onSubmit={handleCsvUpload} className="space-y-3 text-xs">
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

              <textarea rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={`REG2026001, ROLL101, Rahul Sharma, Computer Science, rahul@gmail.com, 9876543210, B.Tech, 6th, 2023-2027, Male, S Sharma\nREG2026002, ROLL102, Priya Singh, Electrical Eng, priya@gmail.com, 9876543211, B.Tech, 6th, 2023-2027, Female, R Singh`} className="w-full p-3 font-mono bg-bg-main border rounded-xl outline-none" />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCsvModal(false)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmittingRoster} className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg">{isSubmittingRoster ? "Uploading..." : "Upload & Save Roster"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
