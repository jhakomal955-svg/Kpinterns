"use client";

import React, { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [verificationResults, setVerificationResults] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const performVerification = async (query) => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    setVerificationResults(null);
    setSelectedCertificate(null);

    try {
      const res = await fetch(`/api/verify?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setVerificationResults(data.data);
        if (data.data.length === 1) {
          setSelectedCertificate(data.data[0]);
        }
      } else {
        setError(data.error || "Verification failed. No matching certificate found.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred while connecting to the verification server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL query parameters on load for direct verification links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id") || params.get("query");
    if (idParam) {
      setInputValue(idParam);
      performVerification(idParam);
    }
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      alert("Please enter a Certificate ID, Email, or Phone Number");
      return;
    }
    performVerification(inputValue);
  };

  const handleDownload = () => {
    if (selectedCertificate?.certificateUrl) {
      window.open(selectedCertificate.certificateUrl, "_blank");
    }
  };

  const handleShare = () => {
    if (selectedCertificate?.certificateId) {
      const shareUrl = `${window.location.origin}/verify?id=${selectedCertificate.certificateId}`;
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy link:", err));
    }
  };

  const trustFeatures = [
    {
      icon: "🔒",
      title: "Secure Verification",
      description:
        "Industry-standard SSL encryption and security protocols to protect your data and ensure authenticity.",
    },
    {
      icon: "✅",
      title: "Instant Results",
      description:
        "Get immediate verification results for certificates issued by Kp Interns with real-time database checks.",
    },
    {
      icon: "🌐",
      title: "Globally Recognized",
      description:
        "Our certificates are recognized internationally and verified by employers worldwide.",
    },
    {
      icon: "📋",
      title: "Official Records",
      description:
        "All verification data is maintained in our secure database with complete audit trails.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Enter Your Information",
      description:
        "Provide your Certificate ID, registered email, or phone number in the verification form above.",
    },
    {
      step: "02",
      title: "System Verification",
      description:
        "Our system instantly cross-references your information with our secure certificate database.",
    },
    {
      step: "03",
      title: "View Details",
      description:
        "Get complete certificate details including course name, completion date, and holder information.",
    },
    {
      step: "04",
      title: "Share Credentials",
      description:
        "Easily share your verified certificate link with employers, clients, or educational institutions.",
    },
  ];

  const faqs = [
    {
      question: "What information do I need to verify my certificate?",
      answer:
        "You can verify using any of the following: your Certificate ID, registered email address, or phone number associated with your account.",
    },
    {
      question: "How long does verification take?",
      answer:
        "Verification is instant! Results are displayed immediately after you submit your information.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes, we use industry-standard SSL encryption and secure databases to protect all personal and certificate information.",
    },
    {
      question: "Can I verify someone else's certificate?",
      answer:
        "Yes, employers and institutions can verify certificates using the publicly available Certificate ID.",
    },
    {
      question: "What if my certificate has expired?",
      answer:
        "Expired certificates can still be verified, but will be clearly marked as expired. You can renew your certificate by contacting our support team.",
    },
    {
      question: "How long are certificates valid?",
      answer:
        "Most Kp Interns certificates are valid for one year from the date of issue. Validity period is mentioned in your certificate.",
    },
  ];

  return (
    <div className="min-h-screen  bg-bg-main">
      {/* Hero Section */}
      <section className="py-16  bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
        <div className=" mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="bg-brand-primary/20 p-4 rounded-2xl">
              <svg
                className="w-12 h-12 text-brand-primary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-text-main mb-6">
            Certificate <span className="text-brand-primary">Verification</span>
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Verify the authenticity of Kp Interns certificates instantly. Enter
            your Certificate ID, email, or phone number to get complete
            verification details.
          </p>
        </div>
      </section>

      {/* Main Verification Section */}
      <div className=" mx-auto px-4 sm:px-8 lg:px-[60px] py-20">
        {/* Verification Form */}
        <div className="mb-20">
          <div className="bg-bg-card border border-border-main rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-text-main mb-8 text-center">
              Verify Your Certificate
            </h2>

            <form onSubmit={handleVerify} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Certificate ID / Email / Phone Number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border border-border-main bg-bg-main text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Verify Now
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                <span className="text-3xl block mb-2">⚠️</span>
                <p className="text-red-500 font-semibold font-poppins">{error}</p>
              </div>
            )}

            {/* Multiple Results List */}
            {verificationResults && verificationResults.length > 1 && !selectedCertificate && (
              <div className="mt-12 space-y-6">
                <h3 className="text-2xl font-bold text-text-main font-poppins border-b border-border-main pb-3">
                  Matches Found ({verificationResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {verificationResults.map((cert, index) => (
                    <ScrollReveal
                      key={cert.certificateId}
                      direction="up"
                      delay={index * 80}
                    >
                      <div
                        onClick={() => setSelectedCertificate(cert)}
                        className="bg-bg-main hover:bg-bg-card p-6 rounded-2xl border border-border-main hover:border-brand-primary hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/20 font-poppins">
                              {cert.type}
                            </span>
                            <span className="text-lg">📜</span>
                          </div>
                          <h4 className="font-bold text-text-main font-poppins text-lg mb-2 line-clamp-1">
                            {cert.course}
                          </h4>
                          <p className="text-sm text-text-muted font-poppins mb-2">
                            Holder: <span className="font-semibold text-text-main">{cert.holder}</span>
                          </p>
                          <p className="text-xs text-text-muted font-mono truncate">
                            ID: {cert.certificateId}
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border-main/50 text-xs font-bold text-brand-primary flex items-center justify-between mt-auto">
                          <span>View Verification Details</span>
                          <span>→</span>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Verification Card */}
            {selectedCertificate && (
              <div className="mt-12">
                {/* Back button if there are multiple matches */}
                {verificationResults && verificationResults.length > 1 && (
                  <button
                     onClick={() => setSelectedCertificate(null)}
                    className="mb-6 text-sm font-bold text-brand-primary hover:underline flex items-center gap-1 font-poppins cursor-pointer"
                  >
                    ← Back to search results
                  </button>
                )}
                
                {(() => {
                  const isOfferLetter = selectedCertificate?.type?.toLowerCase().includes("offer letter");
                  return (
                    <ScrollReveal direction="scale">
                      <div className="p-8 bg-gradient-to-br from-brand-success/10 to-brand-success/5 rounded-2xl border border-brand-success/30 shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-brand-success/20 p-3 rounded-full">
                          <svg
                            className="w-8 h-8 text-brand-success"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-brand-success font-poppins">
                          {isOfferLetter ? "Offer Letter Verified" : "Certificate Verified"}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 font-poppins">
                            {isOfferLetter ? "Offer Letter ID" : "Certificate ID"}
                          </p>
                          <p className="text-lg font-bold text-text-main font-mono select-all break-all">
                            {selectedCertificate.certificateId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 font-poppins">
                            Holder Name
                          </p>
                          <p className="text-lg font-bold text-text-main font-poppins">
                            {selectedCertificate.holder}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 font-poppins">
                            Program/Course
                          </p>
                          <p className="text-lg font-bold text-text-main font-poppins">
                            {selectedCertificate.course}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 font-poppins">
                            Issued Date
                          </p>
                          <p className="text-lg font-bold text-text-main font-poppins">
                            {selectedCertificate.issuedDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 font-poppins">
                            Expiry Date
                          </p>
                          <p className="text-lg font-bold text-brand-success font-poppins">
                            {selectedCertificate.expiryDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 font-poppins">
                            Verification Status
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-success/15 border border-brand-success/30 rounded-full text-xs font-bold text-brand-success font-poppins">
                            <span className="w-2 h-2 bg-brand-success rounded-full animate-pulse"></span>
                            Authentic Record
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={handleDownload}
                          className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          {isOfferLetter ? "Download Offer Letter" : "Download Certificate"}
                        </button>
                        <button
                          onClick={handleShare}
                          className={`flex-1 font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer ${
                            copied
                              ? "bg-brand-success/20 text-brand-success border border-brand-success/30"
                              : "bg-brand-secondary/20 text-brand-secondary border border-transparent hover:bg-brand-secondary/30"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.684 13.342C9.589 12.71 10 11.715 10 10.5c0-2.121-1.879-4-4-4s-4 1.879-4 4 1.879 4 4 4c.464 0 .909-.087 1.316-.25m0 0a6 6 0 016 6v2m0 0a6 6 0 01-6-6m6 6v2m0 0a6 6 0 01-6-6m6 6l-1-1m-8-6a4 4 0 014-4h4a4 4 0 014 4"
                            />
                          </svg>
                          {copied ? "Link Copied!" : "Share Verification"}
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Trust Features Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            Why Verify With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 80}
              >
                <div
                  className="bg-bg-card border border-border-main rounded-2xl p-8 hover:shadow-lg transition-all hover:border-brand-primary/50 h-full"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-text-main mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            How Verification Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <ScrollReveal
                key={index}
                className="relative"
                direction="up"
                delay={index * 80}
              >
                <div className="bg-bg-card border border-border-main rounded-2xl p-8 h-full">
                  <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-3">
                    {item.title}
                  </h3>
                  <p className="text-text-muted">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-brand-primary to-transparent"></div>
                )}
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Security & Trust Badges */}
        <div className="flex flex-col justify-start items-start sm:flex-row sm:justify-center sm:items-center gap-10 sm:gap-32 mt-10 bg-bg-main/40 border border-border-main rounded-2xl p-8">
                  {/* ISO Badge */}
                  <div className="flex flex-col sm:items-center">
                    <div className="w-16 h-16 flex items-center justify-start sm:justify-center mb-3">
                      <Image
                        src="/iso.png"
                        alt="ISO Certification"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-sm text-text-muted sm:text-center">
                      <span className="text-base font-bold text-text-main block mb-1">ISO 9001:2015</span>
                      certified for quality management systems, ensuring consistent delivery of 
                      <br /> high-quality courses and services.
                    </p>
                  </div>
        
                  <div className="flex flex-col sm:items-center">
                    <div className="w-16 h-16 flex items-center justify-start sm:justify-center mb-3">
                      <Image
                        src="/msme.png"
                        alt="MSME Certification"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-sm text-text-muted sm:text-center">
                      <span className="text-base font-bold text-text-main block mb-1">MSME Certified</span>
                      Recognized as a Micro, Small & Medium Enterprise 
                      <br /> by the Government of India
                    </p>
                  </div>
                  
        
                  {/* Verification Badge */}
                  <div className="flex flex-col sm:items-center">
                    <div className="w-16 h-16 flex items-center justify-start sm:justify-center mb-3">
                      <Image
                        src="/aicte.png"
                        alt="Regulated Entity"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-sm text-text-muted sm:text-center">
                      <span className="text-base font-bold text-text-main block mb-1">AICTE Registered</span>
                      All technical programs follow All India Council for 
                      <br /> Technical Education standards
                    </p>
                  </div>
        
                  {/* Secure Badge */}
                  <div className="flex flex-col sm:items-center">
                    <div className="w-16 h-16 flex items-center justify-start sm:justify-center  mb-3">
                      <Image
                        src="/ugc.jpg"
                        alt="Secure Platform"
                        width={50}
                        height={50}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <p className="text-sm text-text-muted sm:text-center">
                      <span className="text-base font-bold text-text-main block mb-1">UGC Compliant</span>
                      Non-technical courses follow University Grants
                      <br /> Commission regulation
                    </p>
                  </div>
                </div>

        {/* FAQ Section */}
        <section className="mt-10">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-bg-card border border-border-main rounded-xl p-6 cursor-pointer hover:border-brand-primary/50 transition-all group"
              >
                <summary className="flex items-center justify-between font-bold text-text-main">
                  <span>{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-brand-primary transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </summary>
                <p className="text-text-muted mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-primary/90 to-brand-secondary/90 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Don't Have a Certificate Yet?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Explore our comprehensive courses and internship programs to earn
            industry-recognized certificates from Kp Interns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/courses')} className="bg-white text-brand-primary font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all">
              Explore Courses
            </button>
            <button onClick={() => router.push('/internship')} className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              View Internships
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
