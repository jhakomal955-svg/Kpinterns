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
        "Kp Interns is a comprehensive online learning platform that provides industry-relevant courses, internship opportunities, and mentorship from experienced professionals. We empower students and professionals to master in-demand skills in design, development, and modern technologies to excel in their careers.",
    },
    {
      question: "How do the internship programs work?",
      answer:
        "Our internship programs are designed to give you hands-on experience with real-world projects. You'll work alongside industry experts, gain practical skills, build a professional portfolio, and receive mentorship to kickstart your career. Each internship program is tailored to your skill level and career goals.",
    },
    {
      question: "What courses are available on Kp Interns?",
      answer:
        "We offer a wide range of courses covering web development, app development, UI/UX design, digital marketing, and more. All courses are designed to be practical, project-based, and aligned with current industry standards. Each course includes video lessons, assignments, and real-world projects.",
    },
    {
      question: "Do you provide certificates after completing courses?",
      answer:
        "Yes! Upon successful completion of any course or internship program, you'll receive a recognized certificate that showcases your achievement and newly acquired skills. Our certificates are valued by industry leaders and can be added to your professional portfolio.",
    },
    {
      question: "How can I get support if I'm stuck on something?",
      answer:
        "We have a dedicated support system including instructor mentorship, community forums, live Q&A sessions, and one-on-one guidance. You can connect with instructors, ask questions, and get help from peers in our collaborative community. We're committed to ensuring your learning success.",
    },
  ];

  // Toggle function for opening/closing FAQ items
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="px-4 sm:px-8 lg:px-[60px] py-4 bg-bg-main">
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
      {/* Security / Certification Badges section */}
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
    </div>
  );
};

export default Question;
