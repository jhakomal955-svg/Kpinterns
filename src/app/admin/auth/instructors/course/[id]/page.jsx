"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MediaPicker from "@/components/MediaPicker";

export default function InstructorCourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;
  const isEditing = !!courseId;
  const [activeTab, setActiveTab] = useState("content");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [adminData, setAdminData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    department: "Technical",
    difficultyLevel: "Beginner",
    language: "English",
    price: 0,
    currency: "INR",
    isFree: true,
    duration: "1-month",
    accessDuration: "lifetime",
    status: "Draft",
    instructor: "",
    instructors: [],
    prerequisites: "",
    learningOutcomes: "",
    contentItems: [],
    updates: [],
    tags: "",
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

  const [editingContentIndex, setEditingContentIndex] = useState(null);
  const [editingUpdateIndex, setEditingUpdateIndex] = useState(null);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const res = await fetch(`/api/course?id=${courseId}`, { headers });
      const data = await res.json();
      if (data.success) {
        const course = data.data;

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
          isAssigned = course.instructor?.some((inst) => {
            const instId = typeof inst.id === "object" ? inst.id?._id : inst.id;
            return instId === currentAdmin._id;
          });
        }

        if (!isAssigned) {
          setIsAccessDenied(true);
          setIsLoading(false);
          return;
        }

        setFormData({
          title: course.title || "",
          description: course.description || "",
          shortDescription: course.shortDescription || "",
          thumbnail: course.thumbnail || "",
          department: course.department || "Technical",
          difficultyLevel: course.difficultyLevel || "Beginner",
          language: course.language || "English",
          price: course.price || 0,
          currency: course.currency || "INR",
          isFree: course.isFree ?? true,
          duration: course.duration || "1-month",
          accessDuration: course.accessDuration || "lifetime",
          status: course.status || "Draft",
          instructors: course.instructor?.map(inst => typeof inst.id === "object" ? inst.id._id : (inst.id || "")).filter(Boolean) || [],
          prerequisites: course.prerequisites?.join(", ") || "",
          learningOutcomes: course.learningOutcomes?.join(", ") || "",
          contentItems: course.content || [],
          updates: course.updates || [],
          tags: course.tags?.join(", ") || "",
        });
      } else {
        setError("Failed to load course");
      }
    } catch (err) {
      setError("Error loading course: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [courseId, isEditing]);

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

      // Cloudinary upload does not strictly require auth header, but we pass it anyway for consistency
      const token = localStorage.getItem("adminToken");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const response = await fetch("/api/cloudinary", { method: "POST", body: payload, headers });
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
        department: formData.department,
        difficultyLevel: formData.difficultyLevel,
        language: formData.language,
        price: Number(formData.price),
        currency: formData.currency,
        isFree: formData.isFree,
        duration: formData.duration,
        accessDuration: formData.accessDuration,
        status: formData.status,
        instructor: formData.instructors.map(id => ({ id })),
        prerequisites: formData.prerequisites ? formData.prerequisites.split(",").map((item) => item.trim()).filter(Boolean) : [],
        learningOutcomes: formData.learningOutcomes ? formData.learningOutcomes.split(",").map((item) => item.trim()).filter(Boolean) : [],
        tags: formData.tags ? formData.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        content: formData.contentItems,
        updates: formData.updates,
      };

      const url = `/api/course?id=${courseId}`;
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
        setMessage("Course content updated successfully!");
        setTimeout(() => {
          router.push("/admin/auth/instructors/course");
        }, 1500);
      } else {
        setError(data.error || "Failed to save course content");
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
          <p className="text-text-muted">Loading course details...</p>
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-brand-secondary tracking-wider">{formData.department}</span>
          <h1 className="text-3xl font-bold text-text-main">{formData.title}</h1>
          <p className="text-text-muted mt-1">Manage multimedia course contents and curriculum updates.</p>
        </div>
        <button type="button" onClick={() => router.push("/admin/auth/instructors/course")} className="p-2 rounded-xl hover:bg-bg-card border border-border-main transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-brand-success flex items-center justify-between">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="font-bold ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-border-main">
        <button type="button" onClick={() => setActiveTab("content")} className={`px-6 py-3 font-semibold border-b-2 transition-all ${activeTab === "content" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}>
          Course Chapters / Modules
        </button>
        <button type="button" onClick={() => setActiveTab("updates")} className={`px-6 py-3 font-semibold border-b-2 transition-all ${activeTab === "updates" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-main"}`}>
          Syllabus Updates
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="bg-bg-card border-2 border-border-main rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-text-main">Add New Content Item</h3>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Content Title *</label>
                <input type="text" value={currentContentItem.title} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g., Chapter 1 - Introduction" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">Text Content / Chapter Notes</label>
                <textarea value={currentContentItem.textContent} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, textContent: e.target.value }))} placeholder="Write lecture markdown text, code blocks, or notes here..." rows="5" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-3">Upload Media Files (Video, PDF, Images)</label>
                <MediaPicker onFileSelect={handleMediaUpload} isUploading={uploadingFile} uploadedItems={[currentContentItem.VideoUrl, currentContentItem.pdfurl, currentContentItem.imageurl].filter(Boolean)} maxSize={100} multiple={true} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">External Link (Optional)</label>
                <input type="url" value={currentContentItem.externalink} onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, externalink: e.target.value }))} placeholder="https://example.com" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
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
                <h3 className="text-xl font-bold text-text-main">Content Items ({formData.contentItems.length})</h3>
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
                <input type="text" value={currentUpdate.title} onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Syllabus updated for Unit 2" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-muted mb-2">External Link (Optional)</label>
                <input type="url" value={currentUpdate.externalLink} onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, externalLink: e.target.value }))} placeholder="https://example.com/document" className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition" />
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
                <h3 className="text-xl font-bold text-text-main">Course Updates ({formData.updates.length})</h3>
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

        <div className="flex gap-4 pt-6 border-t-2 border-border-main sticky bottom-0 bg-bg-main p-6 rounded-2xl">
          <button type="button" disabled={isSubmitting || uploadingFile} onClick={() => router.push("/admin/auth/instructors/course")} className="flex-1 px-6 py-3 border-2 border-border-main text-text-main rounded-xl hover:bg-bg-card transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
          <button type="submit" disabled={isSubmitting || uploadingFile} className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed">
            {uploadingFile ? "Uploading File..." : isSubmitting ? "Saving Content..." : "Save Course Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
