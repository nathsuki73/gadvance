"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "../components/context/ToastContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <SessionProvider>
        <Suspense fallback={null}>
          <div className="">{children}</div>
        </Suspense>
      </SessionProvider>
    </ToastProvider>
  );
}
