"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import SuccessAlertModal from "@/components/SuccessAlertModal";
import CouponAlertModal from "@/components/CouponAlertModal";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
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

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url.trim());
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      if (urlObj.hostname.includes("youtu.be")) {
        const segment = urlObj.pathname.split("/").filter(Boolean)[0];
        if (segment) videoId = segment.split(/[?#]/)[0];
      } else if (urlObj.pathname.includes("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1]?.split(/[?#]/)[0];
      } else if (urlObj.pathname.includes("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1]?.split(/[?#]/)[0];
      } else if (urlObj.pathname.includes("/live/")) {
        videoId = urlObj.pathname.split("/live/")[1]?.split(/[?#]/)[0];
      } else {
        videoId = urlObj.searchParams.get("v");
      }
    }
  } catch (e) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      videoId = match[2];
    }
  }
  if (videoId && videoId.length === 11) {
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&fs=1`;
  }
  return null;
};

function EligibleDepartmentsHeaderBadge({ department }) {
  const [expanded, setExpanded] = useState(false);
  const depts = Array.isArray(department) ? department : [department].filter(Boolean);
  if (depts.length === 0) return null;

  if (depts.length <= 2) {
    return (
      <span className="bg-brand-secondary/10 text-brand-secondary text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
        {depts.join(", ")}
      </span>
    );
  }

  const visibleDepts = expanded ? depts : depts.slice(0, 2);
  const remainingCount = depts.length - 2;

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      <span className="bg-brand-secondary/10 text-brand-secondary text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
        {visibleDepts.join(", ")}
      </span>
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border border-brand-primary/30 transition cursor-pointer"
        >
          +{remainingCount} MORE
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border border-brand-primary/30 transition cursor-pointer"
        >
          SHOW LESS
        </button>
      )}
    </div>
  );
}

export default function InternshipDetailLearnPage() {
  const params = useParams();
  const router = useRouter();
  const internshipId = params.id;

  const [internship, setInternship] = useState(null);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [submissionText, setSubmissionText] = useState("");
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [collegeRates, setCollegeRates] = useState({ registered: false, internshipRate: 0, courseRate: 0 });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponAlertModal, setCouponAlertModal] = useState({
    isOpen: false,
    message: "",
  });
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const getOriginalPayableAmount = () => {
    let originalPrice = internship?.RegistrationFee?.amount !== undefined ? Number(internship.RegistrationFee.amount) : 500;
    if (collegeRates.registered && collegeRates.internshipRate > 0) {
      return collegeRates.internshipRate;
    }
    return originalPrice;
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const basePrice = getOriginalPayableAmount();
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

  useEffect(() => {
    setSubmissionText("");
    setSubmissionFileUrl("");
  }, [selectedMilestoneIndex]);

  const userInternshipData = userData?.ActiveInternship?.find(
    (i) => (i.internship?._id || i.internship) === internshipId
  );

  const handleToggleMilestoneComplete = async (moduleId) => {
    if (!userData || !internshipId || !moduleId) return;

    setIsUpdatingProgress(true);
    try {
      const isCompleted = userInternshipData?.completedModules?.includes(moduleId);
      const token = localStorage.getItem("userToken");
      const res = await fetch("/api/user/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userData._id,
          itemId: internshipId,
          type: "internship",
          moduleId: moduleId,
          completed: !isCompleted,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setUserData(result.data);
        localStorage.setItem("userData", JSON.stringify(result.data));
      } else {
        alert(result.error || "Failed to update milestone progress");
      }
    } catch (err) {
      console.error("Error toggling milestone progress:", err);
      alert("An error occurred while updating your progress.");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleAssignmentFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fData = new FormData();
      fData.append("file", file);
      const token = localStorage.getItem("userToken");
      const res = await fetch("/api/cloudinary", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: fData,
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSubmissionFileUrl(result.data.secure_url);
        alert("File uploaded successfully!");
      } else {
        alert(result.error || "Failed to upload file");
      }
    } catch (err) {
      console.error("Error uploading assignment file:", err);
      alert("Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAssignmentSubmit = async (moduleId) => {
    if (!internshipId || !moduleId) return;

    setSubmittingAssignment(true);
    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch("/api/internship/submit-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId,
          moduleId,
          submissionText,
          fileUrl: submissionFileUrl,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setUserData(result.data);
        localStorage.setItem("userData", JSON.stringify(result.data));
        setSuccessModal({
          isOpen: true,
          title: "Success",
          message: "Assignment submitted successfully!",
        });
      } else {
        alert(result.error || "Failed to submit assignment");
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
      alert("An error occurred while submitting your assignment.");
    } finally {
      setSubmittingAssignment(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in and enrolled
    const token = localStorage.getItem("userToken");
    const userJson = localStorage.getItem("userData");

    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        setTimeout(() => {
          setUserData(parsedUser);

          // Check if this internship id is in their ActiveInternship
          const enrolled = (parsedUser.ActiveInternship || []).some(
            i => (i.internship?._id || i.internship) === internshipId
          );
          setIsEnrolled(enrolled);
        }, 0);

        // Fetch fresh profile details from DB to sync
        fetch(`/api/user?id=${parsedUser._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(result => {
            if (result.success && result.data) {
              setTimeout(() => {
                setUserData(result.data);
                localStorage.setItem("userData", JSON.stringify(result.data));
                const freshEnrolled = (result.data.ActiveInternship || []).some(
                  i => (i.internship?._id || i.internship) === internshipId
                );
                setIsEnrolled(freshEnrolled);
              }, 0);
            }
          })
          .catch(err => console.error("Error syncing profile:", err));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    const fetchInternship = async () => {
      try {
        const res = await fetch(`/api/internship?id=${internshipId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setInternship(data.data);
        } else {
          setError(data.error || "Failed to load internship details");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading internship content.");
      } finally {
        setIsLoading(false);
      }
    };

    if (internshipId) {
      fetchInternship();
    }
  }, [internshipId]);

  useEffect(() => {
    const fetchCollegeRates = async () => {
      if (!userData?.college) return;
      try {
        const res = await fetch(`/api/college-rate?college=${encodeURIComponent(userData.college.trim())}`);
        const data = await res.json();
        if (data.success && data.registered) {
          setCollegeRates({
            registered: data.registered,
            internshipRate: data.internshipRate || 0,
            courseRate: data.courseRate || 0
          });
        }
      } catch (err) {
        console.error("Error fetching college rates:", err);
      }
    };

    fetchCollegeRates();
  }, [userData?.college]);

  const handleEnrollMock = async () => {
    if (!userData) {
      router.push(`/register?type=internship&id=${internshipId}`);
      return;
    }

    const originalPrice = internship.RegistrationFee?.amount || 500;
    const basePrice = (collegeRates.registered && collegeRates.internshipRate > 0)
      ? collegeRates.internshipRate
      : originalPrice;

    const price = appliedCoupon ? appliedCoupon.finalPrice : basePrice;

    try {
      setIsLoading(true);

      if (price === 0) {
        // Free internship enrollment via payment verify endpoint
        const token = localStorage.getItem("userToken");
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: userData._id,
            type: "internship",
            itemId: internshipId,
            amount: 0,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (data.data) {
            localStorage.setItem("userData", JSON.stringify(data.data));
          }
          setIsEnrolled(true);
          setSuccessModal({
            isOpen: true,
            title: "Enrollment Successful!",
            message: `Successfully applied and enrolled in the internship: ${internship.title}!`,
          });
        } else {
          alert(data.error || "Failed to register for internship");
        }
      } else {
        // Paid internship enrollment - Razorpay flow
        const token = localStorage.getItem("userToken");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const resOrder = await fetch("/api/payment/order", {
          method: "POST",
          headers,
          body: JSON.stringify({ 
            type: "internship", 
            itemId: internshipId,
            university: userData?.university,
            college: userData?.college,
            couponCode: appliedCoupon ? appliedCoupon.coupon?.code : undefined,
          }),
        });

        const orderData = await resOrder.json();
        if (!resOrder.ok) {
          if (orderData.error && orderData.error.toLowerCase().includes("coupen")) {
            setAppliedCoupon(null);
            setCouponAlertModal({
              isOpen: true,
              message: orderData.error,
            });
            setIsLoading(false);
            return;
          }
          throw new Error(orderData.error || "Failed to initiate payment");
        }

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Failed to load payment gateway. Please check your internet connection.");
          return;
        }

        const options = {
          key: orderData.key,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: "KpInterns",
          description: `Payment for ${orderData.title}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              setIsLoading(true);
              const token = localStorage.getItem("userToken");
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: userData._id,
                  type: "internship",
                  itemId: internshipId,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                localStorage.setItem("userData", JSON.stringify(verifyData.data));
                setIsEnrolled(true);
                setSuccessModal({
                  isOpen: true,
                  title: "Enrollment Successful!",
                  message: `Successfully paid and registered for the internship: ${internship.title}!`,
                });
              } else {
                alert(verifyData.error || "Payment verification failed.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              alert("An error occurred during payment verification.");
            } finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: userData.fullName,
            email: userData.email,
            contact: userData.phone,
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error registering for internship");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading internship portal...</p>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center px-4">
        <div className="text-center bg-bg-card border-2 border-border-main p-8 rounded-2xl max-w-md">
          <span className="text-4xl block mb-4">⚠️</span>
          <p className="text-red-500 font-bold mb-4">{error || "Internship not found"}</p>
          <Link href="/internship" className="px-6 py-2.5 bg-brand-primary text-white rounded-xl shadow font-semibold">
            Back to Internships
          </Link>
        </div>
      </div>
    );
  }

  const currentMilestone = internship.content?.[selectedMilestoneIndex];

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col">
      {/* Internship Header */}
      <div className="bg-bg-card border-b border-border-main py-6 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <EligibleDepartmentsHeaderBadge department={internship.department} />
              <span className="bg-bg-main text-text-muted text-xs font-semibold px-2.5 py-1 rounded-md border border-border-main">
                {internship.domain}
              </span>
              <span className="bg-brand-success/10 text-brand-success text-xs font-semibold px-2.5 py-1 rounded-md border border-brand-success/20">
                {internship.internshipType}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-poppins">{internship.title}</h1>
            <span className="text-sm font-semibold text-text-muted mt-1 block">
              🏢 {internship.company || "KpInterns"} | 📍 {internship.mode} Mode
            </span>
          </div>

          <div>
            {!isEnrolled ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Coupon Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="px-3 py-2 rounded-xl border border-border-main bg-bg-main text-text-main text-sm font-mono font-bold uppercase w-36 focus:outline-none focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="px-3.5 py-2 bg-bg-main hover:bg-border-main border border-border-main text-text-main font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isValidatingCoupon ? "..." : "Apply"}
                  </button>
                </div>

                {appliedCoupon && (
                  <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                    <span>✓ Code '{appliedCoupon.coupon?.code}' Applied (-₹{appliedCoupon.discountAmount})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponInput("");
                      }}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded px-1.5 py-0.5 font-extrabold cursor-pointer transition"
                      title="Remove Coupon"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  onClick={handleEnrollMock}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow transition cursor-pointer"
                >
                  Apply for Internship
                </button>
              </div>
            ) : (
              <span className="bg-brand-success/10 border border-brand-success/30 text-brand-success font-bold py-2 px-4 rounded-xl flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-brand-success rounded-full animate-pulse"></span>
                Active Internship Profile
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Internship Details / Learning Hub Layout */}
      {!isEnrolled ? (
        /* Preview Layout */
        <div className="max-w-4xl mx-auto py-12 px-4 flex-1 space-y-6 w-full">
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-8 shadow-md space-y-8">

            {/* Role Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4 font-poppins">Role Description</h2>
              <p className="text-text-muted leading-relaxed">{internship.description}</p>
            </div>

            {/* Mentors / Instructors Section */}
            {internship.instructor && internship.instructor.length > 0 && (
              <div className="pt-6 border-t border-border-main/60">
                <h3 className="text-lg font-bold mb-4 font-poppins text-brand-primary">Internship Mentors & Supervisors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {internship.instructor.map((inst, idx) => (
                    <div key={inst._id || idx} className="flex items-center space-x-3 bg-bg-main p-4 rounded-xl border border-border-main">
                      {/* Mentor Initial Badge */}
                      <div className="w-10 h-10 rounded-full bg-brand-secondary/10 text-brand-secondary font-bold flex items-center justify-center border border-brand-secondary/20 shrink-0">
                        {inst.id?.name ? inst.id.name.charAt(0).toUpperCase() : "M"}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-text-main">
                          {inst.id?.name || "Industry Expert"}
                        </h4>
                        {inst.id?.role && (
                          <p className="text-xs text-text-muted capitalize">
                            {inst.id.role}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements and Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-main/60">
              <div>
                <h3 className="text-lg font-bold mb-3 font-poppins text-brand-primary">Key Requirements</h3>
                <ul className="space-y-2">
                  {(internship.requirements || []).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text-muted">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 font-poppins text-brand-secondary">Skills Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {(internship.skills || []).map((skill, idx) => (
                    <span key={idx} className="bg-bg-main border border-border-main text-text-muted text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Responsibilities */}
            <div className="pt-6 border-t border-border-main/60">
              <h3 className="text-lg font-bold mb-3 font-poppins text-brand-success">Daily Responsibilities</h3>
              <ul className="space-y-2">
                {(internship.responsibilities || []).map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="text-brand-success font-bold">✓</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Project Milestones map */}
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-8 shadow-md">
            <h3 className="text-lg font-bold mb-4 font-poppins">Project Milestones & Learning Map</h3>
            <div className="space-y-3">
              {(internship.content || []).map((mod, idx) => (
                <div key={idx} className="bg-bg-main border border-border-main p-4 rounded-xl flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm">{mod.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Enrolled Project Workspace Dashboard */
        <div className="flex-1 max-w-8xl w-full mx-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {/* Progress Section */}
          <div className="bg-bg-card border-2 border-border-main rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in animate-gradient">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold font-poppins text-text-muted">Internship Project Progress</span>
                <span className="text-sm font-bold font-poppins text-brand-secondary">{userInternshipData?.progress || 0}%</span>
              </div>
              <div className="w-full bg-border-main rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary rounded-full transition-all duration-500"
                  style={{ width: `${userInternshipData?.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${userInternshipData?.internshipStatus === "Completed"
                ? "bg-brand-success/15 border-brand-success/30 text-brand-success"
                : "bg-brand-secondary/15 border-brand-secondary/30 text-brand-secondary"
                }`}>
                {userInternshipData?.internshipStatus === "Completed" ? "🏆 Completed" : "⚡ In Progress"}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - Milestones list */}
            <div className="w-full md:w-80 shrink-0 space-y-4">
              <div className="bg-bg-card border-2 border-border-main rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wider text-text-muted mb-4 px-2">
                  Project Milestones
                </h3>

                {/* Internship Updates */}
                {internship.updates && internship.updates.length > 0 && (
                  <div className="mb-4 p-3 bg-brand-secondary/5 border border-brand-secondary/20 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary flex items-center gap-1 px-1">
                      📢 Updates
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(internship.updates || []).slice(-2).reverse().map((update, idx) => (
                        <div key={idx} className="text-xs leading-relaxed border-b border-border-main/40 pb-1.5 last:border-b-0 last:pb-0">
                          {update.externalLink ? (
                            <a
                              href={update.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-main hover:text-brand-secondary font-medium hover:underline block"
                            >
                              {update.title} 🔗
                            </a>
                          ) : (
                            <span className="text-text-muted block">{update.title}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAllUpdates(true)}
                      className="text-xs font-bold text-brand-secondary hover:underline mt-2 block w-full text-left cursor-pointer"
                    >
                      All Updates →
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {(internship.content || []).map((mod, idx) => {
                    const isCompleted = userInternshipData?.completedModules?.includes(mod._id);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedMilestoneIndex(idx);
                          setShowAllUpdates(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all flex items-start gap-3 ${selectedMilestoneIndex === idx
                          ? "bg-brand-secondary/10 border-brand-secondary text-brand-secondary shadow-sm"
                          : "bg-bg-card border-border-main hover:bg-bg-main text-text-muted hover:text-text-main"
                          }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isCompleted
                          ? "bg-brand-success text-white"
                          : selectedMilestoneIndex === idx
                            ? "bg-brand-secondary text-white"
                            : "bg-bg-main"
                          }`}>
                          {isCompleted ? "✓" : idx + 1}
                        </span>
                        <span className="line-clamp-2 mt-0.5">{mod.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Milestone Content Pane */}
            <div className="flex-1 bg-bg-card border-2 border-border-main rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col min-w-0">
              {showAllUpdates ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-brand-secondary uppercase tracking-widest block mb-1">
                        Announcements
                      </span>
                      <h2 className="text-2xl font-bold font-poppins">All Internship Updates</h2>
                    </div>
                    <button
                      onClick={() => setShowAllUpdates(false)}
                      className="px-4 py-2 bg-bg-main hover:bg-border-main text-text-muted hover:text-text-main rounded-xl border border-border-main text-xs font-bold transition cursor-pointer"
                    >
                      Back to Milestone
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(internship.updates || []).slice().reverse().map((update, idx) => (
                      <div key={idx} className="p-5 bg-bg-main border border-border-main rounded-2xl space-y-2 animate-fade-in">
                        <span className="text-xs font-semibold text-text-muted">
                          Update #{internship.updates.length - idx}
                        </span>
                        <h3 className="font-bold text-base text-text-main">{update.title}</h3>
                        {update.externalLink && (
                          <a
                            href={update.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary bg-brand-secondary/10 hover:bg-brand-secondary/20 px-3 py-1.5 rounded-lg border border-brand-secondary/20 transition mt-2"
                          >
                            🔗 Attachment Link
                          </a>
                        )}
                      </div>
                    ))}
                    {(!internship.updates || internship.updates.length === 0) && (
                      <div className="text-center py-12 text-text-muted">
                        <span className="text-3xl block mb-2">📢</span>
                        <p>No updates published yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentMilestone ? (
                <div className="space-y-6">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-main">
                    <div>
                      <span className="text-xs font-bold text-brand-secondary uppercase tracking-widest block mb-1">
                        Milestone {selectedMilestoneIndex + 1}
                      </span>
                      <h2 className="text-2xl font-bold font-poppins">{currentMilestone.title}</h2>
                    </div>
                    <div>
                      <button
                        onClick={() => handleToggleMilestoneComplete(currentMilestone._id)}
                        disabled={isUpdatingProgress}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition duration-200 border cursor-pointer ${userInternshipData?.completedModules?.includes(currentMilestone._id)
                          ? "bg-brand-success/10 border-brand-success/30 text-brand-success hover:bg-brand-success/20"
                          : "bg-brand-secondary text-white border-brand-secondary hover:bg-brand-secondary/90"
                          }`}
                      >
                        {userInternshipData?.completedModules?.includes(currentMilestone._id)
                          ? "✓ Completed"
                          : "Mark as Complete"}
                      </button>
                    </div>
                  </div>

                  {/* Video Briefing */}
                  {(currentMilestone.VideoUrl || (currentMilestone.externalink && getYouTubeEmbedUrl(currentMilestone.externalink))) && (
                    <VideoPlayer videoUrl={currentMilestone.VideoUrl || currentMilestone.externalink} />
                  )}

                  {/* Text Guidelines */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-poppins">Tasks & Instructions</h3>
                    <p className="text-text-muted text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {currentMilestone.textContent || "Please follow standard workflow requirements for this project milestone."}
                    </p>
                  </div>

                  {/* Resources */}
                  {(currentMilestone.pdfurl || (currentMilestone.externalink && !getYouTubeEmbedUrl(currentMilestone.externalink))) && (
                    <div className="pt-6 border-t border-border-main space-y-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                        Milestone Study Files & Resource Links
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {currentMilestone.pdfurl && (
                          <a
                            href={currentMilestone.pdfurl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-4 py-2 rounded-lg border border-brand-primary/20 transition"
                          >
                            📄 Project Brief / Notes
                          </a>
                        )}
                        {currentMilestone.externalink && !getYouTubeEmbedUrl(currentMilestone.externalink) && (
                          <a
                            href={currentMilestone.externalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-brand-secondary bg-brand-secondary/10 hover:bg-brand-secondary/20 px-4 py-2 rounded-lg border border-brand-secondary/20 transition"
                          >
                            🔗 External Reference Link
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assignment Area */}
                  {currentMilestone.assignmentTitle && (
                    <div className="pt-8 border-t border-border-main space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📋</span>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                          Milestone Assignment Project
                        </h4>
                      </div>
                      
                      <div className="bg-gradient-to-br from-bg-card to-bg-card/70 border border-border-main/80 rounded-2xl p-6 shadow-md space-y-5">
                        <div className="space-y-2">
                          <h5 className="text-lg font-bold text-text-main font-poppins tracking-tight">
                            {currentMilestone.assignmentTitle}
                          </h5>
                          <p className="text-text-muted text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                            {currentMilestone.assignmentDesc || "Follow the guidelines above to complete this assignment."}
                          </p>
                        </div>

                        {currentMilestone.assignmentFileUrl && (
                          <div className="pt-1">
                            <a
                              href={currentMilestone.assignmentFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 transition duration-200"
                            >
                              <span>📥</span> Download Assignment Guidelines (PDF)
                            </a>
                          </div>
                        )}

                        {/* Check if student has already submitted */}
                        {(() => {
                          const submission = userInternshipData?.assignments?.find(
                            (a) => a.moduleId === currentMilestone._id.toString()
                          );

                          if (submission) {
                            return (
                              <div className="mt-6 pt-6 border-t border-border-main/60 space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Your Submission</span>
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                                    submission.status === "Graded"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse"
                                  }`}>
                                    {submission.status === "Graded" ? (
                                      <>
                                        <span>🏆</span> Graded
                                      </>
                                    ) : (
                                      <>
                                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                        Pending Evaluation
                                      </>
                                    )}
                                  </span>
                                </div>

                                {submission.submittedText && (
                                  <div className="p-4 bg-bg-main/60 rounded-xl border border-border-main text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                                    {submission.submittedText}
                                  </div>
                                )}

                                {submission.fileUrl && (
                                  <div className="pt-1">
                                    <a
                                      href={submission.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-4 py-2 rounded-lg border border-brand-primary/20 transition"
                                    >
                                      📄 View Submitted Attachment File
                                    </a>
                                  </div>
                                )}

                                <div className="text-[10px] text-text-muted flex items-center gap-1">
                                  <span>📅</span> Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                                </div>

                                {submission.status === "Graded" && (
                                  <div className="mt-4 p-5 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">⭐</span>
                                        <span className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">Evaluation Grade:</span>
                                      </div>
                                      <span className="text-lg font-black text-brand-primary">{submission.marks} / 10</span>
                                    </div>
                                    {submission.feedback && (
                                      <div className="pt-2 border-t border-brand-primary/10">
                                        <p className="text-xs font-semibold text-text-muted italic leading-relaxed">
                                          " {submission.feedback} "
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div className="mt-6 pt-6 border-t border-border-main/60 space-y-5">
                              <div className="space-y-1">
                                <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider block">Submit Work Solution</span>
                                <p className="text-xs text-text-muted">Fill out the fields below to submit your milestone project for evaluation.</p>
                              </div>

                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-text-main">
                                  Submission Notes / Links
                                </label>
                                <textarea
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  placeholder="Provide descriptive explanations or paste your active hosting/repository links (e.g. GitHub URL)..."
                                  rows="4"
                                  className="w-full p-4 bg-bg-main border-2 border-border-main rounded-xl text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition font-sans"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-text-main">
                                  Solution File Attachment (Zip, PDF, or screenshots)
                                </label>
                                
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="assignment-file"
                                    onChange={handleAssignmentFileChange}
                                    className="hidden"
                                    disabled={uploadingFile}
                                  />
                                  <label
                                    htmlFor="assignment-file"
                                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition duration-200 bg-bg-main/50 hover:bg-bg-main ${
                                      submissionFileUrl 
                                        ? "border-emerald-500/50 bg-emerald-500/5" 
                                        : uploadingFile 
                                          ? "border-brand-primary/50 animate-pulse" 
                                          : "border-border-main/80 hover:border-brand-primary"
                                    }`}
                                  >
                                    <div className="space-y-2 text-center flex flex-col items-center">
                                      {uploadingFile ? (
                                        <>
                                          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                          <span className="text-xs font-bold text-brand-primary">Uploading your file to Cloudinary...</span>
                                        </>
                                      ) : submissionFileUrl ? (
                                        <>
                                          <span className="text-2xl text-emerald-500">✓</span>
                                          <span className="text-xs font-bold text-emerald-500">File Attached Successfully!</span>
                                          <span className="text-[10px] text-text-muted font-mono">{submissionFileUrl.split("/").pop()}</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-3xl text-text-muted">☁️</span>
                                          <span className="text-xs font-bold text-text-main">Drag file here or click to browse</span>
                                          <span className="text-[10px] text-text-muted font-medium">Supports ZIP, PDF, PNG, JPG (Max 100MB)</span>
                                        </>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              </div>

                              <button
                                onClick={() => handleAssignmentSubmit(currentMilestone._id)}
                                disabled={submittingAssignment || (!submissionText.trim() && !submissionFileUrl)}
                                className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/95 hover:to-brand-primary text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-primary/10 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {submittingAssignment ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Submitting for Evaluation...</span>
                                  </div>
                                ) : (
                                  "Submit Assignment Project"
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-text-muted">
                  <span className="text-4xl block mb-4">📔</span>
                  <p>No content guidelines uploaded for this milestone.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <SuccessAlertModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
      <CouponAlertModal
        isOpen={couponAlertModal.isOpen}
        onClose={() => setCouponAlertModal({ isOpen: false, message: "" })}
        message={couponAlertModal.message}
      />
    </div>
  );
}