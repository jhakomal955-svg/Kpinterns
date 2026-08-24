"use client";

import React, { useState } from "react";

export default function AdminResetPasswordModal({
  isOpen,
  onClose,
  targetAccount, // { id: string, name: string, email: string, role: string, type: "user" | "admin" }
  onSuccess,
}) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !targetAccount) return null;

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "";
    // Generate 10-char memorable strong password
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setError(null);
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetType: targetAccount.type || "user",
          targetId: targetAccount.id,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || "Password updated successfully!");
        if (onSuccess) {
          onSuccess(newPassword.trim());
        }
        setTimeout(() => {
          handleClose();
        }, 1800);
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setError("An error occurred: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setShowPassword(true);
    setError(null);
    setSuccessMsg(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl border-2 border-border-main bg-bg-card p-6 sm:p-7 text-left align-middle shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-main/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-2xl">
              🔑
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main font-poppins">
                Reset Account Password
              </h3>
              <p className="text-xs text-text-muted">
                Assign a new secure password for this account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-muted hover:text-text-main text-lg font-bold p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Account Info Pill */}
        <div className="mt-4 p-3.5 bg-bg-main/60 rounded-2xl border border-border-main/70 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-main">
              {targetAccount.name || "Account"}
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {targetAccount.role || targetAccount.type || "User"}
            </span>
          </div>
          <p className="text-xs text-text-muted truncate font-mono">
            {targetAccount.email}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                New Password *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>🎲</span> Generate Strong Password
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter at least 6 characters"
                className="w-full p-3 pr-24 bg-bg-main border-2 border-border-main rounded-xl outline-none focus:border-brand-primary font-mono text-sm text-text-main transition"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {newPassword && (
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-2 py-1 bg-bg-card hover:bg-border-main text-text-muted text-xs rounded-lg border border-border-main transition font-semibold"
                    title="Copy Password"
                  >
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-text-muted hover:text-text-main rounded-lg transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">
              Admins can reveal the password to copy and share it directly with the user.
            </span>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-bold flex items-center gap-2">
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border-main/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-bg-main border-2 border-border-main text-text-main hover:bg-bg-main/80 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newPassword || newPassword.length < 6}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving Password...
                </>
              ) : (
                <>
                  <span>🔑</span> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
