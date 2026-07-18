"use client";

import React from "react";
import { useSession } from "next-auth/react";
import AuthHeader from "./_components/header/AuthHeader";
import PublicHeader from "@/app/(public)/_components/header/PublicHeader";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  return (
    <>
      {/* 
        Header State Controller:
        - "loading": Displays a structural layout placeholder with a pulse loader.
        - "authenticated": Seamlessly switches to the inner dashboard toolbar.
        - "unauthenticated": Swaps gracefully to the guest landing menu.
      */}
      {status === "loading" ? (
        <div className="h-16 w-full bg-white border-b border-zinc-200 flex items-center justify-between px-8 lg:px-12 animate-pulse">
          {/* Logo Skeleton block */}
          <div className="h-6 w-24 bg-zinc-200 rounded" />

          {/* Nav items + Profile button area skeleton */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:block h-4 w-16 bg-zinc-200 rounded" />
            <div className="hidden sm:block h-4 w-16 bg-zinc-200 rounded" />
            <div className="h-8 w-8 rounded-full bg-zinc-200" />{" "}
            {/* User avatar placeholder */}
          </div>
        </div>
      ) : status === "authenticated" ? (
        <AuthHeader />
      ) : (
        <PublicHeader />
      )}

      {children}
    </>
  );
}
