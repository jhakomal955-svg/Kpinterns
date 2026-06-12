"use client";

import { useState, useEffect } from "react";

export default function CybercafePage() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "Cybercafe Partner",
    bio: "",
    agreeTerms: true,
    verified: false,
  });

  // Fetch Cybercafe Partners
  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data || []).filter((a) => a.role === "Cybercafe Partner");
        setPartners(filtered);
      } else {
        setError(data.error || "Failed to fetch cybercafe partners");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching cybercafe partners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setShowPassword(false);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "Cybercafe Partner",
      bio: "",
      agreeTerms: true,
      verified: false,
    });
    setShowModal(true);
  };

  const openEditModal = (partner) => {
    setIsEditing(true);
    setSelectedId(partner._id);
    setShowPassword(false);
    setFormData({
      name: partner.name || "",
      email: partner.email || "",
      mobile: partner.mobile || "",
      role: "Cybercafe Partner",
      bio: partner.bio || "",
      agreeTerms: partner.agreeTerms !== undefined ? partner.agreeTerms : true,
      verified: partner.verified !== undefined ? partner.verified : false,
      password: "", // Hide password
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage(null);
      setError(null);

      if (!/^\d{10}$/.test(formData.mobile)) {
        setError("Mobile number must be exactly 10 digits");
        return;
      }

      if (!isEditing && (!formData.password || formData.password.length < 6)) {
        setError("Password is required and must be at least 6 characters");
        return;
      }

      const url = isEditing ? `/api/admin?id=${selectedId}` : "/api/admin";
      const method = isEditing ? "PUT" : "POST";

      const payload = { ...formData };
      if (isEditing) {
        if (!payload.password) {
          delete payload.password; // Do not update empty password
        }
      } else {
        payload.isAdminCreation = true;
      }

      const token = localStorage.getItem("adminToken");
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(isEditing ? "Cybercafe Partner profile updated successfully!" : "Cybercafe Partner account created successfully!");
        setShowModal(false);
        fetchPartners();
      } else {
        setError(data.error || "Failed to save Cybercafe Partner");
      }
    } catch (err) {
      setError("An error occurred while saving the Cybercafe Partner");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Cybercafe Partner account?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin?id=${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Cybercafe Partner deleted successfully!");
        fetchPartners();
      } else {
        setError(data.error || "Failed to delete Cybercafe Partner");
      }
    } catch (err) {
      setError("An error occurred while deleting the Cybercafe Partner");
    }
  };

  const toggleVerification = async (partner) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin?id=${partner._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ verified: !partner.verified }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Cybercafe Partner verification status updated!`);
        fetchPartners();
      } else {
        setError(data.error || "Failed to toggle verification status");
      }
    } catch (err) {
      setError("An error occurred while toggling verification status");
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const term = searchQuery.toLowerCase();
    return (
      partner.name?.toLowerCase().includes(term) ||
      partner.email?.toLowerCase().includes(term) ||
      partner.mobile?.includes(term) ||
      partner.bio?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Manage Cybercafe Partners</h1>
          <p className="text-text-muted text-sm sm:text-base">
            Verify, edit, and manage registered Cybercafe Partner accounts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Cybercafe Partner
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
            placeholder="Search by name, email, or mobile..."
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
            Loading cybercafe partners...
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm sm:text-base">
            No Cybercafe Partner accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Partner Info</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Mobile Number</th>
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
                        {partner.bio && <div className="text-xs text-text-muted mt-0.5 max-w-[240px] truncate">{partner.bio}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6">{partner.email}</td>
                    <td className="py-4 px-6">{partner.mobile}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleVerification(partner)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${
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
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit Partner"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(partner._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Partner"
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

      {/* Cybercafe Partner Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-main">
              <h2 className="text-lg sm:text-xl font-bold text-text-main">
                {isEditing ? "Edit Cybercafe Partner Credentials" : "Create Cybercafe Partner Account"}
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm sm:text-base overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Cybercafe Shop Name or Owner"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. partner@cybercafe.com"
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                  Password {isEditing ? "(leave blank)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Bio <span className="normal-case font-normal">(optional)</span></label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Brief description about the cafe or coordination location..."
                  rows={2}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition resize-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
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
                    Verified Account (Allows partner to login)
                  </label>
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
                  {isEditing ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
