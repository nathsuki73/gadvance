// app/(public)/layout.tsx
"use client";

import React, { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import AuthHeader from "../(private)/workspace/_components/header/AuthHeader";
import Header from "./_components/header/PublicHeader";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "../components/context/ToastContext";
import { forceSignOut } from "@/app/lib/api-client";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  const validateToken = useCallback(() => {
    if (status === "authenticated" && session?.laravelJwt) {
      try {
        const payload = JSON.parse(atob(session.laravelJwt.split(".")[1]));
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
          forceSignOut();
          return false;
        }
      } catch {
        forceSignOut();
        return false;
      }
    }
    return true;
  }, [status, session]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // Check if session is truly valid (authenticated + token active)
  let isJwtValid = false;
  if (status === "authenticated" && session?.laravelJwt) {
    try {
      const payload = JSON.parse(atob(session.laravelJwt.split(".")[1]));
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        isJwtValid = true;
      }
    } catch {
      isJwtValid = false;
    }
  }

  const showAuthHeader =
    status === "authenticated" && isJwtValid && !session?.error;

  return (
    <ToastProvider>
      {showAuthHeader ? <AuthHeader /> : <Header />}
      {children}
      <Footer />
    </ToastProvider>
  );
}
