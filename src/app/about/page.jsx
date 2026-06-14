"use client";

import Image from "next/image";
import React from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const achievements = [
    {
      icon: "👥",
      title: "Trusted by Thousands",
      description:
        "We have successfully served thousands of students, helping them unlock their potential and achieve their career goals.",
    },
    {
      icon: "🏆",
      title: "Award-Winning Courses",
      description:
        "Our courses have received recognition and accolades in the industry for their quality, depth of content, and effective teaching methodologies.",
    },
    {
      icon: "⭐",
      title: "Positive Student Feedback",
      description:
        "We take pride in the positive feedback we receive from our students, who appreciate the practicality and relevance of our courses and mentorship.",
    },
    {
      icon: "🤝",
      title: "Industry Partnerships",
      description:
        "We have established strong partnerships with industry leaders, enabling us to provide our students with access to the latest tools and technologies.",
    },
  ];

  const goals = [
    {
      icon: "💡",
      title: "Provide Practical Skills",
      description:
        "We focus on developing practical skills that are relevant to the current industry standards with hands-on experience and real-world projects.",
    },
    {
      icon: "🚀",
      title: "Faster Creative Problem-Solving",
      description:
        "We encourage creative thinking and problem-solving approaches, allowing our students to tackle complex challenges with innovative solutions.",
    },
    {
      icon: "🌐",
      title: "Promote Collaboration and Community",
      description:
        "We believe in the power of collaboration and peer learning. Our platform fosters a supportive community where learners can connect and grow together.",
    },
    {
      icon: "📈",
      title: "Stay Ahead of the Curve",
      description:
        "We stay updated with the latest industry trends and continuously evolve our curriculum to ensure our students remain competitive and relevant.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero Section */}
  

      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-8 lg:px-[60px]">
        {/* About Section */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-text-main mb-6">
                About <span className="text-bg-main bg-text-main rounded-full p-2"> Kp</span><span className="text-brand-primary">Interns</span>
              </h2>
              <p className="text-lg text-text-muted leading-relaxed mb-4">
                Welcome to our platform, where we are passionate about
                empowering individuals to master the world of design and
                development. We offer a wide range of online courses designed to
                equip learners with the skills and knowledge needed to succeed
                in the dynamic digital industry.
              </p>
              <p className="text-lg text-text-muted leading-relaxed mb-4">
                Our mission is to democratize quality education and provide
                accessible learning opportunities for everyone, regardless of
                their background or experience level. We believe that education
                should be engaging, practical, and tailored to meet the needs of
                today's rapidly evolving job market.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                Whether you're a beginner looking to start your journey in tech
                or an experienced professional seeking to upgrade your skills,
                our comprehensive courses and personalized mentorship will guide
                you towards achieving your career goals.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-1 shadow-2xl">
                <div className="p-12 animate-bounce flex items-center justify-center min-h-96">
                   <Image
                                  src="/banner.png"
                                  alt="Transform Your Skills and Career"
                                  fill
                                  priority
                                  className="object-contain object-center group-hover:scale-110 transition-transform duration-700"
                                />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-20 border-t border-border-main">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold text-text-main mb-4">
              Achievements
            </h2>
            <p className="text-lg text-text-muted max-w-3xl">
              Our commitment to excellence has resulted in achievements that
              reflect our journey. Here are some of our notable accomplishments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 80}
              >
                <div
                  className="bg-bg-card border border-border-main rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="text-5xl mb-4">{achievement.icon}</div>
                  <h3 className="text-xl font-bold text-text-main mb-3">
                    {achievement.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Goals Section */}
        <section className="py-20 border-t border-border-main">
          <div className="mb-16">
            <h2 className="text-4xl font-extrabold text-text-main mb-4">
              Our Goals
            </h2>
            <p className="text-lg text-text-muted max-w-3xl">
              We are committed to delivering educational excellence and shaping
              the future of design and development. We believe that education
              should be accessible and transformative. Through our carefully
              crafted courses and mentorship, we aim to help you reach your full
              potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.map((goal, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 80}
              >
                <div
                  className="bg-bg-card border border-border-main rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="text-5xl mb-4">{goal.icon}</div>
                  <h3 className="text-xl font-bold text-text-main mb-3">
                    {goal.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {goal.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 border-t border-border-main">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={50}>
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 rounded-2xl p-8 h-full">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  Excellence in Education
                </h3>
                <p className="text-text-muted">
                  We maintain the highest standards in curriculum design,
                  instruction quality, and student outcomes through continuous
                  improvement and innovation.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 border border-brand-secondary/20 rounded-2xl p-8 h-full">
                <div className="text-4xl mb-4">🤲</div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  Accessibility & Inclusivity
                </h3>
                <p className="text-text-muted">
                  We believe learning should be accessible to everyone, regardless
                  of their background, location, or financial situation.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={250}>
              <div className="bg-gradient-to-br from-brand-success/10 to-brand-success/5 border border-brand-success/20 rounded-2xl p-8 h-full">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-text-main mb-3">
                  Innovation & Growth
                </h3>
                <p className="text-text-muted">
                  We continuously evolve and adapt to industry changes, ensuring
                  our students are always equipped with the most current and
                  relevant skills.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 border-t border-border-main">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ScrollReveal direction="scale" delay={50}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  50K+
                </div>
                <p className="text-text-muted font-semibold">Students Trained</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={120}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  200+
                </div>
                <p className="text-text-muted font-semibold">Courses Available</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={190}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  95%
                </div>
                <p className="text-text-muted font-semibold">
                  Student Satisfaction
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={260}>
              <div className="bg-bg-card border border-border-main rounded-2xl p-8 text-center h-full">
                <div className="text-5xl font-bold text-brand-primary mb-2">
                  100+
                </div>
                <p className="text-text-muted font-semibold">Industry Partners</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 border-t border-border-main">
          <h2 className="text-4xl font-extrabold text-text-main mb-12 text-center">
            Why Choose Kp Interns?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ScrollReveal direction="up" delay={50}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary/20">
                    <svg
                      className="h-6 w-6 text-brand-primary"
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
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Expert Instructors
                  </h3>
                  <p className="text-text-muted">
                    Learn from industry professionals with years of hands-on
                    experience and proven track records in their respective
                    fields.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-secondary/20">
                    <svg
                      className="h-6 w-6 text-brand-secondary"
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
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Practical Projects
                  </h3>
                  <p className="text-text-muted">
                    Work on real-world projects and build a portfolio that
                    showcases your skills to potential employers.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-success/20">
                    <svg
                      className="h-6 w-6 text-brand-success"
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
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Career Support
                  </h3>
                  <p className="text-text-muted">
                    Get guidance and support with job placements, resume building,
                    and interview preparation from our dedicated career team.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary/20">
                    <svg
                      className="h-6 w-6 text-brand-primary"
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
                <div>
                  <h3 className="text-lg font-bold text-text-main mb-2">
                    Flexible Learning
                  </h3>
                  <p className="text-text-muted">
                    Learn at your own pace with flexible schedules that fit your
                    lifestyle and professional commitments.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-border-main">
          <ScrollReveal direction="scale">
            <div className="bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-3xl p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-main mb-6">
                <span className="text-brand-primary">Together,</span> let's shape
                the future of
                <br />
                <span className="text-brand-secondary">digital innovation</span>
              </h2>
              <p className="text-xl text-text-muted max-w-2xl mx-auto mb-8">
                Join us on this exciting learning journey and unlock your
                potential in the world of design and development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/internship')} className="bg-brand-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-brand-primary/90 transition-all shadow-md">
                  Start internships today
                </button>
                <button onClick={() => router.push('/courses')} className="border-2 border-brand-primary text-brand-primary font-semibold px-8 py-3 rounded-lg hover:bg-brand-primary/5 transition-all">
                  Learn course
                </button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
