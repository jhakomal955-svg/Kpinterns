"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const adminData = localStorage.getItem("adminData");

        if (token && adminData) {
          setAdmin(JSON.parse(adminData));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Redirect to login if accessing protected routes
          if (pathname.includes("/admin/auth/dashboard")) {
            router.push("/admin/auth/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Monitor pathname changes and redirect if not authenticated
  useEffect(() => {
    if (
      !isLoading &&
      !isAuthenticated &&
      pathname.includes("/admin/auth/dashboard")
    ) {
      router.push("/admin/auth/login");
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  const login = async (emailOrPhone, password) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();

      if (data.success) {
        const adminData = data.data;
        localStorage.setItem("adminToken", data.token || "token-" + Date.now());
        localStorage.setItem("adminData", JSON.stringify(adminData));
        setAdmin(adminData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, mobile, password) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          agreeTerms: true,
        }),
      });

      const data = await res.json();

      if (data.success) {
        return {
          success: true,
          message: "Registration successful. Please login.",
        };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setAdmin(null);
    setIsAuthenticated(false);
    router.push("/admin/auth/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
