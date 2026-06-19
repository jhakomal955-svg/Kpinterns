"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AdminAuthContext = createContext();

// Helper to validate client-side token expiration
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}

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

        const isAdminProtectedRoute = pathname.startsWith("/admin") && 
          !pathname.startsWith("/admin/auth/login") && 
          !pathname.startsWith("/admin/auth/register") && 
          !pathname.startsWith("/admin/auth/forgot-password") &&
          pathname !== "/admin/auth";

        if (token && adminData) {
          if (isTokenExpired(token)) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminData");
            setAdmin(null);
            setIsAuthenticated(false);
            if (isAdminProtectedRoute) {
              router.push("/admin/auth/login");
            }
            return;
          }

          setAdmin(JSON.parse(adminData));
          setIsAuthenticated(true);

          // Verify token server-side
          try {
            const res = await fetch("/api/auth/verify", {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (!result.success) {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("adminData");
              setAdmin(null);
              setIsAuthenticated(false);
              if (isAdminProtectedRoute) {
                router.push("/admin/auth/login");
              }
            }
          } catch (e) {
            console.error("Admin session verification error:", e);
          }
        } else {
          setIsAuthenticated(false);
          // Redirect to login if accessing protected routes
          if (isAdminProtectedRoute) {
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
    const isAdminProtectedRoute = pathname.startsWith("/admin") && 
      !pathname.startsWith("/admin/auth/login") && 
      !pathname.startsWith("/admin/auth/register") && 
      !pathname.startsWith("/admin/auth/forgot-password") &&
      pathname !== "/admin/auth";

    if (
      !isLoading &&
      !isAuthenticated &&
      isAdminProtectedRoute
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
