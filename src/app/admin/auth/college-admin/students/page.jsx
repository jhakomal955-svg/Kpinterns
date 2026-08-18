"use client";

import { useState, useEffect } from "react";
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

export default function StudentsDirectoryPage() {
  const [activeTab, setActiveTab] = useState("registered");
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adminData");
      if (stored) setAdminData(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const getAvailableDegrees = () => {
    return getDegreesForUniversityAndCollege(adminData?.UniversityName, adminData?.CollegeName);
  };

  const getAvailableDepartments = (deg) => {
    return getDepartmentsForCollegeAndDegree(adminData?.UniversityName, adminData?.CollegeName, deg);
  };

  // Registered students state
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Partner student roster state
  const [rosterStudents, setRosterStudents] = useState([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rosterMessage, setRosterMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // New Student Form State
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
    gender: "Male",
  });

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
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
    } fontally: {
      setIsLoading(false);
    }
  };

  const fetchRoster = async () => {
    try {
      setIsRosterLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const res = await fetch("/api/partner-students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setRosterStudents(data.students || []);
      }
    } catch (err) {
      console.error("Error fetching roster:", err);
    } finally {
      setIsRosterLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchRoster();
  }, []);

  const handleCloseModal = () => {
    setSelectedStudent(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("studentId");
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("studentId", student._id);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setRosterMessage("");
      const token = localStorage.getItem("adminToken");

      const res = await fetch("/api/partner-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();
      if (data.success) {
        setRosterMessage(data.message || "Student added to roster successfully!");
        setShowAddModal(false);
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
          gender: "Male",
        });
        fetchRoster();
      } else {
        alert(data.error || "Failed to add student to roster");
      }
    } catch (err) {
      alert("Error adding student: " + err.message);
    } finally {
      setIsSubmitting(false);
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

    try {
      setIsSubmitting(true);
      setRosterMessage("");
      const token = localStorage.getItem("adminToken");

      const lines = csvText.trim().split("\n");
      const parsedRecords = [];

      for (let line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(",").map((p) => p.trim());
        if (parts[0].toLowerCase().includes("registrationnumber") || parts[0].toLowerCase().includes("regno") || parts[0].toLowerCase().includes("rollno")) continue;

        parsedRecords.push({
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
        alert("No valid rows found in CSV data.");
        setIsSubmitting(false);
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
        setRosterMessage(data.message || `Uploaded ${data.added} new and updated ${data.updated} students.`);
        setShowCsvModal(false);
        setCsvText("");
        fetchRoster();
      } else {
        alert(data.error || "Failed to upload CSV roster");
      }
    } catch (err) {
      alert("CSV error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRosterStudent = async (id) => {
    if (!confirm("Are you sure you want to remove this student from the roster?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/partner-students?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchRoster();
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

  const uniqueSessions = [
    "All",
    ...new Set(students.map((s) => s.session).filter(Boolean).sort()),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSession = selectedSession === "All" || student.session === selectedSession;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      student.fullName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.rollNumber?.toLowerCase().includes(query) ||
      student.registrationNumber?.toLowerCase().includes(query);
    return matchesSession && matchesSearch;
  });

  const filteredRoster = rosterStudents.filter((st) => {
    const q = rosterSearch.toLowerCase().trim();
    return (
      !q ||
      st.fullName?.toLowerCase().includes(q) ||
      st.registrationNumber?.toLowerCase().includes(q) ||
      st.rollNumber?.toLowerCase().includes(q) ||
      st.department?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        <p className="text-text-muted font-medium">Loading student directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            College Students & Roster Management
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Upload pre-approved student rosters and view enrolled students for your college.
          </p>
        </div>

        <div className="flex bg-bg-main p-1.5 rounded-xl border border-border-main self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("registered")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === "registered"
                ? "bg-brand-primary text-white shadow"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Enrolled Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === "roster"
                ? "bg-brand-primary text-white shadow"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Pre-Approved Roster ({rosterStudents.length})
          </button>
        </div>
      </div>

      {rosterMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-sm font-semibold">
          {rosterMessage}
        </div>
      )}

      {/* TAB 1: REGISTERED ENROLLED STUDENTS */}
      {activeTab === "registered" && (
        <div className="space-y-6">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by name, email, roll number, registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-bg-main border-2 border-border-main rounded-xl text-text-main outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto min-w-[200px]">
              <span className="text-xs font-bold uppercase text-text-muted">Session:</span>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-4 py-3 bg-bg-main border-2 border-border-main rounded-xl text-text-main outline-none text-sm"
              >
                {uniqueSessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-bg-card border-2 border-border-main rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/60 border-b border-border-main text-text-muted text-xs font-bold uppercase">
                    <th className="p-4">Student Details</th>
                    <th className="p-4">Roll No. / Reg No.</th>
                    <th className="p-4">Degree & Dept</th>
                    <th className="p-4">Session</th>
                    <th className="p-4 text-center">Enrollments</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/50 text-sm">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-bg-main/40 transition">
                      <td className="p-4 font-semibold text-text-main">
                        <div>{student.fullName}</div>
                        <div className="text-xs font-normal text-text-muted">{student.email}</div>
                      </td>
                      <td className="p-4">
                        <div>{student.rollNumber}</div>
                        <div className="text-xs text-text-muted">{student.registrationNumber}</div>
                      </td>
                      <td className="p-4">
                        <div>{student.degree}</div>
                        <div className="text-xs text-text-muted">{student.department}</div>
                      </td>
                      <td className="p-4">{student.session}</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-semibold">
                          Internships: {student.ActiveInternship?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary/90 transition"
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
        </div>
      )}

      {/* TAB 2: PRE-APPROVED ROSTER */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search roster by name, roll no, reg no, department..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full px-4 py-3 bg-bg-main border-2 border-border-main rounded-xl text-text-main outline-none text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3">
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
                  setShowAddModal(true);
                }}
                className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2"
              >
                + Add Single Student
              </button>
              <button
                onClick={() => setShowCsvModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2"
              >
                📁 Bulk CSV Upload
              </button>
            </div>
          </div>

          <div className="bg-bg-card border-2 border-border-main rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/60 border-b border-border-main text-text-muted text-xs font-bold uppercase">
                    <th className="p-4">Reg No & Roll No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Department & Degree</th>
                    <th className="p-4">Semester & Session</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/50 text-sm">
                  {filteredRoster.map((st) => (
                    <tr key={st._id} className="hover:bg-bg-main/40 transition">
                      <td className="p-4 font-mono font-medium text-text-main">
                        <div>Reg: {st.registrationNumber}</div>
                        <div className="text-xs text-text-muted">Roll: {st.rollNumber}</div>
                      </td>
                      <td className="p-4 font-semibold text-text-main">{st.fullName}</td>
                      <td className="p-4 text-text-main">
                        <div>{st.department}</div>
                        <div className="text-xs font-semibold text-brand-primary">{st.degree}</div>
                      </td>
                      <td className="p-4 text-text-muted text-xs">
                        <div>Sem: {st.semester}</div>
                        <div>{st.session}</div>
                      </td>
                      <td className="p-4 text-center">
                        {st.enrolledUserId ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">✓ Enrolled</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold">⏳ Pending</span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
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
                            setShowAddModal(true);
                          }}
                          className="px-3 py-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-semibold mr-1.5 transition"
                        >
                          Edit
                        </button>
                        <button
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
          </div>
        </div>
      )}

      {/* Add Single Modal with Selectors */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <div>
                <h3 className="font-bold text-lg text-text-main">
                  {newStudent._id ? "Edit Pre-Approved Student Record" : "Add Pre-Approved Student"}
                </h3>
                <p className="text-xs text-text-muted">All fields are optional for Admin/Employee pre-registration.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-main font-bold">✕</button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-muted mb-1">Registration No (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.registrationNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, registrationNumber: e.target.value })}
                    placeholder="REG2026100"
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-muted mb-1">Roll Number (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    placeholder="ROLL101"
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text-muted mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  placeholder="Student Full Name"
                  className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-muted mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newStudent.email || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-muted mb-1">Mobile / Phone (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.phone || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="10 digit mobile"
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-muted mb-1">Gender (Optional)</label>
                  <select
                    value={newStudent.gender || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-text-muted mb-1">Parent Name (Optional)</label>
                  <input
                    type="text"
                    value={newStudent.parentName || ""}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    placeholder="Parent Name"
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-muted mb-1">Degree (Optional)</label>
                  <select
                    value={newStudent.degree}
                    onChange={(e) => {
                      const newDeg = e.target.value;
                      const availableDepts = getAvailableDepartments(newDeg);
                      setNewStudent({
                        ...newStudent,
                        degree: newDeg,
                        department: availableDepts[0] || "",
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Degree</option>
                    {getAvailableDegrees().map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-text-muted mb-1">Department / Domain (Optional)</label>
                  <select
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {getAvailableDepartments(newStudent.degree).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-muted mb-1">Semester (Optional)</label>
                  <select
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTER_OPTIONS.map((sem) => (
                      <option key={sem} value={sem}>{sem} Semester</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-text-muted mb-1">Session (Optional)</label>
                  <select
                    value={newStudent.session}
                    onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                    className="w-full px-3 py-2.5 bg-bg-main border border-border-main rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">Select Session</option>
                    {SESSION_OPTIONS.map((ses) => (
                      <option key={ses} value={ses}>{ses}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-brand-primary text-white font-bold rounded-xl">
                  {isSubmitting ? "Saving..." : newStudent._id ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal with Guide */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <h3 className="font-bold text-lg text-text-main">Bulk CSV Roster Upload Guide</h3>
              <button onClick={() => setShowCsvModal(false)} className="text-text-muted hover:text-text-main font-bold">✕</button>
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

            <form onSubmit={handleCsvUpload} className="space-y-4 text-sm">
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

              <div className="flex justify-end gap-3 pt-3 border-t border-border-main">
                <button type="button" onClick={() => setShowCsvModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">
                  {isSubmitting ? "Processing..." : "Upload & Save Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
