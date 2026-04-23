"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  requireAuth?: boolean;
  redirectUrl?: string;
}

/**
 * A button component that requires authentication
 * If user is not authenticated, clicking the button will redirect to sign in
 */
export const ProtectedButton = ({
  children,
  onClick,
  requireAuth = true,
  redirectUrl,
  ...rest
}: ProtectedButtonProps) => {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";

  const handleClick = () => {
    // Don't allow clicks while loading
    if (isLoading) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      // Redirect to sign in page
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(redirectUrl || "/workspace")}`;
      return;
    }

    // User is authenticated or auth not required, execute onClick
    onClick?.();
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={isLoading || rest.disabled}
    >
      {children}
    </button>
  );
};

export default ProtectedButton;
