"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/app/lib/api-client";

async function getUserOrganization() {
  const res = await apiFetch("/api/organizations");
  if (!res || !res.ok) return null;

  const data = await res.json();

  // 🎯 Explicitly verify that data exists AND has an id
  if (!data || !data.id) {
    return null;
  }

  return data;
}

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession({ required: true });

  const { data: orgData, isLoading } = useQuery({
    queryKey: ["userOrganization", session?.user?.email],
    queryFn: getUserOrganization,
    enabled: status === "authenticated",
  });

  // Redirect if user is already linked to an organization
  useEffect(() => {
    if (orgData) {
      router.replace("/workspace");
    }
  }, [orgData, router]);

  if (status === "loading" || isLoading || orgData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary/30" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
