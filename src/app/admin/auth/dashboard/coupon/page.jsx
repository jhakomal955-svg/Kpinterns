"use client";

import { useState, useEffect } from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    category: "all",
    expiryDate: "",
    expiryTime: "23:59",
  });

  // Delete Modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    couponId: null,
    couponCode: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/coupon", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
      } else {
        setError(data.error || "Failed to load coupons");
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
      setError("An error occurred while fetching coupons.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!formData.code.trim()) {
      setCreateError("Coupon code is required");
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setCreateError("Please enter a valid positive discount value");
      return;
    }
    if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
      setCreateError("Percentage discount cannot exceed 100%");
      return;
    }
    if (!formData.expiryDate) {
      setCreateError("Expiry date is required");
      return;
    }

    const fullExpiryString = `${formData.expiryDate}T${formData.expiryTime || "23:59"}`;
    const expiryTime = new Date(fullExpiryString).getTime();
    if (isNaN(expiryTime) || expiryTime <= Date.now()) {
      setCreateError("Expiry date & time must be set in the future");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          expiryDate: fullExpiryString,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsCreateModalOpen(false);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          category: "all",
          expiryDate: "",
          expiryTime: "23:59",
        });
        fetchCoupons();
      } else {
        setCreateError(data.error || "Failed to create coupon");
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
      setCreateError("An error occurred while creating coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.couponId) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/coupon/${deleteModal.couponId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchCoupons();
      } else {
        alert(data.error || "Failed to delete coupon");
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert("An error occurred while deleting coupon.");
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.createdByName && item.createdByName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;

    const isExpired = new Date(item.expiryDate) <= new Date();
    let matchesStatus = true;
    if (filterStatus === "active") {
      matchesStatus = item.isActive && !isExpired;
    } else if (filterStatus === "expired") {
      matchesStatus = !item.isActive || isExpired;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalActive = coupons.filter(
    (c) => c.isActive && new Date(c.expiryDate) > new Date()
  ).length;
  const totalExpired = coupons.filter(
    (c) => !c.isActive || new Date(c.expiryDate) <= new Date()
  ).length;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
              Coupon Code Management
            </h1>
          </div>
          <p className="text-sm font-medium text-text-muted mt-1">
            Create, manage, and delete discount coupon codes for Courses and Internships.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition shadow-md hover:shadow-lg cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Coupon
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border-main p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase">Total Coupons</p>
            <p className="text-2xl font-extrabold text-text-main">{coupons.length}</p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-main p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase">Active Coupons</p>
            <p className="text-2xl font-extrabold text-green-500">{totalActive}</p>
          </div>
        </div>

        <div className="bg-bg-card border border-border-main p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase">Expired / Inactive</p>
            <p className="text-2xl font-extrabold text-red-500">{totalExpired}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-bg-card border border-border-main p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search coupon code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main focus:outline-none focus:border-brand-primary text-sm font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-muted uppercase">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-main bg-bg-main text-text-main text-sm font-medium focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="course">Course Only</option>
              <option value="internship">Internship Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-muted uppercase">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border-main bg-bg-main text-text-main text-sm font-medium focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired / Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-bg-card border border-border-main rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-3 text-sm font-semibold text-text-muted">Loading coupons...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-bold">{error}</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">🏷️</span>
            <h3 className="text-lg font-bold text-text-main">No Coupon Codes Found</h3>
            <p className="text-sm text-text-muted mt-1">
              Create a new coupon code or adjust your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main border-b border-border-main text-xs font-extrabold text-text-muted uppercase tracking-wider">
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Expiry Date</th>
                  <th className="py-4 px-6">Created By</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Uses</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-sm font-medium">
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) <= new Date();
                  const isActive = coupon.isActive && !isExpired;

                  return (
                    <tr key={coupon._id} className="hover:bg-bg-main/50 transition">
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-mono font-bold rounded-lg text-sm tracking-wide">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-text-main">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize font-semibold px-2.5 py-1 rounded-md text-xs bg-bg-main border border-border-main text-text-main">
                          {coupon.category === "all" ? "All (Course & Internship)" : coupon.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-text-main font-semibold">
                        {new Date(coupon.expiryDate).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-main">
                            {coupon.createdByName || "Staff"}
                          </span>
                          <span className="text-xs text-text-muted">
                            ({coupon.createdByRole || "Admin"})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-text-main">
                        {coupon.usedCount || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              couponId: coupon._id,
                              couponCode: coupon.code,
                            })
                          }
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition text-xs font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-bg-card border-2 border-border-main rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h2 className="text-xl font-extrabold text-text-main flex items-center gap-2">
                <span>➕</span> Create Coupon Code
              </h2>
              <button
                onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text-main transition p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-bold">
                ⚠️ {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-mono font-bold uppercase focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-semibold focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="all">All (Courses & Internships)</option>
                  <option value="course">Course Only</option>
                  <option value="internship">Internship Only</option>
                </select>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-semibold focus:outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder={
                      formData.discountType === "percentage" ? "e.g. 20 (for 20%)" : "e.g. 100 (for ₹100)"
                    }
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-semibold focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Expiry Date & Expiry Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-semibold focus:outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-text-muted mb-1">
                    Expiry Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.expiryTime}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-semibold focus:outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-border-main">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main font-bold hover:bg-bg-main/80 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, couponId: null, couponCode: "" })
        }
        onConfirm={handleDeleteConfirm}
        itemName={`coupon code "${deleteModal.couponCode}"`}
      />
    </div>
  );
}
