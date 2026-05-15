'use client'
import { useSession } from "next-auth/react";
import AuthHeader from "./_components/header/AuthHeader";
import PublicHeader from "@/app/(public)/_components/header/PublicHeader";


export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
      const { data: session } = useSession();


  return (
    <>
            {session ? <AuthHeader /> : <PublicHeader />}

      {children}
    </>
  );
}
