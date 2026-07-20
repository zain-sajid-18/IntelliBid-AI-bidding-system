"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SocialAuth() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // In Option 2, we send the code or access_token to backend
        // But @react-oauth/google's GoogleLogin component gives credential (ID Token)
        // useGoogleLogin gives access_token. 
        // Let's use the standard GoogleLogin component for simplicity if we want ID Tokens.
        // OR we can fetch user info here and send to backend.
      } catch (err) {
        console.error("Social login failed", err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return null; // I'll actually use the built-in GoogleLogin component for better security (ID Tokens)
}
