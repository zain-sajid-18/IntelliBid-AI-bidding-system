"use client";

import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
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
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

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
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">Success!</h1>
        <p className="opacity-70 font-medium mb-6">Your password has been reset. Redirecting to login...</p>
        <Link href="/login" className="text-[var(--electric)] font-bold underline">Go to Login now</Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-black uppercase text-red-500 mb-4">Invalid Link</h1>
        <p className="opacity-70 mb-6 font-medium">This reset link is invalid or missing a token.</p>
        <Link href="/forgot-password" title="Try again" className="brutal-sm bg-[var(--electric)] text-white px-6 py-2">Try Again</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest opacity-50">New Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-4 w-5 h-5 opacity-30" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-4 font-bold transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/20"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-4 opacity-40 hover:opacity-100"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest opacity-50">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-4 w-5 h-5 opacity-30" />
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-4 font-bold transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/20"
            required
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--electric)] text-white py-4 rounded-xl font-black uppercase tracking-wider border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="brutal-lg bg-white p-8 md:p-10">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
