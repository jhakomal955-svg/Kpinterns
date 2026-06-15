"use client";
import React, { useState } from "react";
import Image from "next/image";

const Question = () => {
  // State to track which FAQ item is open
  const [openIndex, setOpenIndex] = useState(null);

  // Dummy FAQ data
  const faqData = [
    {
      question: "What is Kp Interns?",
      answer:
        "Kp Interns is India's leading learning and compliance platform designed specifically for undergraduate and diploma students. We provide AICTE-registered and UGC-compliant virtual internships and skill-training courses structured under the NEP-2020 Choice Based Credit System (CBCS) to help you gain professional competence and transfer academic credits.",
    },
    {
      question: "How do the internship programs work?",
      answer:
        "Our internships are structured 120-hour programs split into training and hands-on project execution. You will attend interactive live classes via Google Meet, access recordings and study notes in your student dashboard, submit assignments, and work on real-world capstone projects under the guidance of assigned domain mentors.",
    },
    {
      question: "Are these internships valid for university credit submission?",
      answer:
        "Yes, absolutely. Our curriculum matches the 4-credit academic requirements of CCFUP / CBCS guidelines. Once you complete the internship, you receive a digitally signed certificate containing an integrated grade card, which is recognized and validated by state university registrars and department heads across Bihar and other states.",
    },
    {
      question: "What courses and streams are available on Kp Interns?",
      answer:
        "We support a wide range of streams. For Technical tracks (BTech/Diploma), we offer Full Stack Development, IoT, ECE, Civil, Electrical, and Mechanical projects. For Non-Technical tracks, we offer customized programs in Arts (BA), Science (BSc), Commerce (BCom), BBA, and BCA domains tailored to fits your academic curriculum.",
    },
    {
      question: "Do you provide verifiable certificates?",
      answer:
        "Yes. Every completion certificate is embedded with a unique Certificate ID and a secure QR code. Employers and college administrators can instantly search and verify your record's authenticity on our public Verification Portal to ensure complete trust.",
    },
    {
      question: "How can I get support if I get stuck during my training?",
      answer:
        "We provide dedicated WhatsApp support group access with your domain mentor, alongside scheduled live interactive Q&A sessions. You can ask queries, submit intermediate drafts for review, and receive customized technical guidance directly from industry experts.",
    },
  ];

  // Toggle function for opening/closing FAQ items
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="px-4 sm:px-8 lg:px-[60px] py-4 lg:pb-10 bg-bg-main">
      <div className="flex flex-col lg:flex-row lg:gap-x-20">
        <div className="flex flex-col p-3">
          <p className="text-brand-primary text-2xl mb-4 lg:mb-20 font-bold uppercase tracking-widest">
            FAQs
          </p>
          <p className="text-3xl md:text-5xl text-text-main font-black leading-tight">
            Guided by Expertise,
            <br />
            Driven by Success
          </p>
        </div>
        <div className="space-y-4  w-full lg:w-1/2">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-bg-card border border-border-main rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all duration-300 items-center justify-center"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-6 sm:px-8 py-4 text-left focus:outline-none group"
              >
                <span className="text-lg md:text-xl text-text-main font-semibold pr-4">
                  {faq.question}
                </span>

                {/* Plus/Minus Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <svg
                    className={`w-6 h-6 transition-transform duration-300 ${
                      openIndex === index ? "rotate-45" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </button>

              {/* Answer Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 sm:px-8 pb-6 pt-0">
                  <div className="border-t border-border-main/50 pt-4">
                    <p className="text-text-muted text-base md:text-lg leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Question;
