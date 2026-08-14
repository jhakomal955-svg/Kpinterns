"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { normalizeDegree, getDepartmentsForDegree, DEGREE_LIST } from "@/lib/data/degreeDepartments";
import InvalidEmailModal, { getEmailValidationError, validateEmailFormat } from "@/components/InvalidEmailModal";
import CouponAlertModal from "@/components/CouponAlertModal";
import { universitiesData } from "@/lib/data/universities";

const DEGREE_OPTIONS = DEGREE_LIST;
const SEMESTER_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SESSION_OPTIONS = [
  "2023-2027",
  "2024-2028",
  "2022-2026",
  "2025-2029",
  "2021-2025",
  "2024-2027",
  "2025-2028",
];

// Helper to find University key from key or name
const findUniversityKey = (univInput) => {
  if (!univInput) return "";
  if (universitiesData[univInput]) return univInput;
  const entry = Object.entries(universitiesData).find(
    ([key, u]) => u.name.toLowerCase().trim() === univInput.toLowerCase().trim()
  );
  return entry ? entry[0] : "others";
};

// Helper to find College key under a University from key or name
const findCollegeKey = (univKey, collegeInput) => {
  if (!univKey || !collegeInput || univKey === "others") return "others";
  const univData = universitiesData[univKey];
  if (!univData || !univData.colleges) return "others";
  if (univData.colleges[collegeInput]) return collegeInput;
  const entry = Object.entries(univData.colleges).find(
    ([key, c]) => c.name.toLowerCase().trim() === collegeInput.toLowerCase().trim()
  );
  return entry ? entry[0] : "others";
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PartnerStudentPortalPage() {
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchSuccess, setSearchSuccess] = useState(false);

  // Student & College data
  const [partnerStudent, setPartnerStudent] = useState(null);
  const [collegeRates, setCollegeRates] = useState(null);
  const [isNewStudent, setIsNewStudent] = useState(false);

  // Internships list
  const [internships, setInternships] = useState([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(true);
  const [showAllInternships, setShowAllInternships] = useState(false);

  // Enrollment Form State containing all user registration fields
  const [selectedInternship, setSelectedInternship] = useState("");
  const [studentForm, setStudentForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male",
    parentName: "",
    universityKey: "",
    universityCustom: "",
    university: "",
    collegeKey: "",
    collegeCustom: "",
    collegeName: "",
    degree: "B.Tech",
    department: "Computer Science & Engineering",
    rollNumber: "",
    registrationNumber: "",
    semester: "6th",
    session: "2023-2027",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Step Stepper state (1: Personal, 2: Academic, 3: Internship, 4: Review & Pay)
  const [currentStep, setCurrentStep] = useState(1);

  // Helper to validate Step 1 fields
  const validateStep1 = () => {
    const newErrors = {};

    if (!studentForm.fullName?.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!studentForm.gender?.trim()) {
      newErrors.gender = "Gender is required.";
    }

    if (!studentForm.parentName?.trim()) {
      newErrors.parentName = "Parent / Guardian Name is required.";
    }

    if (!studentForm.password) {
      newErrors.password = "Password is required.";
    } else if (studentForm.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    const cleanEmail = studentForm.email ? studentForm.email.trim() : "";
    if (!cleanEmail) {
      newErrors.email = "Email Address is required.";
    } else if (!validateEmailFormat(cleanEmail)) {
      newErrors.email = getEmailValidationError(cleanEmail) || "Invalid email format.";
      setShowInvalidEmailModal(true);
    }

    if (!partnerStudent && !isEmailVerified) {
      newErrors.email = "Please verify your email address using the 6-digit OTP code before proceeding.";
    }

    const cleanedPhone = (studentForm.phone || "").replace(/\D/g, "");
    let normalizedPhone = cleanedPhone;
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      normalizedPhone = cleanedPhone.substring(2);
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      normalizedPhone = cleanedPhone.substring(1);
    }

    if (!normalizedPhone) {
      newErrors.phone = "Mobile Number is required.";
    } else if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number starting with 6-9.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 300, behavior: "smooth" });
      return false;
    }

    setErrors({});
    return true;
  };

  // Helper to validate Step 2 fields
  const validateStep2 = () => {
    const newErrors = {};

    const finalUniversity = studentForm.universityKey === "others"
      ? (studentForm.universityCustom || "").trim()
      : ((studentForm.university || "").trim() || (studentForm.universityCustom || "").trim());

    const finalCollegeName = studentForm.collegeKey === "others"
      ? (studentForm.collegeCustom || "").trim()
      : ((studentForm.collegeName || "").trim() || (studentForm.collegeCustom || "").trim());

    if (!finalUniversity) {
      newErrors.university = "University Name is required.";
    }

    if (!finalCollegeName) {
      newErrors.collegeName = "College Name is required.";
    }

    if (!studentForm.registrationNumber?.trim()) {
      newErrors.registrationNumber = "Registration Number is required.";
    }

    if (!studentForm.rollNumber?.trim()) {
      newErrors.rollNumber = "Roll Number is required.";
    }

    if (!studentForm.degree?.trim()) {
      newErrors.degree = "Degree is required.";
    }

    if (!studentForm.department?.trim()) {
      newErrors.department = "Department / Domain is required.";
    }

    if (!studentForm.semester?.trim()) {
      newErrors.semester = "Semester is required.";
    }

    if (!studentForm.session?.trim()) {
      newErrors.session = "Academic Session is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 300, behavior: "smooth" });
      return false;
    }

    setErrors({});
    return true;
  };

  // Helper to validate Step 3 fields
  const validateStep3 = () => {
    if (!selectedInternship) {
      setErrors({ selectedInternship: "Please select an internship program to continue." });
      window.scrollTo({ top: 300, behavior: "smooth" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handleNextStep3 = () => {
    if (validateStep3()) {
      setCurrentStep(4);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponAlertModal, setCouponAlertModal] = useState({ isOpen: false, message: "" });
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Helper to get available colleges under selected University
  const getAvailableColleges = () => {
    if (!studentForm.universityKey || studentForm.universityKey === "others") return [];
    const uData = universitiesData[studentForm.universityKey];
    if (!uData || !uData.colleges) return [];
    return Object.entries(uData.colleges).map(([key, college]) => ({
      id: key,
      name: college.name,
    }));
  };

  const handleUniversityChange = (e) => {
    const selectedKey = e.target.value;
    if (selectedKey === "others") {
      setStudentForm((prev) => ({
        ...prev,
        universityKey: "others",
        universityCustom: "",
        university: "",
        collegeKey: "others",
        collegeCustom: "",
        collegeName: "",
      }));
    } else if (selectedKey) {
      const univName = universitiesData[selectedKey]?.name || "";
      setStudentForm((prev) => ({
        ...prev,
        universityKey: selectedKey,
        universityCustom: "",
        university: univName,
        collegeKey: "",
        collegeCustom: "",
        collegeName: "",
      }));
    } else {
      setStudentForm((prev) => ({
        ...prev,
        universityKey: "",
        universityCustom: "",
        university: "",
        collegeKey: "",
        collegeCustom: "",
        collegeName: "",
      }));
    }
  };

  const handleCollegeChange = (e) => {
    const selectedKey = e.target.value;
    if (selectedKey === "others") {
      setStudentForm((prev) => ({
        ...prev,
        collegeKey: "others",
        collegeCustom: "",
        collegeName: "",
      }));
    } else if (selectedKey) {
      const cName = universitiesData[studentForm.universityKey]?.colleges?.[selectedKey]?.name || "";
      setStudentForm((prev) => ({
        ...prev,
        collegeKey: selectedKey,
        collegeCustom: "",
        collegeName: cName,
      }));
    } else {
      setStudentForm((prev) => ({
        ...prev,
        collegeKey: "",
        collegeCustom: "",
        collegeName: "",
      }));
    }
  };

  // Email OTP Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [showInvalidEmailModal, setShowInvalidEmailModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(null);

  // Lead Generation state & refs
  const [sessionLeadId, setSessionLeadId] = useState("");
  const isCapturingRef = useRef(false);
  const lastPayloadHashRef = useRef("");

  // Restore session lead ID on mount if returning
  useEffect(() => {
    try {
      const storedLeadId =
        sessionStorage.getItem("kp_registration_lead_id") ||
        localStorage.getItem("kp_registration_lead_id");
      if (storedLeadId) setSessionLeadId(storedLeadId);
    } catch (err) {
      console.error("Failed to load lead id:", err);
    }
  }, []);

  // Lead capture helper (works for new fresh registrations & partner forms)
  const captureLeadData = useCallback(
    async (customPayload = {}) => {
      if (typeof window !== "undefined") {
        if (
          sessionStorage.getItem("kp_registration_completed") === "true" ||
          localStorage.getItem("userToken")
        ) {
          return;
        }
      }

      if (isCapturingRef.current && !customPayload.beacon && !customPayload.force) {
        return;
      }

      try {
        const cleanPhone = (studentForm.phone || "").replace(/\D/g, "").slice(-10);
        const hasValidName = (studentForm.fullName?.trim() || "").length >= 3;
        const hasValidContact =
          (studentForm.email?.trim() && studentForm.email.includes("@")) ||
          (cleanPhone && cleanPhone.length === 10);
        const hasInput = (hasValidName && hasValidContact) || sessionLeadId || customPayload.force;

        if (!hasInput) return;

        const activeLeadId =
          sessionLeadId ||
          customPayload.leadId ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("kp_registration_lead_id") ||
              localStorage.getItem("kp_registration_lead_id")
            : "") ||
          "";

        const payload = {
          leadId: activeLeadId,
          fullName: studentForm.fullName,
          email: studentForm.email,
          phone: cleanPhone || studentForm.phone,
          gender: studentForm.gender,
          parentName: studentForm.parentName,
          university: studentForm.university,
          college: studentForm.collegeName,
          degree: studentForm.degree,
          department: studentForm.department,
          rollNumber: studentForm.rollNumber,
          semester: studentForm.semester,
          session: studentForm.session,
          registrationNumber: studentForm.registrationNumber,
          purchaseType: "internship",
          internshipId: selectedInternship,
          step: isNewStudent ? 2 : 1,
          source: isNewStudent ? "Partner Student Instant Form" : "Partner Student Pre-filled Verification",
          ...customPayload,
        };

        const bodyStr = JSON.stringify(payload);

        if (bodyStr === lastPayloadHashRef.current && !customPayload.force && !customPayload.beacon) {
          return;
        }

        isCapturingRef.current = true;

        if (typeof window !== "undefined" && navigator.sendBeacon && customPayload.beacon) {
          const blob = new Blob([bodyStr], { type: "text/plain;charset=UTF-8" });
          navigator.sendBeacon("/api/leads/capture", blob);
          lastPayloadHashRef.current = bodyStr;
          return;
        }

        const res = await fetch("/api/leads/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: bodyStr,
          keepalive: true,
        }).catch((err) => console.error("Lead capture error:", err));

        if (res && res.ok) {
          lastPayloadHashRef.current = bodyStr;
          const data = await res.json();
          if (data.leadId && data.leadId !== sessionLeadId) {
            setSessionLeadId(data.leadId);
            try {
              sessionStorage.setItem("kp_registration_lead_id", data.leadId);
              localStorage.setItem("kp_registration_lead_id", data.leadId);
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Error in lead capture:", err);
      } finally {
        isCapturingRef.current = false;
      }
    },
    [studentForm, selectedInternship, isNewStudent, sessionLeadId]
  );

  // Debounced auto-save lead capture when form inputs change
  useEffect(() => {
    const hasInput =
      studentForm.fullName?.trim() ||
      studentForm.email?.trim() ||
      studentForm.phone?.trim() ||
      sessionLeadId;

    if (!hasInput) return;

    const timer = setTimeout(() => {
      captureLeadData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [studentForm, selectedInternship, captureLeadData, sessionLeadId]);

  // Start New Student Normal Registration Flow
  const handleStartNewRegistration = () => {
    setPartnerStudent(null);
    setCollegeRates(null);
    setIsNewStudent(true);
    setSearchError("");
    setSearchSuccess(true);
    setStudentForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "Male",
      parentName: "",
      universityKey: "",
      universityCustom: "",
      university: "",
      collegeKey: "",
      collegeCustom: "",
      collegeName: "",
      degree: "B.Tech",
      department: "Computer Science & Engineering",
      rollNumber: "",
      registrationNumber: "",
      semester: "6th",
      session: "2023-2027",
    });
    setIsEmailVerified(false);
    setOtpSent(false);
    setOtpError("");
    setOtpSuccessMsg("");
  };

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Load available internships on mount
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setIsLoadingInternships(true);
        const res = await fetch("/api/internship");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setInternships(data.data);
        }
      } catch (err) {
        console.error("Failed to load internships:", err);
      } finally {
        setIsLoadingInternships(false);
      }
    };

    fetchInternships();
  }, []);

  // Handle Search Submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setSearchError("");
      setSearchSuccess(false);
      setIsNewStudent(false);

      const res = await fetch(`/api/partner-students/search?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (data.success && data.found) {
        setPartnerStudent(data.student);
        setCollegeRates(data.collegeRates);

        const rawUniv = data.student.university || "";
        const rawCollege = data.student.collegeName || "";
        const uKey = findUniversityKey(rawUniv);
        const cKey = findCollegeKey(uKey, rawCollege);

        let studentEmail = data.student.email || "";
        if (studentEmail.toLowerCase().includes("student@example.com") || studentEmail.toLowerCase().includes("example.com")) {
          studentEmail = "";
        }

        setStudentForm({
          fullName: data.student.fullName || "",
          email: studentEmail,
          phone: data.student.phone || "",
          password: "",
          gender: data.student.gender || "Male",
          parentName: data.student.parentName || "",
          universityKey: uKey,
          universityCustom: uKey === "others" ? rawUniv : "",
          university: uKey === "others" ? rawUniv : (universitiesData[uKey]?.name || rawUniv),
          collegeKey: cKey,
          collegeCustom: cKey === "others" ? rawCollege : "",
          collegeName: cKey === "others" ? rawCollege : (universitiesData[uKey]?.colleges?.[cKey]?.name || rawCollege),
          degree: data.student.degree || "B.Tech",
          department: data.student.department || "Computer Science & Engineering",
          rollNumber: data.student.rollNumber || "",
          registrationNumber: data.student.registrationNumber || "",
          semester: data.student.semester || "6th",
          session: data.student.session || "2023-2027",
        });
        // College Partner Students pre-filled in backend do not need Email OTP verification!
        setIsEmailVerified(true);
        setOtpSent(false);
        setOtpError("");
        setOtpSuccessMsg("");
        setSearchSuccess(true);
      } else {
        setPartnerStudent(null);
        setSearchError(data.message || "No registered student record found for this Registration / Roll Number / Email / Phone.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("Failed to verify student details. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Send Email OTP Code
  const handleSendOtp = async () => {
    setOtpError("");
    const cleanEmail = studentForm.email ? studentForm.email.trim() : "";
    if (!cleanEmail || !validateEmailFormat(cleanEmail)) {
      setShowInvalidEmailModal(true);
      setOtpError(getEmailValidationError(cleanEmail) || "Please enter a valid email address (e.g. user@gmail.com).");
      return;
    }

    try {
      setIsSendingOtp(true);
      setOtpError("");
      setOtpSuccessMsg("");

      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentForm.email.trim(), purpose: "partner-student" }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setOtpCooldown(60);
        setOtpSuccessMsg(data.message || "OTP code sent to your email address!");
        if (data.otp) {
          console.log(`[DEV ONLY] OTP Code: ${data.otp}`);
        }
      } else {
        setOtpError(data.error || "Failed to send OTP code.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error sending OTP code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setOtpError("");

      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentForm.email.trim(), otp: otpCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setOtpSuccessMsg("Email address verified successfully! ✓");
      } else {
        setOtpError(data.error || "Invalid OTP code. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Filter internships based on Student's Degree & Department
  const getFilteredInternships = () => {
    if ((!partnerStudent && !isNewStudent) || showAllInternships) {
      return internships;
    }

    const currentDegree = studentForm.degree || (partnerStudent && partnerStudent.degree) || "";
    const currentDept = studentForm.department || (partnerStudent && partnerStudent.department) || "";

    const studentDegNorm = normalizeDegree(currentDegree);
    const studentDeptNorm = currentDept.toLowerCase().trim();

    const matches = internships.filter((intern) => {
      // Check degree match
      let degreeMatch = true;
      if (Array.isArray(intern.degree) && intern.degree.length > 0) {
        degreeMatch = intern.degree.some(
          (d) => normalizeDegree(d) === studentDegNorm
        );
      } else if (typeof intern.degree === "string" && intern.degree) {
        degreeMatch = normalizeDegree(intern.degree) === studentDegNorm;
      }

      // Check department / domain match
      let deptMatch = true;
      if (studentDeptNorm) {
        const internDeptStr = Array.isArray(intern.department)
          ? intern.department.join(" ").toLowerCase()
          : (intern.department || "").toLowerCase();
        
        const titleStr = (intern.title || "").toLowerCase();
        const domainStr = (intern.domain || intern.category || "").toLowerCase();

        // Check keyword matches
        if (studentDeptNorm.includes("computer") || studentDeptNorm.includes("it") || studentDeptNorm.includes("software")) {
          deptMatch = internDeptStr.includes("computer") || internDeptStr.includes("it") || internDeptStr.includes("software") ||
                      titleStr.includes("web") || titleStr.includes("python") || titleStr.includes("data") || titleStr.includes("java") || titleStr.includes("ai") || titleStr.includes("cyber") || domainStr.includes("tech");
        } else if (studentDeptNorm.includes("mechanical") || studentDeptNorm.includes("auto")) {
          deptMatch = internDeptStr.includes("mechanical") || internDeptStr.includes("auto") || titleStr.includes("cad") || titleStr.includes("robotics") || titleStr.includes("design");
        } else if (studentDeptNorm.includes("civil")) {
          deptMatch = internDeptStr.includes("civil") || titleStr.includes("structure") || titleStr.includes("autocad");
        } else if (studentDeptNorm.includes("electric") || studentDeptNorm.includes("electronics")) {
          deptMatch = internDeptStr.includes("electric") || internDeptStr.includes("electronics") || titleStr.includes("embedded") || titleStr.includes("iot");
        } else {
          deptMatch = internDeptStr.includes(studentDeptNorm) || titleStr.includes(studentDeptNorm);
        }
      }

      return degreeMatch || deptMatch;
    });

    // If no exact filtered match found, fallback to showing all internships
    return matches.length > 0 ? matches : internships;
  };

  const displayedInternships = getFilteredInternships();

  // Pre-select internship if user applied for a specific internship from an internship detail/card page
  useEffect(() => {
    if (typeof window === "undefined" || internships.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const targetId =
      urlParams.get("internshipId") ||
      urlParams.get("id") ||
      sessionStorage.getItem("kp_selected_internship_id") ||
      localStorage.getItem("kp_selected_internship_id");

    if (targetId) {
      const match = internships.find((i) => i._id === targetId);
      if (match) {
        if (selectedInternship !== targetId) {
          setSelectedInternship(targetId);
        }
        // If chosen internship isn't in department-filtered list, automatically enable 'Show All Internships' so user sees it!
        const isDisplayed = displayedInternships.some((i) => i._id === targetId);
        if (!isDisplayed && !showAllInternships) {
          setShowAllInternships(true);
        }
        return;
      }
    }

    if (displayedInternships.length > 0 && !selectedInternship) {
      setSelectedInternship(displayedInternships[0]._id);
    }
  }, [internships, displayedInternships, selectedInternship, showAllInternships]);

  // Calculate base & final fee for selected internship
  const getSelectedInternshipBaseFee = () => {
    if (!selectedInternship) return 0;
    const internObj = internships.find((i) => i._id === selectedInternship);
    if (!internObj) return 500;

    if (collegeRates && collegeRates.internshipRate > 0) {
      return collegeRates.internshipRate;
    }
    return internObj.RegistrationFee?.amount !== undefined ? Number(internObj.RegistrationFee.amount) : 500;
  };

  const getSelectedInternshipFee = () => {
    const base = getSelectedInternshipBaseFee();
    if (appliedCoupon && !partnerStudent) {
      return appliedCoupon.finalPrice;
    }
    return base;
  };

  // Handle Apply Coupon (Only allowed for non-partner/new students)
  const handleApplyCoupon = async () => {
    if (partnerStudent) {
      setAppliedCoupon(null);
      setCouponAlertModal({
        isOpen: true,
        message: "Coupons are not applicable for pre-approved partner college students.",
      });
      return;
    }
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const basePrice = getSelectedInternshipBaseFee();
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          type: "internship",
          originalPrice: basePrice,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data);
      } else {
        setAppliedCoupon(null);
        setCouponAlertModal({
          isOpen: true,
          message: data.message || "coupon code is expired try another coupen code",
        });
      }
    } catch (err) {
      console.error(err);
      setAppliedCoupon(null);
      setCouponAlertModal({
        isOpen: true,
        message: "coupon code is expired try another coupen code",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Validate form fields & open Review Section Modal (Available for both pre-approved & new students)
  const handleOpenReviewModal = (e) => {
    if (e) e.preventDefault();

    if (!partnerStudent && !isNewStudent) {
      alert("Please search and select your student record first or start new student registration.");
      return;
    }

    const newErrors = {};

    if (!selectedInternship) {
      newErrors.selectedInternship = "Please select an internship program to continue.";
    }

    if (!studentForm.fullName?.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    const cleanEmail = studentForm.email ? studentForm.email.trim() : "";
    if (!cleanEmail) {
      newErrors.email = "Email Address is required.";
    } else if (!validateEmailFormat(cleanEmail)) {
      newErrors.email = getEmailValidationError(cleanEmail) || "Invalid email format.";
      setShowInvalidEmailModal(true);
    }

    const cleanedPhone = (studentForm.phone || "").replace(/\D/g, "");
    let normalizedPhone = cleanedPhone;
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      normalizedPhone = cleanedPhone.substring(2);
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      normalizedPhone = cleanedPhone.substring(1);
    }

    if (!normalizedPhone) {
      newErrors.phone = "Mobile Number is required.";
    } else if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number starting with 6-9.";
    }

    if (!partnerStudent && !isEmailVerified) {
      newErrors.email = "Please verify your email address using the 6-digit OTP code before proceeding.";
    }

    if (!studentForm.password) {
      newErrors.password = "Password is required.";
    } else if (studentForm.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (!studentForm.gender?.trim()) {
      newErrors.gender = "Gender is required.";
    }

    if (!studentForm.parentName?.trim()) {
      newErrors.parentName = "Parent / Guardian Name is required.";
    }

    const finalUniversity = studentForm.universityKey === "others"
      ? (studentForm.universityCustom || "").trim()
      : ((studentForm.university || "").trim() || (studentForm.universityCustom || "").trim());

    const finalCollegeName = studentForm.collegeKey === "others"
      ? (studentForm.collegeCustom || "").trim()
      : ((studentForm.collegeName || "").trim() || (studentForm.collegeCustom || "").trim());

    if (!finalUniversity) {
      newErrors.university = "University Name is required.";
    }

    if (!finalCollegeName) {
      newErrors.collegeName = "College Name is required.";
    }

    if (!studentForm.degree?.trim()) {
      newErrors.degree = "Degree is required.";
    }

    if (!studentForm.department?.trim()) {
      newErrors.department = "Department / Domain is required.";
    }

    if (!studentForm.rollNumber?.trim()) {
      newErrors.rollNumber = "Roll Number is required.";
    }

    if (!studentForm.registrationNumber?.trim()) {
      newErrors.registrationNumber = "Registration Number is required.";
    }

    if (!studentForm.semester?.trim()) {
      newErrors.semester = "Semester is required.";
    }

    if (!studentForm.session?.trim()) {
      newErrors.session = "Academic Session is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top of section so user sees red border fields immediately
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    setErrors({});
    setShowReviewModal(true);
  };

  // Submit Fast-Track Registration & Initiate Payment
  const handleProceedToPayment = async () => {
    setShowReviewModal(false);

    const cleanedPhone = (studentForm.phone || "").replace(/\D/g, "");
    let normalizedPhone = cleanedPhone;
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      normalizedPhone = cleanedPhone.substring(2);
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      normalizedPhone = cleanedPhone.substring(1);
    }

    const finalUniversity = studentForm.universityKey === "others"
      ? (studentForm.universityCustom || "").trim()
      : ((studentForm.university || "").trim() || (studentForm.universityCustom || "").trim());

    const finalCollegeName = studentForm.collegeKey === "others"
      ? (studentForm.collegeCustom || "").trim()
      : ((studentForm.collegeName || "").trim() || (studentForm.collegeCustom || "").trim());

    try {
      setIsSubmitting(true);

      const payload = {
        partnerStudentId: partnerStudent ? partnerStudent._id : null,
        fullName: studentForm.fullName.trim(),
        email: studentForm.email.trim(),
        phone: normalizedPhone,
        password: studentForm.password.trim(),
        gender: studentForm.gender.trim(),
        parentName: studentForm.parentName.trim(),
        university: finalUniversity,
        college: finalCollegeName,
        degree: studentForm.degree.trim(),
        department: studentForm.department.trim(),
        rollNumber: studentForm.rollNumber.trim(),
        semester: studentForm.semester.trim(),
        session: studentForm.session.trim(),
        registrationNumber: studentForm.registrationNumber.trim(),
        internshipId: selectedInternship,
        couponCode: (!partnerStudent && appliedCoupon) ? appliedCoupon.coupon?.code : undefined,
      };

      const res = await fetch("/api/partner-students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed to process fast-track registration.");
        setIsSubmitting(false);
        return;
      }

      if (data.orderId && data.key) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert("Razorpay payment SDK failed to load. Please refresh.");
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: data.key,
          amount: Math.round(data.amount * 100),
          currency: data.currency || "INR",
          name: "KpInterns - Partner Student Portal",
          description: `Fast-Track Enrollment for ${data.title || "Internship Program"}`,
          order_id: data.orderId,
          prefill: {
            name: studentForm.fullName,
            email: studentForm.email,
            contact: studentForm.phone,
          },
          theme: { color: "#2563EB" },
          handler: async function (response) {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(data.token ? { "Authorization": `Bearer ${data.token}` } : {}),
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  type: "internship",
                  itemId: selectedInternship,
                  userId: data.user?._id,
                  studentPayload: data.studentPayload,
                  amount: data.amount,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                // Payment verified successfully: save user token and session
                const activeToken = verifyData.token || data.token;
                if (activeToken) {
                  localStorage.setItem("userToken", activeToken);
                }
                if (verifyData.data || data.user) {
                  localStorage.setItem("userData", JSON.stringify(verifyData.data || data.user));
                }
                try {
                  sessionStorage.setItem("kp_registration_completed", "true");
                  captureLeadData({ status: "Converted", force: true });
                } catch (e) {}
                setEnrollmentSuccess({
                  studentName: studentForm.fullName,
                  internshipTitle: data.title,
                  paymentId: response.razorpay_payment_id,
                });
              } else {
                alert("Payment verification failed: " + (verifyData.error || "Please contact support."));
              }
            } catch (err) {
              console.error("Payment verification error:", err);
              alert("An error occurred while verifying payment. Please try again.");
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Free enrollment (price === 0)
        if (data.token) {
          localStorage.setItem("userToken", data.token);
        }
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify(data.user));
        }
        try {
          sessionStorage.setItem("kp_registration_completed", "true");
          captureLeadData({ status: "Converted", force: true });
        } catch (e) {}
        setEnrollmentSuccess({
          studentName: studentForm.fullName,
          internshipTitle: data.title || "Internship Program",
          paymentId: "FREE_ENROLLMENT",
        });
      }
    } catch (err) {
      console.error("Fast-track registration error:", err);
      alert("An error occurred: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Banner */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold text-xs sm:text-sm uppercase tracking-wider">
          🎓 Partner College Student Portal
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main leading-tight">
          Fast-Track Internship Verification & Enrollment
        </h1>
        <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Registered with a partner college? Enter your <span className="font-semibold text-text-main">Roll Number</span> or <span className="font-semibold text-text-main">Registration Number</span> below to load your details instantly and start your internship.
        </p>
      </div>

      {/* Step 1: Search Box Container */}
      <div className="max-w-3xl mx-auto bg-bg-card border-2 border-border-main rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-text-main flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">1</span>
          Verify Your College Registration
        </h2>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Registration No. or Roll No. (e.g. REG2026001)"
            className="flex-1 px-5 py-4 bg-bg-main border-2 border-border-main rounded-2xl text-text-main font-mono text-base focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-8 py-4 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-primary/25 transition text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>🔍 Verify Student</>
            )}
          </button>
        </form>

        {searchError && (
          <div className="p-5 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-center space-y-4 animate-fadeIn">
            <p className="text-red-500 font-bold text-sm sm:text-base">
              ⚠️ {searchError}
            </p>
            <div className="p-4 bg-bg-card/90 rounded-2xl border border-border-main space-y-3 shadow-inner">
              <p className="text-xs sm:text-sm text-text-main font-semibold">
                Is your Roll / Registration Number not pre-filled by us or is your college not listed as a partner college?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleStartNewRegistration}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  📝 Register as New Student Here
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="px-6 py-3 bg-bg-main border-2 border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 font-extrabold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  🌐 Follow Normal Registration Page →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Section for New / Non-Partner College Students */}
      {(!searchSuccess || (!partnerStudent && !isNewStudent)) && (
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-brand-primary/10 via-bg-card to-brand-secondary/10 border-2 border-brand-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              ✨
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-text-main">
                New Student or Non-Partner College?
              </h3>
              <p className="text-xs sm:text-sm text-text-muted font-medium">
                If your Roll No. or Registration No. is not pre-filled in our partner system, follow the normal registration process below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option 1: Go to Full Multi-Step Registration */}
            <div
              onClick={() => router.push("/register")}
              className="p-5 bg-bg-card border-2 border-border-main hover:border-brand-primary rounded-2xl transition cursor-pointer group hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌐</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
                    Full Wizard
                  </span>
                </div>
                <h4 className="font-bold text-base text-text-main group-hover:text-brand-primary transition">
                  Follow Normal Registration Page
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Navigate to our full step-by-step registration wizard with course catalog & domain selection.
                </p>
              </div>
              <button
                type="button"
                className="mt-4 w-full py-2.5 bg-brand-primary text-white font-bold text-xs rounded-xl shadow-md group-hover:bg-brand-primary/90 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Go to Registration Page
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Option 2: Direct Registration on Portal */}
            <div
              onClick={handleStartNewRegistration}
              className="p-5 bg-bg-card border-2 border-border-main hover:border-brand-secondary rounded-2xl transition cursor-pointer group hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📝</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-brand-secondary/10 px-2.5 py-1 rounded-full">
                    Instant Form
                  </span>
                </div>
                <h4 className="font-bold text-base text-text-main group-hover:text-brand-secondary transition">
                  Register as New Student
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Fill your personal & academic details, select your university & degree, choose an internship and enroll directly.
                </p>
              </div>
              <button
                type="button"
                className="mt-4 w-full py-2.5 bg-bg-main border-2 border-brand-secondary/40 text-brand-secondary font-bold text-xs rounded-xl group-hover:bg-brand-secondary/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Start New Registration
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Stepper Form for Partner / New Students */}
      {searchSuccess && (partnerStudent || isNewStudent) && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          {/* Header Badge & Search Again Button */}
          <div className="bg-bg-card border-2 border-brand-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 font-bold text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider ${
              isNewStudent ? "bg-brand-primary text-white" : "bg-emerald-500 text-white"
            }`}>
              {isNewStudent ? "✨ New Student Registration" : "✓ Pre-Approved Partner Student"}
            </div>

            <div className="border-b border-border-main pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-text-main flex items-center gap-3">
                  {isNewStudent
                    ? "New Student Registration 📝"
                    : `Welcome, ${studentForm.fullName || partnerStudent?.fullName || "Student"}! 👋`}
                </h3>
                <p className="text-text-muted text-sm mt-1">
                  {isNewStudent
                    ? "Complete your step-by-step registration below to enroll directly."
                    : "Please review and complete your step-by-step registration below."}{" "}
                  <span className="text-red-500 font-bold">* Every field is required</span> for final internship registration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchSuccess(false);
                  setIsNewStudent(false);
                  setPartnerStudent(null);
                  setCurrentStep(1);
                }}
                className="px-3 py-1.5 bg-bg-main border border-border-main text-text-muted hover:text-brand-primary text-xs font-semibold rounded-xl transition cursor-pointer self-start sm:self-auto"
              >
                🔍 Search Roll No. Again
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {[
                  { id: 1, label: "Personal Details", icon: "👤" },
                  { id: 2, label: "Academic Info", icon: "🎓" },
                  { id: 3, label: "Select Internship", icon: "💼" },
                  { id: 4, label: "Review & Pay", icon: "💳" },
                ].map((s, idx) => (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (s.id < currentStep) setCurrentStep(s.id);
                        }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                          currentStep === s.id
                            ? "bg-brand-primary text-white shadow-lg scale-110 ring-4 ring-brand-primary/20"
                            : currentStep > s.id
                            ? "bg-emerald-500 text-white cursor-pointer"
                            : "bg-bg-main border-2 border-border-main text-text-muted cursor-not-allowed"
                        }`}
                      >
                        {currentStep > s.id ? "✓" : s.id}
                      </button>
                      <span
                        className={`text-[11px] font-extrabold mt-1.5 whitespace-nowrap text-center hidden sm:block ${
                          currentStep === s.id
                            ? "text-brand-primary font-bold"
                            : currentStep > s.id
                            ? "text-emerald-500 font-bold"
                            : "text-text-muted font-medium"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div
                        className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                          currentStep > s.id ? "bg-emerald-500" : "bg-border-main"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: Personal Profile Details */}
            {currentStep === 1 && (
              <div className="space-y-6 pt-4 animate-fadeIn">
                <div className="space-y-4 bg-bg-main p-5 rounded-2xl border border-border-main">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2 flex items-center justify-between">
                    <span>1. Personal Profile Details (Step 1 of 4)</span>
                    <span className="text-[10px] text-text-muted font-normal">Fields marked * are mandatory</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.fullName}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, fullName: e.target.value });
                          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                        }}
                        placeholder="Student Full Name"
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm ${
                          errors.fullName ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.fullName}</p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Gender *</label>
                      <select
                        value={studentForm.gender}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, gender: e.target.value });
                          if (errors.gender) setErrors((prev) => ({ ...prev, gender: null }));
                        }}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.gender ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.gender}</p>
                      )}
                    </div>

                    {/* Parent / Guardian Name */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Parent / Guardian Name *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.parentName}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, parentName: e.target.value });
                          if (errors.parentName) setErrors((prev) => ({ ...prev, parentName: null }));
                        }}
                        placeholder="Father's / Mother's Name"
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm ${
                          errors.parentName ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      />
                      {errors.parentName && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.parentName}</p>
                      )}
                    </div>

                    {/* Account Password */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">
                        Account Password * <span className="text-[10px] text-text-muted font-normal">(Min 6 chars)</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={studentForm.password}
                          onChange={(e) => {
                            setStudentForm({ ...studentForm, password: e.target.value });
                            if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                          }}
                          placeholder="Set login password"
                          className={`w-full px-4 py-3 pr-12 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm ${
                            errors.password ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-xs font-semibold focus:outline-none"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Address & OTP Button */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-text-muted mb-1 uppercase flex items-center justify-between">
                      <span>Email Address *</span>
                      {partnerStudent ? (
                        <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                          ✓ Pre-Approved Partner Student
                        </span>
                      ) : isEmailVerified ? (
                        <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                          ✓ Verified
                        </span>
                      ) : null}
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input
                          type="email"
                          required
                          disabled={partnerStudent ? false : isEmailVerified}
                          value={studentForm.email}
                          onChange={(e) => {
                            setStudentForm((prev) => ({ ...prev, email: e.target.value }));
                            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                            if (!partnerStudent) {
                              setIsEmailVerified(false);
                              setOtpSent(false);
                              setOtpError("");
                              setOtpSuccessMsg("");
                            }
                          }}
                          placeholder="Enter your valid personal email (e.g. name@gmail.com)"
                          className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm ${
                            errors.email
                              ? "border-red-500 bg-red-500/5 focus:border-red-500"
                              : partnerStudent || isEmailVerified
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-border-main focus:border-brand-primary"
                          }`}
                        />
                      </div>

                      {!partnerStudent && (
                        <>
                          {!isEmailVerified ? (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={isSendingOtp || otpCooldown > 0}
                              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/95 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                            >
                              {isSendingOtp ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Sending OTP...
                                </>
                              ) : otpCooldown > 0 ? (
                                `Resend OTP (${otpCooldown}s)`
                              ) : (
                                <>📩 Send OTP Code</>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsEmailVerified(false)}
                              className="px-4 py-3 bg-bg-card border-2 border-border-main text-text-muted hover:text-brand-primary font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Change Email
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {errors.email && (
                      <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.email}</p>
                    )}

                    {partnerStudent && (
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                        💡 As a pre-approved college partner student, email OTP verification is not required. Please enter your valid personal email address.
                      </p>
                    )}

                    {/* OTP Input Form Block (Only for New Fresh Students) */}
                    {!partnerStudent && otpSent && !isEmailVerified && (
                      <div className="mt-3 p-4 bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl space-y-3 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold text-text-main">
                            Enter 6-Digit OTP sent to <span className="text-brand-primary">{studentForm.email}</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || otpCooldown > 0}
                            className="text-xs text-brand-primary font-bold hover:underline self-start sm:self-auto"
                          >
                            {otpCooldown > 0 ? `Resend Code in ${otpCooldown}s` : "Resend OTP Code"}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="flex-1 px-4 py-2.5 bg-bg-main border-2 border-brand-primary/40 rounded-xl text-text-main font-mono text-center font-bold tracking-widest text-base outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isVerifyingOtp ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verifying...
                              </>
                            ) : (
                              "Verify OTP"
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {otpSuccessMsg && (
                      <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                        {otpSuccessMsg}
                      </div>
                    )}

                    {otpError && (
                      <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                        {otpError}
                      </div>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Mobile Number (10 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={studentForm.phone}
                      onChange={(e) => {
                        setStudentForm({ ...studentForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) });
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                      }}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm font-mono ${
                        errors.phone ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Step 1 Next Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    Next: Academic Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Academic & College Details */}
            {currentStep === 2 && (
              <div className="space-y-6 pt-4 animate-fadeIn">
                <div className="space-y-4 bg-bg-main p-5 rounded-2xl border border-border-main">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary border-b border-border-main pb-2 flex items-center justify-between">
                    <span>2. Academic & College Details (Step 2 of 4)</span>
                    <span className="text-[10px] text-text-muted font-normal">Fields marked * are mandatory</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* University Select */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">University *</label>
                      <select
                        value={studentForm.universityKey}
                        onChange={(e) => {
                          handleUniversityChange(e);
                          if (errors.university) setErrors((prev) => ({ ...prev, university: null }));
                        }}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.university ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      >
                        <option value="">Select University</option>
                        {Object.entries(universitiesData).map(([key, univ]) => (
                          <option key={key} value={key}>
                            {univ.name}
                          </option>
                        ))}
                        <option value="others">Others</option>
                      </select>
                      {errors.university && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.university}</p>
                      )}
                      {studentForm.universityKey === "others" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            required
                            value={studentForm.universityCustom}
                            onChange={(e) => {
                              setStudentForm((prev) => ({
                                ...prev,
                                universityCustom: e.target.value,
                                university: e.target.value,
                              }));
                              if (errors.university) setErrors((prev) => ({ ...prev, university: null }));
                            }}
                            placeholder="Enter your university name"
                            className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm ${
                              errors.university ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Affiliated College Select */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">College Name *</label>
                      <select
                        value={studentForm.collegeKey}
                        onChange={(e) => {
                          handleCollegeChange(e);
                          if (errors.collegeName) setErrors((prev) => ({ ...prev, collegeName: null }));
                        }}
                        disabled={!studentForm.universityKey}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.collegeName
                            ? "border-red-500 bg-red-500/5 focus:border-red-500"
                            : "border-border-main focus:border-brand-primary"
                        } ${!studentForm.universityKey ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <option value="">
                          {studentForm.universityKey ? "Select College" : "Select University first"}
                        </option>
                        {getAvailableColleges().map((college) => (
                          <option key={college.id} value={college.id}>
                            {college.name}
                          </option>
                        ))}
                        {studentForm.universityKey && <option value="others">Others</option>}
                      </select>
                      {errors.collegeName && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.collegeName}</p>
                      )}
                      {studentForm.collegeKey === "others" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            required
                            value={studentForm.collegeCustom}
                            onChange={(e) => {
                              setStudentForm((prev) => ({
                                ...prev,
                                collegeCustom: e.target.value,
                                collegeName: e.target.value,
                              }));
                              if (errors.collegeName) setErrors((prev) => ({ ...prev, collegeName: null }));
                            }}
                            placeholder="Enter your college name"
                            className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm ${
                              errors.collegeName ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Registration Number */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Registration Number *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.registrationNumber}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, registrationNumber: e.target.value });
                          if (errors.registrationNumber) setErrors((prev) => ({ ...prev, registrationNumber: null }));
                        }}
                        placeholder="Registration No."
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-mono font-medium outline-none transition text-sm ${
                          errors.registrationNumber ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      />
                      {errors.registrationNumber && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.registrationNumber}</p>
                      )}
                    </div>

                    {/* Roll Number */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Roll Number *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.rollNumber}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, rollNumber: e.target.value });
                          if (errors.rollNumber) setErrors((prev) => ({ ...prev, rollNumber: null }));
                        }}
                        placeholder="Roll Number"
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-mono font-medium outline-none transition text-sm ${
                          errors.rollNumber ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      />
                      {errors.rollNumber && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.rollNumber}</p>
                      )}
                    </div>

                    {/* Degree Select */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Degree *</label>
                      <select
                        value={studentForm.degree}
                        onChange={(e) => {
                          const newDeg = e.target.value;
                          const availableDepts = getDepartmentsForDegree(newDeg);
                          setStudentForm({
                            ...studentForm,
                            degree: newDeg,
                            department: availableDepts[0] || "",
                          });
                          if (errors.degree) setErrors((prev) => ({ ...prev, degree: null }));
                        }}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.degree ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      >
                        {DEGREE_OPTIONS.map((deg) => (
                          <option key={deg} value={deg}>{deg}</option>
                        ))}
                      </select>
                      {errors.degree && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.degree}</p>
                      )}
                    </div>

                    {/* Department Select */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Department / Domain *</label>
                      <select
                        value={studentForm.department}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, department: e.target.value });
                          if (errors.department) setErrors((prev) => ({ ...prev, department: null }));
                        }}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.department ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      >
                        {getDepartmentsForDegree(studentForm.degree).map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.department && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.department}</p>
                      )}
                    </div>

                    {/* Semester Select */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Semester *</label>
                      <select
                        value={studentForm.semester}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, semester: e.target.value });
                          if (errors.semester) setErrors((prev) => ({ ...prev, semester: null }));
                        }}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.semester ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      >
                        {SEMESTER_OPTIONS.map((sem) => (
                          <option key={sem} value={sem}>{sem} Semester</option>
                        ))}
                      </select>
                      {errors.semester && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.semester}</p>
                      )}
                    </div>

                    {/* Session Select */}
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Academic Session *</label>
                      <select
                        value={studentForm.session}
                        onChange={(e) => {
                          setStudentForm({ ...studentForm, session: e.target.value });
                          if (errors.session) setErrors((prev) => ({ ...prev, session: null }));
                        }}
                        className={`w-full px-4 py-3 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-sm cursor-pointer ${
                          errors.session ? "border-red-500 bg-red-500/5 focus:border-red-500" : "border-border-main focus:border-brand-primary"
                        }`}
                      >
                        {SESSION_OPTIONS.map((ses) => (
                          <option key={ses} value={ses}>{ses}</option>
                        ))}
                      </select>
                      {errors.session && (
                        <p className="text-red-500 text-xs font-bold mt-1">⚠️ {errors.session}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 Back & Next Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-bg-main border border-border-main text-text-muted hover:text-text-main font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    ← Back to Personal Details
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    Next: Select Internship →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Internship Selection & Coupon */}
            {currentStep === 3 && (
              <div className="space-y-6 pt-4 animate-fadeIn">
                <div className="space-y-6 bg-bg-main p-5 rounded-2xl border border-border-main">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-main pb-4">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
                        3. Select Internship Program (Step 3 of 4)
                      </h4>
                      <p className="text-xs text-text-muted mt-1">
                        Tailored internships matching{" "}
                        <span className="font-bold text-brand-primary">
                          {studentForm.degree || partnerStudent?.degree} ({studentForm.department || partnerStudent?.department})
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAllInternships(!showAllInternships)}
                      className="px-3.5 py-1.5 bg-bg-card border border-border-main rounded-xl text-xs font-bold text-brand-primary hover:border-brand-primary transition self-start sm:self-auto"
                    >
                      {showAllInternships ? "🎯 Show Recommended Only" : `🌐 Browse All (${internships.length})`}
                    </button>
                  </div>

                  {errors.selectedInternship && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold">
                      ⚠️ {errors.selectedInternship}
                    </div>
                  )}

                  {isLoadingInternships ? (
                    <div className="py-8 text-center text-text-muted">Loading internships...</div>
                  ) : displayedInternships.length === 0 ? (
                    <div className="p-6 text-center text-text-muted bg-bg-card rounded-2xl space-y-2">
                      <p className="font-semibold">
                        No specific internships found matching {studentForm.department || partnerStudent?.department}.
                      </p>
                      <button
                        onClick={() => setShowAllInternships(true)}
                        className="px-4 py-2 bg-brand-primary text-white font-bold text-xs rounded-xl"
                      >
                        Browse All Available Internships
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedInternships.map((intern) => {
                        const isSelected = selectedInternship === intern._id;
                        const fee = collegeRates && collegeRates.internshipRate > 0
                          ? collegeRates.internshipRate
                          : intern.RegistrationFee?.amount || 500;

                        return (
                          <div
                            key={intern._id}
                            onClick={() => {
                              setSelectedInternship(intern._id);
                              if (errors.selectedInternship) setErrors((prev) => ({ ...prev, selectedInternship: null }));
                            }}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition flex justify-between items-start ${
                              isSelected
                                ? "border-brand-primary bg-brand-primary/5 shadow-md scale-[1.01]"
                                : "border-border-main bg-bg-card hover:border-brand-primary/50"
                            }`}
                          >
                            <div className="space-y-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-brand-primary bg-brand-primary" : "border-text-muted"}`}>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                </span>
                                <h3 className="font-bold text-base text-text-main truncate">
                                  {intern.title || intern.position}
                                </h3>
                              </div>
                              <p className="text-xs text-text-muted pl-6">
                                Domain: {intern.domain || intern.category || "Technology"} • Duration: {intern.duration || "4 Weeks"}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-lg font-black text-brand-primary">₹{fee}</span>
                              {collegeRates && collegeRates.internshipRate > 0 && (
                                <span className="block text-[10px] text-emerald-600 font-bold uppercase">
                                  Partner Rate
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Coupon Code Applying Section */}
                  <div className="bg-bg-card border border-border-main p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Discount Coupon Code
                      </label>
                      {partnerStudent && (
                        <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                          ⚠️ Pre-Approved Partner Discount Active
                        </span>
                      )}
                    </div>

                    {partnerStudent ? (
                      <div className="text-xs text-text-muted bg-bg-main p-3 rounded-xl border border-border-main flex items-center gap-2 font-medium">
                        <span>💡</span>
                        <span>
                          As a pre-approved college partner student, your special partner rate is automatically applied.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input
                            type="text"
                            placeholder="Have a coupon code? (e.g. SAVE10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border-main bg-bg-main text-text-main text-sm font-mono font-bold uppercase focus:outline-none focus:border-brand-primary"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponInput.trim()}
                            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {isValidatingCoupon ? "Validating..." : "Apply Coupon"}
                          </button>
                        </div>

                        {appliedCoupon && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold flex items-center justify-between">
                            <span>✓ Coupon '{appliedCoupon.coupon?.code}' Applied! (-₹{appliedCoupon.discountAmount})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedCoupon(null);
                                setCouponInput("");
                              }}
                              className="text-red-400 hover:text-red-500 underline ml-2 cursor-pointer font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 Back & Next Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-bg-main border border-border-main text-text-muted hover:text-text-main font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    ← Back to Academic Info
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep3}
                    className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    Proceed to Review & Pay →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review Details & Final Payment Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6 pt-4 animate-fadeIn">
                <div className="bg-bg-main p-5 sm:p-6 rounded-2xl border border-border-main space-y-6">
                  <div className="border-b border-border-main pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
                        4. Final Review & Payment (Step 4 of 4)
                      </span>
                      <h4 className="text-lg font-black text-text-main mt-1">
                        📋 Please Verify All Details Before Enrollment
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-poppins">
                    {/* Personal Details Card */}
                    <div className="bg-bg-card p-4 rounded-2xl border border-border-main space-y-2">
                      <div className="flex items-center justify-between border-b border-border-main/50 pb-1.5">
                        <span className="font-extrabold text-brand-primary uppercase tracking-wider text-[11px]">
                          👤 Personal Profile
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[11px] text-brand-primary font-bold hover:underline cursor-pointer"
                        >
                          Edit ✏
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-text-muted block">Full Name:</span>
                          <span className="font-bold text-text-main">{studentForm.fullName}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Email:</span>
                          <span className="font-bold text-text-main break-all">{studentForm.email}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Mobile Number:</span>
                          <span className="font-bold text-text-main">{studentForm.phone}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Gender & Guardian:</span>
                          <span className="font-bold text-text-main">{studentForm.gender} • {studentForm.parentName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Academic Details Card */}
                    <div className="bg-bg-card p-4 rounded-2xl border border-border-main space-y-2">
                      <div className="flex items-center justify-between border-b border-border-main/50 pb-1.5">
                        <span className="font-extrabold text-brand-primary uppercase tracking-wider text-[11px]">
                          🎓 Academic Info
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] text-brand-primary font-bold hover:underline cursor-pointer"
                        >
                          Edit ✏
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-text-muted block">University:</span>
                          <span className="font-bold text-text-main">{studentForm.universityKey === "others" ? studentForm.universityCustom : studentForm.university}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">College:</span>
                          <span className="font-bold text-text-main">{studentForm.collegeKey === "others" ? studentForm.collegeCustom : studentForm.collegeName}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Degree & Dept:</span>
                          <span className="font-bold text-text-main">{studentForm.degree} ({studentForm.department})</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Roll / Reg Number:</span>
                          <span className="font-bold text-text-main">{studentForm.rollNumber} / {studentForm.registrationNumber}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Sem & Session:</span>
                          <span className="font-bold text-text-main">{studentForm.semester} Sem ({studentForm.session})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Program Card */}
                  <div className="bg-bg-card p-4 rounded-2xl border border-border-main space-y-3">
                    <div className="flex items-center justify-between border-b border-border-main/50 pb-1.5">
                      <span className="font-extrabold text-brand-primary uppercase tracking-wider text-[11px]">
                        💻 Selected Internship Program
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[11px] text-brand-primary font-bold hover:underline cursor-pointer"
                      >
                        Change Internship ✏
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-extrabold text-base text-text-main block">
                          {internships.find((i) => i._id === selectedInternship)?.title || "Selected Internship Program"}
                        </span>
                        <span className="text-text-muted">
                          Domain: {internships.find((i) => i._id === selectedInternship)?.domain || "Technology"}
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-2xl font-black text-emerald-500">₹{getSelectedInternshipFee()}</span>
                        {appliedCoupon && !partnerStudent && (
                          <span className="block text-xs text-text-muted line-through">₹{getSelectedInternshipBaseFee()}</span>
                        )}
                      </div>
                    </div>

                    {appliedCoupon && !partnerStudent && (
                      <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                        ✓ Coupon '{appliedCoupon.coupon?.code}' Applied! (-₹{appliedCoupon.discountAmount} Discount)
                      </div>
                    )}
                    {partnerStudent && (
                      <div className="text-xs font-bold text-amber-500 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        💡 Pre-Approved Partner Student Discount Rate Active
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4 Back & Final Action Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-bg-main border border-border-main text-text-muted hover:text-text-main font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    ← Back to Internship Selection
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Enrollment...
                      </>
                    ) : (
                      <>
                        ✓ Pay ₹{getSelectedInternshipFee()} & Complete Registration
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Review Section Modal (Available for both Pre-Approved & New Students) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border-2 border-brand-primary max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-scaleUp">
            <div className="border-b border-border-main pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">Step 3 of 3 • Data Review</span>
                <h3 className="text-2xl font-black text-text-main flex items-center gap-2 mt-1">
                  📋 Review Details Before Registration
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Please carefully review all your details below before final submission.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-text-muted hover:text-text-main text-2xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Review Details Grid */}
            <div className="space-y-4 text-sm font-poppins">
              {/* Personal Details */}
              <div className="bg-bg-main p-4 rounded-2xl border border-border-main space-y-2">
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-wider block border-b border-border-main/50 pb-1">
                  👤 Personal Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block">Full Name:</span>
                    <span className="font-bold text-text-main">{studentForm.fullName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Email:</span>
                    <span className="font-bold text-text-main break-all">{studentForm.email}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Mobile Phone:</span>
                    <span className="font-bold text-text-main">{studentForm.phone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Gender & Guardian:</span>
                    <span className="font-bold text-text-main">{studentForm.gender} • {studentForm.parentName}</span>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="bg-bg-main p-4 rounded-2xl border border-border-main space-y-2">
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-wider block border-b border-border-main/50 pb-1">
                  🎓 Academic & College Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block">University:</span>
                    <span className="font-bold text-text-main">{studentForm.universityKey === "others" ? studentForm.universityCustom : studentForm.university}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">College Name:</span>
                    <span className="font-bold text-text-main">{studentForm.collegeKey === "others" ? studentForm.collegeCustom : studentForm.collegeName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Degree & Dept:</span>
                    <span className="font-bold text-text-main">{studentForm.degree} ({studentForm.department})</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Roll / Reg Number:</span>
                    <span className="font-bold text-text-main">{studentForm.rollNumber} / {studentForm.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Semester & Session:</span>
                    <span className="font-bold text-text-main">{studentForm.semester} Sem ({studentForm.session})</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Registration Status:</span>
                    <span className="font-bold text-emerald-500">
                      {partnerStudent ? "✓ Pre-Approved Partner Student" : "✨ New Student"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Program & Payment Details */}
              <div className="bg-bg-main p-4 rounded-2xl border border-border-main space-y-2">
                <span className="text-xs font-extrabold text-brand-primary uppercase tracking-wider block border-b border-border-main/50 pb-1">
                  💻 Selected Program & Fee Breakdown
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block">Program Title:</span>
                    <span className="font-bold text-brand-primary text-sm">
                      {internships.find((i) => i._id === selectedInternship)?.title || "Selected Internship"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Total Payable Fee:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-500 text-lg">₹{getSelectedInternshipFee()}</span>
                      {appliedCoupon && !partnerStudent && (
                        <span className="text-xs text-text-muted line-through">₹{getSelectedInternshipBaseFee()}</span>
                      )}
                    </div>
                  </div>
                  {appliedCoupon && !partnerStudent && (
                    <div className="sm:col-span-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                      ✓ Coupon '{appliedCoupon.coupon?.code}' Applied! (-₹{appliedCoupon.discountAmount} Discount)
                    </div>
                  )}
                  {partnerStudent && (
                    <div className="sm:col-span-2 text-xs font-bold text-amber-500 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                      💡 Pre-Approved Partner Student Special Rate Active
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3.5 px-6 bg-bg-main border-2 border-border-main hover:border-brand-primary text-text-main font-bold text-sm rounded-2xl transition cursor-pointer"
              >
                ✏ Edit Details
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  "✓ Confirm & Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Success Modal */}
      {enrollmentSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border-2 border-emerald-500 w-full max-w-lg rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-scaleUp">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl font-bold">
              🎉
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-main">
                Congratulations, {enrollmentSuccess.studentName}!
              </h3>
              <p className="text-sm text-text-muted">
                Your enrollment in <span className="font-bold text-brand-primary">{enrollmentSuccess.internshipTitle}</span> was completed successfully!
              </p>
            </div>

            <button
              onClick={() => router.push("/profile")}
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold rounded-2xl shadow-lg transition text-base"
            >
              Go to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Invalid Email Alert Modal */}
      <InvalidEmailModal
        isOpen={showInvalidEmailModal}
        onClose={() => setShowInvalidEmailModal(false)}
        emailEntered={studentForm.email}
        customErrorMsg={getEmailValidationError(studentForm.email)}
      />

      {/* Coupon Alert Modal */}
      <CouponAlertModal
        isOpen={couponAlertModal.isOpen}
        onClose={() => setCouponAlertModal({ isOpen: false, message: "" })}
        message={couponAlertModal.message}
      />
    </div>
  );
}
