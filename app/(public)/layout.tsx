'use client'
import { useSession } from "next-auth/react";
import AuthHeader from "../(private)/workspace/_components/header/AuthHeader";
import Header from "./_components/header/PublicHeader";
import Footer from "@/app/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

  return (
    <>
    {session ? <AuthHeader /> : <Header />}
      {children}
      <Footer />
    </>
  );
}