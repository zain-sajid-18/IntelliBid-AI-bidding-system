"use client";

import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err.message || "Reset failed. Token might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[4px_4px_0_0_var(--ink)] mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-[var(--ink)]" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tighter mb-2">Password Reset!</h1>
        <p className="text-[var(--ink)]/70 font-medium mb-6">Your password has been updated. Redirecting to login...</p>
        <Link href="/login" className="font-display font-bold uppercase text-sm text-[var(--electric)] hover:underline decoration-2 underline-offset-4">
          Go to Login now
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">🧨</div>
        <h1 className="font-display text-2xl font-black uppercase text-[var(--hotpink)] mb-3">Invalid Link</h1>
        <p className="text-[var(--ink)]/70 font-medium mb-6">This reset link is invalid or missing a token.</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-3 font-display text-sm font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] hover:-translate-y-1 transition-all"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl font-black uppercase tracking-tighter mb-2">Reset Password</h1>
      <p className="text-sm text-[var(--ink)]/70 font-medium mb-8">Enter your new password below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="font-display text-sm font-bold uppercase tracking-wide">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Lock className="w-5 h-5 text-[var(--ink)]/40" />
            </div>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-4 font-medium transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-4 opacity-40 hover:opacity-100 transition-opacity"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-display text-sm font-bold uppercase tracking-wide">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Lock className="w-5 h-5 text-[var(--ink)]/40" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-4 font-medium transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/20"
              required
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border-[3px] border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-4 font-display text-lg font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPassword() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md my-12"
      >
        {/* Back link */}
        <div className="absolute -top-10 left-0 md:-top-16">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase hover:text-[var(--acid)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Back to Login
          </Link>
        </div>

        <div className="brutal-lg bg-white p-8 md:p-10">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
                <Lock className="h-6 w-6" />
              </div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
