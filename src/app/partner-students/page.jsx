"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { normalizeDegree } from "@/lib/data/degreeDepartments";

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

  // Internships list
  const [internships, setInternships] = useState([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(true);
  const [showAllInternships, setShowAllInternships] = useState(false);

  // Enrollment Form State
  const [selectedInternship, setSelectedInternship] = useState("");
  const [studentForm, setStudentForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male",
    parentName: "N/A",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(null);

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

      const res = await fetch(`/api/partner-students/search?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (data.success && data.found) {
        setPartnerStudent(data.student);
        setCollegeRates(data.collegeRates);
        setStudentForm((prev) => ({
          ...prev,
          fullName: data.student.fullName || "",
          email: data.student.email || "",
          phone: data.student.phone || "",
          gender: data.student.gender || "Male",
          parentName: data.student.parentName || "N/A",
        }));
        setIsEmailVerified(false);
        setOtpSent(false);
        setOtpError("");
        setOtpSuccessMsg("");
        setSearchSuccess(true);
      } else {
        setPartnerStudent(null);
        setSearchError(data.message || "No registered student record found for this Registration / Roll Number.");
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!studentForm.email || !emailRegex.test(studentForm.email.trim())) {
      setOtpError("Please enter a valid email address (e.g. user@gmail.com).");
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
    if (!partnerStudent || showAllInternships) {
      return internships;
    }

    const studentDegNorm = normalizeDegree(partnerStudent.degree);
    const studentDeptNorm = (partnerStudent.department || "").toLowerCase().trim();

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

  // Set default selected internship if not set
  useEffect(() => {
    if (displayedInternships.length > 0 && !selectedInternship) {
      setSelectedInternship(displayedInternships[0]._id);
    }
  }, [displayedInternships, selectedInternship]);

  // Calculate final fee for selected internship
  const getSelectedInternshipFee = () => {
    if (!selectedInternship) return 0;
    const internObj = internships.find((i) => i._id === selectedInternship);
    if (!internObj) return 500;

    if (collegeRates && collegeRates.internshipRate > 0) {
      return collegeRates.internshipRate;
    }
    return internObj.RegistrationFee?.amount || 500;
  };

  // Submit Fast-Track Registration & Initiate Payment
  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (!partnerStudent) {
      alert("Please search and select your student record first.");
      return;
    }

    if (!selectedInternship) {
      alert("Please select an internship program to continue.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!studentForm.email || !emailRegex.test(studentForm.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    const cleanedPhone = studentForm.phone.replace(/\D/g, "");
    let normalizedPhone = cleanedPhone;
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      normalizedPhone = cleanedPhone.substring(2);
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      normalizedPhone = cleanedPhone.substring(1);
    }

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      alert("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    if (!isEmailVerified) {
      alert("Please verify your email address using the 6-digit OTP code before proceeding.");
      return;
    }

    if (studentForm.password && studentForm.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        partnerStudentId: partnerStudent._id,
        fullName: studentForm.fullName || partnerStudent.fullName,
        email: studentForm.email,
        phone: studentForm.phone,
        password: studentForm.password || "KpStudent@2026",
        gender: studentForm.gender || partnerStudent.gender || "Male",
        parentName: studentForm.parentName || partnerStudent.parentName || "N/A",
        university: partnerStudent.university || "Partner University",
        college: partnerStudent.collegeName,
        degree: partnerStudent.degree || "B.Tech",
        department: partnerStudent.department || "Computer Science",
        rollNumber: partnerStudent.rollNumber,
        semester: partnerStudent.semester || "6th",
        session: partnerStudent.session || "2023-2027",
        registrationNumber: partnerStudent.registrationNumber,
        internshipId: selectedInternship,
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
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-semibold text-center">
            {searchError}
          </div>
        )}
      </div>

      {/* Step 2 & 3: Details & Internship Selection */}
      {searchSuccess && partnerStudent && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          {/* Verified Student Details Card */}
          <div className="bg-bg-card border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white font-bold text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              ✓ Pre-Approved Partner Student
            </div>

            <div className="border-b border-border-main pb-4">
              <h3 className="text-2xl font-bold text-text-main flex items-center gap-3">
                Welcome, {partnerStudent.fullName}! 👋
              </h3>
              <p className="text-text-muted text-sm mt-1">
                College: <span className="font-semibold text-brand-primary">{partnerStudent.collegeName}</span>
                {partnerStudent.university && ` (${partnerStudent.university})`}
              </p>
            </div>

            {/* Academic Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-bg-main p-4 rounded-2xl border border-border-main text-xs sm:text-sm">
              <div>
                <span className="text-text-muted block font-semibold uppercase text-[10px]">Registration No</span>
                <span className="font-mono font-bold text-text-main">{partnerStudent.registrationNumber}</span>
              </div>
              <div>
                <span className="text-text-muted block font-semibold uppercase text-[10px]">Roll Number</span>
                <span className="font-mono font-bold text-text-main">{partnerStudent.rollNumber}</span>
              </div>
              <div>
                <span className="text-text-muted block font-semibold uppercase text-[10px]">Degree & Dept</span>
                <span className="font-bold text-brand-primary">{partnerStudent.degree} - {partnerStudent.department}</span>
              </div>
              <div>
                <span className="text-text-muted block font-semibold uppercase text-[10px]">Semester / Session</span>
                <span className="font-bold text-text-main">Sem {partnerStudent.semester} ({partnerStudent.session})</span>
              </div>
            </div>

            {/* Contact Details & Account Password Form */}
            <div className="space-y-5 pt-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                Confirm Contact Information & Account Password
              </h4>

              {/* Email Address & Prominent Send OTP Button */}
              <div className="p-5 bg-bg-main border-2 border-border-main rounded-2xl space-y-3 shadow-inner">
                <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider flex items-center justify-between">
                  <span>1. Email Address Verification *</span>
                  {isEmailVerified && (
                    <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      disabled={isEmailVerified}
                      value={studentForm.email}
                      onChange={(e) => {
                        setStudentForm({ ...studentForm, email: e.target.value });
                        setIsEmailVerified(false);
                        setOtpSent(false);
                        setOtpError("");
                        setOtpSuccessMsg("");
                      }}
                      placeholder="student@example.com"
                      className={`w-full px-5 py-3.5 bg-bg-card border-2 rounded-xl text-text-main font-medium outline-none transition text-base ${
                        isEmailVerified ? "border-emerald-500 bg-emerald-500/5" : "border-border-main focus:border-brand-primary"
                      }`}
                    />
                  </div>

                  {!isEmailVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || otpCooldown > 0}
                      className="px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/95 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-base rounded-xl shadow-lg hover:shadow-brand-primary/25 transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      {isSendingOtp ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                      className="px-5 py-3.5 bg-bg-card border-2 border-border-main text-text-muted hover:text-brand-primary font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Change Email
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Number & Password 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">2. Mobile Number (10 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3.5 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-medium focus:border-brand-primary outline-none transition font-mono"
                  />
                </div>

                {/* Account Password */}
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    3. Account Password <span className="text-[10px] font-normal text-text-muted">(Default: KpStudent@2026)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      placeholder="Set login password"
                      className="w-full px-4 py-3.5 pr-12 bg-bg-main border-2 border-border-main rounded-xl text-text-main font-medium focus:border-brand-primary outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-xs font-semibold focus:outline-none"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {/* OTP Input Form Block */}
              {otpSent && !isEmailVerified && (
                <div className="p-4 bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl space-y-3 animate-fadeIn">
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
                      className="flex-1 px-4 py-2.5 bg-bg-main border-2 border-brand-primary/40 rounded-xl text-text-main font-mono text-center font-bold tracking-widest text-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otpCode.length !== 6}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                  {otpSuccessMsg}
                </div>
              )}

              {otpError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold text-center animate-fadeIn">
                  {otpError}
                </div>
              )}
            </div>
          </div>

          {/* Filtered Internship Program Selection */}
          <div className="bg-bg-card border-2 border-border-main rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-main pb-4">
              <div>
                <h2 className="text-xl font-bold text-text-main flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">2</span>
                  Internships Filtered For Your Degree & Department
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Showing tailored internships matching <span className="font-bold text-brand-primary">{partnerStudent.degree} ({partnerStudent.department})</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAllInternships(!showAllInternships)}
                className="px-3.5 py-1.5 bg-bg-main border border-border-main rounded-xl text-xs font-bold text-brand-primary hover:border-brand-primary transition self-start sm:self-auto"
              >
                {showAllInternships ? "🎯 Show Recommended Only" : `🌐 Browse All (${internships.length})`}
              </button>
            </div>

            {isLoadingInternships ? (
              <div className="py-8 text-center text-text-muted">Loading internships...</div>
            ) : displayedInternships.length === 0 ? (
              <div className="p-6 text-center text-text-muted bg-bg-main rounded-2xl space-y-2">
                <p className="font-semibold">No specific internships found matching {partnerStudent.department}.</p>
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
                      onClick={() => setSelectedInternship(intern._id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition flex justify-between items-start ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/5 shadow-md scale-[1.01]"
                          : "border-border-main bg-bg-main hover:border-brand-primary/50"
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

            {/* Action Checkout Button */}
            <div className="pt-4 border-t border-border-main flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-text-muted block">Total Payable Registration Fee</span>
                <span className="text-2xl font-black text-text-main">₹{getSelectedInternshipFee()}</span>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isSubmitting || !selectedInternship}
                className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-lg rounded-2xl shadow-xl transition flex items-center justify-center gap-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Registration...
                  </>
                ) : (
                  <>
                    Proceed to Pay & Enroll
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
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
    </div>
  );
}
