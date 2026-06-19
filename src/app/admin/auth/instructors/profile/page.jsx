"use client";

import { useState, useEffect } from "react";

export default function InstructorProfilePage() {
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    bio: "",
    bankDetails: {
      name: "",
      accountNumber: "",
      ifscCode: ""
    }
  });

  // Load instructor data on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem("adminData");
      if (data) {
        const adminInfo = JSON.parse(data);
        setAdminData(adminInfo);
        setFormData({
          name: adminInfo.name || "",
          email: adminInfo.email || "",
          mobile: adminInfo.mobile || "",
          bio: adminInfo.bio || "",
          bankDetails: {
            name: adminInfo.bankDetails?.name || "",
            accountNumber: adminInfo.bankDetails?.accountNumber || "",
            ifscCode: adminInfo.bankDetails?.ifscCode || "",
          }
        });
      } else {
        setError("No instructor data found. Please login again.");
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      setError(null);

      if (formData.name.length < 3) {
        setError("Name must be at least 3 characters");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Invalid email address");
        return;
      }

      if (!/^\d{10}$/.test(formData.mobile)) {
        setError("Mobile number must be exactly 10 digits");
        return;
      }

      if (!formData.bankDetails?.name || formData.bankDetails.name.trim().length < 3) {
        setError("Account holder name must be at least 3 characters");
        return;
      }

      if (!formData.bankDetails?.accountNumber || !/^\d{9,18}$/.test(formData.bankDetails.accountNumber.trim())) {
        setError("Account number must be between 9 and 18 digits");
        return;
      }

      if (!formData.bankDetails?.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode.trim().toUpperCase())) {
        setError("Invalid IFSC code format (e.g. SBIN0001234)");
        return;
      }

      const token = localStorage.getItem("adminToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      };

      // Update via API
      const res = await fetch(`/api/admin?id=${adminData._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          ...formData,
          bankDetails: {
            name: formData.bankDetails.name.trim(),
            accountNumber: formData.bankDetails.accountNumber.trim(),
            ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase(),
          }
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Profile updated successfully!");
        const updatedAdmin = data.data;
        setAdminData(updatedAdmin);
        localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
        setIsEditing(false);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while updating your profile");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          My Profile
        </h1>
        <p className="text-text-muted text-sm sm:text-base">
          View and manage your instructor account details.
        </p>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Profile Card */}
      {adminData && (
        <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 sm:p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-8 border-b border-border-main">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                {adminData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-main flex items-center gap-2">
                  {adminData.name}
                  {adminData.verified && (
                    <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full p-1 shadow-md" title="Verified Instructor">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </h2>
                <p className="text-text-muted text-sm">{adminData.bio || "No bio added yet."}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2.5 rounded-xl font-semibold transition ${
                isEditing
                  ? "bg-border-main text-text-main hover:bg-border-main/80"
                  : "bg-brand-primary text-white hover:bg-brand-primary/90"
              }`}
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Info */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Display Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                  <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                    Full Name
                  </span>
                  <span className="text-lg font-semibold text-text-main">
                    {adminData.name}
                  </span>
                </div>
                <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                  <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${adminData.email}`}
                    className="text-lg font-semibold text-brand-primary hover:underline"
                  >
                    {adminData.email}
                  </a>
                </div>
                <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                  <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${adminData.mobile}`}
                    className="text-lg font-semibold text-text-main hover:text-brand-primary"
                  >
                    {adminData.mobile}
                  </a>
                </div>
                <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                  <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                    Role
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${adminData.verified ? "bg-brand-success" : "bg-yellow-500"}`}
                    ></div>
                    <span className="text-lg font-semibold text-text-main">
                      {adminData.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio block */}
              <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                  Bio / Details
                </span>
                <p className="text-text-main font-medium leading-relaxed">
                  {adminData.bio || "Click Edit Profile to add your bio."}
                </p>
              </div>

              {/* Bank Details */}
              <div className="space-y-4 pt-4 border-t border-border-main">
                <h3 className="font-bold text-lg text-text-main">
                  Bank Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      Account Holder Name
                    </span>
                    <span className="text-lg font-semibold text-text-main">
                      {adminData.bankDetails?.name || "N/A"}
                    </span>
                  </div>
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      Account Number
                    </span>
                    <span className="text-lg font-semibold text-text-main">
                      {adminData.bankDetails?.accountNumber || "N/A"}
                    </span>
                  </div>
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      IFSC Code
                    </span>
                    <span className="text-lg font-semibold text-text-main font-mono">
                      {adminData.bankDetails?.ifscCode || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & Joining Details */}
              <div className="space-y-4 pt-4 border-t border-border-main">
                <h3 className="font-bold text-lg text-text-main">
                  Employment & Financial Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      Commission %
                    </span>
                    <span className="text-lg font-semibold text-text-main">
                      {adminData.commissionPercentage || 0}%
                    </span>
                  </div>
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      Payments Done (Paid)
                    </span>
                    <span className="text-lg font-semibold text-text-main">
                      ₹{adminData.paymentsDone || 0}
                    </span>
                  </div>
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      Total Revenue
                    </span>
                    <span className="text-lg font-semibold text-text-main">
                      ₹{adminData.totalRevenue || 0}
                    </span>
                  </div>
                  <div className="bg-bg-main rounded-xl p-5 border border-border-main">
                    <span className="text-xs font-bold text-text-muted uppercase block mb-2">
                      Date of Joining
                    </span>
                    <span className="text-lg font-semibold text-text-main">
                      {adminData.employedate
                        ? new Date(adminData.employedate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4 pt-4 border-t border-border-main">
                <h3 className="font-bold text-lg text-text-main">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted block mb-1">
                      Account Created
                    </span>
                    <span className="text-text-main font-medium">
                      {adminData.createdAt
                        ? new Date(adminData.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-1">
                      Account ID
                    </span>
                    <span className="text-text-main font-mono text-xs break-all">
                      {adminData._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-3">
                  Bio / Details
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Enter a brief bio or description of your teaching experience..."
                  rows="4"
                  className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition resize-none"
                />
              </div>

              {/* Bank details editable */}
              <div className="space-y-4 pt-4 border-t border-border-main">
                <h3 className="font-bold text-lg text-text-main">
                  Bank Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bankDetails.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, name: e.target.value }
                      }))}
                      className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      name="bank_accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                      }))}
                      className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      name="bank_ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        bankDetails: { ...prev.bankDetails, ifscCode: e.target.value.toUpperCase() }
                      }))}
                      className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
