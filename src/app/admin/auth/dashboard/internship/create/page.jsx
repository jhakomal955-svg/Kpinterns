"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MediaPicker from "@/components/MediaPicker";

export default function InternshipCreatePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [adminData, setAdminData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    thumbnail: "",
    position: "",
    department: [],
    internshipType: "Full-Time",
    mode: "Hybrid",
    duration: "2 Weeks",
    status: "Draft",
    company: "Kpinterns",
    domain: "Full Stack Development",
    degree: [],
    createdBy: "",
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
  });

  const [currentUpdate, setCurrentUpdate] = useState({
    title: "",
    externalLink: "",
  });

  const [editingContentIndex, setEditingContentIndex] = useState(null);
  const [editingUpdateIndex, setEditingUpdateIndex] = useState(null);

  const degrees = ["BTech", "Diploma", "BSc", "BA", "BCom"];
  const internshipTypes = [
    "Full-Time",
    "Part-Time",
    "Summer",
    "Winter",
    "Project-Based",
  ];
  const internshipModes = ["Online", "Offline", "Hybrid"];
  const statuses = ["Draft", "Published", "Active", "Closed", "Archived"];
  const durations = [
    "2 Weeks",
    "4 Weeks",
    "6 Weeks",
    "8 Weeks",
  ];

  // Grouped departments according to Internship model enums
  const departmentGroups = {
    "Engineering (B.Tech / Diploma)": [
      "Computer Science & Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Electronics & Communication",
      "Chemical Engineering",
      "Aeronautical Engineering",
      "Aerospace Engineering",
      "Agricultural Engineering",
      "Architecture Engineering",
      "Artificial Intelligence (AI)",
      "Artificial Intelligence & Machine Learning (AI & ML)",
      "Artificial Intelligence & Data Science",
      "Automobile Engineering",
      "Biomedical Engineering",
      "Bioinformatics Engineering",
      "Biotechnology Engineering",
      "Biochemical Engineering",
      "Ceramic Engineering",
      "Cyber Security",
      "Data Science",
      "Dairy Technology",
      "Electrical & Electronics Engineering (EEE)",
      "Environmental Engineering",
      "Fire Engineering",
      "Food Engineering",
      "Food Processing & Preservation (FPP)",
      "Food Processing Technology",
      "Food Technology",
      "Genetic Engineering",
      "Industrial Engineering",
      "Industrial & Production Engineering",
      "Information Technology (IT)",
      "Instrumentation Engineering",
      "Internet of Things (IoT)",
      "Leather Technology",
      "Marine Engineering",
      "Materials Engineering",
      "Mechatronics Engineering",
      "Metallurgical Engineering",
      "Mining Engineering",
      "Nanotechnology Engineering",
      "Naval Architecture",
      "Petroleum Engineering",
      "Plastic Engineering",
      "Polymer Engineering",
      "Printing Technology",
      "Production Engineering",
      "Robotics Engineering",
      "Robotics & Automation",
      "Safety Engineering",
      "Software Engineering",
      "Structural Engineering",
      "Textile Engineering",
      "Transportation Engineering",
      "VLSI Design",
      "Renewable Energy Engineering",
      "Power Engineering",
      "Telecommunication Engineering"
    ],
    "Pure & Applied Sciences (BSc)": [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Statistics",
      "Botany",
      "Zoology",
      "Microbiology",
      "Biotechnology",
      "Biochemistry",
      "Computer Science",
      "Data Science",
      "Agriculture",
      "Nursing",
      "Forensic Science",
    ],
    "Arts & Humanities (BA)": [
      "Arts",
      "Home Science",
      "Ancient indian history",
      "Anthropology",
      "Bojpuri",
      "Economics",
      "English",
      "Geography",
      "History",
      "Political Science",
      "Psychology",
      "Sociology",
      "Urdu",
      "Maithili",
      "Hindi",
      "Sanskrit",
      "Music",
      "Rural Economics",
    ],
    "Commerce & Business (BCom / BBA)": [
      "Commerce",
      "Accounting & Finance",
      "Business Administration",
      "Banking & Insurance",
      "Taxation",
      "Economics",
      "Sales & Marketing",
      "Computer Applications",
    ],
    "Education": ["General Teacher Training"],
    "Law": ["Civil Law", "Criminal Law", "Corporate Law"],
  };

  // Grouped domains according to Internship model enums
  const domainGroups = {
    "Computer Science & Engineering": [
      "Web Development",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Science",
      "Cyber Security",
      "Cloud Computing",
      "Android Development",
      "Full Stack Development",
      "Frontend Development",
      "Backend Development",
      "Mobile App Development",
      "Data Science & Machine Learning",
      "DevOps & Cloud Computing",
      "Cybersecurity",
      "Blockchain Development",
      "Web3 & Cryptocurrency",
      "Game Development",
      "IoT & Embedded Systems",
      "Software Testing & QA",
      "Database Administration",
      "UI/UX Design",
      "Other Tech",
    ],
    "Mechanical Engineering": [
      "AutoCAD",
      "Car Designing",
      "IC Engine",
      "Hybrid Electric Vehicle",
      "SolidWorks",
      "Product Design & Development",
      "CAD/CAM Design",
      "Manufacturing & Production",
      "Automobile Engineering",
      "Thermal & HVAC Engineering",
      "Robotics & Automation",
      "Quality Control & Inspection",
      "Industrial Engineering",
      "Maintenance Engineering",
      "Energy & Power Systems",
      "3D Printing & Additive Manufacturing",
      "Project Management (Mechanical)",
      "Other Mechanical",
    ],
    "Civil Engineering": [
      "AutoCAD",
      "Construction Planning",
      "Revit Architecture",
      "SolidWorks",
      "3ds Max",
      "Industrial Training",
      "Structural Engineering",
      "Construction Management",
      "Urban Planning & Design",
      "Geotechnical Engineering",
      "Transportation Engineering",
      "Water Resources & Irrigation",
      "Environmental Engineering",
      "Surveying & GIS",
      "Building Information Modelling (BIM)",
      "Project Management (Civil)",
      "Other Civil",
    ],
    "Electrical Engineering": [
      "Internet of Things (IoT)",
      "Robotics",
      "VLSI Design",
      "Embedded Systems",
      "Power Systems & Grid Engineering",
      "Renewable Energy & Solar",
      "Control Systems & Automation",
      "Electrical Machine Design",
      "High Voltage & Power Electronics",
      "PLC & SCADA Programming",
      "Instrumentation & Measurement",
      "EV & Battery Technology",
      "Electrical Project Management",
      "Other Electrical",
    ],
    "Electronics & Communication": [
      "Internet of Things (IoT)",
      "Robotics",
      "VLSI Design",
      "Embedded Systems",
      "Embedded Systems & IoT",
      "PCB Design & Prototyping",
      "Signal Processing",
      "Telecommunications & Networking",
      "RF & Microwave Engineering",
      "Consumer Electronics Testing",
      "Firmware Development",
      "Other Electronics",
    ],
    "Chemical Engineering": [
      "Process Engineering",
      "Petroleum & Refinery",
      "Pharmaceutical Manufacturing",
      "Polymer & Materials Science",
      "Food Technology",
      "Environmental & Safety Engineering",
      "Quality Assurance (Chemical)",
      "Research & Development (Chemical)",
      "Other Chemical",
    ],
    "Data Science": [
      "Data Analysis & Visualization",
      "Machine Learning Engineering",
      "Business Intelligence",
      "Data Engineering & Pipelines",
      "AI Research",
      "Statistical Modelling",
      "Other Data Science",
    ],
    "Biotechnology": [
      "Molecular Biology Research",
      "Pharmaceutical Biotechnology",
      "Agricultural Biotechnology",
      "Bioinformatics",
      "Environmental Biotechnology",
      "Other Biotechnology",
    ],
    "Life Sciences": [
      "Clinical Microbiology",
      "Food & Beverage Microbiology",
      "Research & Development (Micro)",
      "Quality Control (Lab)",
      "Clinical Research",
      "Pharmaceutical R&D",
      "Nutrition & Dietetics",
      "Wildlife Conservation",
      "Veterinary Support",
      "Plant Research",
      "Horticulture",
      "Pharmaceutical Botany",
      "Other Life Sciences",
    ],
    "Pure Sciences": [
      "Research & Development",
      "Instrumentation",
      "Renewable Energy",
      "Analytical Chemistry",
      "Actuarial Science",
      "Quantitative Finance",
      "Market Research",
      "Other Sciences",
    ],
    "Agriculture": [
      "Agribusiness Management",
      "Agricultural Research",
      "Rural Development",
      "Other Agriculture",
    ],
    "Healthcare": [
      "Clinical Nursing",
      "Community Health",
      "Hospital Administration",
      "Other Healthcare",
    ],
    "Forensic": [
      "Crime Investigation Support",
      "Lab Analysis",
      "Legal Services",
      "Other Forensic",
    ],
    "Commerce / Finance / Business": [
      "Marketing",
      "Digital Marketing",
      "Business Analytics",
      "Finance",
      "Human Resource Management",
      "Stock Market",
      "Financial Analysis",
      "Accounting & Audit",
      "Taxation",
      "Investment Banking",
      "Financial Modelling",
      "Other Finance",
      "General Management",
      "Operations Management",
      "Project Management",
      "Entrepreneurship",
      "Other Business",
      "Banking Operations",
      "Insurance Sales & Advisory",
      "Risk Management",
      "Loan Processing",
      "GST & Indirect Taxation",
      "Direct Taxation",
      "Tax Audit & Compliance",
      "Economic Research & Policy",
      "Other Economics",
      "Content Marketing",
      "Sales & Business Development",
      "Brand Management",
      "Social Media Marketing",
      "Other Marketing",
    ],
    "Arts / Humanities / Media": [
      "Content Writing",
      "Journalism & Media",
      "Public Relations",
      "Event Management",
      "Social Work & NGO",
      "Other Humanities",
      "Public Policy Research",
      "Community Development",
      "Other Social Sciences",
      "Translation & Interpretation",
      "Teaching & Tutoring",
      "Other Languages",
      "Graphic Design",
      "Photography & Videography",
      "Animation & VFX",
      "Film Production",
      "Other Media",
      "Tourism & Hospitality",
      "Retail Management",
      "Other Vocational",
    ],
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAdminData(parsed);
          if (parsed && parsed._id) {
            setFormData((prev) => ({ ...prev, createdBy: parsed._id }));
          }
          if (parsed.role === "Instructor") {
            setActiveTab("content");
          }
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
        const res = await fetch("/api/admin", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
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

  const handleBasicInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => {
      const list = Array.isArray(prev[name]) ? prev[name] : [];
      const newList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return {
        ...prev,
        [name]: newList,
      };
    });
  };

  const handleThumbnailPickerSelect = async (file) => {
    setUploadingThumbnail(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/cloudinary", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: payload,
      });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: data.data.secure_url,
        }));
        setMessage("Banner image processed via MediaPicker successfully!");
      } else {
        setError("Failed to upload thumbnail banner image.");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleReportPickerSelect = async (file) => {
    setUploadingReport(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/cloudinary", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: payload,
      });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          intersnhipReport: data.data.secure_url,
        }));
        setMessage("Internship report PDF uploaded successfully!");
      } else {
        setError("Failed to upload internship report PDF.");
      }
    } catch (err) {
      setError("Upload error: " + err.message);
    } finally {
      setUploadingReport(false);
    }
  };

  const handleMediaUpload = async (file) => {
    setUploadingFile(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);

      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/cloudinary", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: payload,
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

    if (formData.title.length < 5) {
      setError("Title must be at least 5 characters long");
      return;
    }
    if (formData.description.length < 20) {
      setError("Description must be at least 20 characters long");
      return;
    }
    if (!formData.position) {
      setError("Position is required");
      return;
    }
    if (!formData.degree || formData.degree.length === 0) {
      setError("At least one target degree is required");
      return;
    }
    if (!formData.department || formData.department.length === 0) {
      setError("At least one department is required");
      return;
    }
    if (!formData.internshipType) {
      setError("Internship Type is required");
      return;
    }
    if (!formData.company) {
      setError("Company is required");
      return;
    }
    if (!formData.domain) {
      setError("Domain is required");
      return;
    }
    if (!formData.instructors || formData.instructors.length === 0) {
      setError("At least one instructor is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        thumbnail: formData.thumbnail,
        position: formData.position,
        department: formData.department,
        internshipType: formData.internshipType,
        mode: formData.mode,
        duration: formData.duration,
        status: formData.status,
        company: formData.company,
        createdBy: formData.createdBy,
        domain: formData.domain,
        degree: formData.degree,
        certificateOffered: formData.certificateOffered,
        tags: formData.tags ? formData.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map((item) => item.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(",").map((item) => item.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(",").map((item) => item.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split(",").map((item) => item.trim()).filter(Boolean) : [],
        perks: formData.perks ? formData.perks.split(",").map((item) => item.trim()).filter(Boolean) : [],
        instructor: formData.instructors.map(id => ({ id })),
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

      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/internship", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Internship created successfully!");
        setTimeout(() => {
          router.push("/admin/auth/dashboard/internship");
        }, 1500);
      } else {
        setError(data.error || "Failed to create internship");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
            Create Internship
          </h1>
          <p className="text-text-muted text-sm sm:text-base">
            Create a new internship opportunity with professional details.
          </p>
        </div>
        <Link
          href="/admin/auth/dashboard/internship"
          className="inline-flex items-center justify-center rounded-xl border border-border-main bg-bg-card px-4 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary transition"
        >
          Back to Internships
        </Link>
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
          {adminData?.role !== "Instructor" && (
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className={`px-5 py-3 font-semibold transition-all ${activeTab === "basics" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
            >
              Basic Details
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "content" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Content Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("updates")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "updates" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Manage Updates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("test")}
            className={`px-5 py-3 font-semibold transition-all ${activeTab === "test" ? "border-b-2 border-brand-primary text-brand-primary -mb-4" : "border-transparent text-text-muted hover:text-text-main"}`}
          >
            Test Section
          </button>
        </div>

        {activeTab === "basics" && adminData?.role !== "Instructor" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Title / Company Intro *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleBasicInputChange}
                  placeholder="Minimum 5 characters"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Job Position *</label>
                <input
                  type="text"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Frontend Developer"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Company Name *</label>
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. KpInterns"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">Target Degrees *</label>
                <div className="flex flex-wrap gap-2.5">
                  {degrees.map((deg) => {
                    const isChecked = Array.isArray(formData.degree) && formData.degree.includes(deg);
                    return (
                      <button
                        type="button"
                        key={deg}
                        onClick={() => handleCheckboxChange("degree", deg)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                          isChecked
                            ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                            : "bg-bg-main border-border-main text-text-muted hover:border-text-muted/40"
                        }`}
                      >
                        {deg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Target Departments *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-bg-main border-2 border-border-main rounded-2xl p-5 max-h-96 overflow-y-auto">
                  {Object.entries(departmentGroups).map(([group, list]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="text-xs font-extrabold text-brand-secondary uppercase tracking-wider border-b border-border-main pb-1">
                        {group}
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {list.map((dept) => {
                          const isChecked = Array.isArray(formData.department) && formData.department.includes(dept);
                          return (
                            <label key={dept} className="flex items-start gap-2.5 text-sm font-semibold text-text-main cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange("department", dept)}
                                className="mt-1 h-4 w-4 rounded border-border-main text-brand-primary focus:ring-brand-primary cursor-pointer"
                              />
                              <span>{dept}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Domain *</label>
                <select
                  name="domain"
                  required
                  value={formData.domain}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                >
                  {Object.entries(domainGroups).map(([group, list]) => (
                    <optgroup key={group} label={group}>
                      {list.map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Work Mode *</label>
                <select
                  name="mode"
                  required
                  value={formData.mode}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {internshipModes.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Type *</label>
                <select
                  name="internshipType"
                  required
                  value={formData.internshipType}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {internshipTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Internship Duration *</label>
                <select
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Status *</label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleBasicInputChange}
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleBasicInputChange}
                  placeholder="Brief 1-line overview..."
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Description *</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleBasicInputChange}
                  placeholder="Provide responsibilities, requirements, timeline, etc..."
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition font-sans"
                ></textarea>
              </div>

              {/* Internship Banner */}
              <div className="md:col-span-2 bg-bg-main/40 border border-dashed border-border-main rounded-xl p-4">
                <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Internship Cover Banner Image</label>
                <MediaPicker
                  onFileSelect={handleThumbnailPickerSelect}
                  isUploading={uploadingThumbnail}
                  uploadedItems={[formData.thumbnail].filter(Boolean)}
                  maxSize={10}
                  multiple={false}
                />
              </div>

              {/* Internship Final Report PDF Uploader */}
              <div className="md:col-span-2 bg-bg-main/40 border border-dashed border-border-main rounded-xl p-4">
                <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Internship Final Report PDF</label>
                <MediaPicker
                  onFileSelect={handleReportPickerSelect}
                  isUploading={uploadingReport}
                  uploadedItems={[formData.intersnhipReport].filter(Boolean)}
                  maxSize={50}
                  multiple={false}
                />
                {formData.intersnhipReport && (
                  <p className="text-xs text-brand-success mt-2 font-medium">
                    ✓ Report uploaded: <a href={formData.intersnhipReport} target="_blank" rel="noopener noreferrer" className="underline font-bold text-brand-primary">View PDF</a>
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Assigned Instructors *</label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.instructors && formData.instructors.map((instId) => {
                    const match = adminsList.find((admin) => admin._id === instId);
                    const displayName = match ? `${match.name} (ID: ${match._id})` : instId;
                    return (
                      <div key={instId} className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-medium px-3.5 py-1.5 rounded-xl text-sm">
                        <span>{displayName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              instructors: prev.instructors.filter((id) => id !== instId),
                            }));
                          }}
                          className="hover:text-red-500 font-bold transition-all text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {(!formData.instructors || formData.instructors.length === 0) && (
                    <p className="text-xs text-red-500 font-medium italic">No instructors assigned yet.</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <select
                    className="flex-1 p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm text-text-main"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (selectedId && !formData.instructors.includes(selectedId)) {
                        setFormData((prev) => ({
                          ...prev,
                          instructors: [...prev.instructors, selectedId],
                        }));
                      }
                      e.target.value = ""; // Reset dropdown selection
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Add Instructor...</option>
                    {adminsList
                      .filter((admin) => admin.role === "Instructor" && !formData.instructors.includes(admin._id))
                      .map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} (ID: {admin._id})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Stipend Description</label>
                <input
                  type="text"
                  name="stipendAmount"
                  value={formData.stipendAmount}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. $500/month or Unpaid"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Registration Fee</label>
                <input
                  type="text"
                  name="registrationFeeAmount"
                  value={formData.registrationFeeAmount}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Free or $25"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <label className="flex items-center gap-2 text-xs uppercase font-semibold text-text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    name="certificateOffered"
                    checked={formData.certificateOffered}
                    onChange={handleBasicInputChange}
                    className="w-4 h-4 rounded border-border-main text-brand-primary"
                  />
                  Certificate Offered
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Requirements (comma separated)</label>
                <input
                  type="text"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. HTML, CSS, Communication"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. React, SQL, Teamwork"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Responsibilities (comma separated)</label>
                <input
                  type="text"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Develop features, Test code"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Benefits (comma separated)</label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Mentorship, Experience"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Perks (comma separated)</label>
                <input
                  type="text"
                  name="perks"
                  value={formData.perks}
                  onChange={handleBasicInputChange}
                  placeholder="e.g. Flexible hours, Remote work"
                  className="w-full p-2.5 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main">Add Content Item</h3>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Content Title *</label>
                <input
                  type="text"
                  value={currentContentItem.title}
                  onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Company Project Overview"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Text Description / Notes</label>
                <textarea
                  rows="3"
                  value={currentContentItem.textContent || ""}
                  onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, textContent: e.target.value }))}
                  placeholder="Provide modules written materials, text descriptions or requirements..."
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition font-sans"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-3 uppercase">Upload Media Files (Video, PDF, Image)</label>
                <MediaPicker
                  onFileSelect={handleMediaUpload}
                  isUploading={uploadingFile}
                  uploadedItems={[currentContentItem.VideoUrl, currentContentItem.pdfurl, currentContentItem.imageurl].filter(Boolean)}
                  maxSize={100}
                  multiple={true}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">External Link (Optional)</label>
                <input
                  type="url"
                  value={currentContentItem.externalink}
                  onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, externalink: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div className="pt-4 border-t border-border-main/50 space-y-4">
                <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Assignment Details (Optional)</h4>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted mb-2 uppercase">Assignment Title</label>
                  <input
                    type="text"
                    value={currentContentItem.assignmentTitle || ""}
                    onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, assignmentTitle: e.target.value }))}
                    placeholder="e.g. Implement Responsive Grid Layout"
                    className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted mb-2 uppercase">Assignment Description / Instructions</label>
                  <textarea
                    value={currentContentItem.assignmentDesc || ""}
                    onChange={(e) => setCurrentContentItem((prev) => ({ ...prev, assignmentDesc: e.target.value }))}
                    placeholder="Provide details of what students need to submit..."
                    rows="3"
                    className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-text-muted mb-2 uppercase">Assignment Brief PDF / Attachment (Optional)</label>
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
                  disabled={uploadingFile || uploadingThumbnail}
                  onClick={addContentItem}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile || uploadingThumbnail 
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
                <h3 className="text-lg font-bold text-text-main">Content Items ({formData.contentItems.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.contentItems.map((item, idx) => (
                    <div key={idx} className="bg-bg-main border-2 border-border-main rounded-xl p-4 flex items-start justify-between hover:border-brand-primary transition">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-main mb-2">{item.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.textContent && <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-1 rounded-full font-medium">📝 Text Notes</span>}
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
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeContentItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm font-semibold"
                        >
                          Delete
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
          <div className="space-y-6 bg-bg-card border-2 border-border-main rounded-2xl p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main">Add New Update</h3>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">Update Title *</label>
                <input
                  type="text"
                  value={currentUpdate.title}
                  onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Schedule for interview released"
                  className="w-full p-3 bg-bg-main border-2 border-border-main rounded-xl focus:border-brand-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 uppercase">External Link (Optional)</label>
                <input
                  type="url"
                  value={currentUpdate.externalLink}
                  onChange={(e) => setCurrentUpdate((prev) => ({ ...prev, externalLink: e.target.value }))}
                  placeholder="https://example.com"
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
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeUpdateItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm font-semibold"
                        >
                          Delete
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-border-main sticky bottom-0 bg-bg-main p-6 rounded-2xl">
          <button
            type="button"
            disabled={isSubmitting || uploadingFile || uploadingThumbnail}
            onClick={() => router.push("/admin/auth/dashboard/internship")}
            className="flex-1 px-6 py-3 border-2 border-border-main text-text-main rounded-xl hover:bg-bg-card transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploadingFile || uploadingThumbnail}
            className="flex-1 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-semibold shadow transition disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadingFile || uploadingThumbnail ? "Uploading..." : isSubmitting ? "Saving..." : "Create Internship"}
          </button>
        </div>
      </form>
    </div>
  );
}
