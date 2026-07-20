"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRef } from "react";

export default function GoogleProvider({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  // Keep a stable ref so the provider never re-initializes
  const clientIdRef = useRef(clientId);
  
  if (!clientIdRef.current) {
    console.error("❌ Google Client ID is missing! Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your client/.env.local");
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientIdRef.current}>
      {children}
    </GoogleOAuthProvider>
  );
}
