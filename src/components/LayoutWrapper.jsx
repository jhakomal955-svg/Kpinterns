"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Hide navbar and footer for admin/auth routes
  const isAdminAuthRoute = pathname.startsWith("/admin/auth");

  return (
    <>
      {!isAdminAuthRoute && <Navbar />}
      {children}
      {!isAdminAuthRoute && <Footer />}
    </>
  );
}
