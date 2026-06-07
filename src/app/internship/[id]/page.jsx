"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

  const userInternshipData = userData?.ActiveInternship?.find(
    (i) => (i.internship?._id || i.internship) === internshipId
  );

  const handleToggleMilestoneComplete = async (moduleId) => {
    if (!userData || !internshipId || !moduleId) return;

    setIsUpdatingProgress(true);
    try {
      const isCompleted = userInternshipData?.completedModules?.includes(moduleId);
      const res = await fetch("/api/user/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        fetch(`/api/user?id=${parsedUser._id}`)
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

  const handleEnrollMock = async () => {
    if (!userData) {
      router.push(`/register?type=internship&id=${internshipId}`);
      return;
    }

    const price = internship.RegistrationFee?.amount || 500;

    try {
      setIsLoading(true);

      if (price === 0) {
        // Free internship enrollment - direct PUT update
        const updatedActiveInternships = [
          ...(userData.ActiveInternship || []),
          {
            internship: internshipId,
            internshipStatus: "Active",
            progress: 0,
            paymentStatus: true,
            paymentDate: new Date(),
            amount: 0,
          },
        ];

        const res = await fetch(`/api/user?id=${userData._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ActiveInternship: updatedActiveInternships }),
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem("userData", JSON.stringify(data.data));
          setIsEnrolled(true);
          alert(`Successfully applied and enrolled in ${internship.title}!`);
        } else {
          alert(data.error || "Failed to register for internship");
        }
      } else {
        // Paid internship enrollment - Razorpay flow
        const resOrder = await fetch("/api/payment/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "internship", itemId: internshipId }),
        });

        const orderData = await resOrder.json();
        if (!resOrder.ok) {
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
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                alert(`Successfully paid and registered for ${internship.title}!`);
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
              <span className="bg-brand-secondary/10 text-brand-secondary text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                {internship.department}
              </span>
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
              <button
                onClick={handleEnrollMock}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 px-6 rounded-xl shadow transition"
              >
                Apply for Internship {internship.RegistrationFee?.amount ? `- ₹${internship.RegistrationFee.amount}` : ""}
              </button>
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
              <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                userInternshipData?.internshipStatus === "Completed"
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
                <div className="space-y-2">
                  {(internship.content || []).map((mod, idx) => {
                    const isCompleted = userInternshipData?.completedModules?.includes(mod._id);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMilestoneIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition-all flex items-start gap-3 ${
                          selectedMilestoneIndex === idx
                            ? "bg-brand-secondary/10 border-brand-secondary text-brand-secondary shadow-sm"
                            : "bg-bg-card border-border-main hover:bg-bg-main text-text-muted hover:text-text-main"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isCompleted
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
              {currentMilestone ? (
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
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition duration-200 border cursor-pointer ${
                          userInternshipData?.completedModules?.includes(currentMilestone._id)
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
                  {currentMilestone.VideoUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-border-main bg-black">
                      <iframe
                        src={currentMilestone.VideoUrl}
                        title={currentMilestone.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {/* Text Guidelines */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-poppins">Tasks & Instructions</h3>
                    <p className="text-text-muted text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {currentMilestone.textContent || "Please follow standard workflow requirements for this project milestone."}
                    </p>
                  </div>

                  {/* Resources */}
                  {(currentMilestone.pdfurl || currentMilestone.externalink) && (
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
                        {currentMilestone.externalink && (
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
    </div>
  );
}