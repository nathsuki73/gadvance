import { signOut } from "next-auth/react";

export const handleGoogleSignIn = () => {
  window.location.href = "http://127.0.0.1:8000/api/auth/google/redirect";
};

export const handleSignOut = () => signOut({ callbackUrl: "/auth/signin" });
