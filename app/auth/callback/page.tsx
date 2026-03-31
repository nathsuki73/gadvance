"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    async function finalizeLogin() {
      if (!token) {
        router.push("/auth/signin?error=NoToken");
        return;
      }

      const result = await signIn("credentials", {
        token: token,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/onboarding");
      } else {
        router.push("/auth/signin?error=AuthFailed");
      }
    }

    finalizeLogin();
  }, [token, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Securing your session...</p>
      </div>
    </div>
  );
}
