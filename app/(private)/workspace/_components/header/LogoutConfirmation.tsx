"use client";

import React from "react";
import ReactDOM from "react-dom";
import { signOut } from "next-auth/react";

type LogoutConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
};

const LogoutConfirmationDialog = ({
  open,
  onClose,
}: LogoutConfirmationDialogProps) => {
  // Safe runtime execution guard for Next.js SSR hydration environments
  if (!open || typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/10 backdrop-blur-md p-4 animate-fade-in">
      {/* Container Card matching GADVance structure but toned down */}
      <div className="w-full max-w-md rounded-[24px] border border-zinc-100 bg-white p-10 shadow-xl shadow-zinc-200/40 transition-all">
        {/* Content Layout */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-tight text-zinc-900 leading-tight lowercase">
            ready to{" "}
            <span className="italic font-serif text-[#e05353]">sign out?</span>
          </h2>

          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed lowercase">
            you will need to enter your account credentials to access your
            professional workspace again.
          </p>
        </div>

        {/* Action Controls: Soft Red & White Pill Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            onClick={onClose}
            className="w-full rounded-md border border-zinc-200 bg-white px-6 py-4 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 font-medium"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="w-full flex items-center justify-center rounded-md bg-[#e05353] px-6 py-4 text-white transition-all hover:bg-[#cc4646] hover:shadow-lg hover:shadow-red-50 font-medium"
          >
            Sign out
          </button>
        </div>

        {/* Subtle branding anchor matching the curriculum card footer layout */}
        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
            gadvance philippines
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default LogoutConfirmationDialog;
