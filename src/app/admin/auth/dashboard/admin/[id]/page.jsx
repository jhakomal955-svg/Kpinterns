"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminEditPage() {
  const router = useRouter();
  const params = useParams();
  const adminId = params?.id;

  const [activeTab, setActiveTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "Admin",
    bio: "",
    verified: false,
    bankDetails: {
      name: "",
      accountNumber: "",
      ifscCode: ""
    },
    commissionPercentage: 0,
    paymentsDone: 0,
    totalRevenue: 0,
    employedate: ""
  });

  const fetchAdmin = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`/api/admin?id=${adminId}`, { headers });
      const data = await res.json();
      if (data.success && data.data) {
        const admin = data.data;
        setFormData({
          name: admin.name || "",
          email: admin.email || "",
          mobile: admin.mobile || "",
          role: admin.role || "Admin",
          bio: admin.bio || "",
          verified: admin.verified !== undefined ? admin.verified : false,
          password: "", // hide password
          bankDetails: {
            name: admin.bankDetails?.name || "",
            accountNumber: admin.bankDetails?.accountNumber || "",
            ifscCode: admin.bankDetails?.ifscCode || ""
          },
          commissionPercentage: admin.commissionPercentage || 0,
          paymentsDone: admin.paymentsDone || 0,
          totalRevenue: admin.totalRevenue || 0,
          employedate: admin.employedate ? new Date(admin.employedate).toISOString().split('T')[0] : ""
        });
      } else {
        setError(data.error || "Failed to load admin profile");
      }
    } catch (err) {
      setError("Error loading admin: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchAdmin();
    }
  }, [adminId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
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

      if (!formData.bankDetails?.name || formData.bankDetails.name.trim().length < 3) {
        setError("Bank Account Holder Name must be at least 3 characters");
        setIsSubmitting(false);
        return;
      }

      if (!formData.bankDetails?.accountNumber || !/^\d{9,18}$/.test(formData.bankDetails.accountNumber.trim())) {
        setError("Bank Account Number must be between 9 and 18 digits");
        setIsSubmitting(false);
        return;
      }

      if (!formData.bankDetails?.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode.trim().toUpperCase())) {
        setError("Invalid IFSC Code format (e.g. SBIN0001234)");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        bankDetails: {
          name: formData.bankDetails.name.trim(),
          accountNumber: formData.bankDetails.accountNumber.trim(),
          ifscCode: formData.bankDetails.ifscCode.trim().toUpperCase()
        }
      };

      if (!payload.password) {
        delete payload.password; // Do not send empty password
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch(`/api/admin?id=${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Admin profile updated successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/admin");
        }, 1500);
      } else {
        setError(data.error || "Failed to update admin");
      }
    } catch (err) {
      setError("An error occurred while saving profile changes");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Edit Admin Profile
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Modify credentials, shop permissions, bank accounts and metrics for this admin account.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/admin"
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to Admins
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
            onClick={() => setActiveTab("bank")}
            className={`px-5 py-3 font-semibold transition-all cursor-pointer ${
              activeTab === "bank"
                ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Bank Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("financials")}
            className={`px-5 py-3 font-semibold transition-all cursor-pointer ${
              activeTab === "financials"
                ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Financials & Metrics
          </button>
        </div>

        {/* Tab Content: Personal Info */}
        {activeTab === "personal" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm">
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
                  placeholder="Jane Administrator"
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
                  placeholder="admin@kpinterns.com"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
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
                  placeholder="10-digit mobile number"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Password (leave blank to keep)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
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

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Bio / Notes</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Write account notes, coordinator office details, etc."
                rows={3}
                className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center">
              <input
                id="verified"
                name="verified"
                type="checkbox"
                checked={formData.verified}
                onChange={handleInputChange}
                className="w-4.5 h-4.5 text-brand-primary border-border-main rounded focus:ring-brand-primary"
              />
              <label htmlFor="verified" className="ml-2 block text-sm font-semibold text-text-main select-none cursor-pointer">
                Verified Account (Status indicator)
              </label>
            </div>
          </div>
        )}

        {/* Tab Content: Bank Account */}
        {activeTab === "bank" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
              2. Bank Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Account Holder Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.bankDetails.name}
                  onChange={handleBankInputChange}
                  placeholder="e.g. Jane Administrator"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  required
                  value={formData.bankDetails.accountNumber}
                  onChange={handleBankInputChange}
                  placeholder="e.g. 1234567890"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">IFSC Code *</label>
                <input
                  type="text"
                  name="ifscCode"
                  required
                  value={formData.bankDetails.ifscCode}
                  onChange={handleBankInputChange}
                  placeholder="e.g. SBIN0001234"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Financials & Metrics */}
        {activeTab === "financials" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-sm animate-fade-in">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2">
              3. Employment & Commission Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Commission Percentage (%) *</label>
                <input
                  type="number"
                  name="commissionPercentage"
                  required
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Payments Done (₹) *</label>
                <input
                  type="number"
                  name="paymentsDone"
                  required
                  min="0"
                  value={formData.paymentsDone}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Total Revenue Earned (₹) *</label>
                <input
                  type="number"
                  name="totalRevenue"
                  required
                  min="0"
                  value={formData.totalRevenue}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Date of Joining *</label>
                <input
                  type="date"
                  name="employedate"
                  required
                  value={formData.employedate}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex gap-4 items-center justify-end">
          <Link
            href="/admin/auth/dashboard/admin"
            className="px-6 py-3 rounded-xl border-2 border-border-main text-text-main font-semibold hover:bg-bg-main transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition shadow-md flex items-center gap-2 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
