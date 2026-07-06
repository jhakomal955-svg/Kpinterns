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

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [gradingModuleId, setGradingModuleId] = useState("");
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

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
    duration: "2 Weeks",
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
    assignmentTitle: "",
    assignmentDesc: "",
    assignmentFileUrl: "",
  });

  const [currentUpdate, setCurrentUpdate] = useState({
    title: "",
    externalLink: "",
  });

  const fetchEnrolledStudents = async () => {
    if (!internshipId) return;
    setStudentsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch("/api/user", { headers });
      const result = await res.json();
      if (result.success && result.data) {
        // Filter users enrolled in this internship
        const enrolled = result.data.filter(u => 
          u.ActiveInternship?.some(item => (item.internship?._id || item.internship) === internshipId)
        );
        setEnrolledStudents(enrolled);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSaveGradeInstructor = async (studentId, moduleId) => {
    if (!studentId || !internshipId || !moduleId || gradingMarks === "") {
      alert("Please enter marks to grade");
      return;
    }

    setGradingSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const res = await fetch("/api/internship/grade-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: studentId,
          internshipId,
          moduleId,
          marks: Number(gradingMarks),
          feedback: gradingFeedback,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert("Assignment graded successfully!");
        setGradingModuleId("");
        setGradingMarks("");
        setGradingFeedback("");
        // Reload student data
        await fetchEnrolledStudents();
      } else {
        alert(result.error || "Failed to grade assignment");
      }
    } catch (err) {
      console.error(err);
      alert("Error grading assignment");
    } finally {
      setGradingSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchEnrolledStudents();
    }
  }, [activeTab, internshipId]);

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
          duration: internship.duration || "2 Weeks",
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
      assignmentTitle: "",
      assignmentDesc: "",
      assignmentFileUrl: "",
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
      assignmentTitle: "",
      assignmentDesc: "",
      assignmentFileUrl: "",
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
          <button
            type="button"
            onClick={() => setActiveTab("submissions")}
            className={`px-5 py-3 font-semibold transition-all cursor-pointer ${activeTab === "submissions" ? "border-b-2 border-brand-primary text-brand-primary -mb-4 font-bold" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Student Submissions
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

              <div className="pt-4 border-t border-border-main/50 space-y-4">
                <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">Assignment Details (Optional)</h4>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Assignment Title</label>
                  <input
                    type="text"
                    value={currentContentItem.assignmentTitle || ""}
                    onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, assignmentTitle: e.target.value }))}
                    placeholder="e.g. Implement Responsive Grid Layout"
                    className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Assignment Description / Instructions</label>
                  <textarea
                    value={currentContentItem.assignmentDesc || ""}
                    onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, assignmentDesc: e.target.value }))}
                    placeholder="Provide details of what students need to submit..."
                    rows="3"
                    className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">Assignment Brief PDF / Attachment (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="assignment-brief-file"
                      accept=".pdf,.zip,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const statusEl = document.getElementById("assignment-upload-status");
                        if (statusEl) statusEl.innerText = "⏳ Uploading attachment...";
                        try {
                          const fData = new FormData();
                          fData.append("file", file);
                          const token = localStorage.getItem("userToken") || localStorage.getItem("adminToken");
                          const res = await fetch("/api/cloudinary", {
                            method: "POST",
                            headers: token ? { "Authorization": `Bearer ${token}` } : {},
                            body: fData,
                          });
                          const result = await res.json();
                          if (res.ok && result.success) {
                            setCurrentContentItem((prev) => ({ ...prev, assignmentFileUrl: result.data.secure_url }));
                            if (statusEl) statusEl.innerText = "✓ Uploaded";
                          } else {
                            alert(result.error || "Failed to upload assignment attachment");
                            if (statusEl) statusEl.innerText = "";
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Error uploading attachment");
                          if (statusEl) statusEl.innerText = "";
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="assignment-brief-file"
                      className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition bg-bg-main/30 hover:bg-bg-main ${
                        currentContentItem.assignmentFileUrl 
                          ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" 
                          : "border-border-main/80 hover:border-brand-primary text-text-muted"
                      }`}
                    >
                      <div className="text-center space-y-1 flex flex-col items-center">
                        <span className="text-2xl">📁</span>
                        <span className="text-xs font-bold text-text-main">
                          {currentContentItem.assignmentFileUrl ? "Change Brief File" : "Choose Assignment Brief File"}
                        </span>
                        <span className="text-[10px] text-text-muted font-medium">Supports PDF, ZIP, DOCX, PNG (Max 100MB)</span>
                        <span id="assignment-upload-status" className="text-[10px] font-bold text-brand-primary block mt-1"></span>
                      </div>
                    </label>
                    {currentContentItem.assignmentFileUrl && (
                      <div className="mt-2 flex items-center justify-between bg-bg-main p-2 rounded-lg border border-border-main text-[10px] text-text-muted">
                        <span className="truncate max-w-[200px] font-mono">{currentContentItem.assignmentFileUrl.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => setCurrentContentItem(prev => ({ ...prev, assignmentFileUrl: "" }))}
                          className="text-red-500 font-bold hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

        {activeTab === "submissions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Student List */}
              <div className="md:col-span-1 bg-bg-card border-2 border-border-main rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-text-main">Enrolled Students</h3>
                  <p className="text-text-muted text-[11px]">Select a student to view and grade assignment projects.</p>
                </div>

                {studentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-text-muted">Loading students...</span>
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="text-center py-10 text-xs text-text-muted italic bg-bg-main rounded-xl border border-border-main">
                    No students enrolled in this internship yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {enrolledStudents.map((student) => {
                      const studentEnrollment = student.ActiveInternship?.find(
                        item => (item.internship?._id || item.internship) === internshipId
                      );
                      const pendingCount = studentEnrollment?.assignments?.filter(
                        a => a.status !== "Graded"
                      ).length || 0;

                      return (
                        <button
                          key={student._id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(student._id);
                            setGradingModuleId("");
                            setGradingMarks("");
                            setGradingFeedback("");
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 cursor-pointer ${
                            selectedStudentId === student._id
                              ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm"
                              : "bg-bg-main hover:bg-bg-main/70 border-border-main text-text-main"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-xs truncate max-w-[120px]">{student.name}</span>
                            {pendingCount > 0 && (
                              <span className="bg-blue-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {pendingCount} Pending
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted truncate max-w-[150px]">{student.email}</span>
                          <span className="text-[9px] text-text-muted font-medium bg-bg-card px-2 py-0.5 rounded border border-border-main/50 self-start">
                            {student.college || "No College"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Grade Solutions */}
              <div className="md:col-span-2 space-y-4">
                {(() => {
                  if (!selectedStudentId) {
                    return (
                      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
                        <span className="text-4xl">🎓</span>
                        <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">Select a Student</h4>
                        <p className="text-xs text-text-muted max-w-sm">
                          Choose an enrolled student from the list on the left to review their submissions and input grades.
                        </p>
                      </div>
                    );
                  }

                  const selectedStudent = enrolledStudents.find(s => s._id === selectedStudentId);
                  const studentEnrollment = selectedStudent?.ActiveInternship?.find(
                    item => (item.internship?._id || item.internship) === internshipId
                  );

                  return (
                    <div className="space-y-4">
                      {/* Student Details Card */}
                      <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Evaluating Student</span>
                          <h3 className="text-base font-extrabold text-text-main font-poppins">{selectedStudent?.name}</h3>
                          <p className="text-xs text-text-muted">{selectedStudent?.email}</p>
                        </div>
                        <div className="bg-bg-main p-3 rounded-xl border border-border-main text-right">
                          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Attendance Rate</span>
                          <span className="text-xs font-black text-brand-primary">
                            {studentEnrollment?.attendanceRate || "0"}%
                          </span>
                        </div>
                      </div>

                      {/* Coursework Modules list */}
                      <div className="space-y-4">
                        {formData.contentItems.map((mod, idx) => {
                          const submission = studentEnrollment?.assignments?.find(
                            (a) => a.moduleId === mod._id?.toString()
                          );
                          const isCurrentlyGrading = gradingModuleId === mod._id?.toString();

                          return (
                            <div
                              key={mod._id || idx}
                              className="bg-bg-card border border-border-main/80 rounded-2xl p-6 shadow-sm space-y-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-main/50">
                                <div>
                                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Module {idx + 1}</span>
                                  <h4 className="text-sm font-bold text-text-main">{mod.title}</h4>
                                </div>
                                <div>
                                  {mod.assignmentTitle ? (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      submission
                                        ? submission.status === "Graded"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse"
                                        : "bg-bg-main text-text-muted border border-border-main"
                                    }`}>
                                      {submission
                                        ? submission.status === "Graded"
                                          ? `🏆 Graded: ${submission.marks}/10`
                                          : "⏳ Submitted - Review Pending"
                                        : "📝 No Submission"}
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-text-muted bg-bg-main border border-border-main">
                                      No Assignment
                                    </span>
                                  )}
                                </div>
                              </div>

                              {mod.assignmentTitle && (
                                <div className="text-xs text-text-muted space-y-2 bg-bg-main/50 p-4 rounded-xl border border-border-main/60">
                                  <span className="font-bold text-text-main">Assignment Task: {mod.assignmentTitle}</span>
                                  <p className="leading-relaxed">{mod.assignmentDesc || "No details provided."}</p>
                                  {mod.assignmentFileUrl && (
                                    <div className="pt-1">
                                      <a
                                        href={mod.assignmentFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-brand-secondary hover:underline font-bold"
                                      >
                                        📄 Download Assignment Brief Attachment
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {submission ? (
                                <div className="space-y-4 pt-2">
                                  <div className="space-y-2">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Student Submission Info</span>
                                    {submission.submittedText && (
                                      <div className="p-4 bg-bg-main/30 rounded-xl border border-border-main text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                                        {submission.submittedText}
                                      </div>
                                    )}
                                    {submission.fileUrl && (
                                      <div className="pt-1">
                                        <a
                                          href={submission.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-xl border border-brand-primary/20 hover:bg-brand-primary/20 transition"
                                        >
                                          📥 Download Submission File Attachment
                                        </a>
                                      </div>
                                    )}
                                    <p className="text-[10px] text-text-muted">
                                      📅 Submitted at: {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                  </div>

                                  {submission.status === "Graded" && !isCurrentlyGrading && (
                                    <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                                      <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                        <span className="flex items-center gap-1.5">🏆 Grade Score:</span>
                                        <span>{submission.marks} / 10</span>
                                      </div>
                                      {submission.feedback && (
                                        <p className="text-xs text-text-muted italic leading-relaxed pt-1.5 border-t border-emerald-500/10">
                                          Instructor Feedback: "{submission.feedback}"
                                        </p>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setGradingModuleId(mod._id?.toString() || "");
                                          setGradingMarks(submission.marks.toString());
                                          setGradingFeedback(submission.feedback || "");
                                        }}
                                        className="text-xs text-brand-primary font-bold hover:underline block pt-2 cursor-pointer"
                                      >
                                        ✏️ Edit Score / Feedback Comments
                                      </button>
                                    </div>
                                  )}

                                  {(!submission.status || submission.status !== "Graded" || isCurrentlyGrading) && (
                                    <div className="p-5 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 rounded-2xl space-y-4">
                                      <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">
                                        {isCurrentlyGrading ? "✏️ Update Assignment Evaluation" : "📝 Evaluate Student Solution"}
                                      </span>

                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">
                                            Evaluation Score (0 - 10)
                                          </label>
                                          <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={gradingMarks}
                                            onChange={(e) => setGradingMarks(e.target.value)}
                                            placeholder="e.g. 9"
                                            className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl outline-none focus:border-brand-primary text-xs font-bold text-text-main"
                                          />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="block text-[10px] font-bold text-text-muted uppercase mb-1.5">
                                            Feedback Comments for student
                                          </label>
                                          <input
                                            type="text"
                                            value={gradingFeedback}
                                            onChange={(e) => setGradingFeedback(e.target.value)}
                                            placeholder="Good grid structure, correct implementation of flexbox rules..."
                                            className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl outline-none focus:border-brand-primary text-xs text-text-main"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveGradeInstructor(selectedStudentId, mod._id?.toString())}
                                          disabled={gradingSubmitting || gradingMarks === ""}
                                          className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer"
                                        >
                                          {gradingSubmitting ? "Saving Score..." : "Submit Grade Evaluation"}
                                        </button>
                                        {isCurrentlyGrading && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setGradingModuleId("");
                                              setGradingMarks("");
                                              setGradingFeedback("");
                                            }}
                                            className="px-5 py-2.5 bg-bg-main border border-border-main text-text-muted hover:text-text-main text-xs font-bold rounded-xl transition cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : mod.assignmentTitle ? (
                                <p className="text-xs text-text-muted italic bg-bg-main/50 p-4 rounded-xl border border-border-main/55 text-center">
                                  No assignment submission received from student for this module yet.
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
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
