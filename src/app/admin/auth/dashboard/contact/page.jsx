"use client";

import { useState, useEffect } from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState(null);

  // Form/Modal state for viewing detail
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetIdToDelete, setTargetIdToDelete] = useState(null);
  const [adminData, setAdminData] = useState(null);

  const statuses = ["New", "Reviewed", "Responded", "Closed"];

  // Fetch Contacts
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/contact", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      } else {
        setError(data.error || "Failed to fetch contact form submissions");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    try {
      const stored = localStorage.getItem("adminData");
      if (stored) {
        setAdminData(JSON.parse(stored));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setMessage(null);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Submission marked as ${newStatus}!`);
        // If detailed modal is open, sync it
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact((prev) => ({ ...prev, status: newStatus }));
        }
        fetchContacts();
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch (err) {
      setError("An error occurred while updating status");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Submission deleted successfully!");
        setShowDetailModal(false);
        setShowConfirmModal(false);
        setTargetIdToDelete(null);
        fetchContacts();
      } else {
        setError(data.error || "Failed to delete submission");
      }
    } catch (err) {
      setError("An error occurred while deleting the submission");
    }
  };

  const openDetail = (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
  };

  const filteredContacts = contacts.filter((contact) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      contact.fullName?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.message?.toLowerCase().includes(term) ||
      contact.college?.toLowerCase().includes(term) ||
      contact.course?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "All" || contact.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">Contact Inquiries</h1>
        <p className="text-text-muted text-sm sm:text-base">
          Review and respond to contact form messages submitted by potential students and users.
        </p>
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
            placeholder="Search by sender name, email, college, course, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main placeholder-text-muted focus:border-brand-primary outline-none transition text-sm sm:text-base"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main focus:border-brand-primary outline-none transition text-sm sm:text-base"
          >
            <option value="All">All Inquiries</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st} Submissions
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="bg-bg-card border-2 border-border-main rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-text-muted">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            Loading form submissions...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm sm:text-base">
            No contact inquiries found matching the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-border-main bg-bg-main text-text-muted text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Sender Details</th>
                  <th className="py-4 px-6">Academic Course Info</th>
                  <th className="py-4 px-6">Message Excerpt</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main text-text-main text-sm sm:text-base">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-bg-main/40 transition duration-150">
                    <td className="py-4 px-6 font-medium text-text-main">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">{contact.fullName}</span>
                        <span className="text-xs text-text-muted">{contact.email}</span>
                        <span className="text-xs text-text-muted">{contact.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{contact.college}</span>
                        <span className="text-text-muted text-xs">{contact.course}</span>
                        <span className="text-text-muted text-xs">{contact.university} (Sem: {contact.semester})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="truncate text-sm text-text-muted italic">
                        "{contact.message}"
                      </p>
                      <span className="text-xs text-text-muted block mt-1">
                        {new Date(contact.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                          className={`text-xs font-bold py-1 px-3.5 rounded-lg border focus:outline-none transition ${
                            contact.status === "New"
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                              : contact.status === "Reviewed"
                              ? "bg-purple-500/10 border-purple-500/30 text-purple-500"
                              : contact.status === "Responded"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-brand-success"
                              : "bg-gray-500/10 border-border-main text-text-muted"
                          }`}
                        >
                          {statuses.map((st) => (
                            <option key={`status-option-${st}`} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openDetail(contact)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Submission Details"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {adminData?.role !== "Employee" && (
                          <button
                            onClick={() => {
                              setTargetIdToDelete(contact._id);
                              setShowConfirmModal(true);
                            }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-550 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete Submission"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-main">
              <h2 className="text-lg sm:text-xl font-bold text-text-main flex items-center gap-2">
                <span>Inquiry Details</span>
                <span className="text-xs uppercase bg-brand-primary/10 text-brand-primary py-0.5 px-2 rounded-full font-extrabold">
                  {selectedContact.status}
                </span>
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-border-main transition-colors text-text-muted hover:text-text-main"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm sm:text-base">
              {/* Sender info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-main/50 p-4 rounded-xl border border-border-main">
                <div>
                  <span className="text-xs font-bold text-text-muted block uppercase mb-1">Full Name</span>
                  <span className="font-semibold text-text-main">{selectedContact.fullName}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-muted block uppercase mb-1">Email Address</span>
                  <a href={`mailto:${selectedContact.email}`} className="font-medium text-brand-primary hover:underline block">
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-muted block uppercase mb-1">Phone Number</span>
                  <a href={`tel:${selectedContact.phone}`} className="font-medium text-text-main hover:text-brand-primary block">
                    {selectedContact.phone}
                  </a>
                </div>
                <div>
                  <span className="text-xs font-bold text-text-muted block uppercase mb-1">Submission Time</span>
                  <span className="text-text-main font-medium">
                    {new Date(selectedContact.createdAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Academic info */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-1">
                  Academic details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-text-muted block uppercase mb-1">College</span>
                    <span className="font-semibold text-text-main">{selectedContact.college}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted block uppercase mb-1">Interested Course / Branch</span>
                    <span className="font-semibold text-text-main">{selectedContact.course}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted block uppercase mb-1">University</span>
                    <span className="font-medium text-text-main">{selectedContact.university}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted block uppercase mb-1">Current Semester</span>
                    <span className="font-semibold text-text-main">{selectedContact.semester} Semester</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary border-b border-border-main pb-1">
                  Inquiry Message Message
                </h3>
                <div className="bg-bg-main border-2 border-border-main p-4 rounded-xl text-text-main leading-relaxed italic whitespace-pre-line text-sm sm:text-base">
                  "{selectedContact.message}"
                </div>
              </div>

              {/* Status Update & Delete inside Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border-main">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase text-text-muted">Update Status:</label>
                  <select
                    value={selectedContact.status}
                    onChange={(e) => handleStatusChange(selectedContact._id, e.target.value)}
                    className="p-1.5 bg-bg-main border-2 border-border-main rounded-lg text-sm text-text-main focus:border-brand-primary outline-none"
                  >
                    {statuses.map((st) => (
                      <option key={`modal-status-${st}`} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {adminData?.role !== "Employee" && (
                    <button
                      onClick={() => {
                        setTargetIdToDelete(selectedContact._id);
                        setShowConfirmModal(true);
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete inquiry
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-5 py-2 rounded-xl border-2 border-border-main hover:bg-bg-main text-text-main text-xs sm:text-sm font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTargetIdToDelete(null);
        }}
        onConfirm={() => handleDelete(targetIdToDelete)}
        itemName="submission"
      />
    </div>
  );
}
