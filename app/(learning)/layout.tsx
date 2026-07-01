// app/(learn)/layout.tsx

import React from "react";

type LearnLayoutProps = {
  children: React.ReactNode;
};

const LearnLayout = ({ children }: LearnLayoutProps) => {
  return (
    <div className="min-h-screen overflow-hidden text-zinc-900 antialiased">
      {children}
    </div>
  );
};

export default LearnLayout;
