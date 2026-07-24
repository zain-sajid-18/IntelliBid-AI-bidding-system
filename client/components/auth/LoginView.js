"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { GoogleLogin } from "@react-oauth/google";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function LoginView() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.email || !form.password) return "Email and password are required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await api("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      // Double-check by fetching /me to ensure we have correct role
      const meData = await api("/api/auth/me");
      if (meData && meData.user) {
        setUser(meData.user);
        const roleRoutes = { buyer: "/dashboard", seller: "/seller/dashboard", admin: "/admin/dashboard" };
        router.push(roleRoutes[meData.user.role] || "/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await api("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });
      // Double-check by fetching /me to ensure we have correct role
      const meData = await api("/api/auth/me");
      if (meData && meData.user) {
        setUser(meData.user);
        const roleRoutes = { buyer: "/dashboard", seller: "/seller/dashboard", admin: "/admin/dashboard" };
        router.push(roleRoutes[meData.user.role] || "/dashboard");
      }
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />

      {/* Decorative Background Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[10%] top-[20%] h-40 w-40 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[var(--shadow-brutal)]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[10%] bottom-[15%] h-32 w-32 border-[3px] border-[var(--ink)] bg-[var(--electric)] shadow-[var(--shadow-brutal)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md my-12"
      >
        {/* Back link */}
        <div className="absolute -top-10 left-0 md:-top-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase hover:text-[var(--acid)] transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={3} /> Back to Home
          </Link>
        </div>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--electric)] font-display text-2xl font-black text-white shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 hover:rotate-6"
          >
            IB
          </Link>
        </div>

        {/* Card */}
        <div className="brutal-lg overflow-hidden bg-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-black tracking-tighter">Welcome back.</h1>
            <p className="mt-2 text-[var(--ink)]/70">Login to continue bidding.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="rounded-xl border-[3px] border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--ink)]/50" strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--ink)]/50" strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-display text-xs font-bold uppercase tracking-wide text-[var(--hotpink)] hover:underline decoration-2 underline-offset-4 transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] px-6 py-4 font-display text-lg font-black uppercase text-white shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In{" "}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-2 text-sm opacity-40">
            <div className="h-[1px] flex-1 bg-current" />
            OR
            <div className="h-[1px] flex-1 bg-current" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed")}
              theme="outline"
              shape="pill"
            />
          </div>

          <div className="mt-8 text-center text-sm font-medium">
            New here?{" "}
            <Link href="/register" className="font-bold text-[var(--electric)] hover:underline decoration-2 underline-offset-4">
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
