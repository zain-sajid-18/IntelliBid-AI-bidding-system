"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (token) {
      api(`/api/auth/verify-email?token=${token}`)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white p-10 rounded-2xl border-[3px] border-[var(--ink)] shadow-[var(--shadow-brutal)] text-center"
    >
      {status === "verifying" && (
        <>
          <h1 className="text-2xl font-black mb-4 uppercase">Verifying Email...</h1>
          <div className="h-3 w-full bg-gray-100 border-2 border-[var(--ink)] rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: ["-100%", "100%"] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-full bg-[var(--electric)] w-1/2"
            />
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-black mb-2 uppercase">Verified!</h1>
          <p className="mb-8 font-medium opacity-80 text-sm">Your email is confirmed. You're ready to start bidding.</p>
          <Link href="/login" className="block w-full bg-[var(--acid)] py-4 font-black border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase">
            Go to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-6xl mb-4">🧨</div>
          <h1 className="text-3xl font-black mb-2 uppercase">Error</h1>
          <p className="mb-8 font-medium opacity-80 text-sm">The link is invalid or expired. Please request a new one.</p>
          <Link href="/register" className="inline-block font-black underline decoration-4 underline-offset-4 hover:text-[var(--hotpink)]">
            Back to Signup
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 grain">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
