"use client";

function calculateEndDate(startDate, durationStr) {
  const date = new Date(startDate);
  switch (durationStr) {
    case "1-week":
      date.setDate(date.getDate() + 7);
      break;
    case "2-weeks":
      date.setDate(date.getDate() + 14);
      break;
    case "4-week":
    case "4-weeks":
      date.setDate(date.getDate() + 28);
      break;
    case "6-weeks":
      date.setDate(date.getDate() + 42);
      break;
    case "8-weeks":
      date.setDate(date.getDate() + 56);
      break;
    case "12-weeks":
      date.setDate(date.getDate() + 84);
      break;
    case "1-month":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3-months":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6-months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1-year":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date;
}

function calculateCourseEndDate(startDate, accessDuration) {
  if (!accessDuration || accessDuration === "lifetime") {
    return null;
  }
  const date = new Date(startDate);
  switch (accessDuration) {
    case "1-month":
      date.setMonth(date.getMonth() + 1);
      break;
    case "3-months":
      date.setMonth(date.getMonth() + 3);
      break;
    case "6-months":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1-year":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return date;
}

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// Premium Custom File Uploader Component with Drag & Drop, Animations, and Cloudinary Upload
function BeautifulFileUploader({ label, value, onChange, onRemove }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    try {
      const fData = new FormData();
      fData.append("file", file);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch("/api/cloudinary", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: fData,
      });
      const resData = await res.json();
      if (resData.success) {
        onChange(resData.data.secure_url);
      } else {
        alert(resData.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">{label}</label>
      {value ? (
        <div className="flex items-center justify-between bg-bg-card p-3.5 rounded-2xl border border-emerald-500/20 shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg shadow-inner">
              📄
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text-main truncate max-w-[180px]" title={value}>
                {value.split("/").pop().split("?")[0]}
              </span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Uploaded Successfully</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-2 rounded-xl font-bold transition duration-200 flex items-center gap-1.5"
            >
              View
            </a>
            <button
              type="button"
              onClick={onRemove}
              className="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-xl font-bold transition duration-200 flex items-center justify-center"
              title="Remove File"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center cursor-pointer flex flex-col items-center justify-center min-h-[110px] ${
            dragActive
              ? "border-brand-primary bg-brand-primary/5 scale-[1.01]"
              : "border-border-main bg-bg-main hover:border-brand-primary/60 hover:bg-bg-card"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-text-muted">Uploading resource...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl mb-1.5">📤</div>
              <p className="text-xs font-bold text-text-main">
                {dragActive ? "Drop file here" : `Click or Drag to Upload ${label}`}
              </p>
              <p className="text-[10px] text-text-muted mt-1">Supports PDF & image files (Max 10MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const isEditing = !!userId && userId !== "new";

  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [allInternships, setAllInternships] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "Male",
    parentName: "",
    university: "",
    college: "",
    degree: "",
    department: "",
    rollNumber: "",
    semester: "",
    session: "",
    registrationNumber: "",
    password: "",
    ActiveInternship: [],
    ActiveCources: [],
  });

  const [selectedIntId, setSelectedIntId] = useState("");
  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const fetchAttendance = async (intId) => {
    if (!intId || !userId) return;
    setAttendanceLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`/api/attendance?userId=${userId}&internshipId=${intId}`, { headers });
      const result = await res.json();
      if (result.success && result.data) {
        setAttendanceInfo(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance" && selectedIntId) {
      fetchAttendance(selectedIntId);
    }
  }, [activeTab, selectedIntId]);

  useEffect(() => {
    if (activeTab === "attendance" && formData.ActiveInternship?.length > 0 && !selectedIntId) {
      const firstInt = formData.ActiveInternship[0];
      const intId = firstInt.internship?._id || firstInt.internship;
      setSelectedIntId(intId);
    }
  }, [activeTab, formData.ActiveInternship, selectedIntId]);

  const handleSaveAttendanceRecord = async (date, status) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: userId,
          internshipId: selectedIntId,
          date: date,
          status: status,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        fetchAttendance(selectedIntId);
      } else {
        alert(result.error || "Failed to update attendance");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving attendance record");
    }
  };

  const getDatesRange = () => {
    if (!attendanceInfo?.startDate) return [];
    
    const getKolkataDateString = (dateObj) => {
      return new Date(dateObj).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    };

    const startStr = getKolkataDateString(attendanceInfo.startDate);
    const end = attendanceInfo.endDate ? new Date(attendanceInfo.endDate) : null;
    const today = new Date();
    const limitDate = (end && end < today) ? end : today;
    const limitStr = getKolkataDateString(limitDate);

    const [sYear, sMonth, sDay] = startStr.split("-").map(Number);
    const [lYear, lMonth, lDay] = limitStr.split("-").map(Number);

    const startDateUTC = new Date(Date.UTC(sYear, sMonth - 1, sDay));
    const limitDateUTC = new Date(Date.UTC(lYear, lMonth - 1, lDay));

    const dates = [];
    const current = new Date(startDateUTC);
    while (current <= limitDateUTC) {
      const yyyy = current.getUTCFullYear();
      const mm = String(current.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(current.getUTCDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates.reverse();
  };

  const fetchDropdownData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const [resInt, resCourse] = await Promise.all([
        fetch("/api/internship", { headers }),
        fetch("/api/course", { headers }),
      ]);
      const dataInt = await resInt.json();
      const dataCourse = await resCourse.json();
      if (dataInt.success) {
        setAllInternships(dataInt.data);
      }
      if (dataCourse.success) {
        setAllCourses(dataCourse.data);
      }
    } catch (err) {
      console.error("Error fetching program options:", err);
    }
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`/api/user?id=${userId}`, { headers });
      const data = await res.json();
      if (data.success) {
        const u = data.data;
        setFormData({
          fullName: u.fullName || "",
          email: u.email || "",
          phone: u.phone || "",
          gender: u.gender || "Male",
          parentName: u.parentName || "",
          university: u.university || "",
          college: u.college || "",
          degree: u.degree || "",
          department: u.department || "",
          rollNumber: u.rollNumber || "",
          semester: u.semester || "",
          session: u.session || "",
          registrationNumber: u.registrationNumber || "",
          password: "", // Hide password for security
          ActiveInternship: u.ActiveInternship || [],
          ActiveCources: u.ActiveCources || [],
        });
      } else {
        setError(data.error || "Failed to load user profile");
      }
    } catch (err) {
      setError("Error loading user: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    if (isEditing) {
      fetchUser();
    }
  }, [userId, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      setError(null);
      setIsSubmitting(true);

      // Validate matching phone formatting
      if (!/^\d{10}$/.test(formData.phone)) {
        setError("Phone number must be exactly 10 digits");
        setIsSubmitting(false);
        return;
      }

      // Password requirement on creation
      if (!isEditing && (!formData.password || formData.password.length < 6)) {
        setError("Password is required and must be at least 6 characters");
        setIsSubmitting(false);
        return;
      }

      const url = isEditing ? `/api/user?id=${userId}` : "/api/user";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        ...( !isEditing ? { isAdminCreation: true } : {} ),
        ActiveInternship: (formData.ActiveInternship || []).map((i) => ({
          ...(i._id ? { _id: i._id } : {}),
          internship: i.internship?._id || i.internship,
          internshipStatus: i.internshipStatus || "Active",
          progress: i.progress || 0,
          paymentStatus: i.paymentStatus || false,
          paymentDate: i.paymentDate || new Date(),
          paymentId: i.paymentId || "",
          paymentreceipt: i.paymentreceipt || "",
          attendance: i.attendance?._id || i.attendance || null,
          amount: i.amount || 0,
          offerLetterUrl: i.offerLetterUrl || "",
          certificationUrl: i.certificationUrl || "",
          completedModules: i.completedModules || [],
          startDate: i.startDate || new Date(),
          endDate: i.endDate || null,
          testScore: i.testScore !== undefined ? i.testScore : null,
          testTaken: i.testTaken || false,
          testTakenAt: i.testTakenAt || null,
        })),
        ActiveCources: (formData.ActiveCources || []).map((c) => ({
          ...(c._id ? { _id: c._id } : {}),
          course: c.course?._id || c.course,
          courseStatus: c.courseStatus || "Active",
          progress: c.progress || 0,
          paymentStatus: c.paymentStatus || false,
          paymentDate: c.paymentDate || new Date(),
          paymentId: c.paymentId || "",
          paymentreceipt: c.paymentreceipt || "",
          amount: c.amount || 0,
          certificateUrl: c.certificateUrl || "",
          completedModules: c.completedModules || [],
          startDate: c.startDate || new Date(),
          endDate: c.endDate || null,
        })),
      };

      if (isEditing && !payload.password) {
        delete payload.password; // Do not send empty password on update
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(isEditing ? "User updated successfully!" : "User created successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/user");
        }, 1500);
      } else {
        setError(data.error || "Failed to save user");
      }
    } catch (err) {
      setError("An error occurred while saving the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading user profile details...</p>
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
            {isEditing ? "Edit User Profile" : "Register New User"}
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Manage student details, academic registration, and course/internship enrollments.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/user"
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to Users
        </Link>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between text-sm sm:text-base">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between text-sm sm:text-base">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Form and Navigation tabs */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 border-b-2 border-border-main mb-4 bg-bg-card rounded-t-2xl p-4">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`px-5 py-3 font-semibold transition-all cursor-pointer ${
              activeTab === "personal"
                ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("academic")}
            className={`px-5 py-3 font-semibold transition-all cursor-pointer ${
              activeTab === "academic"
                ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Academic Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("programs")}
            className={`px-5 py-3 font-semibold transition-all cursor-pointer ${
              activeTab === "programs"
                ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Enrolled Programs
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setActiveTab("attendance")}
              className={`px-5 py-3 font-semibold transition-all cursor-pointer ${
                activeTab === "attendance"
                  ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              Attendance Logs
            </button>
          )}
        </div>

        {/* Tab 1: Personal Info */}
        {activeTab === "personal" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
              1. Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
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
                  placeholder="e.g. john@example.com"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Parent / Guardian Name *</label>
                <input
                  type="text"
                  name="parentName"
                  required
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="Parent's full name"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Password {isEditing ? "(Leave blank to keep)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 pr-10 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors text-sm"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Academic details */}
        {activeTab === "academic" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
              2. Academic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">University *</label>
                <input
                  type="text"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleInputChange}
                  placeholder="University name"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">College *</label>
                <input
                  type="text"
                  name="college"
                  required
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="College name"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Degree *</label>
                <input
                  type="text"
                  name="degree"
                  required
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder="e.g. B.Tech, MCA"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Department *</label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. CSE, IT"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Roll Number *</label>
                <input
                  type="text"
                  name="rollNumber"
                  required
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Student Roll Number"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="University enrollment reg no."
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Semester *</label>
                <input
                  type="text"
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="e.g. 6th, 8th"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Session *</label>
                <input
                  type="text"
                  name="session"
                  required
                  value={formData.session}
                  onChange={handleInputChange}
                  placeholder="e.g. 2024-2025"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Enrolled Programs */}
        {activeTab === "programs" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
              3. Enrolled Internships & Courses
            </h3>

            {/* Internships section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-2">
                <h4 className="text-base font-bold text-text-main flex items-center gap-2">
                  <span>💼</span> Applied Internships
                </h4>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    id="add-internship-select"
                    className="p-2 bg-bg-main border-2 border-border-main rounded-xl text-xs focus:border-brand-primary outline-none text-text-main font-semibold"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Internship</option>
                    {allInternships
                      .filter(
                        (item) =>
                          !formData.ActiveInternship?.some(
                            (act) => (act.internship?._id || act.internship) === item._id
                          )
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.title} ({item.company})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const selectEl = document.getElementById("add-internship-select");
                      const intId = selectEl.value;
                      if (!intId) return;
                      const selectedInt = allInternships.find((i) => i._id === intId);
                      if (!selectedInt) return;

                      setFormData((prev) => ({
                        ...prev,
                        ActiveInternship: [
                          ...(prev.ActiveInternship || []),
                          {
                            internship: selectedInt,
                            internshipStatus: "Active",
                            progress: 0,
                            paymentStatus: false,
                            amount: selectedInt.RegistrationFee?.amount || 500,
                            offerLetterUrl: "",
                            certificationUrl: "",
                            completedModules: [],
                            startDate: new Date(),
                            endDate: calculateEndDate(new Date(), selectedInt.duration || "1-month"),
                          },
                        ],
                      }));
                      selectEl.value = "";
                    }}
                    className="bg-brand-primary text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-brand-primary/90 transition shadow-sm"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {(formData.ActiveInternship || []).length === 0 ? (
                <p className="text-sm text-text-muted italic bg-bg-main p-4 rounded-2xl border border-border-main/50 text-center">
                  No enrolled internships.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.ActiveInternship.map((item, index) => {
                    const intDetails = item.internship;
                    const title = intDetails?.title || "Internship Reference";
                    const company = intDetails?.company || "KpInterns";

                    return (
                      <div
                        key={index}
                        className="bg-bg-main border-2 border-border-main p-5 rounded-2xl space-y-4 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              ActiveInternship: prev.ActiveInternship.filter((_, idx) => idx !== index),
                            }));
                          }}
                          className="absolute top-4 right-4 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-xl transition font-semibold text-xs flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>

                        <div className="font-bold text-sm text-text-main pr-20 flex items-center gap-2">
                          <span className="text-xl">💼</span> {title} <span className="text-xs font-semibold text-text-muted">({company})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Status</label>
                            <select
                              value={item.internshipStatus || "Active"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveInternship];
                                  list[index] = { ...list[index], internshipStatus: val };
                                  return { ...prev, ActiveInternship: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            >
                              <option value="Active">Active</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Progress (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.progress || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveInternship];
                                  list[index] = { ...list[index], progress: Math.min(100, Math.max(0, val)) };
                                  return { ...prev, ActiveInternship: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Fee (₹)</label>
                            <input
                              type="number"
                              value={item.amount || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveInternship];
                                  list[index] = { ...list[index], amount: val };
                                  return { ...prev, ActiveInternship: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                                     <div className="flex items-center sm:justify-center pt-4">
                            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-text-main">
                              <input
                                type="checkbox"
                                checked={item.paymentStatus || false}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setFormData((prev) => {
                                    const list = [...prev.ActiveInternship];
                                    list[index] = { ...list[index], paymentStatus: val };
                                    return { ...prev, ActiveInternship: list };
                                  });
                                }}
                                className="accent-brand-primary w-5 h-5 rounded-lg cursor-pointer"
                              />
                              Registration Paid
                            </label>
                          </div>
                        </div>

                        {/* Start and End Date Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border-main/40">
                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Start Date</label>
                            <input
                              type="date"
                              value={item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveInternship];
                                  const newStart = val ? new Date(val) : new Date();
                                  const duration = intDetails?.duration || "1-month";
                                  const newEnd = calculateEndDate(newStart, duration);
                                  list[index] = { ...list[index], startDate: newStart, endDate: newEnd };
                                  return { ...prev, ActiveInternship: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">End Date</label>
                            <input
                              type="date"
                              value={item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveInternship];
                                  list[index] = { ...list[index], endDate: val ? new Date(val) : null };
                                  return { ...prev, ActiveInternship: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>
                        </div>

                        {/* Test Details Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border-main/40">
                          <div className="flex items-center pt-4">
                            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-text-main">
                              <input
                                type="checkbox"
                                checked={item.testTaken || false}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setFormData((prev) => {
                                    const list = [...prev.ActiveInternship];
                                    list[index] = { 
                                      ...list[index], 
                                      testTaken: val,
                                      testTakenAt: val ? (list[index].testTakenAt || new Date()) : null,
                                      testScore: val ? (list[index].testScore !== null && list[index].testScore !== undefined ? list[index].testScore : 0) : null
                                    };
                                    return { ...prev, ActiveInternship: list };
                                  });
                                }}
                                className="accent-brand-primary w-5 h-5 rounded-lg cursor-pointer"
                              />
                              Test Attended / Taken
                            </label>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Test Score</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!item.testTaken}
                              value={item.testScore !== null && item.testScore !== undefined ? item.testScore : ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                setFormData((prev) => {
                                  const list = [...prev.ActiveInternship];
                                  list[index] = { ...list[index], testScore: val === "" ? null : val };
                                  return { ...prev, ActiveInternship: list };
                                });
                              }}
                              placeholder={item.testTaken ? "Enter score (0-100)" : "N/A - Test not taken"}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                        {/* Beautiful custom file uploaders */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border-main/40">

                          <BeautifulFileUploader
                            label="Offer Letter"
                            value={item.offerLetterUrl}
                            onChange={(url) => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveInternship];
                                list[index] = { ...list[index], offerLetterUrl: url };
                                return { ...prev, ActiveInternship: list };
                              });
                            }}
                            onRemove={() => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveInternship];
                                list[index] = { ...list[index], offerLetterUrl: "" };
                                return { ...prev, ActiveInternship: list };
                              });
                            }}
                          />

                          <BeautifulFileUploader
                            label="Internship Certificate"
                            value={item.certificationUrl}
                            onChange={(url) => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveInternship];
                                list[index] = { ...list[index], certificationUrl: url };
                                return { ...prev, ActiveInternship: list };
                              });
                            }}
                            onRemove={() => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveInternship];
                                list[index] = { ...list[index], certificationUrl: "" };
                                return { ...prev, ActiveInternship: list };
                              });
                            }}
                          />

                          <BeautifulFileUploader
                            label="Payment Receipt"
                            value={item.paymentreceipt}
                            onChange={(url) => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveInternship];
                                list[index] = { ...list[index], paymentreceipt: url };
                                return { ...prev, ActiveInternship: list };
                              });
                            }}
                            onRemove={() => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveInternship];
                                list[index] = { ...list[index], paymentreceipt: "" };
                                return { ...prev, ActiveInternship: list };
                              });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Courses section */}
            <div className="space-y-4 pt-6 border-t border-border-main">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-2">
                <h4 className="text-base font-bold text-text-main flex items-center gap-2">
                  <span>📚</span> Enrolled Courses
                </h4>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    id="add-course-select"
                    className="p-2 bg-bg-main border-2 border-border-main rounded-xl text-xs focus:border-brand-primary outline-none text-text-main font-semibold"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Course</option>
                    {allCourses
                      .filter(
                        (item) =>
                          !formData.ActiveCources?.some(
                            (act) => (act.course?._id || act.course) === item._id
                          )
                      )
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.title}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const selectEl = document.getElementById("add-course-select");
                      const cId = selectEl.value;
                      if (!cId) return;
                      const selectedC = allCourses.find((c) => c._id === cId);
                      if (!selectedC) return;

                      setFormData((prev) => ({
                        ...prev,
                        ActiveCources: [
                          ...(prev.ActiveCources || []),
                          {
                            course: selectedC,
                            courseStatus: "Active",
                            progress: 0,
                            paymentStatus: false,
                            amount: selectedC.price || 0,
                            certificateUrl: "",
                            completedModules: [],
                            startDate: new Date(),
                            endDate: calculateCourseEndDate(new Date(), selectedC.accessDuration || "lifetime"),
                          },
                        ],
                      }));
                      selectEl.value = "";
                    }}
                    className="bg-brand-primary text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-brand-primary/90 transition shadow-sm"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {(formData.ActiveCources || []).length === 0 ? (
                <p className="text-sm text-text-muted italic bg-bg-main p-4 rounded-2xl border border-border-main/50 text-center">
                  No enrolled courses.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.ActiveCources.map((item, index) => {
                    const cDetails = item.course;
                    const title = cDetails?.title || "Course Reference";

                    return (
                      <div
                        key={index}
                        className="bg-bg-main border-2 border-border-main p-5 rounded-2xl space-y-4 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              ActiveCources: prev.ActiveCources.filter((_, idx) => idx !== index),
                            }));
                          }}
                          className="absolute top-4 right-4 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-xl transition font-semibold text-xs flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>

                        <div className="font-bold text-sm text-text-main pr-20 flex items-center gap-2">
                          <span className="text-xl">📚</span> {title}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Status</label>
                            <select
                              value={item.courseStatus || "Active"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveCources];
                                  list[index] = { ...list[index], courseStatus: val };
                                  return { ...prev, ActiveCources: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            >
                              <option value="Active">Active</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Progress (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.progress || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveCources];
                                  list[index] = { ...list[index], progress: Math.min(100, Math.max(0, val)) };
                                  return { ...prev, ActiveCources: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Fee (₹)</label>
                            <input
                              type="number"
                              value={item.amount || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveCources];
                                  list[index] = { ...list[index], amount: val };
                                  return { ...prev, ActiveCources: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                             <div className="flex items-center sm:justify-center pt-4">
                            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-text-main">
                              <input
                                type="checkbox"
                                checked={item.paymentStatus || false}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  setFormData((prev) => {
                                    const list = [...prev.ActiveCources];
                                    list[index] = { ...list[index], paymentStatus: val };
                                    return { ...prev, ActiveCources: list };
                                  });
                                }}
                                className="accent-brand-primary w-5 h-5 rounded-lg cursor-pointer"
                              />
                              Enrollment Paid
                            </label>
                          </div>
                        </div>

                        {/* Start and End Date Inputs for Course */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border-main/40">
                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Start Date</label>
                            <input
                              type="date"
                              value={item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveCources];
                                  const newStart = val ? new Date(val) : new Date();
                                  const accessDuration = cDetails?.accessDuration || "lifetime";
                                  const newEnd = calculateCourseEndDate(newStart, accessDuration);
                                  list[index] = { ...list[index], startDate: newStart, endDate: newEnd };
                                  return { ...prev, ActiveCources: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">End Date</label>
                            <input
                              type="date"
                              value={item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => {
                                  const list = [...prev.ActiveCources];
                                  list[index] = { ...list[index], endDate: val ? new Date(val) : null };
                                  return { ...prev, ActiveCources: list };
                                });
                              }}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>
                        </div>
                        </div>

                        {/* Beautiful custom file uploaders */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border-main/40">
                          <BeautifulFileUploader
                            label="Course Certificate"
                            value={item.certificateUrl}
                            onChange={(url) => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveCources];
                                list[index] = { ...list[index], certificateUrl: url };
                                return { ...prev, ActiveCources: list };
                              });
                            }}
                            onRemove={() => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveCources];
                                list[index] = { ...list[index], certificateUrl: "" };
                                return { ...prev, ActiveCources: list };
                              });
                            }}
                          />

                          <BeautifulFileUploader
                            label="Payment Receipt"
                            value={item.paymentreceipt}
                            onChange={(url) => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveCources];
                                list[index] = { ...list[index], paymentreceipt: url };
                                return { ...prev, ActiveCources: list };
                              });
                            }}
                            onRemove={() => {
                              setFormData((prev) => {
                                const list = [...prev.ActiveCources];
                                list[index] = { ...list[index], paymentreceipt: "" };
                                return { ...prev, ActiveCources: list };
                              });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Attendance Log */}
        {activeTab === "attendance" && isEditing && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
              4. Attendance Logs & Overrides
            </h3>

            {/* Select Enrolled Internship */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Select Internship Program</label>
              <select
                value={selectedIntId}
                onChange={(e) => setSelectedIntId(e.target.value)}
                className="w-full sm:w-1/2 p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none font-semibold text-text-main"
              >
                <option value="" disabled>-- Select Program --</option>
                {(formData.ActiveInternship || []).map((item, index) => {
                  const intDetails = allInternships.find(i => i._id === (item.internship?._id || item.internship));
                  return (
                    <option key={index} value={item.internship?._id || item.internship}>
                      {intDetails?.title || "Internship Reference"}
                    </option>
                  );
                })}
              </select>
            </div>

            {!selectedIntId ? (
              <p className="text-sm text-text-muted italic bg-bg-main p-4 rounded-xl text-center">
                Select an active internship program above to manage attendance logs.
              </p>
            ) : attendanceLoading ? (
              <div className="py-10 text-center text-text-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-2"></div>
                Loading attendance records...
              </div>
            ) : attendanceInfo ? (
              <div className="space-y-6">
                {/* Stats Panel */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-bg-main p-4 rounded-xl border border-border-main">
                    <span className="block text-[10px] uppercase font-bold text-text-muted mb-1">Attendance Rate</span>
                    <span className="text-xl font-extrabold text-brand-primary">{attendanceInfo.percentage}%</span>
                  </div>
                  <div className="bg-bg-main p-4 rounded-xl border border-border-main">
                    <span className="block text-[10px] uppercase font-bold text-text-muted mb-1">Present Days</span>
                    <span className="text-xl font-extrabold text-emerald-500">{attendanceInfo.presentCount} days</span>
                  </div>
                  <div className="bg-bg-main p-4 rounded-xl border border-border-main">
                    <span className="block text-[10px] uppercase font-bold text-text-muted mb-1">Leave Days</span>
                    <span className="text-xl font-extrabold text-blue-500">{attendanceInfo.leaveCount} days</span>
                  </div>
                  <div className="bg-bg-main p-4 rounded-xl border border-border-main">
                    <span className="block text-[10px] uppercase font-bold text-text-muted mb-1">Absent Days</span>
                    <span className="text-xl font-extrabold text-red-500">{attendanceInfo.absentCount} days</span>
                  </div>
                  <div className="bg-bg-main p-4 rounded-xl border border-border-main">
                    <span className="block text-[10px] uppercase font-bold text-text-muted mb-1">Total Days</span>
                    <span className="text-xl font-extrabold text-text-main">{attendanceInfo.totalCalendarDays} days</span>
                  </div>
                </div>

                {/* Dates List Table */}
                <div className="border border-border-main rounded-xl overflow-hidden shadow-sm">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Log Status</th>
                          <th className="py-3 px-4 text-center">Change Status (Override)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main text-text-main text-sm">
                        {getDatesRange().map((dateStr) => {
                          const record = attendanceInfo.records.find(r => r.date === dateStr);
                          const status = record?.status || "Absent";

                          return (
                            <tr key={dateStr} className="hover:bg-bg-main/20 transition">
                              <td className="py-3 px-4 font-semibold font-mono">{dateStr}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  status === "Present"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : status === "Leave"
                                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                      : "bg-red-500/10 text-red-500"
                                }`}>
                                  {record?.status ? status : `${status} (Auto)`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex rounded-lg overflow-hidden border border-border-main">
                                  {["Present", "Absent", "Leave"].map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => handleSaveAttendanceRecord(dateStr, opt)}
                                      className={`px-3 py-1 text-xs font-semibold cursor-pointer transition ${
                                        status === opt
                                          ? opt === "Present"
                                            ? "bg-emerald-500 text-white"
                                            : opt === "Leave"
                                              ? "bg-blue-500 text-white"
                                              : "bg-red-500 text-white"
                                          : "bg-bg-main hover:bg-border-main text-text-muted"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic bg-bg-main p-4 rounded-xl text-center">
                Failed to load attendance records.
              </p>
            )}
          </div>
        )}

        {/* Action Save/Cancel Footer */}
        <div className="flex items-center justify-end gap-4 bg-bg-card border-2 border-border-main rounded-2xl p-4 shadow-sm">
          <Link
            href="/admin/auth/dashboard/user"
            className="px-6 py-3 rounded-xl border-2 border-border-main hover:bg-bg-main text-text-main font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              </div>
            ) : (
              isEditing ? "Save Changes" : "Register User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
