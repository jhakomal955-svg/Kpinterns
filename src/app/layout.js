import { Poppins } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper.jsx";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Kpinterns - Internship and courses provider",
  description: "Elearning platform for Under Graduate and Post Graduate Students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-poppins">
        <AdminAuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
