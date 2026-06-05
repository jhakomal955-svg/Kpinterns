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

  useEffect(() => {
    fetchUsers();
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

      const payload = { ...formData };
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
