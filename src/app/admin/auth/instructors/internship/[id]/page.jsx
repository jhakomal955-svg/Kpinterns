"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MediaPicker from "@/components/MediaPicker";

export default function InstructorInternshipEditPage() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params?.id;
  const isEditing = !!internshipId;

  const [activeTab, setActiveTab] = useState("content");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [adminData, setAdminData] = useState(null);

  const [editingContentIndex, setEditingContentIndex] = useState(null);
  const [editingUpdateIndex, setEditingUpdateIndex] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    position: "",
    degree: "BTech",
    department: "Computer Science & Engineering",
    domain: "Full Stack Development",
    internshipType: "Full-Time",
    mode: "Hybrid",
    duration: "2-weeks",
    status: "Draft",
    company: "Kpinterns",
    createdBy: "admin",
    tags: "",
    requirements: "",
    skills: "",
    responsibilities: "",
    benefits: "",
    perks: "",
    certificateOffered: true,
    stipendAmount: "",
    registrationFeeAmount: "",
    instructors: [],
    contentItems: [],
    updates: [],
    testStatus: "Draft",
    testQuestions: [],
    intersnhipReport: "",
  });

  const [currentContentItem, setCurrentContentItem] = useState({
    title: "",
    textContent: "",
    VideoUrl: "",
    pdfurl: "",
    imageurl: "",
    externalink: "",
  });

  const [currentUpdate, setCurrentUpdate] = useState({
    title: "",
    externalLink: "",
  });

  const fetchInternship = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const res = await fetch(`/api/internship?id=${internshipId}`, { headers });
      const data = await res.json();
      if (data.success) {
        const internship = data.data;

        // Access control check
        let isAssigned = false;
        let currentAdmin = null;
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("adminData");
            if (stored) {
              currentAdmin = JSON.parse(stored);
            }
          } catch (e) { console.error(e); }
        }

        if (currentAdmin) {
          isAssigned = internship.instructor?.some((inst) => {
            const instId = typeof inst.id === "object" ? inst.id?._id : inst.id;
            return instId === currentAdmin._id;
          });
        }

        if (!isAssigned) {
          setIsAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // Load admin ID for fallback
        let loggedInAdminId = "admin";
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("adminData");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && parsed._id) {
                loggedInAdminId = parsed._id;
              }
            }
          } catch (err) {
            console.error(err);
          }
        }

        setFormData({
          title: internship.title || "",
          description: internship.description || "",
          shortDescription: internship.shortDescription || "",
          thumbnail: internship.thumbnail || "",
          position: internship.position || "",
          degree: Array.isArray(internship.degree) ? internship.degree : (internship.degree ? [internship.degree] : []),
          department: Array.isArray(internship.department) ? internship.department : (internship.department ? [internship.department] : []),
          domain: internship.domain || "Full Stack Development",
          internshipType: internship.internshipType || "Full-Time",
          mode: internship.mode || "Hybrid",
          duration: internship.duration || "2-weeks",
          status: internship.status || "Draft",
          company: internship.company || "Kpinterns",
          createdBy: (internship.createdBy && internship.createdBy !== "admin")
            ? (typeof internship.createdBy === "object" ? internship.createdBy._id : internship.createdBy)
            : loggedInAdminId,
          tags: Array.isArray(internship.tags) ? internship.tags.join(", ") : "",
          requirements: Array.isArray(internship.requirements) ? internship.requirements.join(", ") : "",
          skills: Array.isArray(internship.skills) ? internship.skills.join(", ") : "",
          responsibilities: Array.isArray(internship.responsibilities) ? internship.responsibilities.join(", ") : "",
          benefits: Array.isArray(internship.benefits) ? internship.benefits.join(", ") : "",
          perks: Array.isArray(internship.perks) ? internship.perks.join(", ") : "",
          certificateOffered: internship.certificateOffered ?? true,
          stipendAmount: internship.stipend?.amount || "",
          registrationFeeAmount: internship.RegistrationFee?.amount || "",
          instructors: internship.instructor?.map(inst => typeof inst.id === "object" ? inst.id._id : (inst.id || "")).filter(Boolean) || [],
          contentItems: internship.content || [],
          updates: internship.updates || [],
          testStatus: internship.test?.status || "Draft",
          testQuestions: internship.test?.questions || [],
          intersnhipReport: internship.intersnhipReport || "",
        });
      } else {
        setError(data.error || "Failed to load internship");
      }
    } catch (err) {
      setError("Error loading internship: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchInternship();
    }
  }, [internshipId, isEditing]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAdminData(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch("/api/admin", { headers });
        const data = await res.json();
        if (data.success) {
          setAdminsList(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };
    fetchAdmins();
  }, []);

  const handleMediaUpload = async (file) => {
    setUploadingFile(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const token = localStorage.getItem("adminToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const response = await fetch("/api/cloudinary", {
        method: "POST",
        body: payload,
        headers,
      });
      const data = await response.json();

      if (data.success) {
        const fileType = file.type;
        const url = data.data.secure_url;

        if (fileType.includes("image")) {
          setCurrentContentItem((prev) => ({ ...prev, imageurl: url }));
        } else if (fileType.includes("video")) {
          setCurrentContentItem((prev) => ({ ...prev, VideoUrl: url }));
        } else if (fileType.includes("pdf")) {
          setCurrentContentItem((prev) => ({ ...prev, pdfurl: url }));
        }
        setMessage("File uploaded successfully!");
      } else {
        setError("Failed to upload file");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const editContentItem = (index) => {
    setEditingContentIndex(index);
    setCurrentContentItem(formData.contentItems[index]);
  };

  const cancelEditContentItem = () => {
    setEditingContentIndex(null);
    setCurrentContentItem({
      title: "",
      textContent: "",
      VideoUrl: "",
      pdfurl: "",
      imageurl: "",
      externalink: "",
    });
  };

  const addContentItem = () => {
    if (!currentContentItem.title.trim()) {
      setError("Please enter a content title");
      return;
    }

    setFormData((prev) => {
      let newItems;
      if (editingContentIndex !== null) {
        newItems = [...prev.contentItems];
        newItems[editingContentIndex] = currentContentItem;
      } else {
        newItems = [...prev.contentItems, currentContentItem];
      }
      return {
        ...prev,
        contentItems: newItems,
      };
    });

    const isEditMode = editingContentIndex !== null;
    setEditingContentIndex(null);

    setCurrentContentItem({
      title: "",
      textContent: "",
      VideoUrl: "",
      pdfurl: "",
      imageurl: "",
      externalink: "",
    });

    setMessage(isEditMode ? "Content item updated successfully!" : "Content item added successfully!");
  };

  const removeContentItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      contentItems: prev.contentItems.filter((_, i) => i !== index),
    }));
    if (editingContentIndex === index) {
      cancelEditContentItem();
    } else if (editingContentIndex > index) {
      setEditingContentIndex(editingContentIndex - 1);
    }
  };

  const editUpdateItem = (index) => {
    setEditingUpdateIndex(index);
    setCurrentUpdate(formData.updates[index]);
  };

  const cancelEditUpdateItem = () => {
    setEditingUpdateIndex(null);
    setCurrentUpdate({
      title: "",
      externalLink: "",
    });
  };

  const addUpdateItem = () => {
    if (!currentUpdate.title.trim()) {
      setError("Please enter an update title");
      return;
    }

    setFormData((prev) => {
      let newUpdates;
      if (editingUpdateIndex !== null) {
        newUpdates = [...prev.updates];
        newUpdates[editingUpdateIndex] = currentUpdate;
      } else {
        newUpdates = [...(prev.updates || []), currentUpdate];
      }
      return {
        ...prev,
        updates: newUpdates,
      };
    });

    const isEditMode = editingUpdateIndex !== null;
    setEditingUpdateIndex(null);

    setCurrentUpdate({
      title: "",
      externalLink: "",
    });

    setMessage(isEditMode ? "Update item updated successfully!" : "Update item added successfully!");
  };

  const removeUpdateItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));
    if (editingUpdateIndex === index) {
      cancelEditUpdateItem();
    } else if (editingUpdateIndex > index) {
      setEditingUpdateIndex(editingUpdateIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        thumbnail: formData.thumbnail,
        position: formData.position,
        degree: formData.degree,
        department: formData.department,
        domain: formData.domain,
        internshipType: formData.internshipType,
        mode: formData.mode,
        duration: formData.duration,
        status: formData.status,
        company: formData.company,
        createdBy: formData.createdBy,
        certificateOffered: formData.certificateOffered,
        instructor: formData.instructors.map(id => ({ id })),
        tags: formData.tags ? formData.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map((item) => item.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(",").map((item) => item.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(",").map((item) => item.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split(",").map((item) => item.trim()).filter(Boolean) : [],
        perks: formData.perks ? formData.perks.split(",").map((item) => item.trim()).filter(Boolean) : [],
        stipend: {
          amount: formData.stipendAmount,
        },
        RegistrationFee: {
          amount: formData.registrationFeeAmount || "0",
        },
        content: formData.contentItems,
        updates: formData.updates,
        test: {
          status: formData.testStatus,
          questions: formData.testQuestions,
        },
        intersnhipReport: formData.intersnhipReport || "",
      };

      const url = `/api/internship?id=${internshipId}`;
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      };

      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Internship coursework content updated successfully!");
        setTimeout(() => {
          router.push("/admin/auth/instructors/internship");
        }, 1500);
      } else {
        setError(data.error || "Failed to save internship content");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (isAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-bg-card border-2 border-border-main p-8 rounded-2xl max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-main">Access Denied</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            instructor have not acess for this page view and edit contact to admin for any updation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-brand-secondary tracking-wider">{Array.isArray(formData.department) ? formData.department.join(", ") : formData.department} ({formData.domain})</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            {formData.position} Internship
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Manage student tasks, curriculum content, and general updates.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/auth/instructors/internship")}
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to Internships
        </button>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 border-b-2 border-border-main mb-4 bg-bg-card rounded-t-2xl p-4">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "content" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Coursework Content Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "updates" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Syllabus Updates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("test")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "test" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Test Section
          </button>
        </div>

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-text-main">Add New Coursework Content</h3>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Content Title *</label>
                <input
                  type="text"
                  value={currentContentItem.title}
                  onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Week 1 - Project Setup & Architecture"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Text Content / Task Notes</label>
                <textarea
                  value={currentContentItem.textContent}
                  onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, textContent: e.target.value }))}
                  placeholder="Detailed task list, learning notes, or documentation..."
                  rows="5"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-3">Upload Media Files (Video, PDF, Images)</label>
                <MediaPicker
                  onFileSelect={handleMediaUpload}
                  isUploading={uploadingFile}
                  uploadedItems={[currentContentItem.VideoUrl, currentContentItem.pdfurl, currentContentItem.imageurl].filter(Boolean)}
                  maxSize={100}
                  multiple={true}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">External Reference Link (Optional)</label>
                <input
                  type="url"
                  value={currentContentItem.externalink}
                  onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, externalink: e.target.value }))}
                  placeholder="https://github.com/example/repo"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={uploadingFile}
                  onClick={addContentItem}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile 
                    ? "Uploading File..." 
                    : (editingContentIndex !== null ? "Update Content Item" : "Add Content Item")}
                </button>
                {editingContentIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelEditContentItem}
                    className="px-6 bg-bg-main border-2 border-border-main text-text-muted hover:text-text-main font-semibold py-3 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {formData.contentItems.length > 0 && (
              <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-text-main">Coursework Items ({formData.contentItems.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.contentItems.map((item, idx) => (
                    <div key={idx} className="bg-bg-main border-2 border-border-main rounded-xl p-4 flex items-start justify-between hover:border-brand-primary transition">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-main mb-1">{item.title}</h4>
                        {item.textContent && <p className="text-xs text-text-muted truncate max-w-xl mb-2 italic">"{item.textContent}"</p>}
                        <div className="flex flex-wrap gap-2">
                          {item.VideoUrl && <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full font-medium">🎬 Video</span>}
                          {item.pdfurl && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-medium">📄 PDF</span>}
                          {item.imageurl && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-medium">🖼️ Image</span>}
                          {item.externalink && <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full font-medium">🔗 Link</span>}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editContentItem(idx)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="space-y-6">
            <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-text-main">Add New Update</h3>
              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Update Title *</label>
                <input
                  type="text"
                  value={currentUpdate.title}
                  onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Midterm project evaluation scheduled for Monday"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Reference Document URL (Optional)</label>
                <input
                  type="url"
                  value={currentUpdate.externalLink}
                  onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, externalLink: e.target.value }))}
                  placeholder="https://example.com/document"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addUpdateItem}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {editingUpdateIndex !== null ? "Update Update Item" : "Add Update Item"}
                </button>
                {editingUpdateIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelEditUpdateItem}
                    className="px-6 bg-bg-main border-2 border-border-main text-text-muted hover:text-text-main font-semibold py-3 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {formData.updates && formData.updates.length > 0 && (
              <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-text-main">Internship Updates ({formData.updates.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.updates.map((item, idx) => (
                    <div key={idx} className="bg-bg-main border-2 border-border-main rounded-xl p-4 flex items-center justify-between hover:border-brand-primary transition">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-main mb-1">{item.title}</h4>
                        {item.externalLink && <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline truncate max-w-xl block mt-1">{item.externalLink}</a>}
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editUpdateItem(idx)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUpdateItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "test" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
              <div>
                <h3 className="text-lg font-bold text-text-main">Internship Test Settings</h3>
                <p className="text-text-muted text-xs">Configure the final assessment test for this internship</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-text-muted uppercase">Test Status:</label>
                <select
                  value={formData.testStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, testStatus: e.target.value }))}
                  className="p-2 bg-bg-main border-2 border-border-main rounded-xl text-xs focus:border-brand-primary outline-none text-text-main font-semibold"
                >
                  <option value="Draft">Draft (Only Admin/Instructor can see)</option>
                  <option value="Published">Published (Enrolled student completes internship to see)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-main">Questions ({formData.testQuestions.length})</h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      testQuestions: [
                        ...prev.testQuestions,
                        { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }
                      ]
                    }));
                  }}
                  className="bg-brand-primary text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-brand-primary/90 transition shadow-sm"
                >
                  + Add Question
                </button>
              </div>

              {formData.testQuestions.length === 0 ? (
                <p className="text-sm text-text-muted italic bg-bg-main p-6 rounded-2xl border border-border-main/50 text-center">
                  No questions added yet. Click "+ Add Question" to start building the test.
                </p>
              ) : (
                <div className="space-y-6">
                  {formData.testQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-bg-main border-2 border-border-main p-5 rounded-2xl space-y-4 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            testQuestions: prev.testQuestions.filter((_, idx) => idx !== qIdx)
                          }));
                        }}
                        className="absolute top-4 right-4 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 p-2 rounded-xl transition font-semibold text-xs flex items-center gap-1"
                      >
                        Remove
                      </button>
                      
                      <div className="font-bold text-sm text-brand-primary flex items-center gap-2">
                        <span>❓</span> Question {qIdx + 1}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-text-muted uppercase">Question Text *</label>
                        <input
                          type="text"
                          required
                          value={q.questionText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const newList = [...prev.testQuestions];
                              newList[qIdx] = { ...newList[qIdx], questionText: val };
                              return { ...prev, testQuestions: newList };
                            });
                          }}
                          placeholder="e.g. What is the output of 2 + 2 in JavaScript?"
                          className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-text-muted uppercase">Option {optIdx + 1} *</label>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => {
                                  const newList = [...prev.testQuestions];
                                  const newOptions = [...newList[qIdx].options];
                                  newOptions[optIdx] = val;
                                  newList[qIdx] = { ...newList[qIdx], options: newOptions };
                                  return { ...prev, testQuestions: newList };
                                });
                              }}
                              placeholder={`Option ${optIdx + 1}`}
                              className="w-full p-2.5 bg-bg-card border-2 border-border-main rounded-xl focus:border-brand-primary outline-none text-xs font-semibold text-text-main"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="w-full sm:w-1/2 pt-2">
                        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase font-poppins">Correct Option *</label>
                        <select
                          value={q.correctOptionIndex}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setFormData(prev => {
                              const newList = [...prev.testQuestions];
                              newList[qIdx] = { ...newList[qIdx], correctOptionIndex: val };
                              return { ...prev, testQuestions: newList };
                            });
                          }}
                          className="p-2.5 bg-bg-card border-2 border-border-main rounded-xl text-xs focus:border-brand-primary outline-none text-text-main font-semibold w-full"
                        >
                          {q.options.map((opt, optIdx) => (
                            <option key={optIdx} value={optIdx}>
                              Option {optIdx + 1} {opt ? `(${opt})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t-2 border-border-main sticky bottom-0 bg-bg-main p-6 rounded-2xl">
          <button type="button" disabled={isSubmitting || uploadingFile} onClick={() => router.push("/admin/auth/instructors/internship")} className="flex-1 px-6 py-3 border-2 border-border-main text-text-main rounded-xl hover:bg-bg-card transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button type="submit" disabled={isSubmitting || uploadingFile} className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed">
            {uploadingFile ? "Uploading File..." : isSubmitting ? "Saving Content..." : "Save Internship Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
