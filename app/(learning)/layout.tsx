import React from "react";
import { ToastProvider } from "@/app/components/context/ToastContext";

type LearnLayoutProps = {
  children: React.ReactNode;
};

const LearnLayout = ({ children }: LearnLayoutProps) => {
  return (
    <ToastProvider>
      <div className="min-h-screen text-zinc-900 antialiased">{children}</div>
    </ToastProvider>
  );
};

export default LearnLayout;
