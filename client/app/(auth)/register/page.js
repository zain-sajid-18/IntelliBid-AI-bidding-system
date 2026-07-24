"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { LiquidCursor } from "@/components/shared/LiquidCursor";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export default function Signup() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .endsWith("@gmail.com");
  };

  const validateFirstName = (name) => {
    const isOnlyDigits = /^\d+$/.test(name);
    return !isOnlyDigits && name.length >= 2 && name.length <= 50;
  };

  const validateLastName = (name) => {
    // Allows letters AND digits as requested
    return name.length >= 2 && name.length <= 50;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend Validations
    if (!validateFirstName(form.firstName)) {
      setError("Please enter a valid first name (2-50 characters, no digits only)");
      return;
    }
    if (!validateLastName(form.lastName)) {
      setError("Please enter a valid last name (2-50 characters)");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Please enter a valid Gmail address (ending in @gmail.com)");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      // Try to verify if user is actually logged in (bypass email verification case)
      try {
        const meData = await api("/api/auth/me");
        if (meData && meData.user && meData.user.role) {
          setUser(meData.user);
          const roleRoutes = {
            buyer: "/dashboard",
            seller: "/seller/dashboard",
            admin: "/admin/dashboard",
          };
          router.push(roleRoutes[meData.user.role] || "/dashboard");
          return;
        }
      } catch (_) {
        // If /me fails, email verification is required; proceed to redirect to login
      }

      // If we get here, user needs to verify email first; send them to login page
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await api("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      setUser(data.user);
      
      const roleRoutes = {
        buyer: "/dashboard",
        seller: "/seller/dashboard",
        admin: "/admin/dashboard",
      };

      router.push(roleRoutes[data.user.role] || "/dashboard");
    } catch (err) {
      setError(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 grain">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl border-[3px] border-[var(--ink)] shadow-[var(--shadow-brutal)] text-center"
        >
          <div className="text-6xl mb-6">📩</div>
          <h1 className="text-3xl font-black mb-4 uppercase">Check your email</h1>
          <p className="mb-8 font-medium opacity-80">
            We've sent a verification link to <span className="font-bold text-[var(--electric)]">{form.email}</span>. 
            Please verify your account to continue.
          </p>
          <Link href="/login" className="block w-full bg-[var(--acid)] py-4 font-black border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase">
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />

      {/* Decorative Background Elements */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[5%] bottom-[10%] h-32 w-32 rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--sunset)] shadow-[var(--shadow-brutal)] md:h-48 md:w-48"
      />
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-[5%] top-[10%] h-40 w-40 animate-blob border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[var(--shadow-brutal-lg)] md:h-56 md:w-56"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg my-12"
      >
        <div className="absolute -top-10 left-0 md:-top-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase hover:text-[var(--acid)] transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={3} /> Back
            to Home
          </Link>
        </div>

        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-[4px] border-[var(--ink)] bg-[var(--electric)] font-display text-2xl font-black text-white shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 hover:rotate-6"
          >
            IB
          </Link>
        </div>

        <div className="brutal-lg overflow-hidden bg-white p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-display text-4xl font-black tracking-tighter">
              Join the hustle.
            </h1>
            <p className="mt-2 text-[var(--ink)]/70">
              Create an account and start winning.
            </p>
          </div>

          {/* ✅ FIX 1: form now calls handleSubmit */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ✅ FIX 2: Error message displayed */}
            {error && (
              <div className="rounded-xl border-[3px] border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="font-display text-sm font-bold uppercase tracking-wide">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User
                      className="h-5 w-5 text-[var(--ink)]/50"
                      strokeWidth={2.5}
                    />
                  </div>
                  {/* ✅ FIX 3: wired to state */}
                  <input
                    type="text"
                    placeholder="Jane"
                    value={form.firstName}
                    maxLength={50}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-display text-sm font-bold uppercase tracking-wide">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User
                      className="h-5 w-5 text-[var(--ink)]/50"
                      strokeWidth={2.5}
                    />
                  </div>
                  {/* ✅ FIX 4: wired to state */}
                  <input
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    maxLength={50}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail
                    className="h-5 w-5 text-[var(--ink)]/50"
                    strokeWidth={2.5}
                  />
                </div>
                {/* ✅ FIX 5: wired to state */}
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-display text-sm font-bold uppercase tracking-wide">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "buyer", label: "Buyer", color: "var(--electric)" },
                  { id: "seller", label: "Seller", color: "var(--acid)" },
                ].map((type) => (
                  <label key={type.id} className="relative cursor-pointer">
                    {/* ✅ FIX 6: role radio wired to state */}
                    <input
                      type="radio"
                      name="accountType"
                      value={type.id}
                      checked={form.role === type.id}
                      onChange={() => setForm({ ...form, role: type.id })}
                      className="peer sr-only"
                    />
                    <div
                      className="flex items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-white px-2 py-3 font-display text-xs font-bold uppercase transition-all peer-checked:bg-[var(--bg-color)] peer-checked:shadow-[var(--shadow-brutal)] peer-checked:-translate-y-1 hover:-translate-y-0.5"
                      style={{ "--bg-color": type.color }}
                    >
                      {type.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock
                    className="h-5 w-5 text-[var(--ink)]/50"
                    strokeWidth={2.5}
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  minLength={8}
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
              <p className="text-xs text-[var(--ink)]/60 font-medium">
                Must be at least 8 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-display text-sm font-bold uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock
                    className="h-5 w-5 text-[var(--ink)]/50"
                    strokeWidth={2.5}
                  />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  minLength={8}
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-3 font-medium transition-colors focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-[var(--ink)]/60 font-medium">
                Re-enter your password to confirm.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-4 font-display text-lg font-black uppercase shadow-[var(--shadow-brutal)] transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account{" "}
                  <ArrowRight
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    strokeWidth={3}
                  />
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
              onError={() => setError("Google signup failed")}
              theme="outline"
              shape="pill"
              text="signup_with"
            />
          </div>

          <div className="mt-8 text-center text-sm font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[var(--hotpink)] hover:underline decoration-2 underline-offset-4"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}