import { signIn, signOut, useSession } from "next-auth/react";

export const handleSignIn = () => signIn("google");
export const handleSignOut = (options?: Parameters<typeof signOut>[0]) =>
  signOut(options);

export const requireAuth = async (callback: () => void | Promise<void>) => {
  try {
    const response = await fetch("/api/auth/session");
    const session = await response.json();

    if (session?.user) {
      callback();
    } else {
      signIn("google");
    }
  } catch {
    signIn("google");
  }
};

// Removed the RefreshAccessTokenError useEffect — WorkspaceLayout
// and apiFetch already own this responsibility via forceSignOut().
export const useProtectedNavigation = () => {
  const { data: session } = useSession();

  const navigate = (href: string) => {
    if (!session?.user) {
      signIn("google", { callbackUrl: href, redirect: true });
    } else {
      return true;
    }
    return false;
  };

  return { navigate, isAuthenticated: !!session?.user };
};
