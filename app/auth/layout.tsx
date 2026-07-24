"use client";

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
        <div className="">{children}</div>
      </SessionProvider>
    </ToastProvider>
  );
}
