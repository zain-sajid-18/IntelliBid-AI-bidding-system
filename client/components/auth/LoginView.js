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

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // validation
  const validateForm = () => {
    if (!form.email || !form.password) {
      return "Email and password are required";
    }
    return null;
  };

  // submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      setUser(data.user);

      const roleRoutes = {
        buyer: "/dashboard",
        seller: "/seller/dashboard",
        admin: "/admin/dashboard",
      };

      router.push(roleRoutes[data.user.role] || "/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
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
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden">
      <LiquidCursor />

      {/* Background */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute left-[10%] top-[20%] h-40 w-40 rounded-full border bg-[var(--acid)]"
      />

      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute right-[10%] bottom-[15%] h-32 w-32 border bg-[var(--electric)]"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back */}
        <Link href="/" className="text-sm font-bold flex items-center gap-2 mb-4">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome back
          </h1>
          <p className="text-center text-sm opacity-70 mb-6">
            Login to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 opacity-50" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border px-10 py-3 rounded-lg"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 opacity-50" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border px-10 py-3 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 opacity-50 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-bold uppercase opacity-50 hover:opacity-100 hover:text-[var(--hotpink)] transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--hotpink)] text-white py-3 rounded-lg font-bold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-2 text-sm opacity-40">
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

          {/* Footer */}
          <p className="mt-6 text-center text-sm">
            New here?{" "}
            <Link href="/register" className="underline font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
