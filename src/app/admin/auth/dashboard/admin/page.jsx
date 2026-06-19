"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function AdminsAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState(null);



  // Fetch Admins
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data || []).filter(
          (a) => a.role === "Admin"
        );
        setAdmins(filtered);
      } else {
        setError(data.error || "Failed to fetch admins");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching admins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);



  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin?id=${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Admin deleted successfully!");
        setShowConfirmModal(false);
        setTargetIdToDelete(null);
        fetchAdmins();
      } else {
        setError(data.error || "Failed to delete admin");
      }
    } catch (err) {
      setError("An error occurred while deleting the admin");
    }
  };

  const toggleVerification = async (admin) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin?id=${admin._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ verified: !admin.verified }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Admin verification status updated!`);
        fetchAdmins();
      } else {
        setError(data.error || "Failed to toggle verification status");
      }
    } catch (err) {
      setError("An error occurred while toggling verification status");
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const term = searchQuery.toLowerCase();
    return (
      admin.name?.toLowerCase().includes(term) ||
      admin.email?.toLowerCase().includes(term) ||
      admin.mobile?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Manage Admins</h1>
          <p className="text-text-muted text-sm sm:text-base">
            Create and maintain administrator privileges and profiles.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/admin/create"
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2 self-start sm:self-auto text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add New Admin
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
            Loading platform admins...
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm sm:text-base">
            No administrator accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Mobile Number</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-main text-sm sm:text-base">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-bg-main/40 transition duration-150">
                    <td className="py-4 px-6 font-semibold text-text-main">
                      <div>
                        <div>{admin.name}</div>
                        {admin.bio && <div className="text-xs text-text-muted mt-0.5 max-w-[180px] truncate">{admin.bio}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6">{admin.email}</td>
                    <td className="py-4 px-6">{admin.mobile}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        admin.role === "Instructor"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                          : "bg-brand-primary/10 text-brand-primary border border-brand-primary/30"
                      }`}>
                        {admin.role || "Admin"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleVerification(admin)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${
                            admin.verified
                              ? "bg-emerald-500/10 border-emerald-500/30 text-brand-success hover:bg-emerald-500/20"
                              : "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.verified ? "bg-brand-success" : "bg-orange-500"}`}></span>
                          {admin.verified ? "Verified" : "Unverified"}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/auth/dashboard/admin/${admin._id}`}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit Admin"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            setTargetIdToDelete(admin._id);
                            setShowConfirmModal(true);
                          }}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-550 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Admin"
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
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTargetIdToDelete(null);
        }}
        onConfirm={() => handleDelete(targetIdToDelete)}
        itemName="admin account"
      />
    </div>
  );
}
