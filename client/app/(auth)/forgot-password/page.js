"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { LiquidCursor } from "@/components/shared/LiquidCursor";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("Reset link sent! Check your inbox.");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--ink)] overflow-hidden grain">
      <LiquidCursor />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/login" className="text-sm font-bold flex items-center gap-2 mb-4 hover:text-[var(--electric)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="brutal-lg bg-white p-8 md:p-10">
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Forgot Password?</h1>
          <p className="text-sm opacity-70 mb-8 font-medium">Enter your email and we'll send you a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-50">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 opacity-30" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-12 py-4 font-bold transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/20"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            {message && <p className="text-green-600 text-sm font-bold bg-green-50 p-3 border-2 border-green-200 rounded-lg">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--hotpink)] text-white py-4 rounded-xl font-black uppercase tracking-wider border-[3px] border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
