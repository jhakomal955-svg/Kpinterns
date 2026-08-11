"use client";

import Link from "next/link";

const Footer = () => {
  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add newsletter subscription logic here
  };

  return (
    // Main footer container changing seamlessly with your theme variables
    <footer
      className="px-4 sm:px-8 lg:px-[60px] py-8 text-text-main relative bg-bg-card border-t border-border-main"
      id="newsletter"
    >
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        {/* Top section grid with logo, navigation, and newsletter */}
        <div className="flex flex-col justify-between items-start lg:flex-row mb-20  gap-y-8 md:gap-x-8">
          
          {/* Logo and tagline section matching PKJ Interns layout */}
          <div className="flex flex-col md:flex-row justify-around w-full gap-8">
            <div className="w-full md:max-w-[350px]">
              {/* Updated Logo container to match PKJ Interns */}
              <div className="flex items-center mb-4 gap-2">
                <Link href="/" className="text-xl font-extrabold tracking-tight text-text-main">
              <span className="text-bg-main bg-text-main rounded-full p-2">Kp</span><span className="text-brand-primary">Interns</span>
            </Link>
              </div>
              {/* Company tagline */}
              <p className="text-md text-text-muted text-justify leading-relaxed">
                Kp Interns is your comprehensive learning and credit compliance partner – helping UG students complete mandatory internships and transfer academic credits under NEP-2020 guidelines with expert mentorship and verifiable certificates.
              </p>
            </div>
            
            {/* Navigation Lists */}
            <div className="w-full flex justify-start md:justify-around mt-4 gap-32 md:gap-0">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-4">LEGAL</h3>
                <nav className="flex flex-col gap-y-4">
                  <Link
                    href="/admin/auth/dashboard"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    Admin Panel
                  </Link>
                  <Link
                    href="/admin/auth/instructors"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    Instructor Panel
                  </Link>
                   <Link
                    href="/admin/auth/college-admin"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    College Panel
                  </Link>
                   <Link
                    href="/admin/auth/cybercafe-partner"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    Cybercafe partner
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    Privacy policy
                  </Link>
                </nav>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-main mb-4">EXPLORE</h3>
                <nav className="flex flex-col gap-y-4">
                  <Link href="/" className="text-md text-text-muted hover:text-brand-primary transition-colors">
                    Home
                  </Link>
                  <Link
                    href="/internship"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    Explore Internships
                  </Link>
                  <Link
                    href="/courses"
                    className="text-md text-text-muted hover:text-brand-primary transition-colors"
                  >
                    Courses
                  </Link>
                  
                  <Link href="/about" className="text-md text-text-muted hover:text-brand-primary transition-colors">
                    About us
                  </Link>
                  <Link href="/contact" className="text-md text-text-muted hover:text-brand-primary transition-colors">
                    Contact us
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Newsletter subscription section */}
          <div className="flex flex-col w-full lg:max-w-md mt-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-text-main mb-4 text-start">
              Subscribe to our newsletter
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email input field - utilizes border-main and bg-bg-main layout variables */}
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-5 py-3 rounded-xl border border-border-main bg-bg-main text-text-main placeholder-text-muted/60 focus:outline-none focus:border-brand-primary transition-colors"
                required
              />
              {/* Submit button - links seamlessly with brand-primary */}
              <button
                type="submit"
                className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-semibold hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/10 cursor-pointer"
              >
                JOIN THE NEWSLETTER <span className="ml-2">&gt;</span>
              </button>
            </form>
          </div>
        </div>

        

        {/* Bottom section with sublinks and legal copyright parameters */}
        <div className="border-t border-border-main border-opacity-60 pt-8 flex flex-col gap-6 md:flex-row md:justify-between items-center">
          <div>
            <p className="text-xs text-text-muted text-center md:text-left">
              © 2021-2026 Kp Interns. ALL RIGHTS RESERVED | MADE WITH ♥
            </p>
          </div>

          {/* Social media connections links */}
          <div className="flex gap-6 sm:gap-8 items-center">
            <Link href="https://whatsapp.com/channel/0029VbD99mRDJ6H8VJ0Jc417" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#25D366] transition-colors" title="WhatsApp Channel" aria-label="Follow KP Interns on WhatsApp">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </Link>
            <Link href="https://www.linkedin.com/company/kpinterns.com/" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors" title="LinkedIn" aria-label="KP Interns LinkedIn">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.015-.51.09-.69a1.14 1.14 0 0 1 1-.74c.65 0 .8.51.8 1.25v4.85h2.8M7.12 9.49a1.44 1.44 0 1 0-1.44-1.44 1.44 1.44 0 0 0 1.44 1.44m1.39 9.01V10.12H5.73v8.38h2.78z"/></svg>
            </Link>
            <Link href="https://youtube.com/@kpinterns?si=UOU6cATzGDzYW7zN" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors" title="YouTube" aria-label="KP Interns YouTube">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </Link>
            <Link href="https://www.instagram.com/kpinterns020?igsh=a2p3cW9vbnB1ZWU=" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-brand-primary transition-colors" title="Instagram" aria-label="KP Interns Instagram">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </Link>
          </div>

          {/* Inline privacy tracking references */}
          <div className="flex gap-4 justify-center md:justify-end text-text-muted">
            <Link href="/privacy-policy" className="text-xs hover:text-brand-primary transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/terms-of-use" className="text-xs hover:text-brand-primary transition-colors">
              TERMS OF USE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;