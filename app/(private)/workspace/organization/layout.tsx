// app/(workspace)/organization/layout.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession({ required: true });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary/30" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
