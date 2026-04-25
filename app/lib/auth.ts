import { signIn, signOut, useSession } from "next-auth/react";

export const handleSignIn = () => signIn("google");
export const handleSignOut = (options?: Parameters<typeof signOut>[0]) =>
  signOut(options);

/**
 * Helper function to check if user is authenticated
 * Used for protecting button clicks and actions
 */
export const requireAuth = async (callback: () => void | Promise<void>) => {
  try {
    const response = await fetch("/api/auth/session");
    const session = await response.json();

    if (session?.user) {
      // User is authenticated, execute callback
      callback();
    } else {
      // User is not authenticated, trigger sign in
      signIn("google");
    }
  } catch {
    // If there's an error, trigger sign in
    signIn("google");
  }
};

/**
 * Hook for protected navigation - redirects to signin if not authenticated
 */
export const useProtectedNavigation = () => {
  const { data: session } = useSession();

  const navigate = (href: string) => {
    if (!session?.user) {
      signIn("google", {
        callbackUrl: href,
        redirect: true,
      });
    } else {
      // User is authenticated, can navigate normally
      // This is handled by the component using this hook
      return true;
    }
    return false;
  };

  return { navigate, isAuthenticated: !!session?.user };
};
