"use client";

import { useState, useEffect } from "react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [allInternships, setAllInternships] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
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
    subject: "",
    semester: "",
    session: "",
    registrationNumber: "",
    emergencyName: "",
    emergencyNumber: "",
    relationship: "",
    password: "",
  });

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

  const fetchDropdownData = async () => {
    try {
      const [resInt, resCourse] = await Promise.all([
        fetch("/api/internship"),
        fetch("/api/course"),
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

  useEffect(() => {
    fetchUsers();
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      gender: "Male",
      parentName: "",
      university: "",
      college: "",
      degree: "",
      department: "",
      subject: "",
      semester: "",
      session: "",
      registrationNumber: "",
      emergencyName: "",
      emergencyNumber: "",
      relationship: "",
      password: "",
      ActiveInternship: [],
      ActiveCources: [],
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setSelectedId(user._id);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "Male",
      parentName: user.parentName || "",
      university: user.university || "",
      college: user.college || "",
      degree: user.degree || "",
      department: user.department || "",
      subject: user.subject || "",
      semester: user.semester || "",
      session: user.session || "",
      registrationNumber: user.registrationNumber || "",
      emergencyName: user.emergencyName || "",
      emergencyNumber: user.emergencyNumber || "",
      relationship: user.relationship || "",
      password: "", // Hide password for security, only update if entered
      ActiveInternship: user.ActiveInternship || [],
      ActiveCources: user.ActiveCources || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      setError(null);

      // Validate matching phone formatting if backend requires 10 digits
      if (!/^\d{10}$/.test(formData.phone)) {
        setError("Phone number must be exactly 10 digits");
        return;
      }
      if (!/^\d{10}$/.test(formData.emergencyNumber)) {
        setError("Emergency phone number must be exactly 10 digits");
        return;
      }

      // Password requirement
      if (!isEditing && (!formData.password || formData.password.length < 6)) {
        setError("Password is required and must be at least 6 characters");
        return;
      }

      const url = isEditing ? `/api/user?id=${selectedId}` : "/api/user";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        ActiveInternship: (formData.ActiveInternship || []).map((i) => ({
          ...(i._id ? { _id: i._id } : {}),
          internship: i.internship?._id || i.internship,
          internshipStatus: i.internshipStatus || "Active",
          progress: i.progress || 0,
          paymentStatus: i.paymentStatus || false,
          paymentDate: i.paymentDate || new Date(),
          amount: i.amount || 0,
          offerLetterUrl: i.offerLetterUrl || "",
          certificationUrl: i.certificationUrl || "",
        })),
        ActiveCources: (formData.ActiveCources || []).map((c) => ({
          ...(c._id ? { _id: c._id } : {}),
          course: c.course?._id || c.course,
          courseStatus: c.courseStatus || "Active",
          progress: c.progress || 0,
          paymentStatus: c.paymentStatus || false,
          paymentDate: c.paymentDate || new Date(),
          amount: c.amount || 0,
          certificateUrl: c.certificateUrl || "",
        })),
      };
      if (isEditing && !payload.password) {
        delete payload.password; // Do not send empty password on update
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(isEditing ? "User updated successfully!" : "User created successfully!");
        setShowModal(false);
        fetchUsers();
      } else {
        setError(data.error || "Failed to save user");
      }
    } catch (err) {
      setError("An error occurred while saving the user");
    }
  };

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
        <button
          onClick={openAddModal}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </button>
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
                  <th className="py-4 px-6">Emergency Contact</th>
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
                      <div className="flex flex-col text-sm">
                        <span>{user.emergencyName} ({user.relationship})</span>
                        <span className="text-text-muted">{user.emergencyNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2 max-w-[250px] text-xs">
                        {/* Internships */}
                        {user.ActiveInternship && user.ActiveInternship.length > 0 ? (
                          <div>
                            <span className="font-bold text-brand-secondary block mb-0.5 uppercase tracking-wide text-[10px]">Internships</span>
                            <div className="space-y-1.5">
                              {user.ActiveInternship.map((i, idx) => (
                                <div key={idx} className="bg-bg-main px-2 py-1.5 rounded-lg border border-border-main space-y-1">
                                  <div className="font-semibold text-text-main leading-tight line-clamp-1">{i.internship?.title || "Internship Reference"}</div>
                                  <div className="flex justify-between items-center text-text-muted text-[10px]">
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
                              ))}
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
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit User"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
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

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-main">
              <h2 className="text-lg sm:text-xl font-bold text-text-main">
                {isEditing ? "Edit User Profile" : "Register New User"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-border-main transition-colors text-text-muted hover:text-text-main"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm sm:text-base">
              {/* Group 1: Personal Info */}
              <div className="space-y-4">
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
                    <input
                      type="password"
                      name="password"
                      required={!isEditing}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Minimum 6 characters"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Academic Info */}
              <div className="space-y-4">
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
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Subject / Specialization *</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Computer Science"
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

              {/* Group 3: Emergency Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
                  3. Emergency Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Contact Person Name *</label>
                    <input
                      type="text"
                      name="emergencyName"
                      required
                      value={formData.emergencyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Parent's name"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Contact Number *</label>
                    <input
                      type="tel"
                      name="emergencyNumber"
                      required
                      value={formData.emergencyNumber}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Relationship *</label>
                    <input
                      type="text"
                      name="relationship"
                      required
                      value={formData.relationship}
                      onChange={handleInputChange}
                      placeholder="e.g. Mother, Father, Brother"
                      className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Enrolled Programs */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
                  4. Enrolled Internships & Courses
                </h3>

                {/* Internships List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-main">Applied Internships</h4>
                    <div className="flex items-center gap-2">
                      <select
                        id="add-internship-select"
                        className="p-1.5 bg-bg-main border-2 border-border-main rounded-lg text-xs"
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
                              },
                            ],
                          }));
                          selectEl.value = "";
                        }}
                        className="bg-brand-primary text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-brand-primary/90 transition"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {(formData.ActiveInternship || []).length === 0 ? (
                    <p className="text-xs text-text-muted italic bg-bg-main p-3 rounded-xl border border-border-main/50">
                      No enrolled internships.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {formData.ActiveInternship.map((item, index) => {
                        const intDetails = item.internship;
                        const title = intDetails?.title || "Internship Reference";
                        const company = intDetails?.company || "KpInterns";

                        return (
                          <div
                            key={index}
                            className="bg-bg-main border-2 border-border-main p-4 rounded-xl space-y-3 relative group"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  ActiveInternship: prev.ActiveInternship.filter((_, idx) => idx !== index),
                                }));
                              }}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-xs bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-md transition"
                            >
                              Remove
                            </button>

                            <div className="font-semibold text-xs text-text-muted uppercase tracking-wider">
                              💼 {title} ({company})
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Status</label>
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
                                  className="w-full p-1.5 bg-bg-card border border-border-main rounded-lg text-xs"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Progress (%)</label>
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
                                  className="w-full p-1.5 bg-bg-card border border-border-main rounded-lg text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Fee (₹)</label>
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
                                  className="w-full p-1.5 bg-bg-card border border-border-main rounded-lg text-xs"
                                />
                              </div>

                              <div className="flex items-center pt-4 sm:justify-center">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
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
                                    className="accent-brand-primary w-4 h-4 rounded cursor-pointer"
                                  />
                                  Paid
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-main/50">
                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Offer Letter</label>
                                {item.offerLetterUrl ? (
                                  <div className="flex items-center justify-between bg-bg-card p-2 rounded-lg border border-border-main">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">
                                      Offer Letter already offered
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={item.offerLetterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand-secondary hover:underline font-semibold"
                                      >
                                        📄 View
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => {
                                            const list = [...prev.ActiveInternship];
                                            list[index] = { ...list[index], offerLetterUrl: "" };
                                            return { ...prev, ActiveInternship: list };
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold ml-1"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept="application/pdf,image/*"
                                      id={`offer-letter-input-${index}`}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const uploadBtn = document.getElementById(`offer-letter-btn-${index}`);
                                          const originalText = uploadBtn.innerText;
                                          uploadBtn.innerText = "Uploading...";
                                          uploadBtn.disabled = true;

                                          const fData = new FormData();
                                          fData.append("file", file);
                                          const res = await fetch("/api/cloudinary", {
                                            method: "POST",
                                            body: fData,
                                          });
                                          const resData = await res.json();
                                          if (resData.success) {
                                            setFormData((prev) => {
                                              const list = [...prev.ActiveInternship];
                                              list[index] = { ...list[index], offerLetterUrl: resData.data.secure_url };
                                              return { ...prev, ActiveInternship: list };
                                            });
                                          } else {
                                            alert(resData.error || "Upload failed");
                                            uploadBtn.innerText = originalText;
                                            uploadBtn.disabled = false;
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert("Failed to upload file");
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <button
                                      type="button"
                                      id={`offer-letter-btn-${index}`}
                                      onClick={() => document.getElementById(`offer-letter-input-${index}`).click()}
                                      className="w-full text-left p-2 bg-bg-card border border-border-main rounded-lg text-xs hover:border-brand-primary transition"
                                    >
                                      📤 Click to upload Offer Letter PDF
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Internship Certificate</label>
                                {item.certificationUrl ? (
                                  <div className="flex items-center justify-between bg-bg-card p-2 rounded-lg border border-border-main">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">
                                      Certificate already offered
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={item.certificationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand-success hover:underline font-semibold"
                                      >
                                        🎓 View
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => {
                                            const list = [...prev.ActiveInternship];
                                            list[index] = { ...list[index], certificationUrl: "" };
                                            return { ...prev, ActiveInternship: list };
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold ml-1"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept="application/pdf,image/*"
                                      id={`certification-input-${index}`}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const uploadBtn = document.getElementById(`certification-btn-${index}`);
                                          const originalText = uploadBtn.innerText;
                                          uploadBtn.innerText = "Uploading...";
                                          uploadBtn.disabled = true;

                                          const fData = new FormData();
                                          fData.append("file", file);
                                          const res = await fetch("/api/cloudinary", {
                                            method: "POST",
                                            body: fData,
                                          });
                                          const resData = await res.json();
                                          if (resData.success) {
                                            setFormData((prev) => {
                                              const list = [...prev.ActiveInternship];
                                              list[index] = { ...list[index], certificationUrl: resData.data.secure_url };
                                              return { ...prev, ActiveInternship: list };
                                            });
                                          } else {
                                            alert(resData.error || "Upload failed");
                                            uploadBtn.innerText = originalText;
                                            uploadBtn.disabled = false;
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert("Failed to upload file");
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <button
                                      type="button"
                                      id={`certification-btn-${index}`}
                                      onClick={() => document.getElementById(`certification-input-${index}`).click()}
                                      className="w-full text-left p-2 bg-bg-card border border-border-main rounded-lg text-xs hover:border-brand-primary transition"
                                    >
                                      📤 Click to upload Certificate PDF
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-main">Enrolled Courses</h4>
                    <div className="flex items-center gap-2">
                      <select
                        id="add-course-select"
                        className="p-1.5 bg-bg-main border-2 border-border-main rounded-lg text-xs"
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
                              },
                            ],
                          }));
                          selectEl.value = "";
                        }}
                        className="bg-brand-primary text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-brand-primary/90 transition"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {(formData.ActiveCources || []).length === 0 ? (
                    <p className="text-xs text-text-muted italic bg-bg-main p-3 rounded-xl border border-border-main/50">
                      No enrolled courses.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {formData.ActiveCources.map((item, index) => {
                        const cDetails = item.course;
                        const title = cDetails?.title || "Course Reference";

                        return (
                          <div
                            key={index}
                            className="bg-bg-main border-2 border-border-main p-4 rounded-xl space-y-3 relative group"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  ActiveCources: prev.ActiveCources.filter((_, idx) => idx !== index),
                                }));
                              }}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700 font-bold text-xs bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-md transition"
                            >
                              Remove
                            </button>

                            <div className="font-semibold text-xs text-text-muted uppercase tracking-wider">
                              📚 {title}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Status</label>
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
                                  className="w-full p-1.5 bg-bg-card border border-border-main rounded-lg text-xs"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Progress (%)</label>
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
                                  className="w-full p-1.5 bg-bg-card border border-border-main rounded-lg text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Fee (₹)</label>
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
                                  className="w-full p-1.5 bg-bg-card border border-border-main rounded-lg text-xs"
                                />
                              </div>

                              <div className="flex items-center pt-4 sm:justify-center">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
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
                                    className="accent-brand-primary w-4 h-4 rounded cursor-pointer"
                                  />
                                  Paid
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-2 border-t border-border-main/50">
                              <div>
                                <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Course Certificate</label>
                                {item.certificateUrl ? (
                                  <div className="flex items-center justify-between bg-bg-card p-2 rounded-lg border border-border-main">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">
                                      Certificate already offered
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={item.certificateUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand-success hover:underline font-semibold"
                                      >
                                        🎓 View
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => {
                                            const list = [...prev.ActiveCources];
                                            list[index] = { ...list[index], certificateUrl: "" };
                                            return { ...prev, ActiveCources: list };
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 text-xs font-bold ml-1"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept="application/pdf,image/*"
                                      id={`course-cert-input-${index}`}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                          const uploadBtn = document.getElementById(`course-cert-btn-${index}`);
                                          const originalText = uploadBtn.innerText;
                                          uploadBtn.innerText = "Uploading...";
                                          uploadBtn.disabled = true;

                                          const fData = new FormData();
                                          fData.append("file", file);
                                          const res = await fetch("/api/cloudinary", {
                                            method: "POST",
                                            body: fData,
                                          });
                                          const resData = await res.json();
                                          if (resData.success) {
                                            setFormData((prev) => {
                                              const list = [...prev.ActiveCources];
                                              list[index] = { ...list[index], certificateUrl: resData.data.secure_url };
                                              return { ...prev, ActiveCources: list };
                                            });
                                          } else {
                                            alert(resData.error || "Upload failed");
                                            uploadBtn.innerText = originalText;
                                            uploadBtn.disabled = false;
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert("Failed to upload file");
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <button
                                      type="button"
                                      id={`course-cert-btn-${index}`}
                                      onClick={() => document.getElementById(`course-cert-input-${index}`).click()}
                                      className="w-full text-left p-2 bg-bg-card border border-border-main rounded-lg text-xs hover:border-brand-primary transition"
                                    >
                                      📤 Click to upload Course Certificate PDF
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-border-main hover:bg-bg-main text-text-main font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold shadow transition"
                >
                  {isEditing ? "Save Changes" : "Register User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
