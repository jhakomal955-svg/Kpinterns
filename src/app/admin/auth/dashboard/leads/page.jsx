"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    New: 0,
    Contacted: 0,
    "Follow-up": 0,
    Converted: 0,
    Lost: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: debouncedSearch,
      });

      const res = await fetch(`/api/admin/leads?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(data.data || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      } else {
        console.error("Failed to load leads:", data.error);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle Quick Status Change
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
        );
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead((prev) => ({ ...prev, status: newStatus }));
        }
        fetchLeads();
      } else {
        alert(data.error || "Failed to update lead status");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Add Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;

    setSubmittingNote(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/leads/${selectedLead._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newNote: newNote.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedLead(data.data);
        setLeads((prev) =>
          prev.map((l) => (l._id === selectedLead._id ? data.data : l))
        );
        setNewNote("");
      } else {
        alert(data.error || "Failed to add note");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Delete Lead
  const handleDeleteLead = async () => {
    if (!deleteConfirmLead) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/leads/${deleteConfirmLead._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeads((prev) => prev.filter((l) => l._id !== deleteConfirmLead._id));
        if (selectedLead?._id === deleteConfirmLead._id) {
          setSelectedLead(null);
        }
        setDeleteConfirmLead(null);
        fetchLeads();
      } else {
        alert(data.error || "Failed to delete lead");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!leads.length) {
      alert("No lead data to export!");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "University",
      "College",
      "Degree",
      "Department",
      "Internship Domain",
      "Last Step",
      "Status",
      "Captured Date",
    ];

    const csvRows = [headers.join(",")];

    leads.forEach((l) => {
      const row = [
        `"${(l.fullName || "").replace(/"/g, '""')}"`,
        `"${(l.email || "").replace(/"/g, '""')}"`,
        `"${(l.phone || "").replace(/"/g, '""')}"`,
        `"${(l.university || "").replace(/"/g, '""')}"`,
        `"${(l.college || "").replace(/"/g, '""')}"`,
        `"${(l.degree || "").replace(/"/g, '""')}"`,
        `"${(l.department || "").replace(/"/g, '""')}"`,
        `"${(l.internshipDomain || "").replace(/"/g, '""')}"`,
        `"Step ${l.lastStepCompleted || 1}"`,
        `"${l.status || "New"}"`,
        `"${l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `KP_Interns_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Contacted":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Follow-up":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Converted":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Lost":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const cleanPhoneForLink = (phoneStr) => {
    if (!phoneStr) return "";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Lead Generation & Abandoned Registrations
          </h1>
          <p className="text-text-muted text-sm sm:text-base mt-1">
            Track visitors who started registering and reach out to convert them into students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="px-4 py-2 rounded-xl border border-border-main text-text-main hover:bg-bg-card transition-all flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white hover:opacity-90 transition-all flex items-center gap-2 text-sm font-medium shadow-md shadow-brand-primary/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-bg-card p-4 rounded-2xl border border-border-main shadow-sm flex flex-col justify-between">
          <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Total Captured</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-text-main">{stats.total}</span>
            <span className="text-xs text-text-muted">All Time</span>
          </div>
        </div>

        <div className="bg-bg-card p-4 rounded-2xl border border-blue-500/20 shadow-sm flex flex-col justify-between">
          <span className="text-blue-500 text-xs font-semibold uppercase tracking-wider">New Leads</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-500">{stats.New || 0}</span>
            <span className="text-xs text-blue-400">Needs Action</span>
          </div>
        </div>

        <div className="bg-bg-card p-4 rounded-2xl border border-purple-500/20 shadow-sm flex flex-col justify-between">
          <span className="text-purple-500 text-xs font-semibold uppercase tracking-wider">Contacted</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-500">{stats.Contacted || 0}</span>
            <span className="text-xs text-purple-400">In Touch</span>
          </div>
        </div>

        <div className="bg-bg-card p-4 rounded-2xl border border-amber-500/20 shadow-sm flex flex-col justify-between">
          <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">Follow-up Needed</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">{stats["Follow-up"] || 0}</span>
            <span className="text-xs text-amber-400">Active Pipeline</span>
          </div>
        </div>

        <div className="bg-bg-card p-4 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-emerald-500 text-xs font-semibold uppercase tracking-wider">Converted</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500">{stats.Converted || 0}</span>
            <span className="text-xs text-emerald-400">Registered 🎉</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-bg-card p-4 rounded-2xl border border-border-main shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["all", "New", "Contacted", "Follow-up", "Converted", "Lost"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 capitalize ${
                statusFilter === st
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-main hover:bg-bg-main"
              }`}
            >
              {st === "all" ? "All Statuses" : st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search name, email, mobile, college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-main border border-border-main text-text-main text-sm focus:outline-none focus:border-brand-primary transition-colors"
          />
          <svg
            className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-bg-card rounded-2xl border border-border-main shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted space-y-3">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm">Loading captured leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <svg className="w-12 h-12 text-text-muted mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-text-main">No leads found</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No leads matched your search or status filter criteria."
                : "When visitors fill partial registration forms and leave, their details will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-main border-collapse">
              <thead>
                <tr className="bg-bg-main/50 border-b border-border-main text-xs uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 px-4 font-semibold">Candidate Info</th>
                  <th className="py-3.5 px-4 font-semibold">Academic / Domain</th>
                  <th className="py-3.5 px-4 font-semibold">Form Progress</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Captured Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Quick Contact & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {leads.map((lead) => {
                  const cleanedPhone = cleanPhoneForLink(lead.phone);
                  return (
                    <tr key={lead._id} className="hover:bg-bg-main/30 transition-colors">
                      {/* Candidate Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-text-main text-base">
                          {lead.fullName || "Anonymous Visitor"}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 space-y-0.5">
                          {lead.email && <div className="flex items-center gap-1">✉️ {lead.email}</div>}
                          {lead.phone && <div className="flex items-center gap-1 font-mono">📱 {lead.phone}</div>}
                        </div>
                      </td>

                      {/* Academic Info */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-text-main">
                          {lead.internshipDomain ? (
                            <span className="text-brand-primary font-semibold">{lead.internshipDomain}</span>
                          ) : (
                            <span className="text-text-muted">Domain Not Chosen</span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {lead.college || lead.university ? `${lead.college || ""} ${lead.university ? `(${lead.university})` : ""}` : "College Not Selected"}
                        </div>
                      </td>

                      {/* Progress Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-bg-main border border-border-main text-text-main">
                          <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                          Step {lead.lastStepCompleted || 1} of 4
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={lead.status || "New"}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadgeClass(
                            lead.status
                          )}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Converted">Converted</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Captured Date */}
                      <td className="py-4 px-4 text-xs text-text-muted">
                        <div>{new Date(lead.createdAt || lead.lastActivityAt).toLocaleDateString()}</div>
                        <div className="text-[10px] opacity-75">{new Date(lead.createdAt || lead.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Quick Contact & Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Call Link */}
                          {cleanedPhone && (
                            <a
                              href={`tel:+${cleanedPhone}`}
                              title="Call Candidate"
                              className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </a>
                          )}

                          {/* WhatsApp Link */}
                          {cleanedPhone && (
                            <a
                              href={`https://wa.me/${cleanedPhone}?text=Hi%20${encodeURIComponent(lead.fullName || "")},%20I%20noticed%20you%20were%20registering%20on%20KP%20Interns.`}
                              target="_blank"
                              rel="noreferrer"
                              title="WhatsApp Chat"
                              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                              </svg>
                            </a>
                          )}

                          {/* Email Link */}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}?subject=Need%20Help%20Completing%20Your%20KP%20Interns%20Registration?`}
                              title="Send Email"
                              className="p-2 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </a>
                          )}

                          {/* Details Drawer Button */}
                          <button
                            onClick={() => setSelectedLead(lead)}
                            title="View Lead Details & Notes"
                            className="px-3 py-1.5 rounded-xl bg-bg-main hover:bg-border-main border border-border-main text-text-main text-xs font-semibold transition-all flex items-center gap-1"
                          >
                            <span>Details</span>
                            {lead.notes?.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-brand-primary text-white text-[10px]">
                                {lead.notes.length}
                              </span>
                            )}
                          </button>

                          {/* Delete Lead Button */}
                          <button
                            onClick={() => setDeleteConfirmLead(lead)}
                            title="Delete Lead"
                            className="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border-main flex items-center justify-between gap-4 text-xs text-text-muted">
            <div>
              Showing <span className="font-bold text-text-main">{leads.length}</span> of{" "}
              <span className="font-bold text-text-main">{pagination.total}</span> leads
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-border-main hover:bg-bg-main disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="font-medium text-text-main">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-border-main hover:bg-bg-main disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details & Notes Modal / Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-bg-card w-full max-w-lg h-full border-l border-border-main shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-border-main flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-main">{selectedLead.fullName || "Lead Details"}</h2>
                <p className="text-xs text-text-muted mt-0.5">Captured on {new Date(selectedLead.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-main transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
              {/* Status Updater Card */}
              <div className="p-4 rounded-xl bg-bg-main border border-border-main space-y-3">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Update Lead Status</span>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedLead.status || "New"}
                    onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-bg-card border border-border-main text-text-main text-sm font-semibold focus:outline-none focus:border-brand-primary"
                  >
                    <option value="New">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up Needed</option>
                    <option value="Converted">Converted (Registered)</option>
                    <option value="Lost">Lost / Unresponsive</option>
                  </select>
                </div>
              </div>

              {/* Personal & Contact Info Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Personal & Contact Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">Email</span>
                    <span className="font-medium text-text-main break-all">{selectedLead.email || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">Phone</span>
                    <span className="font-medium text-text-main font-mono">{selectedLead.phone || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">Gender</span>
                    <span className="font-medium text-text-main">{selectedLead.gender || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">Parent / Guardian</span>
                    <span className="font-medium text-text-main">{selectedLead.parentName || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Academic Info Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Academic Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">University</span>
                    <span className="font-medium text-text-main">{selectedLead.university || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">College</span>
                    <span className="font-medium text-text-main">{selectedLead.college || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">Degree & Dept</span>
                    <span className="font-medium text-text-main">{selectedLead.degree ? `${selectedLead.degree} - ${selectedLead.department}` : "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-bg-main border border-border-main">
                    <span className="text-xs text-text-muted block">Semester / Session</span>
                    <span className="font-medium text-text-main">{selectedLead.semester ? `Sem ${selectedLead.semester} (${selectedLead.session})` : "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Follow-up Notes Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Follow-up Notes & Comments</h3>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows="3"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add follow-up notes (e.g. Called candidate, offered 10% discount coupon...)"
                    className="w-full p-3 rounded-xl bg-bg-main border border-border-main text-text-main text-sm focus:outline-none focus:border-brand-primary"
                  />
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="w-full py-2 rounded-xl bg-brand-primary text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {submittingNote ? "Adding Note..." : "Add Follow-up Note"}
                  </button>
                </form>

                {/* Existing Notes List */}
                <div className="space-y-2 pt-2">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.slice().reverse().map((note, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-bg-main border border-border-main space-y-1">
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <span className="font-semibold text-brand-primary">{note.addedBy}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-text-main whitespace-pre-wrap">{note.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-muted text-center py-4 italic">No follow-up notes recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-card max-w-md w-full rounded-2xl border border-border-main p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-text-main">Delete Lead Record</h3>
            <p className="text-text-muted text-sm">
              Are you sure you want to delete lead <strong className="text-text-main">{deleteConfirmLead.fullName || deleteConfirmLead.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmLead(null)}
                className="px-4 py-2 rounded-xl border border-border-main text-text-main text-sm font-medium hover:bg-bg-main transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLead}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-md shadow-red-500/20"
              >
                {deleting ? "Deleting..." : "Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
